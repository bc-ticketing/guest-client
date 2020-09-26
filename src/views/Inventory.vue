<template>
  <div class="container-fluid inventory">
    <div class="ticket-preview">
      <Ticket v-bind:ticket="activeTicket" v-if="activeTicket" />
    </div>
    <div class="ticket-swiper">
      <div class="swiper-container">
        <!-- Additional required wrapper -->
        <div class="swiper-wrapper">
          <!-- Slides -->
          <div
            class="swiper-slide"
            v-for="(ticket, index) in $store.state.user.fungibleTickets"
            v-bind:key="'fungible_'+index"
          >
            <div
              class="img"
              :style="{ backgroundImage: `url(${getEventForTicket(ticket.ticketType).img_url})` }"
            >
              <span class="nrTickets"> {{ ticket.amount }}</span>
            </div>
            <div class="info">
              <span class="title">{{ getEventForTicket(ticket.ticketType).title }}</span>
              <span class="date"> {{getEventForTicket(ticket.ticketType).date}}</span>
              <span class="location">{{
                getEventForTicket(ticket.ticketType).location
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
      activeTicket: {},
    };
  },
  components: {
    Ticket,
  },
  methods: {
    getEventForTicket: function(ticket) {
      return this.$store.events.filter(event => event.contractAddress === ticket.eventContractAddress)[0];
    },
  },
  beforeCreate: async function() {
    this.$root.$on("loadedUserTickets", () => {
      this.activeTicket = this.$store.state.user.fungibleTickets.length > 0
        ? this.$store.state.user.fungibleTickets[0]
        : {};
    });
  },
  mounted: function() {
    this.$root.$emit('hideSearchBar');
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
