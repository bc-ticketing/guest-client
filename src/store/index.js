import Vue from "vue";
import Vuex from "vuex";
import state from "./state";
import { getWeb3, updateWeb3 } from "../util/getWeb3";
import { EVENT_FACTORY_ABI } from "./../util/abi/eventFactory";
import { IDENTITY_ABI } from "./../util/abi/identity";
import { Event } from "./../util/event";
import { User } from "./../util/User";
import idb from "./../util/db/idb";
import { IdentityApprover } from "../util/identity";
//import { FungibleTicketType, NonFungibleTicketType, NonFungibleTicket } from "../util/tickets";

Vue.use(Vuex);

export default new Vuex.Store({
  state,
  mutations: {
    setPageTransition(state, value) {
      if ("default" === value) {
        state.pageTransition = {
          name: "router-view",
          mode: "in-out",
        };
      }
      if ("back" === value) {
        state.pageTransition = {
          name: "router-view-back",
          mode: "",
        };
      }
    },
    updateWeb3(state, web3) {
      if (!web3) {
        state.web3 = false;
      } else {
        state.web3.web3Instance = web3.web3Instance;
        state.web3.account = web3.account;
        state.web3.networkId = web3.networkId;
        state.web3.balance = parseInt(web3.balance, 10);
        state.web3.isInjected = true;
        state.web3.currentBlock = web3.currentBlock;
        state.web3.ethereum = web3.ethereum;
      }
    },
    setEventFactory(state, factory) {
      state.eventFactory = factory;
    },
    setIdentity(state, identity) {
      state.identity = identity;
    },
    updateEventStore(state, events) {
      state.events = events;
    },
    addEventToStore(state, event) {
      state.events.push(event);
    },
    updateEvent(state, event) {
      let ev = state.events.find(
        (e) => e.contractAddress === event.contractAddress
      );
      state.events = state.events.filter(
        (e) => e.contractAddress !== event.contractAddress
      );
      ev = event;
      state.events.push(ev);
    },
    setUsers(state, users) {
      state.users = users;
    },
    setActiveUser(state, user) {
      state.activeUser = user;
    },
    updateApproverStore(state, approver) {
      let ap = state.approvers.find(
        (e) => e.contractAddress === approver.contractAddress
      );
      state.approvers = state.approvers.filter(
        (e) => e.contractAddress !== approver.contractAddress
      );
      ap = approver;
      state.approvers.push(ap);
    },
    setIdentityContractAddress(state, address) {
      state.IDENTITY_ADDRESS = address;
    },
    setEventFactoryContractAddress(state, address) {
      state.EVENT_FACTORY_ADDRESS = address;
    },
  },
  actions: {
    async setIdentityContractAddress({ commit }, address) {
      commit("setIdentityContractAddress", address);
    },
    async setEventFactoryContractAddress({ commit }, address) {
      commit("setEventFactoryContractAddress", address);
    },
    registerWeb3: async function({ commit }) {
      const web3 = await getWeb3();
      commit("updateWeb3", web3);
    },
    /* pulls the current web3 object and updates the store with it */
    async updateWeb3({ commit }) {
      const web3 = await updateWeb3();
      commit("updateWeb3", web3);
    },
    async createEventFactory({ commit }) {
      const eventFactory = new state.web3.web3Instance.eth.Contract(
        EVENT_FACTORY_ABI,
        state.EVENT_FACTORY_ADDRESS
      );
      commit("setEventFactory", eventFactory);
    },
    async createIdentity({ commit }) {
      const identity = new state.web3.web3Instance.eth.Contract(
        IDENTITY_ABI,
        state.IDENTITY_ADDRESS
      );
      commit("setIdentity", identity);
    },
    async getUserApprovalLevels({ commit }) {
      let user = state.activeUser;
      for (const event of state.events) {
        let approver = state.approvers.find(
          (a) =>
            String(a.approverAddress) === String(event.identityContractAddress)
        );
        if (approver) {
          console.log(approver.title);
          const level = await approver.getApprovalLevel(
            state.identity,
            user.account
          );
          user.setApprovalLevel(approver.approverAddress, level);
        }
      }

      commit("setActiveUser", user);
    },
    /* 
      Responsible for getting the current user object.
      First checks if the IDB contains a user with the account
      we get from web3, else creates a new user.
      Then the user is updated with events from the Blockchain only
      from the 'lastFetchedBlock', which is 0 in the case of a new account
      Finally we store the user in the db/update the old record.
    */
    async registerActiveUser({ commit }) {
      //check if the user is in the db already
      const inDB = await idb.getUser(state.web3.account);

      let user;
      if (inDB) {
        user = new User(inDB);
      } else {
        //if not, create a new user from the web3 data and load his tickets
        user = new User(state.web3.account, state.web3.balance);
      }
      // update the user to the status of the event
      for (const event of state.events) {
        await user.handleMissedEvents(
          event.contractAddress,
          [],
          event.lastFetchedBlock + 1,
          event.contract
        );
        user.setEventUpToDate(event.contractAddress, event.lastFetchedBlock);
      }
      //and update the record in the db
      await idb.saveUser(user);
      commit("setActiveUser", user);
    },
    /* 
      Loads all events from the IDB and Blockchain.
      First gets all the event addresses from the eventFactory Smart contract.
      Then checks for each address if there is a record in the DB.
      If there is a record, checks with the 'lastFetchedBlock' if any updates 
      are needed (metadata, tickets, ticketMetadata, aftermarket listings, etc.)
      and fetches the updates if needed.
      If there is no record, creates one and fetches all information from block 1.
      finally stores/updates the event in the IDB and puts it into 
      the state.
    */
    async loadEvents({ commit }) {
      const createdEvents = await state.eventFactory.getPastEvents(
        "EventCreated",
        {
          fromBlock: 0,
        }
      );

      const inDB = await idb.getUser(state.web3.account);
      let user;
      if (inDB) {
        user = new User(inDB);
      } else {
        //if not, create a new user from the web3 data and load his tickets
        user = new User(state.web3.account, state.web3.balance);
      }
      //let user = state.activeUser;
      for (let i = 0; i < createdEvents.length; i++) {
        const address = createdEvents[i].returnValues._contractAddress;
        const inStore = await idb.getEvent(address);
        let event;
        let result;
        if (!inStore) {
          // fullLoads += 1;
          event = new Event(address, state.web3.web3Instance);
        } else {
          // partLoads += 1;
          event = new Event(inStore, state.web3.web3Instance);
        }
        result = await event.handleMissedEvents(state.activeUser.account);
        if (result.success) {
          const block = await state.web3.web3Instance.eth.getBlock("latest");
          await user.handleMissedEvents(
            event.contractAddress,
            result.userEvents,
            event.lastFetchedBlock + 1,
            event.contract
          );
          user.setEventUpToDate(event.contractAddress, block.number);
          // user.setEventUpToDate(event.contractAddress, loadToBlock);
          // await idb.saveUser(user);
          commit("setActiveUser", user);

          event.lastFetchedBlock = block.number;
          // event.lastFetchedBlock = loadToBlock;
        }
        await event.verifySocials();
        //event.initSubscriptions(state.web3.web3Instance);
        await idb.saveEvent(event);
        if (!inStore) {
          commit("addEventToStore", event);
        } else {
          commit("updateEvent", event);
        }
      }
    },
    /* 
      Updates a specific event in the same manner as described in 'updateEvents'.
      This is used, e.g., when a user buys a ticket, in order to display
      the changes in ownership live, without reloading the page.
    */
    async updateEvent({ commit }, address) {
      console.info(`updtating event ${address}`);
      let event = state.events.find((e) => e.contractAddress === address);
      let result = await event.handleMissedEvents(state.activeUser.account);

      if (result.success) {
        const block = await state.web3.web3Instance.eth.getBlock("latest");
        let user = state.activeUser;
        await user.handleMissedEvents(
          event.contractAddress,
          result.userEvents,
          event.lastFetchedBlock + 1,
          event.contract
        );
        user.setEventUpToDate(event.contractAddress, block.number);
        await idb.saveUser(user);
        commit("setActiveUser", user);

        event.lastFetchedBlock = block.number;
      }

      await idb.saveEvent(event);
      commit("updateEvent", event);
    },
    async loadApprovers({ commit }) {
      let alreadyUpdated = [];
      for (const event of state.events) {
        const approverAddress = event.identityContractAddress;
        if (approverAddress && approverAddress.length > 0) {
          if (alreadyUpdated.indexOf(approverAddress) === -1) {
            alreadyUpdated.push(approverAddress);

            const inStore = await idb.getApprover(approverAddress);
            let approver;
            if (inStore) {
              approver = new IdentityApprover(inStore);
              approver.requestUrlVerification();
              approver.requestTwitterVerification();
            } else {
              approver = new IdentityApprover(approverAddress);
              await approver.loadData(state.identity);
            }
            await idb.saveApprover(approver);
            commit("updateApproverStore", approver);
          }
        }
      }
    },
  },
  modules: {},
});
