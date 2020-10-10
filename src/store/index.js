import Vue from "vue";
import Vuex from "vuex";
import state from "./state";
import { getWeb3, updateWeb3 } from "../util/getWeb3";
import { EVENT_FACTORY_ABI } from "./../util/abi/eventFactory";
import { EVENT_FACTORY_ADDRESS } from "./../util/constants/addresses";
import { EVENT_MINTABLE_AFTERMARKET_ABI } from "./../util/abi/eventMintableAftermarket";
import getIpfs from "./../util/ipfs/getIpfs";
import { Event } from "./../util/event";
import { User } from "./../util/User";
import { ShoppingCart } from "./../util/shoppingCart";

import idb from "./../util/db/idb";
import { eventMetadataChanged } from "../util/blockchainEventHandler";
//import { FungibleTicketType, NonFungibleTicketType, NonFungibleTicket } from "../util/tickets";

Vue.use(Vuex);

export default new Vuex.Store({
  state,
  mutations: {
    updateWeb3(state, web3) {
      state.web3.web3Instance = web3.web3Instance;
      state.web3.account = web3.account;
      state.web3.networkId = web3.networkId;
      state.web3.balance = parseInt(web3.balance, 10);
      state.web3.isInjected = true;
      state.web3.currentBlock = web3.currentBlock;
    },
    setEventFactory(state, factory) {
      state.eventFactory = factory;
    },
    updateEventStore(state, events) {
      console.log("setting events");
      state.events = events;
    },
    addEvent(state, event) {
      state.events.push(event);
    },
    updateUserStore(state, user) {
      state.user = user;
    },
    updateShoppingCartStore(state, cart) {
      state.shoppingCart = cart;
    },
    registerIpfsInstance(state, payload) {
      console.log("setting ipfs instance");
      state.ipfsInstance = payload;
    },
    setUserTickets(state, tickets) {
      console.log("setting user tickets");
      state.userTickets = tickets;
    },
    setLastFetchedBlock(state, block) {
      state.lastFetchedBlock = block;
      console.log(block);
      //state.lastFetchedBlock = 0;
    },
  },
  /* */
  actions: {
    async getLastFetchedBlock({ commit }) {
      const blocks = await idb.getBlocks();
      commit(
        "setLastFetchedBlock",
        blocks.length > 0 ? blocks[blocks.length - 1].blockNumber : 0
      );
    },
    async registerUser({ commit }) {
      commit(
        "updateUserStore",
        new User(state.web3.account, state.web3.balance)
      );
    },
    async createShoppingCart({ commit }) {
      commit("updateShoppingCartStore", new ShoppingCart());
    },
    async registerIpfs({ commit }) {
      const ipfs = await getIpfs();
      commit("registerIpfsInstance", ipfs);
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
        EVENT_FACTORY_ADDRESS
      );
      commit("setEventFactory", eventFactory);
    },
    async saveFetchedBlockNumber({ commit }) {
      console.log("saving block");
      if (await idb.saveBlock(state.web3.currentBlock)) {
        console.log("saved block");
        commit("setLastFetchedBlock", state.web3.currentBlock);
      }
    },
    async loadEvents({ commit }) {
      console.log("dispatched loadEvents Action");
      const eventAddresses = await state.eventFactory.methods
        .getEvents()
        .call();
      var events = [];
      for (let i = 0; i < eventAddresses.length; i++) {
        const address = eventAddresses[i];
        const eventSC = new state.web3.web3Instance.eth.Contract(
          EVENT_MINTABLE_AFTERMARKET_ABI,
          address
        );
        const changed = await eventMetadataChanged(
          eventSC,
          state.lastFetchedBlock + 1
        );
        const inStore = await idb.getEvent(address);
        let event;
        if (changed) {
          if (!inStore) {
            try {
              event = new Event(address);
            } catch (error) {
              console.log("could not get metadata for event");
            }
          } else {
            console.log("event already in store");
            event = new Event(inStore);
          }
          await event.loadData(
            EVENT_MINTABLE_AFTERMARKET_ABI,
            state.ipfsInstance,
            state.web3.web3Instance
          );
          await event.fetchPosition();
          if (!(await idb.saveEvent(event))) {
            console.log("could not save event to db");
          }
          {
            console.log("stored event to db");
          }
        } else {
          event = new Event(inStore);
          console.log("nothing changed");
        }
        events.push(event);
      }
      commit("updateEventStore", events);
    },
    async loadFungibleTickets({ commit }) {
      console.log("dispatched loadFungibleTickets Action");
      for (const event of state.events) {
        try {
          await event.loadFungibleTickets(
            state.web3.web3Instance,
            EVENT_MINTABLE_AFTERMARKET_ABI,
            state.ipfsInstance,
            state.lastFetchedBlock + 1
          );
          if (!(await idb.saveEvent(event))) {
            console.log("could not save event to db");
          }
          {
            console.log("stored event to db");
          }
        } catch (error) {
          console.log(error);
        }
      }
      commit("updateEventStore", state.events);
    },
    async loadNonFungibleTickets({ commit }) {
      console.log("dispatched loadNonFungibleTickets Action");
      for (const event of state.events) {
        try {
          await event.loadNonFungibleTickets(
            state.web3.web3Instance,
            EVENT_MINTABLE_AFTERMARKET_ABI,
            state.ipfsInstance,
            state.lastFetchedBlock + 1
          );
          if (!(await idb.saveEvent(event))) {
            console.log("could not save event to db");
          }
          {
            console.log("stored event to db");
          }
        } catch (error) {
          console.log(error);
        }
      }
      commit("updateEventStore", state.events);
    },
    async loadOwnershipChanges({ commit }) {
      for (const event of state.events) {
        try {
          await event.loadOwnerShipChanges(
            state.web3.web3Instance,
            EVENT_MINTABLE_AFTERMARKET_ABI,
            state.lastFetchedBlock +1
            //1
          );
          await event.loadTicketsSoldChanges(
            state.web3.web3Instance,
            EVENT_MINTABLE_AFTERMARKET_ABI,
            state.lastFetchedBlock +1
            //1
          )
          if (!await idb.saveEvent(event)) {
            console.log('could not safe event to db');
          }
        } catch(e) {
          console.log(e);
        }
      }
      commit("updateEventStore", state.events);
    },
    async loadAftermarketChanges({ commit }) {
      for (const event of state.events) {
        try {
          await event.loadAftermarketChanges(
            state.web3.web3Instance,
            EVENT_MINTABLE_AFTERMARKET_ABI,
            state.lastFetchedBlock +1
            //1
          );
          if (!await idb.saveEvent(event)) {
            console.log('could not safe event to db');
          }
        } catch(e) {
          console.log(e);
        }
      }
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
    async loadUserTickets({ commit }) {
      console.log("dispatchet loadUserTicketsAction");
      await state.user.loadTicketsFromStore();
      for (const event of state.events) {
        await state.user.loadTicketsForEvent(
          state.web3.web3Instance,
          EVENT_MINTABLE_AFTERMARKET_ABI,
          event,
          state.lastFetchedBlock + 1
        );
        state.user.loadAftermarketForEvent(event);
      }
      console.log(state.user);
      if (
        !(await idb.saveUserTickets({
          fungibleTickets: state.user.fungibleTickets,
          nonFungibleTickets: state.user.nonFungibleTickets,
          address: state.user.account,
        }))
      ) {
        console.log("could not save tickets to db");
      }
      commit("updateUserStore", state.user);
    },
    async verifyUser({ commit }, payload) {
      console.log("dispatched verifyUser Action");
      await state.user.verify(payload);
      commit("upateUserStore", state.user);
    },
  },
  modules: {},
});
