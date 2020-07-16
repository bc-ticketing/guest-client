<template>
  <div id="phone-verification">
    <div class="container">
      <div class="input-wrapper">
        <md-field>
          <label>Phone number</label>
          <span class="md-prefix">+41</span>
          <md-input md-counter="9" maxlength="9"></md-input>
        </md-field>
        <md-button class="md-primary" @click.native="showPhoneSignatureInputs()"
          >Send code.</md-button
        >
      </div>
      <md-button class="md-primary" @click.native="showPhoneSignatureInputs()"
        >I already have a code.</md-button
      >
      <div
        class="phone-signature-input-wrapper"
        id="phone-signature-input-wrapper"
      >
        <md-field>
          <label>Signed code</label>
          <md-input md-counter="32" maxlength="32"></md-input>
        </md-field>
        <md-button class="md-primary">Request Verification.</md-button>
        <div class="submission-finish"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "PhoneVerificationForm",
  data: () => ({
    approvers: null
  }),
  methods: {
    showPhoneSignatureInputs: function() {
      document.getElementById(`signature-input-wrapper`).classList.add("open");
    }
  }
};
</script>

<style scoped>
.input-wrapper {
  display: flex;
}

.signature-input-wrapper {
  margin-bottom: 1rem;
  max-height: 0;
  transition: max-height 0.3s linear;
  overflow: hidden;
}
.signature-input-wrapper.open {
  max-height: 500px;
}
</style>
