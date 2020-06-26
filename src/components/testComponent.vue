<template>
  <div class="container">
    <div class="response">
      {{ someValue }}
    </div>

    <!--  
    <h3>{{someValue}}</h3>
    <input type="text" placeholder="something" v-model="name" />
    <div>{{ name }}</div>
    <md-button class="md-primary" @click="submitForm">submit</md-button>
    -->
  </div>
</template>

<script>
export default {
  name: "testComponent",
  data() {
    return {
      metadataURI: "",
      name: "",
      a: 5,
      b: 10,
    };
  },
  props: {
    someValue: String,
  },
  methods: {
    submitForm: function() {
      console.log(this.name);
      console.log(this.c);
      //ajax.post();
    },
  },
  computed: {
    c: function() {
      return this.a + this.b;
    },
  },
  mounted: function() {
    console.log(this.name);
  },
};
</script>

<style scoped></style>
