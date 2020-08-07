import Vue from "vue";
import Vuex from "vuex";
import state from "./state";
import { getWeb3, updateWeb3 } from "../util/getWeb3";
import { EVENT_FACTORY_ABI } from "./../util/abi/eventFactory";
import { EVENT_FACTORY_ADDRESS } from "./../util/constants/addresses";
import { EVENT_MINTABLE_AFTERMARKET_ABI } from "./../util/abi/eventMintableAftermarket";
import { argsToCid } from "idetix-utils";

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
    setEventAddresses(state, addresses) {
      console.log("setting event addresses");
      state.events = addresses;
    },
    setEvents(state, events) {
      console.log("setting events");
      state.events = events;
    },
  },
  /* */
  actions: {
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
    async fetchEventAddresses({ commit }) {
      console.log("fetching event addresses");
      commit();
      // TODO
    },
    async createEventFactory({ commit }) {
      console.log("dispatched createEventFactory Action");
      const eventFactory = new state.web3.web3Instance.eth.Contract(
        EVENT_FACTORY_ABI,
        EVENT_FACTORY_ADDRESS
      );
      commit("setEventFactory", eventFactory);
    },
    async loadEventAddresses({ commit }) {
      console.log("dispatched loadEventAddresses Action");
      const eventAddresses = await state.eventFactory.methods
        .getEvents()
        .call();
      commit("setEventAddresses", eventAddresses);
    },
    async loadEvents({ commit }) {
      console.log("dispatched loadEvents Action");
      var ipfs_hashes = [];
      for (let i = 0; i < state.eventAddresses.length; i++) {
        var a = state.eventAddresses[i];
        try {
          const eventSC = new state.web3.web3Instance.eth.Contract(
            EVENT_MINTABLE_AFTERMARKET_ABI,
            a
          );
          const eventMetadata = await eventSC.getPastEvents("EventMetadata", {
            fromBlock: 1,
          });
          var metadataObject = eventMetadata[0].returnValues;
          ipfs_hashes.push({
            contract_address: a,
            ipfs_hash: argsToCid(
              metadataObject.hashFunction,
              metadataObject.size,
              metadataObject.digest
            ),
          });
        } catch {
          console.log("could not get metadata for event");
        }
      }
      commit("setEvents", ipfs_hashes);
    },
  },
  modules: {},
});
