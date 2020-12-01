<template>
  <div id="identity" class="content">
    <div class="container">
      <md-card
        v-for="approver in $store.state.approvers"
        v-bind:key="approver.approverAddress"
      >
        <md-card-content>
          <div class="approver">
            <div class="md-title">{{ approver.title }}</div>
            <div class="md-subhead" v-if="isIdetix(approver.approverAddress)">
              You can verify yourself with idetix right in the application. Make
              sure to check which approvers are listed on the events you are
              interested in!
            </div>
            <div
              class="method"
              v-for="method in approver.methods"
              v-bind:key="method.value"
            >
              <h4>{{ method.value }}</h4>

              <md-button
                v-if="
                  !userVerified(approver, method.level) &&
                    isIdetix(approver.approverAddress)
                "
                class="md-raised"
                @click="openForm(approver, method.level, method.value)"
                >Verify</md-button
              >
              <span
                class="status good"
                v-if="userVerified(approver, method.level)"
              >
                <md-icon>done</md-icon>
              </span>
            </div>
          </div>
        </md-card-content>
      </md-card>
    </div>
    <IdentificationForm
      v-bind:method="desiredMethod"
      v-bind:level="desiredLevel"
      v-bind:approver="approver"
      v-bind:open="formOpen"
      v-on:close="closeForm()"
    ></IdentificationForm>
  </div>
</template>

<script>
import IdentificationForm from "./../components/IdentificationForm";

export default {
  name: "Identification",
  components: {
    IdentificationForm,
  },
  data() {
    return {
      desiredMethod: "",
      desiredLevel: 0,
      approver: undefined,
      formOpen: false,
    };
  },
  watch: {},
  methods: {
    isIdetix(address) {
      return address === process.env.VUE_APP_IDETIX_APPROVER;
    },
    userVerified(approver, level) {
      try {
        const approvedLevel = this.$store.state.activeUser.approvalLevels[
          approver.approverAddress
        ].level;
        return approvedLevel >= level;
      } catch {
        return false;
      }
    },
    openForm(approver, level, name) {
      this.desiredMethod = name;
      this.approver = approver;
      this.desiredLevel = level;
      this.formOpen = true;
    },
    closeForm() {
      this.formOpen = false;
    },
  },
  computed: {},
  mounted: function() {
    this.$root.$emit("hideSearchBar");
  },
};
</script>

<style>
#identity {
  padding-top: 2rem;
  height: var(--vh);
  overflow-y: hidden;
  position: relative;
}
.method {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.method h4 {
  display: inline-block;
  margin-right: 1rem;
}
hr {
  margin-bottom: 2rem;
}
.good i.md-icon {
  font-size: 2rem !important;
  color: var(--green) !important;
}
</style>
