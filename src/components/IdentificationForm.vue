<template>
  <div class="selection" v-bind:class="{ open: open }">
    <div class="wrapper">
      <span class="close-icon" @click="close">
        <md-icon>close</md-icon>
      </span>

      <div class="form-version mail" v-bind:class="{ active: this.method === 'mail' }">
        <div class="form-group">
          <label for="mail">Mail</label>
          <input type="text" name="mail" v-model="mail"/>
        </div>
      </div>

      <div class="form-version phone" v-bind:class="{ active: this.method === 'phone' }">
        <div class="form-group">
          <label for="phone">Phone</label>
          <input type="text" name="phone" v-model="phone"/>
        </div>
      </div>

      <div class="form-version kyc" v-bind:class="{ active: this.method === 'kyc' }">
        <div class="form-group mail">
          <label for="mail">KYC</label>
        </div>
      </div>
      <md-button class="md-raised" @click="submit">Submit</md-button>
    </div>
  </div>
</template>

<script>
export default {
  name: "IdentificationForm",
  components: {},
  data() {
    return {
      mail: '',
      phone: '',
      kyc: {}
    };
  },
  props: {
    open: Boolean,
    method: String,
  },
  mounted: function() {},
  computed: {},
  methods: {
    close: function() {
      this.$emit("close");
    },
    isValidMail: function() {
      //todo: make real check
      return this.mail.indexOf('@') != -1;
    },
    submit: async function() {
      if(this.method === 'mail') {
        if (this.isValidMail()){
          await this.$store.dispatch('verifyUser', {mail: this.mail, method: this.method});
        }
      } else if (this.method === 'phone') {
        await this.$store.dispatch('verifyUser', {phone: this.phone, method: this.method});
      } else {
        console.log('kyc');
      }
    }
  },
};
</script>

<style scoped>
.selection {
  position: absolute;
  top: 100vh;
  left: 0;
  transition: transform 0.5s ease-in-out;
  width: 100vw;
  background-color: aliceblue;
  z-index: 9999;
}

.selection.open {
  transform: translateY(-100%);
}

.wrapper {
  position: relative;
  padding: 2rem;
  padding-bottom: 4rem;
}

.close-icon {
  position: absolute;
  top: 1rem;
  right: 1rem;
  cursor: pointer;
}

.form-version {
  display: none;
  transition: opacity 0.3s ease-in-out;
}

.form-version.active {
  display: block;
}
</style>
