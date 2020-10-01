<template>
  <div class="ticket-wrapper">
    <div
      class="ticket-img"
      :style="{
        backgroundImage: `url(${event.img_url})`,
        backgroundColor: `${event.color}`,
      }"
    ></div>
    <div class="ticket-content">
      <div class="event-title">
        <h3>{{ event.title }}</h3>
        <span class="date">
          {{ timeAndDate }}
        </span>
      </div>
      <div class="ticket-info">
        <h3>{{ title }}</h3>
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
    ticket: Object,
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
    event() {
       if (
        Object.keys(this.ticket).length === 0 &&
        this.ticket.constructor === Object
      ) {
        return {};
      }
      const event = this.$store.state.events.filter(
        (event) =>
          event.contractAddress === this.ticket.ticketType.eventContractAddress
      )[0];
      return event === undefined ? {} : event;
    },
    timeAndDate() {
      try {
        return event.getTimeAndDate();
      } catch (error) {
        return "";
      }
    },
    title() {
      if (
        Object.keys(this.ticket).length === 0 &&
        this.ticket.constructor === Object
      ) {
        return "";
      }
      return this.ticket.ticketType.getTitle();
    },
    isNf() {
      if (
        Object.keys(this.ticket).length === 0 &&
        this.ticket.constructor === Object
      ) {
        return false;
      }
      return !this.ticket.isNf ? this.ticket.ticketType.isNf : this.ticket.isNf;
    },
    amount() {
      if(Object.keys(this.ticket).length === 0 && this.ticket.constructor === Object) {return 0;}
      return !this.ticket.isNf ? this.ticket.amount : 1;
    },
    seat() {
      if(Object.keys(this.ticket).length === 0 && this.ticket.constructor === Object) {return 0;}
      return !this.ticket.isNf ? 0 : this.ticket.ticketId;
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
