<template>
  <md-bottom-bar class="md-accent bottom-bar" :class="theme">
    <div ref="wrapper">
      <md-bottom-bar-item
        md-icon="home"
        @click="
          theme = '#00bec0';
          navigateTo('home');
        "
      ></md-bottom-bar-item>
      <md-bottom-bar-item
        md-icon="search"
        @click="
          theme = 'orange';
          navigateTo('event-list');
        "
      ></md-bottom-bar-item>
      <md-bottom-bar-item
        md-icon="theaters"
        @click="
          theme = 'red';
          navigateTo('inventory');
        "
      ></md-bottom-bar-item>
      <md-bottom-bar-item
        md-icon="face"
        @click="
          theme = 'red';
          navigateTo('identification');
        "
      ></md-bottom-bar-item>
    </div>
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
    navigateTo: async function(view) {
      try {
        await this.$router.push({ name: view, params: {} });
      } catch {
        return;
      }
    },
  },
  mounted: function() {
    this.$emit("height", this.$refs["wrapper"].getBoundingClientRect().top);
  },
};
</script>

<style scoped>
.bottom-bar {
  position: sticky;
  bottom: 0;
  height: 56px;
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
