<template>
  <div class="container-fluid inventory">
    <h1>Tickets</h1>
    <div class="tabs">
      <div class="tab active">Live</div>
      <div class="tab">Past</div>
      <div class="underline"></div>
    </div>
    <div class="empty-message" v-if="noTicketsOwned">
      <div class="empty-icon">
        <md-icon>confirmation_number</md-icon>
      </div>
      <p>
        Looks like its empty here! Checkout some of our events to get your first
        ticket!
      </p>
    </div>
    <div class="container ticket-list" v-if="$store.state.activeUser">
      <div
        class="ticket"
        v-for="(ticket, index) in $store.state.activeUser.fungibleTickets"
        v-bind:key="'fungible_' + index"
      >
        <Ticket
          v-bind:ticketTypeId="ticket.ticketType"
          v-bind:ticketId="ticket.ticketId"
          v-bind:eventContractAddress="ticket.eventContractAddress"
          v-bind:isNf="false"
          v-on:openOverlay="openTicketOverlay(ticket)"
        />
      </div>
      <div
        class="ticket"
        v-for="(ticket, index) in $store.state.activeUser.nonFungibleTickets"
        v-bind:key="'nonfungible_' + index"
      >
        <Ticket
          v-bind:ticketTypeId="ticket.ticketType"
          v-bind:ticketId="ticket.ticketId"
          v-bind:eventContractAddress="ticket.eventContractAddress"
          v-bind:isNf="true"
          v-on:openOverlay="openTicketOverlay(ticket)"
        />
      </div>
    </div>
    <!--
    <div class="position-relative">
      <div class="ticket-preview"></div>

      <div class="container ticket-sell">
        <div v-if="activeSellOrders.length > 0">
          <p>You have created the following sale listings for this ticket:</p>
          <div class="sell-order">
            <div
              v-for="(order, index) in activeSellOrders"
              v-bind:key="'sell_' + index"
            >
              <p>
                {{ order.quantity }} tickets for {{ order.percentage }}% of its
                original price
              </p>
              <md-button class="md-raised" @click="withdrawSellOrder(index)">
                Withdraw sell order
              </md-button>
            </div>
          </div>
        </div>
        <md-button
          v-if="ticketsLeftToSell > 0"
          class="md-raised"
          @click="sellOpen = true"
        >
          Create Sell Order
        </md-button>
      </div>

      <div class="ticket-swiper">
        <div class="pagination"></div>
        <div v-if="$store.state.activeUser">
          <div class="swiper-container">
            <div class="swiper-wrapper">
              <div
                class="swiper-slide"
                v-for="(ticket, index) in $store.state.activeUser
                  .fungibleTickets"
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
                    {{ getEventForTicket(ticket).getTimeAndDate() }}</span
                  >
                  <span class="location">{{
                    getEventForTicket(ticket).location
                  }}</span>
                </div>
              </div>
              <div
                class="swiper-slide"
                v-for="(ticket, index) in $store.state.activeUser
                  .nonFungibleTickets"
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
                    {{ getEventForTicket(ticket).getTimeAndDate() }}</span
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
    </div> -->
    <SellView
      v-bind:eventContractAddress="activeTicketEvent"
      v-bind:ticketId="activeTicket"
      v-bind:ticketTypeId="activeTicketType"
      v-bind:leftToSell="ticketsLeftToSell"
      v-bind:isNf="activeIsNf"
      v-bind:open="sellOpen"
      v-on:close="sellOpen = false"
    ></SellView>
    <TicketOverlay
      v-bind:eventContractAddress="activeTicketEvent"
      v-bind:ticketId="activeTicket"
      v-bind:ticketTypeId="activeTicketType"
      v-bind:isNf="activeIsNf"
      v-bind:open="ticketOverlay.open"
      v-on:close="ticketOverlay.open = false"
    />
  </div>
</template>

<script>
import TicketOverlay from "./../components/TicketOverlay";
import Ticket from "./../components/Ticket";
import SellView from "./SellView";
import { getNumberFungibleOwned } from "./../util/User";
import Swiper, { Pagination } from "swiper";
Swiper.use([Pagination]);
import "swiper/swiper-bundle.css";
import {
  withdrawSellOrderFungible,
  withdrawSellOrderNonFungible,
} from "../util/tickets";

