<template>
  <div id="identity">
    <div class="container">
      <h1>Identity</h1>
      <div class="search"></div>
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
import Vue from "vue";

import { MdIcon } from "vue-material/dist/components";
import "material-design-icons";
Vue.use(MdIcon);

export default {
  name: "Identification",
  data() {
    return {
      approvers: [
        {
          name: "Idetix",
          id: "0",
          methods: [
            {
              name: "Mail",
              approved: false,
            },
            {
              name: "Phone",
              approved: true,
            },
            {
              name: "Airbnb",
              approved: false,
            },
          ],
        },
        {
          name: "Starticket",
          id: "1",
          methods: [
            {
              name: "Mail",
              approved: false,
            },
            {
              name: "Phone",
              approved: false,
            },
            {
              name: "Blackberry",
              approved: false,
            },
          ],
        },
      ],
    };
  },
  methods: {
    getApprovedFraction: function(approver_id) {
      var approver = this.approvers.filter((app) => app.id == approver_id)[0];
      var approved = 0;
      var total = 0;
      approver.methods.forEach((method) => {
        if (method.approved) approved += 1;
        total += 1;
      });
      return `${approved}/${total}`;
    },
    toggleApprover: function(approved_id) {
      //var approver = this.approvers.filter((app) => app.id == approver_id)[0];
      var test = `methods_${approved_id}`;
      var element = this.$refs[test][0];
      if (element.classList.contains("open")) {
        element.classList.remove("open");
      } else {
        element.classList.add("open");
      }
    },
  },
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

.approver-wrapper {
  border-bottom: 2px solid black;
  margin-bottom: 2rem;
}

.method {
  display: flex;
  justify-content: space-between;
}
</style>
