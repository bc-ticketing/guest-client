<template>
  <div class="navigation-container">
    <div class="navigation-links">
      <router-link to="/">Home</router-link> |
      <router-link to="/event-hosting">Event Hosting</router-link> |
      <router-link to="/identification">Identification</router-link> |
      <router-link to="/lottery">Lottery</router-link> |
      <router-link to="/wallet-funding">Wallet Funding</router-link> |
      <router-link to="/simple-storage">Simple Storage</router-link>
    </div>

    <div class="burger-wrapper">
      <div
        id="burger"
        @click="toggleMobileNav"
        v-bind:class="{ open: mobileNavOpen }"
      >
        <span class="burger-bar bar1"></span>
        <span class="burger-bar bar2"></span>
        <span class="burger-bar bar3"></span>
      </div>
    </div>

    <div class="navigation-mobile" v-bind:class="{ open: mobileNavOpen }">
      <router-link to="/">Home</router-link>
      <router-link to="/event-hosting">Event Hosting</router-link>
      <router-link to="/identification">Identification</router-link>
      <router-link to="/lottery">Lottery</router-link>
      <router-link to="/wallet-funding">Wallet Funding</router-link>
      <router-link to="/simple-storage">Simple Storage</router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: "Navigation",
  data() {
    return {
      mobileNavOpen: false,
    };
  },
  methods: {
    toggleMobileNav: function() {
      this.mobileNavOpen = !this.mobileNavOpen;
    },
  },
};
</script>

<style scoped>
#burger {
  transition: transform 1s linear, background-color 1s linear;
}

#burger.open {
  transform: rotateZ(180deg);
}

.burger-bar {
  height: 3px;
  width: 15px;
  background-color: black;
  display: block;
  margin-bottom: 2px;
}
.navigation-links {
  display: none;
}

.burger-wrapper {
  position: absolute;
  top: 50px;
  right: 50px;
  z-index: 99;
  cursor: pointer;
  background-color: white;
}

.navigation-mobile {
  position: absolute;
  top: 0;
  left: 0;
  transform: translateX(-100vw);
  height: 100vh;
  width: 100vw;
  transition: transform 0.3s linear;
  background-color: white;
  padding: 50px;
}
.navigation-mobile a {
  display: block;
}
.navigation-mobile.open {
  transform: translateX(0);
}

@media screen and (min-width: 992px) {
  .burger-wrapper {
    display: none;
  }
  .navigation-links {
    display: block;
  }
  .navigation-mobile {
    display: none;
  }
}
</style>