export default {
  name: "Inventory",
  data() {
    return {
      activeSlide: 0,
      activeTicket: 0,
      activeTicketType: 0,
      activeIsNf: false,
      activeTicketEvent: "",
      aftermarketPercentage: 100,
      aftermarketAmount: 0,
      sellOpen: false,
      ticketOverlay: { open: false, ticket: undefined },
    };
  },
  components: {
    Ticket,
    SellView,
    TicketOverlay,
  },
  computed: {
    noTicketsOwned() {
      return (
        !this.$store.state.activeUser ||
        (this.$store.state.activeUser.fungibleTickets.length == 0 &&
          this.$store.state.activeUser.nonFungibleTickets.length == 0)
      );
    },
    activeSellOrders() {
      if (!this.$store.state.activeUser) {
        return [];
      }
      try {
        if (this.activeIsNf) {
          let order = this.$store.state.activeUser.nonFungibleTickets[
            this.activeSlide -
              this.$store.state.activeUser.fungibleTickets.length
          ].sellOrder;
          order.quantity = 1;
          return order.percentage ? [order] : [];
        } else {
          return this.$store.state.activeUser.fungibleTickets[this.activeSlide]
            .sellOrders;
        }
      } catch (e) {
        return [];
      }
    },
    ticketsLeftToSell() {
      let total = 0;
      this.activeSellOrders.forEach((o) => {
        total += o.quantity;
      });
      return this.amountOwned - total;
    },
    amountOwned() {
      if (this.activeTicketType) {
        if (this.activeIsNf) {
          return 1;
        } else {
          return getNumberFungibleOwned(
            this.$store.state.activeUser,
            this.activeTicketEvent,
            this.activeTicketType
          );
        }
      } else {
        return 0;
      }
    },
  },
  methods: {
    openTicketOverlay(ticket) {
      this.setActiveTicket(ticket);
      this.ticketOverlay.open = true;
      this.ticketOverlay.ticket = ticket;
    },
    async withdrawSellOrder(index) {
      let result;
      if (this.activeIsNf) {
        result = await withdrawSellOrderNonFungible(
          this.activeTicketType,
          this.activeTicket,
          this.$store.state.activeUser.account,
          this.$store.state.web3.web3Instance,
          this.activeTicketEvent
        );
      } else {
        result = await withdrawSellOrderFungible(
          this.activeTicketType,
          this.activeSellOrders[index].quantity,
          this.activeSellOrders[index].percentage,
          this.$store.state.activeUser.account,
          this.$store.state.web3.web3Instance,
          this.activeTicketEvent
        );
      }
      if (result.status == 1) {
        await this.$store.dispatch("updateEvent", result.event);
        await this.$store.dispatch("registerActiveUser");
        this.$root.$emit("userUpdated");
      }
      this.$root.$emit("openMessageBus", result);
    },
    getTicketType(ticket) {
      for (const ticketType of this.event.nonFungibleTickets) {
        if (ticketType.typeId == ticket.ticketTypeId) {
          return ticketType;
        }
      }
    },
    getEventForTicket: function(ticket) {
      return this.$store.state.events.filter(
        (event) => event.contractAddress === ticket.eventContractAddress
      )[0];
    },
    setActiveTicket: function(ticket) {
      if (ticket.isNF) {
        this.activeTicket = ticket.ticketId;
        this.activeIsNf = true;
      } else {
        this.activeIsNf = false;
      }

      this.activeTicketEvent = ticket.eventContractAddress;
      this.activeTicketType = ticket.ticketType;
    },
  },
  beforeCreate: async function() {},
  mounted: function() {
    this.$root.$emit("hideSearchBar");
  },
};
</script>

<style>
h1 {
  margin-left: 1rem;
  margin-top: 2rem;
}
.tabs {
  width: 100%;
  display: flex;
  margin-bottom: 1rem;
  position: relative;
}
.tabs .tab {
  flex-basis: 50%;
  padding-bottom: 1rem;
  text-align: center;
  transition: color 0.3s ease-in-out;
}
.tabs .tab.active {
  color: var(--orange);
}
.tabs .underline {
  position: absolute;
  width: 50%;
  height: 2px;
  background: var(--orange);
  left: 0;
  bottom: 0;
  transition: transform 0.3s ease-in-out;
}
.tabs .underline.moved {
  transform: translateX(100%);
}
.empty-message {
  padding: 2rem;
  opacity: 0.7;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  display: flex;
}
.empty-message .empty-icon {
  padding: 2rem;
  border: 2px solid;
  border-radius: 50%;
}
.empty-message p {
  text-align: center;
}
.sell-order {
  display: flex;
  justify-content: space-between;
}
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
