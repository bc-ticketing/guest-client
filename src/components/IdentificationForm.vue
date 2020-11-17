<template>
  <div class="selection md-elevation-9" v-bind:class="{ open: open }">
    <div class="wrapper">
      <span class="close-icon" @click="close">
        <md-icon>close</md-icon>
      </span>

      <div
        class="form-version mail"
        v-bind:class="{ active: this.method === 'email' }"
      >
        <md-steppers md-linear :md-active-step.sync="mailForm.progress.active">
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
              <md-field>
                <label for="mail"></label>
                <md-input
                  type="text"
                  name="mail"
                  id="mail"
                  placeholder="mail"
                  v-model="mailForm.mail"
                />
              </md-field>

              <md-button class="md-raised" @click="submitMail"
                >Submit</md-button
              >
            </div>
          </md-step>
          <md-step
            id="mail_verify"
            :md-editable="false"
            :md-done.sync="mailForm.progress.mail_verify"
          >
            <div class="form-group">
              <p>
                Copy the code we sent you via mail and paste it into the
                'secret' field
              </p>
              <md-field>
                <label for="secret mail">secret</label>
                <md-input
                  type="text"
                  name="secret mail"
                  id="secret_mail"
                  placeholder="secret"
                  v-model="mailForm.secret"
                />
              </md-field>

              <md-button class="md-raised" @click="verifyMail"
                >Submit</md-button
              >
            </div>
          </md-step>
          <md-step
            id="mail_done"
            :md-editable="false"
            :md-done.sync="mailForm.progress.mail_done"
          >
            <div class="form-group">
              <p>
                You are all done!
              </p>
            </div>
          </md-step>
        </md-steppers>
      </div>

      <div
        class="form-version phone"
        v-bind:class="{ active: this.method === 'mobile phone' }"
      >
        <md-steppers md-linear :md-active-step.sync="phoneForm.progress.active">
          <md-step
            id="phone_submit"
            :md-done.sync="phoneForm.progress.phone_submit"
            :md-editable="false"
          >
            <div class="form-group">
              <p>
                In this first step of the approval process we will send you a
                mail with a code! Please provide your phone number so that we
                can contact you.
              </p>
              <md-field>
                <label for="phoneNr">phone number</label>
                <md-input
                  name="phoneNr"
                  id="phoneNr"
                  type="text"
                  placeholder="phone"
                  v-model="phoneForm.phone"
                />
              </md-field>

              <md-button class="md-raised" @click="submitPhone"
                >Submit</md-button
              >
            </div>
          </md-step>
          <md-step
            id="phone_verify"
            :md-editable="false"
            :md-done.sync="phoneForm.progress.phone_verify"
          >
            <div class="form-group">
              <p>
                Copy the code we sent you via phone and paste it into the
                'secret' field
              </p>
              <md-field>
                <label for="secret_phone">Secret</label>
                <md-input
                  type="text"
                  name="secret phone"
                  id="secret_phone"
                  placeholder="secret"
                  v-model="phoneForm.secret"
                />
              </md-field>

              <md-button class="md-raised" @click="verifyPhone"
                >Submit</md-button
              >
            </div>
          </md-step>
          <md-step
            id="phone_done"
            :md-editable="false"
            :md-done.sync="phoneForm.progress.phone_done"
          >
            <div class="form-group">
              <p>
                You are all done!
              </p>
            </div>
          </md-step>
        </md-steppers>
      </div>

      <div
        class="form-version kyc"
        v-bind:class="{ active: this.method === 'kyc' }"
      >
        <md-steppers md-linear :md-active-step.sync="kycForm.progress.active">
          <md-step
            id="kyc_submit"
            :md-done.sync="kycForm.progress.kyc_submit"
            :md-editable="false"
          >
            <camera />

            <div class="form-group">
              <p>
                In this first step of the approval process we will send you a
                mail with a code! Please provide your phone number so that we
                can contact you.
              </p>
              <md-field>
                <label>mrz</label>
                <md-file @change="assignMrzFile($event)" accept="image/*" />
              </md-field>
              <md-field>
                <label>front</label>
                <md-file @change="assignFrontFile($event)" accept="image/*" />
              </md-field>
              <md-field>
                <label>selfie</label>
                <md-file @change="assignSelfieFile($event)" accept="image/*" />
              </md-field>

              <md-button class="md-raised" @click="submitKYC">Submit</md-button>
            </div>
          </md-step>
          <md-step
            id="kyc_done"
            :md-editable="false"
            :md-done.sync="kycForm.progress.kyc_done"
          >
            <div class="form-group">
              <p>
                You are all done!
              </p>
            </div>
          </md-step>
        </md-steppers>
      </div>
    </div>
  </div>
