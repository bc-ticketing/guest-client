import Vue from "vue";
import Vuex from "vuex";
import state from "./state";
import { getWeb3, updateWeb3 } from "../util/getWeb3";

Vue.use(Vuex);

export default new Vuex.Store({
  state,
  mutations: {
    updateWeb3(state, web3Instance) {
      console.log("Updating store with new version of web3");
      let web3Copy = state.web3;
      web3Copy.account = web3Instance.account;
      web3Copy.networkId = web3Instance.networkId;
      web3Copy.balance = parseInt(web3Instance.balance, 10);
      web3Copy.isInjected = web3Instance.injectedWeb3;
      web3Copy.web3Instance = web3Instance;
      state.web3 = web3Copy;
    },
  },
  /* */
  actions: {
    registerWeb3: async function({ commit }) {
      console.log("dispatched registerWeb3 Action");
      const web3 = await getWeb3();
      commit("updateWeb3", web3);
    },
    /* Simply pulls the current web3 object and updates the store with it */
    async updateWeb3({ commit }) {
      console.log("dispatched updateWeb3 Sction");
      const web3 = await updateWeb3();
      commit("updateWeb3", web3);
    },
    async fetchEventAddresses({ commit }) {
      console.log("fetching event addresses");
      commit();
      // TODO
    },
  },
  modules: {},
});
