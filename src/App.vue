<template>
  <div id="app">
    <div class="content" ref="content">
      <overlayMessage></overlayMessage>

      <transition :name="'slide'" mode="out-in">
        <router-view></router-view>
      </transition>
    </div>
    <messageBus v-bind:yPos="messagePos"></messageBus>
    <searchBar v-bind:yPos="navHeight"></searchBar>
    <bottomBar ref="nav"></bottomBar>
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
    messageBus,
  },
  data() {
    return {
      navHeight: 100,
      messagePos: 0,
      transitionName: "",
      //infoOpen: false
    };
  },
  watch: {
    $route(to, from) {
      const toDepth = to.path.split("/").length;
      const fromDepth = from.path.split("/").length;
      this.transitionName = toDepth < fromDepth ? "slide-right" : "slide-left";
    },
  },
  methods: {
    afterEnter: () => {
      window.scrollTo(0, 0);
    },
    afterLeave: () => {
      this.$store.commit("setPageTransition", "default");
    },
    setNavHeight: function(value) {
      this.navHeight = value;
    },
    loadEvents: async function() {
      await this.$store.dispatch("loadEvents");
      this.$root.$emit("loadedEvents");
    },
  },
  /* handles the initial data loading logic */
  async beforeCreate() {
    // load events when event factory is ready
    this.$root.$on("eventFactoryCreated", async () => {
      await this.$store.dispatch("registerActiveUser");
      console.log("loaded user");
      await this.loadEvents();
    });

    // register the user only when events are loaded,
    // since the ticket loading logic depends on the event metadata
    // being present.
    this.$root.$on("loadedEvents", async () => {
      console.log("loaded events");
      await this.$store.dispatch("loadApprovers");
      console.log("loaded approvers");
      await this.$store.dispatch("getUserApprovalLevels");
      this.$root.$emit("userUpdated");
      this.$root.$emit("openMessageBus", {
        message: "Loaded all data",
        status: "success",
      });
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
    await this.$store.dispatch(
      "setEventFactoryContractAddress",
      process.env.VUE_APP_EVENT_FACTORY_CONTRACT_ADDRESS
    );
    await this.$store.dispatch(
      "setIdentityContractAddress",
      process.env.VUE_APP_IDENTITY_CONTRACT_ADDRESS
    );

    await this.$store.dispatch("createEventFactory");
    this.$root.$emit("eventFactoryCreated");

    await this.$store.dispatch("createIdentity");
    this.$root.$emit("identityCreated");
    // We register a new, empty shopping cart
    await this.$store.dispatch("createShoppingCart");
  },
  mounted: async function() {
    console.log(process.env.VUE_APP_IDENTITY_CONTRACT_ADDRESS);
  },
};
</script>

<style lang="scss">
/* ----------- Fonts ----------- */
@import url("https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;500;700&display=swap");
@import url("https://fonts.googleapis.com/icon?family=Material+Icons");
/* ----------- Color Definitions ----------- */
@import url("https://fonts.googleapis.com/css2?family=Dosis:wght@400;700&display=swap");

:root {
  --fg: #584d53;
  --fg-light: hsl(9, 36%, 85%);
  --bg: white;
  --bg-dark: #584d53;
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
  font-family: "Dosis", sans-serif;
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
h3 {
  margin-top: 0;
  margin-bottom: 1rem;
}
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
.container-fluid,
.container {
  /*height: calc(100vh - 56px);*/
  /* overflow-y: scroll; */
  overflow-x: invisible;
}

/* ---------- Navigation Bar ---------- */

/* ---------- Basic Components ---------- */
#app {
  min-height: 100vh;
  max-height: 100vh;
}

.content,
#app {
  padding-top: 0;
  /*overflow-x: hidden;*/
  position: relative;
  width: 100vw;
  max-width: 100vw;
}
.container-fluid {
  width: 100%;
}
/* ---------- Media Queries ---------- */
/* TODO: Define breakpoints */

@media screen and (min-width: 992px) {
  .container {
    width: 80%;
  }
}

/* ----------------- Page Transitions ----------------- */
.slide-enter-active,
.slide-leave-active {
  transition: 300ms;
}
.slide-enter {
  left: -100vw;
  position: absolute;
}
.slide-enter-to {
  position: relative;
  left: 0;
}

.slide-leave {
  position: absolute;
  left: 0;
}
.slide-leave-to {
  left: 100vw;
}
</style>
