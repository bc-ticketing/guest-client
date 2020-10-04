<template>
  <div id="app">
    <walletInfo v-bind:open="infoOpen"></walletInfo>
    <!--
    <div id="nav" ref="nav">
      <div class="container">
        <div class="logo-container">
           <img src="" alt="Logo" /> 
          <h4 id="nav-title">Idetix</h4>
        </div>
        <div class="wallet-info">
          
        </div>
         <Navigation v-bind:navHeight="navHeight" /> 
      </div>
      
    </div>
    -->
    <div class="content" ref="content">
      <router-view />
    </div>
    <searchBar v-bind:yPos="navHeight"></searchBar>
    <bottomBar ref='nav' v-on:height="setNavHeight"></bottomBar>
  </div>
</template>

<script>
// Material kit css
import "vue-material/dist/vue-material.min.css";
import "vue-material/dist/theme/default.css";
// import Navigation from "./components/Navigation";
import bottomBar from "./components/bottomBar";
import searchBar from './components/searchBar';
import walletInfo from "./components/walletInfo";
import Vue from "vue";

// Importing Modules from the material kit, these are global imports
// For components only used in single views, import locally
import VueMaterial from "vue-material";
Vue.use(VueMaterial);

export default {
  components: {
    //Navigation,
    bottomBar,
    searchBar,
    walletInfo,
  },
  data() {
    return {
      navHeight: 100,
      infoOpen: false,
    };
  },
  methods: {
    setNavHeight: function(value) {
      this.navHeight = value;
    },
    loadEvents: async function() {
      await this.$store.dispatch("loadEvents");
      this.$root.$emit("loadedEvents");
    },
    loadTickets: async function() {
      await this.$store.dispatch("loadFungibleTickets");
      await this.$store.dispatch("loadNonFungibleTickets");
      this.$root.$emit("loadedTickets");
    },
    loadUserTickets: async function() {
      await this.$store.dispatch("loadUserTickets");
      this.$root.$emit("loadedUserTickets");
    },
  },
  async beforeCreate() {
    this.$root.$on("eventFactoryCreated", async () => {
      this.loadEvents();
    });
    this.$root.$on("loadedEvents", async () => {
      await this.loadTickets();
      await this.loadUserTickets();
      await this.$store.dispatch('saveFetchedBlockNumber');
    });
    await this.$store.dispatch("registerIpfs");
    await this.$store.dispatch("registerWeb3");
    await this.$store.dispatch('getLastFetchedBlock');

    await this.$store.dispatch('registerUser');
    await this.$store.dispatch('createShoppingCart');
    this.$root.$emit("web3Injected");
    await this.$store.dispatch("createEventFactory");
    this.$root.$emit("eventFactoryCreated");
  },
  mounted: async function() {
    setTimeout(() => {
      this.infoOpen = true;
    }, 1000);
    this.$root.$on("web3Injected", async () => {
      setTimeout(() => {
        this.infoOpen = false;
      }, 3000);
    });
  },
};
</script>

<style>
/* ----------- Fonts ----------- */
@import url("https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;500;700&display=swap");
@import url("https://fonts.googleapis.com/icon?family=Material+Icons");
/* ----------- Color Definitions ----------- */
:root {
  --fg: #584d53;
  --fg-light: hsl(9, 36%, 85%);
  --bg: white;
  --bg-dark: #584d53;
  --accent: #ff0266;
  --button-neutral: #e1ada6;
  --button-confirm: #0f5e59;
  --button-cancel: #3e2737;
  /* more colors to come */
}
/* ---------- Global Styles ---------- */
body,
html {
  font-size: 16px;
  font-family: "Ubuntu", sans-serif;
  font-weight: 400;
  /* Placeholder font */
  color: var(--fg);
  background-color: var(--bg);
}
/*
h1 {
  font-size: 3rem;
  font-weight: 700;
  margin-top: 0;
  margin-bottom: 1rem;
}
h2 {
  font-size: 2.5rem;
  font-weight: 500;
  margin-top: 0;
  margin-bottom: 1rem;
}
h3 {
  font-size: 2.2rem;
  font-weight: 500;
  margin-top: 0;
  margin-bottom: 1rem;
}
h4 {
  font-size: 1.6rem;
  margin-top: 0;
  margin-bottom: 1rem;
}
h5 {
  font-size: 1.2rem;
  margin-top: 0;
  margin-bottom: 1rem;
}
*/
p {
  font-size: 1rem;
}
a {
  text-decoration: none;
  padding-bottom: 2px;
  color: #0f5e59 !important;
}
a:hover {
  text-decoration: none !important;
}
.container {
  width: 90%;
  max-width: 1080px;
  margin: auto;
}
.container-fluid {
  width: 100%;
  max-width: 1440px;
}

/* ---------- Navigation Bar ---------- */

/* ---------- Basic Components ---------- */
.content {
  padding-top: 0;
  overflow-x: hidden;
}
/* ---------- Media Queries ---------- */
/* TODO: Define breakpoints */

@media screen and (min-width: 992px) {
  .container {
    width: 80%;
  }
}
</style>
