<template>
  <div id="mail-verification">
    <div class="container">
      <div class="input-wrapper">
        <md-field>
          <label>Mail address</label>
          <md-input md-counter="50" maxlength="50"></md-input>
        </md-field>
        <md-button class="md-primary">Send code.</md-button>
      </div>
      <md-button class="md-primary">I already have a code.</md-button>
      <div class="signed-input-wrapper">
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
  })
};
</script>

<style scoped>
.input-wrapper {
  display: grid;
}
</style>
