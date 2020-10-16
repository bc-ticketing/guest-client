<template>
  <div id="app">
    <!-- <walletInfo v-bind:open="infoOpen"></walletInfo> -->
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
    <overlayMessage></overlayMessage>
    <messageBus v-bind:yPos="messagePos"></messageBus>
    <searchBar v-bind:yPos="navHeight"></searchBar>
    <bottomBar ref="nav" v-on:height="setNavHeight"></bottomBar>
  </div>
</template>

<script>
// Material kit css
import "vue-material/dist/vue-material.min.css";
import "vue-material/dist/theme/default.css";
// import Navigation from "./components/Navigation";
import bottomBar from "./components/bottomBar";
import searchBar from "./components/searchBar";
import messageBus from "./components/MessageBus";
import overlayMessage from "./components/OverlayMessage";

//import walletInfo from "./components/walletInfo";
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
    //walletInfo,
    overlayMessage,
    messageBus
  },
  data() {
    return {
      navHeight: 100,
      messagePos: 0
      //infoOpen: false
    };
  },
  methods: {
    setNavHeight: function(value) {
      this.navHeight = value;
    },
    loadEvents: async function() {
      await this.$store.dispatch("loadEvents");
      this.$root.$emit("loadedEvents");
    }
  },
  /* handles the initial data loading logic */
  async beforeCreate() {
    // load events when event factory is ready
    this.$root.$on("eventFactoryCreated", async () => {
      await this.loadEvents();
    });

    // register the user only when events are loaded,
    // since the ticket loading logic depends on the event metadata
    // being present.
    this.$root.$on("loadedEvents", async () => {
      //await this.$store.dispatch("loadUsers");
      await this.$store.dispatch("loadApprovers");
      await this.$store.dispatch("registerActiveUser");
      this.$root.$emit("userUpdated");
    });

    /* 
    When the user changes his active account we first display
    an overlay screen with a loading animation, then make sure to have the
    most recent account information through 'updateWeb3' and then fetch
    ticket information for the new account.
    */
    this.$root.$on("accountChanged", async () => {
      this.$root.$emit("openMessageOverlay");
      await this.$store.dispatch("updateWeb3");
      await this.$store.dispatch("registerActiveUser");
      this.$root.$emit("accountUpdated");
      this.$root.$emit("hideMessageOverlay");
    });

    // Actual execution starts here
    // First we register ipfs and web3 handlers and emit the respective event
    await this.$store.dispatch("registerIpfs");
    await this.$store.dispatch("registerWeb3");
    this.$root.$emit("web3Injected");
    // we subscribe to the accountsChanged event from web3 to detect thos
    this.$store.state.web3.ethereum.on("accountsChanged", () => {
      this.$root.$emit("accountChanged");
    });

    /* 
     we create an eventFactory instance, which is needed to get the event
     smart contract addresses form the Blockchain
     this triggers the 'loadEvents' action, which in turn triggers
     the user ticket loading action 
     */
    await this.$store.dispatch("setEventFactoryContractAddress",process.env.VUE_APP_EVENT_FACTORY_CONTRACT_ADDRESS);
    await this.$store.dispatch("setIdentityContractAddress",process.env.VUE_APP_IDENTITY_CONTRACT_ADDRESS);


    await this.$store.dispatch("createEventFactory");
    this.$root.$emit("eventFactoryCreated");

    await this.$store.dispatch("createIdentity");
    this.$root.$emit("identityCreated");
    // We register a new, empty shopping cart
    await this.$store.dispatch("createShoppingCart");

    //finally a message confirms that all the data is loaded
    this.$root.$emit("openMessageBus", {
      message: "Loaded all data",
      status: "success"
    });
  },
  mounted: async function() {
    console.log(process.env.VUE_APP_IDENTITY_CONTRACT_ADDRESS);
  }
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
  --orange: #d08770;
  --yellow: #ebcb8b;
  --green: #a3be8c;
  --red: #bf616a;
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
  min-height: 100vh;
  position: relative;
}
/* ---------- Media Queries ---------- */
/* TODO: Define breakpoints */

@media screen and (min-width: 992px) {
  .container {
    width: 80%;
  }
}
</style>
