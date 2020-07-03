<template>
  <div id="app">
    <div id="nav" ref="nav">
      <div class="container">
        <div class="logo-container">
          <!-- <img src="" alt="Logo" /> -->
          Idetix
        </div>
        <Navigation v-bind:navHeight="navHeight" />
      </div>
    </div>
    <div class="content" ref="content">
      <router-view />
    </div>
  </div>
</template>

<script>
// Material kit css
import "vue-material/dist/vue-material.min.css";
//import "vue-material/dist/theme/default.css";
import Navigation from "./components/Navigation";
import Vue from "vue";

// Importing Modules from the material kit, these are global imports
// For components only used in single views, import locally
import { MdButton, MdIcon } from "vue-material/dist/components";
Vue.use(MdButton);
Vue.use(MdIcon);

export default {
  components: {
    Navigation
  },
  data() {
    return {
      navHeight: 100
    };
  },
  methods: {
    getNavHeight: function() {
      return this.$refs["nav"].getBoundingClientRect().height;
    }
  },
  mounted: function() {
    this.navHeight = this.getNavHeight();
    //this.$refs["content"].style.paddingTop = this.navHeight + "px";
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
  --accent: #FF0266;
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
p {
  font-size: 1rem;
}
a {
  text-decoration: none;
  border-bottom: 2px solid var(--accent);
  padding-bottom: 2px;
  color: var(--fg);
}
a:hover {
  text-decoration: none;
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
#nav {
  width: 100%;
  padding: 20px 0px;
  background-color: var(--bg);
  position: sticky;
  top: 0;
}
#nav .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.logo-container {
  color: var(--accent);
}

/* ---------- Basic Components ---------- */
.content {
  padding-top: 1rem;
}
/* ---------- Media Queries ---------- */
/* TODO: Define breakpoints */

@media screen and (min-width: 992px) {
  .container {
    width: 80%;
  }
}
</style>
