<template>
  <div id="identity">
    <div class="container">
      <div
        class="approver"
        v-for="approver in $store.state.approvers"
        v-bind:key="approver.approverAddress"
      >
        <h3>{{ approver.title }}</h3>
        <div
          class="method"
          v-for="method in approver.methods"
          v-bind:key="method.value"
        >
          <h4>{{ method.value }}</h4>

          <md-button
            v-if="!userVerified(approver, method.level)"
            class="md-raised"
            @click="openForm(approver, method.level, method.value)"
            >Verify</md-button
          >
          <span class="status good" v-else>
            <md-icon>done</md-icon>
          </span>
        </div>
      </div>
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
    IdentificationForm
  },
  data() {
    return {
      desiredMethod: "",
      desiredLevel: 0,
      approver: undefined,
      formOpen: false
    };
  },
  watch: {},
  methods: {
    userVerified(approver, level) {
      return (
        this.$store.state.activeUser && 
        this.$store.state.activeUser.approvalLevels[approver.approvalLevels] && 
        this.$store.state.activeUser.approvalLevels[approver.approverAddress]
          .level >= level
      );
    },
    openForm(approver, level, name) {
      this.desiredMethod = name;
      this.approver = approver;
      this.desiredLevel = level;
      this.formOpen = true;
    },
    closeForm() {
      this.formOpen = false;
    }
  },
  computed: {},
  mounted: function() {
    this.$root.$emit("hideSearchBar");
  }
};
</script>

<style>
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
