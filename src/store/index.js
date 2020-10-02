import Vue from "vue";
import Vuex from "vuex";
import state from "./state";
import { getWeb3, updateWeb3 } from "../util/getWeb3";
import { EVENT_FACTORY_ABI } from "./../util/abi/eventFactory";
import { EVENT_FACTORY_ADDRESS } from "./../util/constants/addresses";
import { EVENT_MINTABLE_AFTERMARKET_ABI } from "./../util/abi/eventMintableAftermarket";
import getIpfs from "./../util/ipfs/getIpfs";
import {Event} from './../util/event';
import {User} from './../util/User';
import {ShoppingCart} from './../util/shoppingCart';

import idb from './../util/db/idb';
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
      state.lastFetchedBlock = block.blockNumber;
    }
  },
  /* */
  actions: {
    async getLastFetchedBlock( {commit}) {
      const blocks = await idb.getBlocks();
      console.log(blocks);
      commit('setLastFetchedBlock', blocks.length > 0 ? blocks[0] : 1);
    },
    async registerUser({commit}) {
      commit('updateUserStore', new User(state.web3.account, state.web3.balance));
    },
    async createShoppingCart({commit}) {
      commit('updateShoppingCartStore', new ShoppingCart());
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
    async saveEvents({ commit }) {
      console.log(state.events);
      for (const event of state.events) {
        console.log(event);
        console.log('saving event');
        console.log(await idb.saveEvent(event));
      }
      console.log('saving block');
      if(await idb.saveBlock(state.web3.currentBlock)) {
        console.log('saved block');
        commit('setLastFetchedBlock', state.web3.currentBlock);
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
        const eventSC = new state.web3.web3Instance.eth.Contract(EVENT_MINTABLE_AFTERMARKET_ABI,address);
        const changed = await eventMetadataChanged(eventSC, state.lastFetchedBlock+1); 
        const inStore = await idb.getEvent(address);
        if (changed){
          let event;
          if (!inStore) {
            try {
              event = new Event(address);
            } catch (error) {
              console.log("could not get metadata for event");
            }
          } else {
            console.log('event already in store');
            event = new Event(inStore);
          }
          await event.loadData(EVENT_MINTABLE_AFTERMARKET_ABI, state.ipfsInstance, state.web3.web3Instance);
          await event.fetchPosition();
          if(!await idb.saveEvent(event)) {
            console.log('could not save event to db');
          }
          events.push(event);
        } else {
          const event = new Event(inStore);
          events.push(event);
          console.log('nothing changed');
        }
      }
      commit("updateEventStore", events);
    },
    async loadFungibleTickets({ commit }) {
      console.log("dispatched loadFungibleTickets Action");
      for (const event of state.events) {
        try {
          await event.loadFungibleTickets(state.web3.web3Instance, EVENT_MINTABLE_AFTERMARKET_ABI, state.ipfsInstance, state.lastFetchedBlock+1);
        } catch (error) {
          console.log(error);
        }
      };
      commit("updateEventStore", state.events);
    },
    async loadNonFungibleTickets({ commit }) {
      console.log("dispatched loadNonFungibleTickets Action");
        for (const event of state.events) {
        try {
        await event.loadNonFungibleTickets(state.web3.web3Instance, EVENT_MINTABLE_AFTERMARKET_ABI, state.ipfsInstance, state.lastFetchedBlock+1);
        } catch (error) {
          console.log(error);
        }
      };
      commit("updateEventStore", state.events);
    },
    async addTicketToCart({ commit}, selection) {
      state.shoppingCart.add(selection);
      commit('updateShoppingCartStore', state.shoppingCart);
    },
    async removeTicketFromCart({ commit }, toRemove) {
      state.shoppingCart.removeByIndex(toRemove.index, toRemove.fungible);
      commit('updateShoppingCartStore', state.shoppingCart);
    },
    /* TODO: also non fungible */
    async loadUserTickets({ commit }) {
      console.log("dispatchet loadUserTicketsAction");
      /* const fungibleTickets = await idb.getFungibleTickets().map(t => { 
        return { 
          ticketType: new FungibleTicketType(t.ticketType),
          amount: t.amount,
        };
      });
      const nonFungibleTickets = await idb.getNonFungibleTickets().map(t => {
        t.ticketType = new NonFungibleTicketType(t.ticketType);
        t = new NonFungibleTicket(0,t);
        return t;
      });
      state.user.fungibleTickets = fungibleTickets;
      state.user.nonFungibleTickets = nonFungibleTickets;
      commit('updateUserStore', state.user); */
      for (const event of state.events) {
        await state.user.loadTicketsForEvent(state.web3.web3Instance, EVENT_MINTABLE_AFTERMARKET_ABI, event);
      }
      commit("updateUserStore", state.user);
    },
    async verifyUser({ commit }, payload) {
      console.log('dispatched verifyUser Action')
      await state.user.verify(payload);
      commit('upateUserStore', state.user);
    }
    
  },
  modules: {},
});
