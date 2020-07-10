<template>
  <div class="home">
    <div class="container">
      <h1>Home</h1>
      <p>actual application for finding events, buying tickets, etc</p>
      <h3>Buttons</h3>
      <div class="button-list">
        <Button v-bind:label="'Neutral'"></Button>
        <Button v-bind:label="'Good'" class="confirm"></Button>
        <Button v-bind:label="'Bad'" class="cancel"></Button>
        <h4>Rounded</h4>
        <Button v-bind:label="'Neutral'" class="round"></Button>
      </div>
      <h3>Links</h3>
      <a class="link-ix" href="">This is a link</a>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import { MdContent } from "vue-material/dist/components";
Vue.use(MdContent);
import Button from "./../components/basics/Button";
export default {
  name: "Home",
  components: {
    Button
  },
  data() {
    return {};
  },
  methods: {}
};
</script>

<style scoped>
.button-list .button {
  margin: 0 20px;
}
</style>
