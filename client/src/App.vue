<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/event-hosting">Event Hosting</router-link> |
      <router-link to="/identification">Identification</router-link> |
      <router-link to="/lottery">Lottery</router-link> |
      <router-link to="/wallet-funding">Wallet Funding</router-link> |
      <router-link to="/simple-storage">Simple Storage</router-link>
    </div>
    <router-view/>
  </div>
</template>

<script>

export default {
  components:{
  }
}
</script>
