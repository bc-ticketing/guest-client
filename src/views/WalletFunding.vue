<template>
  <div>
      <h1>Wallet Funding</h1>
      <div class='metamask-info'>
   <p>Network: {{ networkName }}</p>
   <p>Account: {{ web3.account}}</p>
   <p>Balance: {{ web3.balance }}</p>
 </div>
  </div>
</template>

<script>

import {NETWORKS} from './../util/constants/constants.js'

export default {
  name:'WalletFunding',
  components:{
  },
  beforeCreate () {
    console.log('registerWeb3 Action dispatched from casino-dapp.vue')
    this.$store.dispatch('registerWeb3')
    
  },
  computed: {
   web3 () {
     return this.$store.state.web3
     },
    networkName () {
      return NETWORKS[this.web3.networkId]
    }
   }
}
</script>


<style>

</style>