<template>
  <div id="app">
    <div id="nav">
      <div class="logo-container">
        <!-- <img src="" alt="Logo" /> -->
        Idetix
      </div>
      <Navigation />
    </div>
    <div class="container">
      <router-view />
    </div>
  </div>
</template>

<script>
// Material kit css
import "vue-material/dist/vue-material.min.css";
import "vue-material/dist/theme/default.css";
import Navigation from "./components/Navigation";
import Vue from "vue";

// Importing Modules from the material kit, these are global imports
// For components only used in single views, import locally
import { MdButton } from "vue-material/dist/components";
Vue.use(MdButton);

export default {
  components: {
    Navigation
  },
};
</script>

<style>
/* ----------- Color Definitions ----------- */
:root {
  --fg: black;
  --bg: white;
  --accent: red;
  /* more colors to come */
}
/* ---------- Global Styles ---------- */
body,
html {
  font-size: 16px;
  /* Placeholder font */
  font-family: "Courier New", Courier, monospace;
  color: var(--fg);
  background-color: var(--bg);
}
h1 {
  font-size: 3rem;
}
h2 {
  font-size: 2.5rem;
}
h3 {
  font-size: 2.2rem;
}
h4 {
  font-size: 1.6rem;
}
h5 {
  font-size: 1.2rem;
}
p {
  font-size: 1rem;
}
.container {
  width: 90%;
  max-width: 1080px;
  margin: auto;
}



/* ---------- Navigation Bar ---------- */
#nav {
  display: flex;
  width: 100%;
  padding: 50px 20px;
  justify-content: space-between;
  align-items: center;
}
#nav a {
  text-decoration: none;
  color: var(--fg);
}
#nav a.router-link-active {
  color: var(--accent);
}
/* ---------- Media Queries ---------- */
/* TODO: Define breakpoints */

@media screen and (min-width: 992px) {
  .container {
    width: 80%;
  }
}
</style>
