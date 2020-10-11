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
import { loadTicketsForEvent, loadAftermarketForEvent } from "./../util/User";
import idb from "./../util/db/idb";
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
      state.web3.ethereum = web3.ethereum;
    },
    setEventFactory(state, factory) {
      state.eventFactory = factory;
    },
    updateEventStore(state, events) {
      state.events = events;
    },
    updateShoppingCartStore(state, cart) {
      state.shoppingCart = cart;
    },
    registerIpfsInstance(state, payload) {
      state.ipfsInstance = payload;
    },
    setUsers(state, users) {
      state.users = users;
    },
    setActiveUser(state, user) {
      state.activeUser = user;
    }
  },
  /* */
  actions: {
    async registerActiveUser({ commit }) {
      const user = await idb.getUser(state.web3.account);
      if (user) {
        commit("setActiveUser", user);
      } else {
        let user = new User(state.web3.account, state.web3.balance);
        await idb.saveUser(user);
        commit("setActiveUser", user);
      }
    },
    async loadUsers({ commit }) {
      //const account = state.web3.account;
      let users = await idb.getUsers();
      if (!users) {
        users = [];
      }
      users.push(new User(state.web3.account, state.web3.balance));
      for (const user of users) {
        for (const event of state.events) {
          await loadTicketsForEvent(
            user,
            state.web3.web3Instance,
            EVENT_MINTABLE_AFTERMARKET_ABI,
            event
          );
          loadAftermarketForEvent(user, event);
        }
        user.lastFetchedBlock = state.web3.currentBlock;
        await idb.saveUser(user);
      }
      commit("setUsers", users);
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
    async loadEvents({ commit }) {
      console.log("dispatched loadEvents Action");
      const eventAddresses = await state.eventFactory.methods
        .getEvents()
        .call();
      var events = [];
      for (let i = 0; i < eventAddresses.length; i++) {
        const address = eventAddresses[i];
        console.log('loading event: '+address);
        const inStore = await idb.getEvent(address);

        let event;
        if (!inStore) {
          event = new Event(address);
        } else {
          event = new Event(inStore);
        }
        let fetch = await event.loadData(
          EVENT_MINTABLE_AFTERMARKET_ABI,
          state.ipfsInstance,
          state.web3.web3Instance
        );
        if (fetch) {
          event.lastFetchedBlock = state.web3.currentBlock;
        }
        if (!(await idb.saveEvent(event))) {
          console.log("could not save event to db");
        }
        events.push(event);
      }
      commit("updateEventStore", events);
    },
    async addTicketToCart({ commit }, selection) {
      state.shoppingCart.add(selection);
      commit("updateShoppingCartStore", state.shoppingCart);
    },
    async removeTicketFromCart({ commit }, toRemove) {
      state.shoppingCart.removeByIndex(toRemove.index, toRemove.fungible);
      commit("updateShoppingCartStore", state.shoppingCart);
    },
    async verifyUser({ commit }, payload) {
      console.log("dispatched verifyUser Action");
      await state.user.verify(payload);
      commit("upateUserStore", state.user);
    }
  },
  modules: {}
});
