<template>
  <div class="container-fluid inventory">
    <div class="ticket-preview">
      <Ticket v-bind:ticketData="activeTicket" v-if="activeTicket" />
    </div>
    <div class="ticket-swiper">
      <div class="swiper-container">
        <!-- Additional required wrapper -->
        <div class="swiper-wrapper">
          <!-- Slides -->
          <div
            class="swiper-slide"
            v-for="(ticket, index) in tickets"
            v-bind:key="index"
          >
            <div
              class="img"
              :style="{ backgroundColor: ticket.eventMetadata.event.color }"
            >
              <span class="nrTickets"> {{ ticket.amount }}</span>
            </div>
            <div class="info">
              <span class="title">{{ ticket.eventMetadata.event.title }}</span>
              <span class="date"> Date (WIP)</span>
              <span class="location">{{
                ticket.eventMetadata.event.location
              }}</span>
            </div>
          </div>
        </div>
        <div class="swiper-pagination"></div>
      </div>
    </div>
    <div class="ticket-list"></div>
  </div>
</template>

<script>
import Ticket from "./../components/Ticket";
import Swiper, { Pagination } from "swiper";
Swiper.use([Pagination]);
import "swiper/swiper-bundle.css";

export default {
  name: "Inventory",
  data() {
    return {
      activeSlide: 0,
    };
  },
  components: {
    Ticket,
  },
  computed: {
    tickets: function() {
      return this.$store.state.userTickets.map((ticket) => {
        ticket.eventMetadata = this.$store.state.events[
          ticket.eventAddress
        ].metadata;
        return ticket;
      });
    },
    activeTicket: function() {
      return this.tickets.length > 0
        ? this.tickets[this.activeSlide]
        : undefined;
    },
  },
  methods: {
    updateTickets: function() {
      this.$store.state.userTickets.forEach((ticket) => {
        console.log("ticket event add");
        console.log(ticket);
        var e = this.$store.state.events[ticket.eventAddress];
        e.contractAddress = ticket.eventAddress;
        if (e.metadata != undefined) {
          this.tickets.push(e);
        }
      });
    },
  },
  beforeCreate: async function() {
    this.$root.$on("loadedUserTickets", () => {
      //this.updateTickets();
    });
  },
  beforeMount: function() {
    //this.updateTickets();
  },
  created: function() {
    //this.activeTicket = this.tickets[0];
  },
  mounted: function() {
    this.swiper = new Swiper(".swiper-container", {
      slidesPerView: 1,
      spaceBetween: 10,
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
    });
    this.swiper.on("slideChange", () => {
      console.log("active slide = " + this.swiper.activeIndex);
      this.activeSlide = this.swiper.activeIndex;
      //this.activeTicket = this.tickets[this.activeSlide];
    });
  },
};
</script>

<style>
.img {
  display: flex;
  justify-content: center;
  align-items: center;
}
.img .nrTickets {
  color: white;
  font-size: 2rem;
}
.inventory {
  height: 90vh;
  position: relative;
}
.ticket-swiper {
  width: 90%;
  margin: auto;
  height: 200px;
  position: absolute;
  bottom: 0;
  left: 5%;
}
.swiper-container {
  width: 100%;
  height: 100%;
}

.ticket-swiper .swiper-slide {
  height: 80%;
  border-radius: 12px;
  width: 100%;
  background-color: whitesmoke;
  display: grid;
  grid-template-columns: 1fr 1fr;
}
.ticket-swiper .swiper-slide .img {
  background-position: center;
  background-size: cover;
  border-top-left-radius: 12px;
  border-bottom-left-radius: 12px;
  height: 100%;
}
.ticket-swiper .swiper-slide .info {
  padding: 10px;
}
.swiper-slide .info span {
  display: block;
}
.ticket-swiper .swiper-pagination-bullet-active {
  background: var(--accent);
}
</style>
