<template>
  <div class="info-wrapper">
    <div class="user-icon">
      <span class="balance" @click="openConnectModal"
        ><md-icon class="md-size-2x" :class="{ active: isConnected }"
          >public</md-icon
        >
        <span v-if="isConnected">{{ web3.balance }} ETH</span>
      </span>
    </div>
  </div>
</template>

<script>
import { NETWORKS } from "./../util/constants/constants.js";

export default {
  name: "walletInfo",
  components: {},
  methods: {
    openConnectModal: function() {
      this.$store.dispatch("registerWeb3");
    },
  },
  beforeCreate() {
    console.log("registerWeb3 Action dispatched from casino-dapp.vue");
    this.$store.dispatch("registerWeb3");
  },
  computed: {
    web3() {
      return this.$store.state.web3;
    },
    networkName() {
      return NETWORKS[this.web3.networkId];
    },
    isConnected() {
      return this.web3.networkId != null;
    },
  },
};
</script>

<style>
.balance {
  display: block;
}
.balance .md-icon.md-theme-default.md-icon-font {
  transition: color 0.5s linear;
}
.balance .md-icon.md-theme-default.md-icon-font.active {
  color: var(--accent);
}
</style>
