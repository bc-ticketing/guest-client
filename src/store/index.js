import Vue from "vue";
import Vuex from "vuex";
import state from "./state";
import { getWeb3, updateWeb3 } from "../util/getWeb3";
import { EVENT_FACTORY_ABI } from "./../util/abi/eventFactory";
import { EVENT_MINTABLE_AFTERMARKET_ABI } from "./../util/abi/eventMintableAftermarket";
import { IDENTITY_ABI } from "./../util/abi/identity";
import { Event } from "./../util/event";
import { User, setApprovalLevel } from "./../util/User";
import { ShoppingCart } from "./../util/shoppingCart";
import {
  loadTicketsForEvent,
  loadAftermarketForEvent,
  loadPresales,
} from "./../util/User";
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
      state.web3.web3Instance = web3.web3Instance;
      state.web3.account = web3.account;
      state.web3.networkId = web3.networkId;
      state.web3.balance = parseInt(web3.balance, 10);
      state.web3.isInjected = true;
      state.web3.currentBlock = web3.currentBlock;
      state.web3.ethereum = web3.ethereum;
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
    updateShoppingCartStore(state, cart) {
      state.shoppingCart = cart;
    },
    setUsers(state, users) {
      state.users = users;
    },
    setActiveUser(state, user) {
      state.activeUser = user;
    },
    updateApproverStore(state, approvers) {
      state.approvers = approvers;
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
      if (inDB) {
        console.log("user in db");
        let user = new User(inDB);
        console.log(user);
        //if yes, update the data of the user to the current block
        for (const event of state.events) {
          console.log("loading tickets for" + event.contractAddress);
          await loadTicketsForEvent(
            user,
            state.web3.web3Instance,
            EVENT_MINTABLE_AFTERMARKET_ABI,
            event
          );
          console.log(user);
          console.log("loading am");
          loadAftermarketForEvent(user, event);
          console.log("loaded am");
          await loadPresales(
            user,
            event,
            state.web3.web3Instance,
            EVENT_MINTABLE_AFTERMARKET_ABI
          );
          let approver = state.approvers.find(
            (a) =>
              String(a.approverAddress) ===
              String(event.identityContractAddress)
          );
          const method = await approver.getApprovalLevel(
            state.identity,
            user.account
          );
          setApprovalLevel(user, approver.approverAddress, method);
        }
        //and update the record in the db
        const block = await state.web3.web3Instance.eth.getBlock("latest");
        user.lastFetchedBlock = block.number;
        await idb.saveUser(user);
        console.log(user);
        commit("setActiveUser", user);
      } else {
        //if not, create a new user from the web3 data and load his tickets
        let user = new User(state.web3.account, state.web3.balance);
        for (const event of state.events) {
          await loadTicketsForEvent(
            user,
            state.web3.web3Instance,
            EVENT_MINTABLE_AFTERMARKET_ABI,
            event
          );
          console.log(JSON.parse(JSON.stringify(user.fungibleTickets)));
          loadAftermarketForEvent(user, event);
          await loadPresales(
            user,
            event,
            state.web3.web3Instance,
            EVENT_MINTABLE_AFTERMARKET_ABI
          );
          let approver = state.approvers.find(
            (a) =>
              String(a.approverAddress) ===
              String(event.identityContractAddress)
          );
          const method = await approver.getApprovalLevel(
            state.identity,
            user.account
          );
          setApprovalLevel(user, approver.approverAddress, method);
        }
        //and save it to the db
        const block = await state.web3.web3Instance.eth.getBlock("latest");
        user.lastFetchedBlock = block.number;
        await idb.saveUser(user);
        commit("setActiveUser", user);
      }
    },
    async createShoppingCart({ commit }) {
      commit("updateShoppingCartStore", new ShoppingCart());
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
      const createdEvents = await state.eventFactory.getPastEvents("EventCreated", {
        fromBlock: 0,
      });
      var events = [];
      for (let i = 0; i < createdEvents.length; i++) {
        const address = createdEvents[i].returnValues._contractAddress;
        console.log("loading event; " + address);
        const inStore = await idb.getEvent(address);
        let event;
        let success;
        if (!inStore) {
          console.log("not in store");
          event = new Event(address, state.web3.web3Instance);
          console.log(event);
        } else {
          console.log("in store");
          event = new Event(inStore, state.web3.web3Instance);
        }
        success = await event.handleMissedEvents();
        if (success) {
          const block = await state.web3.web3Instance.eth.getBlock("latest");
          event.lastFetchedBlock = block.number;
        }
        await event.verifySocials();
        //event.initSubscriptions(state.web3.web3Instance);
        await idb.saveEvent(event);
        console.log('saved event');
        events.push(event);
      }
      commit("updateEventStore", events);
    },
    async loadApprovers({ commit }) {
      let approvers = [];
      for (const event of state.events) {
        const approverAddress = event.identityContractAddress;
        console.log(approverAddress);
        const inStore = await idb.getApprover(approverAddress);
        let approver;
        if (inStore) {
          console.log('in store')
          approver = new IdentityApprover(inStore);
          approver.requestUrlVerification();
          approver.requestTwitterVerification();
        } else {
          console.log('not in store')
          approver = new IdentityApprover(approverAddress);
          await approver.loadData(state.identity);
        }
        await idb.saveApprover(approver);
        if (! approvers.find(a => a.approverAddress === approver.approverAddress)) {
          approvers.push(approver);
        }
      }
      commit("updateApproverStore", approvers);
    },
    /* 
      Updates a specific event in the same manner as described in 'updateEvents'.
      This is used, e.g., when a user buys a ticket, in order to display
      the changes in ownership live, without reloading the page.
    */
    async updateEvent({ commit }, address) {
      let event = state.events.find((e) => e.contractAddress === address);
      let fetch = await event.loadData(
        EVENT_MINTABLE_AFTERMARKET_ABI,
        state.ipfsInstance,
        state.web3.web3Instance
      );
      if (fetch) {
        const block = await state.web3.web3Instance.eth.getBlock("latest");
        event.lastFetchedBlock = block.number;
      }
      await idb.saveEvent(event);
      commit("updateEventStore", state.events);
    },
    async addTicketToCart({ commit }, selection) {
      state.shoppingCart.add(selection);
      commit("updateShoppingCartStore", state.shoppingCart);
    },
    async removeTicketFromCart({ commit }, toRemove) {
      state.shoppingCart.removeByIndex(toRemove.index, toRemove.fungible);
      commit("updateShoppingCartStore", state.shoppingCart);
    },
    async clearShoppingCart({ commit }) {
      state.shoppingCart.clear();
      commit("updateShoppingCartStore", state.shoppingCart);
    },
  },
  modules: {},
});
