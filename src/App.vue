<template>
  <div class="layout">
    <div class="idetix">
      <div class="landing">
        <h2 class="big-text">Idetix</h2>
      </div>
      <div class="intro">
        <div class="intro-text">
          <h1 class="hide">
            <span class="text"> Online Ticketing</span>
          </h1>
          <h1 class="hide">
            <span class="text">Reimagined.</span>
          </h1>
        </div>
      </div>
      <div class="slider"></div>
    </div>
    <div class="frame">
      <div class="frame-top">
        <div class="camera" id="camera"></div>
        <div class="speaker"></div>
      </div>
      <div id="app">
        <div class="">
          <overlayMessage
            :message="overlayMessage"
            :autoClose="overlayAutoClose"
          ></overlayMessage>

          <transition :name="'slide'" mode="out-in">
            <router-view></router-view>
          </transition>
        </div>
        <messageBus v-bind:yPos="messagePos"></messageBus>
        <searchBar v-bind:yPos="navHeight"></searchBar>
        <bottomBar ref="nav"></bottomBar>
      </div>
      <div class="frame-bottom">
        <div class="home-button"></div>
      </div>
    </div>
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
      overlayAutoClose: true,
      overlayMessage: "",
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
    this.$root.$on("transactionStarted", async () => {
      this.overlayAutoClose = false;
      this.overlayMessage = "Processing your transaction.";
      this.$root.$emit("openMessageOverlay");
    });
    this.$root.$on("transactionEnded", async () => {
      this.overlayAutoClose = false;
      this.$root.$emit("closeMessageOverlay");
    });

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
      this.overlayAutoClose = false;
      this.overlayMessage =
        "Looks like you changed your Account, hang on for a second while we load your tickets!";
      this.$root.$emit("openMessageOverlay");
      await this.$store.dispatch("updateWeb3");
      await this.$store.dispatch("registerActiveUser");
      this.$root.$emit("accountUpdated");
      this.$root.$emit("hideMessageOverlay");
    });

    // Actual execution starts here
    // First we register ipfs and web3 handlers and emit the respective event
    await this.$store.dispatch("registerWeb3");
    if (this.$store.state.web3) {
      this.$root.$emit("web3Injected");
    } else {
      this.overlayAutoClose = -false;
      this.overlayMessage =
        "We could not detect a Wallet Provider on your browser. Please Install the metamask browser extension.";
      this.$root.$emit("openMessageOverlay");
    }

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
  },
  mounted: async function() {},
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
  --vw: 375px;
  --vh: 667px;
  --negative-vw: -375px;
  /* more colors to come */
}
/* ---------- Global Styles ---------- */

body {
  display: flex;
  justify-content: center;
  align-items: center;
}
body,
html {
  font-size: 16px;
  font-family: "Dosis", sans-serif;
  font-weight: 400;
  /* Placeholder font */
  color: var(--fg);
  background-color: var(--bg);
}

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

.content {
  width: var(--vw);
  max-width: var(--vw);
  overflow-x: hidden;
  overflow-y: scroll;
  max-height: 543px;
}
#app {
  min-height: var(--vh);
  max-height: var(--vh);
  min-width: var(--vw);
  max-width: var(--vw);
  padding-top: 0;
  will-change: transform;
  overflow-x: hidden;
  overflow: hidden;
  position: relative;
  border: 1px solid black;
  background: white;
}
.frame {
  box-shadow: 0 5px 6px -3px rgba(0, 0, 0, 0.2),
    0 9px 12px 1px rgba(0, 0, 0, 0.14), 0 3px 16px 2px rgba(0, 0, 0, 0.12);
  background: #2e3440;
  padding: 1rem;
  padding-bottom: 0;
  border: 1px solid black;
  border-radius: 25px;
  animation: gocenter 1s ease-in-out 4.5s 1 forwards;
}
.frame-top {
  padding: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
}
.frame-bottom {
  padding: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
}
.home-button {
  height: 50px;
  width: 50px;
  border: 3px solid #4c566a;
  border-radius: 50%;
}
.frame .camera {
  width: 8px;
  height: 8px;
  background: black;
  border-radius: 50%;
  margin-right: 2rem;
  border: 2px solid black;
}
.frame .camera.active {
  background: #bf616a;
  box-shadow: 0px 0px 12px #bf616a;
}

.frame .speaker {
  width: 50px;
  height: 5px;
  background: black;
  border-radius: 15px;
}
.container-fluid {
  width: 100%;
}
/* ---------- Media Queries ---------- */

/* ----------------- Page Transitions ----------------- */
.slide-enter-active,
.slide-leave-active {
  transition: 300ms;
}
.slide-enter {
  left: var(--vw);
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
  left: var(--vw);
}

/* ----------------- Opening animation ----------------- */
@keyframes movedown {
  0% {
    transform: translateY(100%);
  }
  100% {
    transform: translateY(0%);
  }
}
@keyframes moveup {
  0% {
    transform: translateY(0%);
  }
  100% {
    transform: translateY(-100%);
  }
}
@keyframes movethrough {
  0% {
    transform: translateY(100%);
  }
  100% {
    transform: translateY(-100%);
  }
}
@keyframes opacity {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
@keyframes fuckoff {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-100vw);
  }
}
@keyframes gocenter {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-25vw);
  }
}
.layout {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 100vh;
  width: 100vw;
}
.idetix {
  will-change: transform;
  overflow: hidden;
  position: relative;
  height: var(--vh);
  width: var(--vw);
  animation: fuckoff 1s ease-in-out 4.5s 1 forwards;
}
.intro {
  background: black;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.slider {
  background: rgb(97, 105, 109);
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: translateY(100%);
}
.big-text {
  position: absolute;
  top: 30%;
  left: 50%;
  transform: translate(-50%, -30%);
  font-size: 5rem;
  color: rgb(61, 61, 61);
  line-height: 80px;
  opacity: 0;
}
.hide span {
  transform: translateY(100%);
  display: inline-block;
}
.intro-text {
  color: rgb(233, 233, 233);
  font-family: "Heebo", sans-serif;
  font-size: 1rem;
}
.hide {
  background: black;
  overflow: hidden;
  line-height: 50px;
  margin: 0;
}

.text {
  animation: movedown 1s ease-in-out 0.25s 1 forwards;
}
.slider {
  animation: movethrough 1.5s ease-in-out 2.75s 1 forwards;
}
.intro {
  animation: moveup 1s ease-in-out 2.25s 1 forwards;
}
.big-text {
  animation: opacity 1s ease-in-out 2.95s 1 forwards;
}
</style>
