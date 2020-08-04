<template>
  <md-bottom-bar class="bottom-bar" md-type="shift" :class="theme">
    <md-bottom-bar-item
      md-label="Home"
      md-icon="home"
      @click="
        theme = '#00bec0';
        navigateTo('home');
      "
    ></md-bottom-bar-item>
    <md-bottom-bar-item
      md-label="Events"
      md-icon="event_available"
      @click="
        theme = 'orange';
        navigateTo('event-list');
      "
    ></md-bottom-bar-item>
    <md-bottom-bar-item
      md-label="Inventory"
      md-icon="theaters"
      @click="
        theme = 'red';
        navigateTo('inventory');
      "
    ></md-bottom-bar-item>
    <md-bottom-bar-item
      md-label="Identity"
      md-icon="face"
      @click="
        theme = 'red';
        navigateTo('identification');
      "
    ></md-bottom-bar-item>
  </md-bottom-bar>
</template>

<script>
export default {
  name: "bottomBar",
  data() {
    return {
      theme: "teal",
    };
  },
  props: {},
  methods: {
    navigateTo: function(view) {
      this.$router.push({ name: view, params: {} });
    },
  },
  mounted: function() {},
};
</script>

<style scoped>
.bottom-bar {
  position: fixed;
  bottom: 0;
  z-index: 99;
}
.bottom-bar.teal {
  background-color: #64ffda;
}
.bottom-bar.orange {
  background-color: #ffab40;
}
.bottom-bar.red {
  background-color: #ff5252;
}
</style>
