<template>
  <div class="container-fluid inventory">
    <div class="position-relative">
      <div class="ticket-preview">
        <Ticket v-bind:ticket="activeTicket" v-if="activeTicket" />
      </div>

      <div class="container ticket-sell">
        <md-button class="md-raised" @click="sellOpen = true"
          >Sell this ticket</md-button
        >
      </div>

      <div class="ticket-swiper">
        <div class="pagination"></div>
        <div class="swiper-container">
          <!-- Additional required wrapper -->
          <div class="swiper-wrapper">
            <!-- Slides -->
            <div
              class="swiper-slide"
              v-for="(ticket, index) in $store.state.user.fungibleTickets"
              v-bind:key="'fungible_' + index"
            >
              <div
                class="img"
                :style="{
                  backgroundImage: `url(${
                    getEventForTicket(ticket.ticketType).img_url
                  })`,
                }"
              >
                <span class="nrTickets"> {{ ticket.amount }}</span>
              </div>
              <div class="info">
                <span class="title">{{
                  getEventForTicket(ticket.ticketType).title
                }}</span>
                <span class="date">
                  {{
                    getEventForTicket(ticket.ticketType).getTimeAndDate()
                  }}</span
                >
                <span class="location">{{
                  getEventForTicket(ticket.ticketType).location
                }}</span>
              </div>
            </div>
            <div
              class="swiper-slide"
              v-for="(ticket, index) in $store.state.user.nonFungibleTickets"
              v-bind:key="'nonfungible_' + index"
            >
              <div
                class="img"
                :style="{
                  backgroundImage: `url(${
                    getEventForTicket(ticket.ticketType).img_url
                  })`,
                }"
              ></div>
              <div class="info">
                <span class="title">{{
                  getEventForTicket(ticket.ticketType).title
                }}</span>
                <span class="date">
                  {{
                    getEventForTicket(ticket.ticketType).getTimeAndDate()
                  }}</span
                >
                <span class="location">{{
                  getEventForTicket(ticket.ticketType).location
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <SellView
      v-bind:ticket="activeTicket"
      v-bind:open="sellOpen"
      v-on:close="sellOpen = false"
    ></SellView>
  </div>
</template>

<script>
import Ticket from "./../components/Ticket";
import SellView from "./SellView";

import Swiper, { Pagination } from "swiper";
Swiper.use([Pagination]);
import "swiper/swiper-bundle.css";

export default {
  name: "Inventory",
  data() {
    return {
      activeSlide: 0,
      activeTicket: {},
      aftermarketPercentage: 100,
      aftermarketAmount: 0,
      sellOpen: false,
    };
  },
  components: {
    Ticket,
    SellView,
  },
  computed: {
    isNf() {
      return this.activeTicket.isNf;
    },

    granularity() {
      if (!this.activeTicket.ticketType) {
        return 0;
      }
      return this.activeTicket.ticketType.aftermarketGranularity;
    },
  },
  methods: {
    getEventForTicket: function(ticket) {
      return this.$store.state.events.filter(
        (event) => event.contractAddress === ticket.eventContractAddress
      )[0];
    },
  },
  beforeCreate: async function() {
    this.$root.$on("loadedUserTickets", () => {
      this.activeTicket =
        this.$store.state.user.fungibleTickets.length > 0
          ? this.$store.state.user.fungibleTickets[0]
          : {};
    });
  },
  mounted: function() {
    this.$root.$emit("hideSearchBar");
    this.activeTicket =
      this.$store.state.user.fungibleTickets &&
      this.$store.state.user.fungibleTickets.length > 0
        ? this.$store.state.user.fungibleTickets[0]
        : {};
    this.swiper = new Swiper(".swiper-container", {
      slidesPerView: 1,
      spaceBetween: 10,
      pagination: {
        el: ".pagination",
        clickable: true,
      },
    });
    this.swiper.on("slideChange", () => {
      this.activeSlide = this.swiper.activeIndex;
      if (this.activeSlide >= this.$store.state.user.fungibleTickets.length) {
        this.activeTicket = this.$store.state.user.nonFungibleTickets[
          this.activeSlide - this.$store.state.user.fungibleTickets.length
        ];
      } else {
        this.activeTicket = this.$store.state.user.fungibleTickets[
          this.activeSlide
        ];
        this.activeTicket.isNf = false;
      }
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
  height: 100vh;
  position: relative;
  overflow-y: hidden;
}
.position-relative {
  height: 90%;
  position: relative;
}
.ticket-swiper {
  width: 100%;
  margin: auto;
  height: 200px;
  position: absolute;
  bottom: 0;
  left: 0;
}
.swiper-container {
  width: 100%;
  height: 200px;
}
.swiper-wrapper {
  height: 100%; 
}

.ticket-swiper .swiper-slide {
  height: 100%;
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
.ticket-swiper .pagination {
  position: relative;
  bottom: unset;
  left: unset;
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}
.pagination .swiper-pagination-bullet {
  margin-left: 0.3rem;
  margin-right: 0.3rem;
}
.ticket-swiper .swiper-pagination-bullet-active {
  background: var(--accent);
}


.amount-selection {
  display: inline-block;
}
.amount-selection p {
  display: inline-block;
  margin-left: 1rem;
  margin-right: 1rem;
}
.amount-selection .icon-wrap {
  display: inline-block;
}
.ticket-sell h3 {
  margin: 0;
}
.sell-config {
  display: none;
}
.sell-config.active {
  display: block;
}
</style>
