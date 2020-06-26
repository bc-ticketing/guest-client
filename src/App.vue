<template>
  <div id="app">
    <div id="nav">
      <div class="logo-container">
        <img src="" alt="Logo" />
      </div>
      <div class="navigation-container">
        <router-link to="/">Home</router-link> |
        <router-link to="/event-hosting">Event Hosting</router-link> |
        <router-link to="/identification">Identification</router-link> |
        <router-link to="/lottery">Lottery</router-link> |
        <router-link to="/wallet-funding">Wallet Funding</router-link> |
        <router-link to="/simple-storage">Simple Storage</router-link>
      </div>
    </div>
    <div class="container">
      <router-view />
    </div>
  </div>
</template>

<script>
export default {
  components: {},
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
  width: 80%;
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
@media only screen and (max-width: 600px) {
}
</style>
