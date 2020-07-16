<template>
  <div id="mail-verification">
    <div class="container">
      <div class="input-wrapper">
        <md-field>
          <label>Mail address</label>
          <md-input md-counter="50" maxlength="50"></md-input>
        </md-field>
        <md-button class="md-primary" @click.native="showMailSignatureInputs()"
          >Send code.</md-button
        >
      </div>
      <md-button class="md-primary" @click.native="showMailSignatureInputs()"
        >I already have a code.</md-button
      >
      <div
        class="mail-signature-input-wrapper"
        id="mail-signature-input-wrapper"
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
  name: "MailVerificationForm",
  data: () => ({
    approvers: null
  }),
  methods: {
    showMailSignatureInputs: function() {
      document
        .getElementById(`mail-signature-input-wrapper`)
        .classList.add("open");
    }
  }
};
</script>

<style scoped>
.input-wrapper {
  display: grid;
}

.mail-signature-input-wrapper {
  margin-bottom: 1rem;
  max-height: 0;
  transition: max-height 0.3s linear;
  overflow: hidden;
}
.mail-signature-input-wrapper.open {
  max-height: 500px;
}
</style>
