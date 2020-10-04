<template>
  <div class="ticket-wrapper">
    <div
      class="ticket-img"
      :style="{
        backgroundImage: `url(${eventImage})`,
        backgroundColor: `${eventColor}`,
      }"
    ></div>
    <div class="ticket-content">
      <div class="event-title">
        <h3>{{ eventTitle }}</h3>
        <span class="date">
          {{ timeAndDate }}
        </span>
      </div>
      <div class="ticket-info">
        <h3>{{ ticketTitle }}</h3>
        <p v-if="isNf">Non Fungible</p>
        <p v-if="!isNf">Fungible</p>
        <p v-if="isNf">Seat Number: {{ seat }}</p>
        <p v-if="!isNf">Number of tickets: {{ amount }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Ticket",
  data() {
    return {
    };
  },
  props: {
    ticketTypeId: Number,
    ticketId: Number,
    eventContract: String,
  },
  watch: {
  },
  methods: {
    goToDetails: function() {
      this.$router.push({
        name: "event",
        params: { id: this.ticketData.eventAddress },
      });
    },
  },
  computed: {
    eventImage() {
      return this.event ? this.event.img_url : '';
    },
    eventColor() {
      return this.event ? this.event.color : '';

    },
    eventTitle() {
      return this.event ? this.event.title : '';
    },
    event() {
      console.log(this.$store.state.events);
      return this.$store.state.events.find(e => e.contractAddress === this.eventContract);
    },
    ticket() {
      return this.event ? this.event.getNfTicket(this.ticketTypeId, this.ticketId) : undefined;
    },
    ticketType() {
      return this.event ? this.event.getTicketType(this.ticketTypeId) : undefined;
    },
    timeAndDate() {
      return this.event ? this.event.getTimeAndDate() : '';
    },
    ticketTitle() {
      return this.ticketType ? this.ticketType.title : '';
    },
    isNf() {
      return this.ticketType ? this.ticketType.isNf : false;
    },
    amount() {
      if(this.ticketType) {
        if (this.isNf) {
          return this.ticket ? this.$store.state.user.nonFungibleTickets.filter(t => t.ticketTypeID == this.ticketTypeId).length : 0;
        } else {
          return this.$store.state.user.getNumberFungibleOwned(this.eventContract, this.ticketTypeId);
        }
      }
    },
    seat() {
      return this.ticket ? this.ticket.ticketId : 0;
    },
  },
  mounted: function() {
  },
};
</script>

<style scoped>
.ticket-content {
  padding: 10px;
  z-index: 1;
  position: relative;
}
.event-title {
  color: white !important;
  display: flex;
  justify-content: space-between;
}
.event-title h3 {
  margin-top: 0;
}
.ticket-wrapper {
  height: 200px;

  position: relative;
}
.ticket-img {
  filter: blur(4px);
  height: 200px;
  background-position: center;
  background-size: contain;
  position: absolute;
  width: 100%;

  top: 0;
}
.ticket-img .nrTickets {
  color: white;
  font-size: 2rem;
}
.background-overlay {
  position: absolute;
  height: 100%;
  width: 100%;
  background-color: white;
  opacity: 0.5;
  z-index: 0;
}
</style>
