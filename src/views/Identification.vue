<template>
  <div id="identity">
    <div class="container">
      <div class="verification-wrapper">
        <div class="md-layout-item">
          <md-field class="md-field-select-verification-option">
            <label>VerificationOption</label>
            <md-select
              v-model="verificationOption"
              name="verificationOption"
              id="verificationOption"
              placeholder="Verification Option"
            >
              <md-option value="phone-verification">Phone Number</md-option>
              <md-option value="mail-verification">Mail Address</md-option>
            </md-select>
          </md-field>
        </div>
        <div class="form-wrapper">
          <PhoneVerificationForm
            ref="phone-verification"
            id="phone-verification"
          ></PhoneVerificationForm>
          <MailVerificationForm
            ref="mail-verification"
            id="mail-verification"
          ></MailVerificationForm>
        </div>
      </div>
      <div class="approver-list-wrapper">
        <div
          class="approver-wrapper"
          v-for="approver in approvers"
          v-bind:key="approver.id"
        >
          <div class="overview">
            <h3 @click="toggleApprover(approver.id)">{{ approver.name }}</h3>
            <span class="status">{{ getApprovedFraction(approver.id) }}</span>
          </div>
          <div class="approver-methods" :ref="'methods_' + approver.id">
            <div
              class="method"
              v-for="(method, index) in approver.methods"
              v-bind:key="approver.id + index"
            >
              <span class="name">{{ method.name }}</span>
              <span class="status">
                <i class="material-icons" v-if="method.approved">done</i>
                <i class="material-icons" v-if="!method.approved">close</i>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PhoneVerificationForm from "../components/PhoneVerificationForm";
import MailVerificationForm from "../components/MailVerificationForm";

export default {
  name: "Identification",
  components: { PhoneVerificationForm, MailVerificationForm },
  data() {
    return {
      verificationOption: "",
      approvers: [
        {
          name: "Idetix",
          id: "0",
          methods: [
            {
              name: "Mail",
              approved: false
            },
            {
              name: "Phone",
              approved: true
            },
            {
              name: "Airbnb",
              approved: false
            }
          ]
        },
        {
          name: "Starticket",
          id: "1",
          methods: [
            {
              name: "Mail",
              approved: false
            },
            {
              name: "Phone",
              approved: false
            },
            {
              name: "Blackberry",
              approved: false
            }
          ]
        }
      ]
    };
  },
  watch: {
    verificationOption: function(val) {
      this.toggleForm(val);
    }
  },
  methods: {
    getApprovedFraction: function(approver_id) {
      var approver = this.approvers.filter(app => app.id === approver_id)[0];
      var approved = 0;
      var total = 0;
      approver.methods.forEach(method => {
        if (method.approved) approved += 1;
        total += 1;
      });
      return `${approved}/${total}`;
    },
    toggleApprover: function(approved_id) {
      var test = `methods_${approved_id}`;
      var element = this.$refs[test][0];
      console.log(element);
      if (element.classList.contains("open")) {
        element.classList.remove("open");
      } else {
        element.classList.add("open");
      }
    },
    toggleForm: function(option) {
      var phoneElem = document.getElementById(`phone-verification`);
      var mailElem = document.getElementById(`mail-verification`);
      if (option === `phone-verification`) {
        if (!phoneElem.classList.contains("open")) {
          console.log("not containing open");
          phoneElem.classList.add("open");
        }
        if (mailElem.classList.contains("open")) {
          mailElem.classList.remove("open");
        }
      } else if (option === `mail-verification`) {
        if (!mailElem.classList.contains("open")) {
          mailElem.classList.add("open");
        }
        if (phoneElem.classList.contains("open")) {
          phoneElem.classList.remove("open");
        }
      }
    }
  }
};
</script>

<style>
.approver-methods {
  margin-bottom: 1rem;
  max-height: 0;
  transition: max-height 0.3s linear;
  overflow: hidden;
}
.approver-methods.open {
  max-height: 500px;
}

.overview {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}
.overview h3 {
  margin: 0;
  cursor: pointer;
  font-size: 1.3rem;
}

.approver-list-wrapper {
  border-top: 2px solid black;
  padding-top: 1rem;
  margin-top: ;
}

.approver-wrapper {
  border-bottom: 2px solid black;
  margin-bottom: 1rem;
  max-height: 3rem;
}

.method {
  display: flex;
  justify-content: space-between;
}

.md-field-select-verification-option {
  margin: 0;
}

#phone-verification {
  margin-bottom: 1rem;
  max-height: 0;
  transition: max-height 0.3s linear;
  overflow: hidden;
}
#phone-verification.open {
  max-height: 500px;
}

#mail-verification {
  margin-bottom: 1rem;
  max-height: 0;
  transition: max-height 0.3s linear;
  overflow: hidden;
}
#mail-verification.open {
  max-height: 500px;
}
</style>
