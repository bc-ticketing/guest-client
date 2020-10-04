<template>
  <div class="container-fluid inventory">
    <div class="position-relative">
      <div class="ticket-preview">
        <Ticket 
        v-bind:ticketTypeId="activeTicketType" 
        v-bind:ticketId="activeTicket"
        v-bind:eventContract="activeTicketEvent"/>
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
                    getEventForTicket(ticket).img_url
                  })`,
                }"
              >
                <span class="nrTickets"> {{ ticket.amount }}</span>
              </div>
              <div class="info">
                <span class="title">{{
                  getEventForTicket(ticket).title
                }}</span>
                <span class="date">
                  {{
                    getEventForTicket(ticket).getTimeAndDate()
                  }}</span
                >
                <span class="location">{{
                  getEventForTicket(ticket).location
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
                    getEventForTicket(ticket).img_url
                  })`,
                }"
              ></div>
              <div class="info">
                <span class="title">{{
                  getEventForTicket(ticket).title
                }}</span>
                <span class="date">
                  {{
                    getEventForTicket(ticket).getTimeAndDate()
                  }}</span
                >
                <span class="location">{{
                  getEventForTicket(ticket).location
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <SellView
      v-bind:eventContract="activeTicketEvent"
      v-bind:ticketId="activeTicket"
      v-bind:ticketTypeId="activeTicketType"
      v-bind:isNf="activeIsNf"
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
      activeTicket: 0,
      activeTicketType: 0,
      activeIsNf: false,
      activeTicketEvent: '',
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
    getTicketType(ticket) {
      for (const ticketType of this.event.nonFungibleTickets) {
        if( ticketType.typeId == ticket.ticketTypeId) {
          return ticketType;
        }
      }
    },
    getEventForTicket: function(ticket) {
      return this.$store.state.events.filter(
        (event) => event.contractAddress === ticket.eventContractAddress
      )[0];
    },
    setActiveTicket: function() {
      if (!this.$store.state.user.fungibleTickets || !this.$store.state.user.nonFungibleTickets){
        return;
      }
        if (this.activeSlide >= this.$store.state.user.fungibleTickets.length) {
          let t = this.$store.state.user.nonFungibleTickets[
          this.activeSlide - this.$store.state.user.fungibleTickets.length
        ];
        this.activeTicket = t.ticketId;
        this.activeTicketType = t.ticketType;
        this.activeTicketEvent = t.eventContractAddress;
        this.activeIsNf = true;
      } else {
        let t = this.$store.state.user.fungibleTickets[
          this.activeSlide
        ];
        this.activeTicketType = t.ticketType
        this.activeIsNf = false;
        this.activeTicketEvent = t.eventContractAddress;
      }
    }
  },
  beforeCreate: async function() {
    this.$root.$on("loadedUserTickets", () => {
      console.log('event landed');
     this.setActiveTicket();
    });
  },
  mounted: function() {
    this.$root.$emit("hideSearchBar");
    this.setActiveTicket();
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
      this.setActiveTicket()
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
