<template>
  <div class="navigation-container">
    <div class="navigation-links">
      <router-link to="/">Home</router-link>
      <router-link to="/events">Events</router-link>
      <router-link to="/identification">Identification</router-link>
      <router-link to="/lottery">Lottery</router-link>
      <router-link to="/wallet-funding">Wallet Funding</router-link>
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

    <div
      class="navigation-mobile"
      v-bind:class="{ open: mobileNavOpen }"
      ref="mobile-nav"
    >
      <router-link to="/">Home</router-link>
      <router-link to="/events">Events</router-link>
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
  props: {
    navHeight: Number,
  },
  methods: {
    toggleMobileNav: function() {
      this.mobileNavOpen = !this.mobileNavOpen;
      this.$refs["mobile-nav"].style.top = this.navHeight + "px";
    },
  },
  mounted: function() {},
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
  z-index: 99;
  cursor: pointer;
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
  border-bottom: none;
}
.navigation-links a {
  margin-right: 20px;
  position: relative;
  padding-bottom: 2px;
  border-bottom: none;
  color: var(--fg-light);
}
.navigation-links a:hover {
  border-bottom: none;
  text-decoration: none;
}

.navigation-links a:before {
  content: "";
  position: absolute;
  width: 100%;
  height: 0px;
  border-bottom: 2px solid black;
  bottom: -3px;
  -webkit-transform: scaleX(0);
  -ms-transform: scaleX(0);
  transform: scaleX(0);
  -webkit-transition: -webkit-transform 0.2s ease-in;
  transition: transform 0.2s ease-in;
}

.navigation-links a:hover:before {
  -webkit-transform: scaleX(1);
  -ms-transform: scaleX(1);
  transform: scaleX(1);
}
.navigation-links a:last-child {
  margin-right: 0px;
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
