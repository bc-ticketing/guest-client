<template>
  <div class="ticket-wrapper">
    <div class="ticket-info">
      <div class="ticket-date">
        <div>
          <div class="month">{{ monthName }}</div>
          <div class="day">{{ day }}</div>
        </div>
      </div>
      <div class="ticket-content">
        <h2>{{ eventTitle }}</h2>
        <h3>{{ ticketTitle }}</h3>
        <p class="date">
          {{ timeAndDate }}
        </p>
        <p @click="openTicketOverlay" class="seat-info" v-if="isNf">
          See your seat: {{ seat }}
        </p>
        <p @click="openTicketOverlay" class="seat-info" v-if="!isNf">
          See {{ amount }} tickets
        </p>
      </div>
    </div>
    <div
      class="ticket-img"
      :style="{
        backgroundImage: `url(${eventImage})`,
        backgroundColor: `${eventColor}`,
      }"
    ></div>
  </div>
</template>

<script>
import { MONTHS } from "./../util/constants/constants.js";

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
  },
  watch: {},
  methods: {
    goToDetails: function() {
      this.$router.push({
        name: "event",
        params: { id: this.ticketData.eventAddress },
      });
    },
    openTicketOverlay: function() {
      this.$emit("openOverlay");
    },
  },
  computed: {
    monthName: function() {
      return this.event ? MONTHS[this.event.getMonth()] : "";
    },
    day() {
      return event ? event.getDay() : "";
    },
    event() {
      if (!this.eventContractAddress) return undefined;
      return this.$store.state.events.find(
        (e) => e.contractAddress === this.eventContractAddress
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
                (t) => t.ticketTypeID == this.ticketTypeId
              ).length
            : 0;
        } else {
          return this.$store.state.activeUser.getNumberFungibleOwned(
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
    },
  },
  mounted: function() {},
};
</script>

<style scoped>
.ticket-wrapper {
  display: flex;
}
.ticket-info {
  border: 1px solid rgba(0, 0, 0, 0.329);
  border-radius: 10px;

  flex-basis: 80%;
  display: flex;
  padding: 1rem;
}
.ticket-date {
  flex-basis: 10%;
  flex-grow: 0;
  height: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding-right: 0.5rem;
}
.ticket-date .month {
  color: var(--orange);
}
.ticket-content {
  flex-grow: 0;
  flex-basis: 90%;
}

.ticket-img {
  border: 1px solid rgba(0, 0, 0, 0.329);
  border-radius: 10px;
  flex-basis: 20%;
}

.ticket-content h2 {
  font-size: 1.2rem;
  margin-top: 0;
  margin-bottom: 0.2rem;
}
.ticket-content h3 {
  font-size: 0.8rem;
  margin-top: 0;
  margin-bottom: 0;
  opacity: 0.8;
  font-style: normal;
}
.ticket-content .date {
  font-size: 0.7rem;
  margin-top: 0;
}

.ticket-content .seat-info {
  font-size: 0.9rem;
  margin: 0;
  color: var(--red);
  cursor: pointer;
}

.ticket-img img {
  filter: blur(4px);
  background-position: center;
  background-size: contain;
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
