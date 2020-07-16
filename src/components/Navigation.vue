<template>
  <div class="navigation-container">
    <!--
    <div class="navigation-links">
      <router-link to="/">Home</router-link>
      <router-link to="/event-list">Events</router-link>
      <router-link to="/identification">Identification</router-link>
      <router-link to="/lottery">Lottery</router-link>
      <router-link to="/wallet-funding">Wallet Funding</router-link>
      <router-link to="/simple-storage">Simple Storage</router-link>
    </div>

    <div class="burger-wrapper">
      <button
        class="hamburger hamburger--elastic"
        type="button"
        v-bind:class="{ open: mobileNavOpen }"
        @click="toggleMobileNav"
      >
        <span class="hamburger-box">
          <span class="hamburger-inner"></span>
        </span>
      </button>
    </div>

    <div
      class="navigation-mobile"
      v-bind:class="{ open: mobileNavOpen }"
      ref="mobile-nav"
      @click="toggleMobileNav"
    >
      <router-link to="/">Home</router-link>
      <router-link to="/event-list">Events</router-link>
      <router-link to="/identification">Identification</router-link>
      <router-link to="/lottery">Lottery</router-link>
      <router-link to="/wallet-funding">Wallet Funding</router-link>
      <router-link to="/simple-storage">Simple Storage</router-link>
    </div>
    -->
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
.phone-viewport {
  width: 100vw;
  height: 200px;
  display: inline-flex;
  align-items: flex-end;
  overflow: hidden;
  border: 1px solid rgba(#000, 0.26);
  background: rgba(#000, 0.06);
}

.hamburger {
  padding: 15px 15px;
  display: inline-block;
  cursor: pointer;
  transition-property: opacity, filter;
  transition-duration: 0.15s;
  transition-timing-function: linear;
  font: inherit;
  color: inherit;
  text-transform: none;
  background-color: transparent;
  border: 0;
  margin: 0;
  overflow: visible;
}
.hamburger:hover {
  opacity: 0.7;
}
.hamburger.open:hover {
  opacity: 0.7;
}
.hamburger.open .hamburger-inner,
.hamburger.open .hamburger-inner::before,
.hamburger.open .hamburger-inner::after {
  background-color: var(--accent);
}

.hamburger-box {
  width: 40px;
  height: 24px;
  display: inline-block;
  position: relative;
}

.hamburger-inner {
  display: block;
  top: 50%;
  margin-top: -2px;
}
.hamburger-inner,
.hamburger-inner::before,
.hamburger-inner::after {
  width: 40px;
  height: 4px;
  background-color: var(--accent);
  border-radius: 4px;
  position: absolute;
  transition-property: transform;
  transition-duration: 0.15s;
  transition-timing-function: ease;
}
.hamburger-inner::before,
.hamburger-inner::after {
  content: "";
  display: block;
}
.hamburger-inner::before {
  top: -10px;
}
.hamburger-inner::after {
  bottom: -10px;
}
/*
   * Elastic
   */
.hamburger--elastic .hamburger-inner {
  top: 2px;
  transition-duration: 0.275s;
  transition-timing-function: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
.hamburger--elastic .hamburger-inner::before {
  top: 10px;
  transition: opacity 0.125s 0.275s ease;
}
.hamburger--elastic .hamburger-inner::after {
  top: 20px;
  transition: transform 0.275s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.hamburger--elastic.open .hamburger-inner {
  transform: translate3d(0, 10px, 0) rotate(135deg);
  transition-delay: 0.075s;
}
.hamburger--elastic.open .hamburger-inner::before {
  transition-delay: 0s;
  opacity: 0;
}
.hamburger--elastic.open .hamburger-inner::after {
  transform: translate3d(0, -20px, 0) rotate(-270deg);
  transition-delay: 0.075s;
}

#burger {
  transition: transform 1s linear, background-color 1s linear;
}

#burger.open {
  transform: rotateZ(180deg);
}

.burger-bar {
  height: 3px;
  width: 15px;
  background-color: var(--accent);
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
