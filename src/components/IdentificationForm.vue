<template>
  <div class="selection" v-bind:class="{ open: open }">
    <div class="wrapper">
      <span class="close-icon" @click="close">
        <md-icon>close</md-icon>
      </span>

      <div
        class="form-version mail"
        v-bind:class="{ active: this.method === 'email' }"
      >
        <md-steppers md-linear
        :md-active-step.sync = mailForm.progress.active>
          <md-step 
          id="mail_submit"
          :md-done.sync="mailForm.progress.mail_submit"
          :md-editable="false"
          >
            <div class="form-group">
              <p>
                In this first step of the approval process we will send you a
                mail with a code! Please provide your email address so that we
                can contact you.
              </p>
              <input
                type="text"
                name="mail"
                placeholder="mail"
                v-model="mailForm.mail"
              />
              <md-button class="md-raised" @click="submitMail">Submit</md-button>
            </div>
          </md-step>
          <md-step id='mail_verify'
          :md-editable="false"
          :md-done="mailForm.progress.mail_verify"></md-step>
        </md-steppers>
      </div>

      <div
        class="form-version phone"
        v-bind:class="{ active: this.method === 'phone' }"
      >
        <div class="form-group">
          <label for="phone">Phone</label>
          <input type="text" name="phone" v-model="phoneForm.phone" />
        </div>
      </div>

      <div
        class="form-version kyc"
        v-bind:class="{ active: this.method === 'kyc' }"
      >
        <div class="form-group mail">
          <label for="mail">KYC</label>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { requestMailValidationCode } from './../util/identity';

export default {
  name: "IdentificationForm",
  components: {},
  data() {
    return {
      mailForm: {
        mail: '',
        progress: {
          active: 'mail_submit',
          mail_submit: false,
          mail_verify: false,
          // secondStepError: null
    }
      },
      phoneForm: {
        phone: '',
        step: 0,
      },
    };
  },
  props: {
    open: Boolean,
    approver: Object,
    method: String,
    level: Number
  },
  mounted: function() {},
  computed: {},
  methods: {
    close: function() {
      this.$emit("close");
    },
    isValidMail: function() {
      //todo: make real check
      return this.mailForm.mail.indexOf("@") != -1;
    },
    submitMail: async function() {
      if (this.isValidMail()) {
          const result = await requestMailValidationCode(this.mailForm.mail);
          console.log(result);
      }
    },
    submitPhone: async function() {

        await this.$store.dispatch("verifyUser", {
          phone: this.phone,
          method: 'phone'
        });
  }
  }
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
  padding: 0.5rem;
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