</template>

<script>
import {
  requestMailValidationCode,
  requestPhoneValidationCode,
  requestMailVerification,
  requestPhoneVerification,
  requestKYCVerification,
} from "./../util/identity";
import Camera from "./camera.vue";

export default {
  name: "IdentificationForm",
  components: { Camera },
  data() {
    return {
      mailForm: {
        mail: "",
        secret: "",
        signedSecret: "",
        progress: {
          active: "mail_submit",
          mail_submit: false,
          mail_verify: false,
          mail_done: false,
          // secondStepError: null
        },
      },
      phoneForm: {
        phone: "",
        secret: "",
        signedSecret: "",
        progress: {
          active: "phone_submit",
          phone_submit: false,
          phone_verify: false,
          phone_done: false,
        },
      },
      kycForm: {
        mrz: undefined,
        front: undefined,
        selfie: undefined,
        progress: {
          active: "kyc_submit",
          kyc_submit: false,
          kyc_done: false,
        },
      },
    };
  },
  props: {
    open: Boolean,
    approver: Object,
    method: String,
    level: Number,
  },
  mounted: function() {},
  computed: {},
  methods: {
    assignMrzFile(event) {
      const file = event.target.files[0];
      console.log(file);
      this.kycForm.mrz = file;
    },
    assignFrontFile(event) {
      const file = event.target.files[0];
      console.log(file);
      this.kycForm.front = file;
    },
    assignSelfieFile(event) {
      const file = event.target.files[0];
      console.log(file);
      this.kycForm.selfie = file;
    },
    close: function() {
      this.$emit("close");
    },
    isValidMail: function() {
      //todo: make real check
      return this.mailForm.mail.indexOf("@") != -1;
    },
    isValidPhone: function() {
      return true;
      //todo: make real check
    },
    submitMail: async function() {
      if (this.isValidMail()) {
        const result = await requestMailValidationCode(this.mailForm.mail);
        if (result) {
          this.mailForm.progress.active = "mail_verify";
        }
      }
    },
    submitPhone: async function() {
      if (this.isValidPhone()) {
        const result = await requestPhoneValidationCode(this.phoneForm.phone);
        if (result) {
          this.phoneForm.progress.active = "phone_verify";
        }
      }
    },
    // addKYCIdentity(MultipartFile mrz, MultipartFile front, MultipartFile selfie)
    submitKYC: async function() {
      console.log(this.kycForm.mrz);

      const result = await requestKYCVerification(
        this.kycForm.mrz,
        this.kycForm.front,
        this.kycForm.selfie
      );
      console.log(result);
    },
    /*
      @RequestParam String eMail
      @RequestParam String secret,
      @RequestParam String signedSecret
      @RequestParam String ethAddress
      */
    verifyMail: async function() {
      const signedSecret = await this.$store.state.web3.web3Instance.eth.personal.sign(
        this.mailForm.secret,
        this.$store.state.activeUser.account
      );
      console.log(signedSecret);
      const result = await requestMailVerification(
        this.mailForm.mail,
        this.mailForm.secret,
        signedSecret,
        this.$store.state.activeUser.account
      );
      console.log(result);
      if (result) {
        this.mailForm.progress.active = "mail_done";
        this.$root.dispatch("registerActiveUser");
      }
    },
    verifyPhone: async function() {
      const signedSecret = await this.$store.state.web3.web3Instance.eth.personal.sign(
        this.phoneForm.secret,
        this.$store.state.activeUser.account
      );
      console.log(signedSecret);
      const result = await requestPhoneVerification(
        this.phoneForm.phone,
        this.phoneForm.secret,
        signedSecret,
        this.$store.state.activeUser.account
      );
      console.log(result);
      if (result) {
        this.phoneForm.progress.active = "phone_done";
        this.$root.dispatch("registerActiveUser");
      }
    },
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
  background-color: white;
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
