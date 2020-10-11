<template>
  <div>
    <div class="container">
      <h1>Wallet Funding</h1>
      <div class="connected-info" v-if="isConnected">
        <span class="balance">
          <md-icon class="icon-accent">public</md-icon> {{ networkName }}
        </span>
        <span class="balance">
          <md-icon class="icon-accent">contact_mail</md-icon> {{ web3.account }}
        </span>
        <span class="balance"
          ><md-icon class="icon-accent">account_balance_wallet</md-icon>
          {{ web3.balance }}</span
        >
      </div>
      <div class="connect-button" v-if="!isConnected">
        <md-button class="md-raised md-primary" @click="openConnectModal"
          >Connect</md-button
        >
      </div>
    </div>
  </div>
</template>

<script>
import { NETWORKS } from "./../util/constants/constants.js";

export default {
  name: "WalletFunding",
  components: {},
  methods: {
    openConnectModal: function() {
      this.$store.dispatch("registerWeb3");
    },
  },
  beforeCreate() {
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
  color: var(--accent);
}
</style>
