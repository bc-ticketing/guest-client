<template>
  <div class="ticket-wrapper">
    <div
      class="ticket-img"
      :style="{
        backgroundImage: `url(${eventImage})`,
        backgroundColor: `${eventColor}`
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
        <p v-if="isNf">{{ ticketDescription }}</p>
        <p v-if="!isNf">{{ ticketDescription }}</p>
        <p v-if="isNf">Seat Number: {{ seat }}</p>
        <p v-if="!isNf">Number of tickets: {{ amount }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { getNumberFungibleOwned } from "./../util/User";
export default {
  name: "Ticket",
  data() {
    return {};
  },
  props: {
    ticketTypeId: Number,
    ticketId: Number,
    eventContractAddress: String,
    isNf: Boolean,
    ticketIndex: Number
  },
  watch: {
  },
  methods: {
    goToDetails: function() {
      this.$router.push({
        name: "event",
        params: { id: this.ticketData.eventAddress }
      });
    }
  },
  computed: {
    event() {
      if (!this.eventContractAddress) return undefined;
      return this.$store.state.events.find(
        e => e.contractAddress === this.eventContractAddress
      );
    },
    ticket() {
      return this.event && this.isNf
        ? this.event.getNfTicket(this.ticketTypeId, this.ticketId)
        : undefined;
    },
    ticketType() {
      return this.event
        ? this.event.getTicketType(this.ticketTypeId, this.isNf)
        : undefined;
    },
    eventImage() {
      return this.event ? this.event.img_url : "";
    },
    eventColor() {
      return this.event ? this.event.color : "";
    },
    eventTitle() {
      return this.event ? this.event.title : "";
    },
    timeAndDate() {
      return this.event ? this.event.getTimeAndDate() : "";
    },
    ticketTitle() {
      return this.ticketType ? this.ticketType.title : "";
    },
    ticketDescription() {
      return this.ticketType ? this.ticketType.description : "";
    },
    amount() {
      if (this.ticketTypeId) {
        if (this.isNf) {
          return this.ticket
            ? this.$store.state.activeUser.nonFungibleTickets.filter(
                t => t.ticketTypeID == this.ticketTypeId
              ).length
            : 0;
        } else {
          return getNumberFungibleOwned(
            this.$store.state.activeUser,
            this.eventContractAddress,
            this.ticketTypeId
          );
        }
      } else {
        return 0;
      }
    },
    seat() {
      return this.ticket ? this.ticket.ticketId : 0;
    }
  },
  mounted: function() {}
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
