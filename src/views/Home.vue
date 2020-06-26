<template>
  <div class="home">
    <h1>Home</h1>
    <p>actual application for finding events, buying tickets, etc</p>
    <md-button class="md-primary">Primary</md-button>
  </div>
</template>

<script>
import Vue from "vue";
import { MdContent } from "vue-material/dist/components";
Vue.use(MdContent);

export default {
  name: "Home",
  components: {},
  data() {
    return {};
  },
  methods: {},
};
</script>

<style scoped></style>
