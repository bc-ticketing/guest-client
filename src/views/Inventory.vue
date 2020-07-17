<template>
  <div class="container">
    <div class="ticket-list">
      <Ticket
        v-for="(ticket, index) in tickets"
        v-bind:key="index"
        v-bind:eventinfo="ticket"
      />
    </div>
  </div>
</template>

<script>
import Ticket from "./../components/Ticket";

export default {
  name: "Inventory",
  data() {
    return {
      tickets: [
        {
          name: "Bastille",
          Type: "Concert",
          lowestPrice: "0.2",
          date: "15.12.20",
          location: "Zurich",
          id: "1",
          organizer: "Events Gmbh",
          description:
            "This will be an awesome open air if covid-19 does not fuck it up and it will be super cool for sure",
          approvers: "Idetix",
          img_url: require("@/assets/event_img/event_1.jpg"),
        },
      ],
    };
  },
  components: {
    Ticket,
  },
};
</script>

<style></style>
