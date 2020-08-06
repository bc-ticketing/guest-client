<template>
  <div class="info-wrapper wallet-info" v-bind:class="{ open: open }">
    <div class="user-icon">
      <span v-if="isConnected" class="balance">{{ balanceShort }} ETH</span>
      <span class="eth-icon" @click="openConnectModal"
        ><md-icon class="md-size-2x" :class="{ active: isConnected }"
          >public</md-icon
        >
      </span>
    </div>
  </div>
</template>

<script>
import { NETWORKS } from "./../util/constants/constants.js";

export default {
  name: "walletInfo",
  components: {},
  props: {
    open: Boolean,
  },
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
    balanceShort() {
      var balance = this.web3.balance;
      return balance.toString().slice(0, 2);
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
.wallet-info {
  position: absolute;
  top: 20px;
  z-index: 101;
  background-color: whitesmoke;
  padding: 5px 10px;
  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;
  transform: translateX(-100%);
  transition: transform 0.5s linear;
}
.wallet-info.open {
  transform: translateX(0);
}

.balance {
  display: inline-block;
  margin-right: 10px;
}
.eth-icon .md-icon.md-theme-default.md-icon-font {
  transition: color 0.5s linear;
}
.eth-icon .md-icon.md-theme-default.md-icon-font.active {
  color: var(--accent);
}
</style>
