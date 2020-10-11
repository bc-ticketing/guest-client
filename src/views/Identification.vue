<template>
  <div id="identity">
    <div class="container">
      <div class="title">
        <h3>Idetix Identifiation</h3>
        <p>Some information text</p>
      </div>
      <div class="identification-option">
        <div>
          <md-icon class="icon">mail</md-icon>
          <span class="status">{{ mailVerification }}</span>
        </div>

        <md-button class="md-raised" @click="openForm('mail')">Verify</md-button>
      </div>
      <hr />
      <div class="identification-option">
        <div>
          <md-icon class="icon">phone</md-icon>
          <span class="status">{{ phoneVerification }}</span>
        </div>
        <md-button class="md-raised" @click="openForm('phone')">Verify</md-button>
      </div>
      <hr />
      <div class="identification-option">
        <div>
          <md-icon class="icon">person</md-icon>
          <span class="status">{{ kycVerification }}</span>
        </div>
        <md-button class="md-raised" @click="openForm('kyc')">Verify</md-button>
      </div>
    </div>
    <IdentificationForm
    v-bind:method="identificationMethod"
    v-bind:open="formOpen"
    v-on:close="closeForm()"></IdentificationForm>
  </div>
</template>

<script>
import IdentificationForm from './../components/IdentificationForm';

export default {
  name: "Identification",
  components: {
    IdentificationForm,
  },
  data() {
    return {
      identificationMethod: '',
      formOpen: false,
    };
  },
  watch: {},
  methods: {
    openForm(method) {
      this.identificationMethod = method;
      this.formOpen = true;
    },
    closeForm() {
      this.formOpen = false;
    }
  },
  computed: {
    mailVerification() {
      return this.$store.state.activeUser.idetixIdentity ? this.$store.state.activeUser.idetixIdentity.mail : false;
    },
    phoneVerification() {
      return this.$store.state.activeUser.idetixIdentity ? this.$store.state.activeUser.idetixIdentity.phone : false;
    },
    kycVerification() {
      return this.$store.state.activeUser.idetixIdentity ? this.$store.state.activeUser.idetixIdentity.kyc : false;
    },
  },
  mounted: function() {
    this.$root.$emit('hideSearchBar');
  }
};
</script>

<style>
.identification-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.identification-option .icon {
  margin-right: 1rem;
}
hr {
  margin-bottom: 2rem;
}
</style>
