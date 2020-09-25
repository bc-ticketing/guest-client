import Vue from "vue";
import Vuex from "vuex";
import state from "./state";
import { getWeb3, updateWeb3 } from "../util/getWeb3";
import { EVENT_FACTORY_ABI } from "./../util/abi/eventFactory";
import { EVENT_FACTORY_ADDRESS } from "./../util/constants/addresses";
import { EVENT_MINTABLE_AFTERMARKET_ABI } from "./../util/abi/eventMintableAftermarket";
import { argsToCid, fungibleBaseId } from "idetix-utils";
import getIpfs from "./../util/ipfs/getIpfs";
import {Event} from './../util/event';

Vue.use(Vuex);

export default new Vuex.Store({
  state,
  mutations: {
    updateWeb3(state, web3) {
      console.log("Updating store with new version of web3");
      state.web3.web3Instance = web3.web3Instance;
      state.web3.account = web3.account;
      state.web3.networkId = web3.networkId;
      state.web3.balance = parseInt(web3.balance, 10);
      state.web3.isInjected = true;
    },
    setEventFactory(state, factory) {
      console.log("setting event factory");
      state.eventFactory = factory;
    },
    updateEventStore(state, events) {
      console.log("setting events");
      state.events = events;
    },
    registerIpfsInstance(state, payload) {
      console.log("setting ipfs instance");
      state.ipfsInstance = payload;
    },
    setUserTickets(state, tickets) {
      console.log("setting user tickets");
      state.userTickets = tickets;
    },
  },
  /* */
  actions: {
    async registerIpfs({ commit }) {
      console.log("dispatched registerIpfs Action");
      const ipfs = await getIpfs();
      commit("registerIpfsInstance", ipfs);
    },
    registerWeb3: async function({ commit }) {
      console.log("dispatched registerWeb3 Action");
      const web3 = await getWeb3();
      commit("updateWeb3", web3);
    },
    /* pulls the current web3 object and updates the store with it */
    async updateWeb3({ commit }) {
      console.log("dispatched updateWeb3 Action");
      const web3 = await updateWeb3();
      commit("updateWeb3", web3);
    },
    async createEventFactory({ commit }) {
      console.log("dispatched createEventFactory Action");
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
        var a = eventAddresses[i];
        try {
          const eventSC = new state.web3.web3Instance.eth.Contract(
            EVENT_MINTABLE_AFTERMARKET_ABI,
            a
          );
          const eventMetadata = await eventSC.getPastEvents("EventMetadata", {
            fromBlock: 1,
          });
          var metadataObject = eventMetadata[0].returnValues;
          const ipfsHash = argsToCid(
            metadataObject.hashFunction,
            metadataObject.size,
            metadataObject.digest
          );
          let event = new Event(a, ipfsHash);
          try {
            await event.loadIPFSMetadata(state.ipfsInstance);
          } catch (error) {
            if (error.name == "TimeoutError") {
              console.log("timeout while fetching ipfs metadata");
            }
          }
          events.push(event);
        } catch {
          console.log("could not get metadata for event");
        }
      }
      commit("updateEventStore", events);
    },
    async loadFungibleTickets({ commit }) {
      console.log("dispatched loadTickets Action");
      for (const event of state.events) {
        try {
          await event.loadFungibleTickets(state.web3.web3Instance, EVENT_MINTABLE_AFTERMARKET_ABI, state.ipfsInstance);
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
        await event.loadNonFungibleTickets(state.web3.web3Instance, EVENT_MINTABLE_AFTERMARKET_ABI, state.ipfsInstance);
        } catch (error) {
          console.log(error);
        }
      };
      commit("updateEventStore", state.events);
    },
    /* TODO: also non fungible */
    async loadUserTickets({ commit }) {
      console.log("dispatchet loadUserTicketsAction");
      var tickets = [];
      for (let i = 0; i < state.eventAddresses.length; i++) {
        var a = state.eventAddresses[i];
        try {
          const eventSC = new state.web3.web3Instance.eth.Contract(
            EVENT_MINTABLE_AFTERMARKET_ABI,
            a
          );
          const nonce = await eventSC.methods.fNonce().call();
          // nonce shows how many ticket types exist for this event
          if (nonce > 0) {
            for (let i = 0; i < nonce; i++) {
              var type = fungibleBaseId.plus(i);
              var myTickets = await eventSC.methods
                .tickets(type, state.web3.account)
                .call();
              if (myTickets > 0) {
                tickets.push({
                  amount: myTickets,
                  eventAddress: a,
                });
              }
            }
          }

          //var metadataObject = eventMetadata[0].returnValues;
        } catch (error) {
          console.log("could not get tickets for event");
          console.log(error);
        }
      }
      commit("setUserTickets", tickets);
    },
  },
  modules: {},
});
