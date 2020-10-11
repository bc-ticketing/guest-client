<template>
  <div class="container-fluid inventory">
    <div class="position-relative">
      <div class="ticket-preview">
        <Ticket
          v-if="activeTicketType != 0"
          v-bind:ticketTypeId="activeTicketType"
          v-bind:ticketId="activeTicket"
          v-bind:eventContractAddress="activeTicketEvent"
          v-bind:isNf="activeIsNf"
          v-bind:ticketIndex="activeSlide"
        />
      </div>

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
        <div class="swiper-container">
          <!-- Additional required wrapper -->
          <div class="swiper-wrapper" v-if="$store.state.activeUser">
            <!-- Slides -->
            <div
              class="swiper-slide"
              v-for="(ticket, index) in $store.state.activeUser.fungibleTickets"
              v-bind:key="'fungible_' + index"
            >
              <div
                class="img"
                :style="{
                  backgroundImage: `url(${getEventForTicket(ticket).img_url})`
                }"
              >
                <span class="nrTickets"> {{ ticket.amount }}</span>
              </div>
              <div class="info">
                <span class="title">{{ getEventForTicket(ticket).title }}</span>
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
                  backgroundImage: `url(${getEventForTicket(ticket).img_url})`
                }"
              ></div>
              <div class="info">
                <span class="title">{{ getEventForTicket(ticket).title }}</span>
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
    <SellView
      v-bind:eventContractAddress="activeTicketEvent"
      v-bind:ticketId="activeTicket"
      v-bind:ticketTypeId="activeTicketType"
      v-bind:leftToSell="ticketsLeftToSell"
      v-bind:isNf="activeIsNf"
      v-bind:open="sellOpen"
      v-on:close="sellOpen = false"
    ></SellView>
  </div>
</template>

<script>
import Ticket from "./../components/Ticket";
import SellView from "./SellView";
import { getNumberFungibleOwned } from "./../util/User";
import Swiper, { Pagination } from "swiper";
Swiper.use([Pagination]);
import "swiper/swiper-bundle.css";
import { withdrawSellOrderFungible } from "../util/tickets";

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
      sellOpen: false
    };
  },
  components: {
    Ticket,
    SellView
  },
  computed: {
    activeSellOrders() {
      if (!this.$store.state.activeUser) {return [];}
      console.log(this.$store.state.activeUser);
      if (this.activeIsNf) {
        let order = this.$store.state.activeUser.nonFungibleTickets[
          this.activeSlide - this.$store.state.activeUser.fungibleTickets.length
        ].sellOrder;
        order.quantity = 1;
        return order.percentage ? [order] : [];
      } else {
        return this.$store.state.activeUser.fungibleTickets[this.activeSlide]
          .sellOrders;
      }
    },
    ticketsLeftToSell() {
      let total = 0;
      this.activeSellOrders.forEach(o => {
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
    }
  },
  methods: {
    withdrawSellOrder(index) {
      if (this.activeIsNf) {
        console.log("nf");
      } else {
        withdrawSellOrderFungible(
          this.activeTicketType,
          this.activeSellOrders[index].quantity,
          this.activeSellOrders[index].percentage,
          this.$store.state.activeUser.account,
          this.$store.state.web3.web3Instance,
          this.activeTicketEvent
        );
      }
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
        event => event.contractAddress === ticket.eventContractAddress
      )[0];
    },
    setActiveTicket: function() {
      if (
        this.$store.state.activeUser.fungibleTickets.length == 0 &&
        this.$store.state.activeUser.nonFungibleTickets.length == 0
      ) {
        return;
      }
      let t;
      if (
        this.activeSlide >= this.$store.state.activeUser.fungibleTickets.length
      ) {
        t = this.$store.state.activeUser.nonFungibleTickets[
          this.activeSlide - this.$store.state.activeUser.fungibleTickets.length
        ];
        this.activeTicket = t.ticketId;
        this.activeIsNf = true;
      } else {
        t = this.$store.state.activeUser.fungibleTickets[this.activeSlide];
        this.activeIsNf = false;
      }
      this.activeTicketEvent = t.eventContractAddress;
      this.activeTicketType = t.ticketType;
    }
  },
  beforeCreate: async function() {
    this.$root.$on("userRegistered", () => {
      this.setActiveTicket();
    });
    this.$root.$on("accountUpdated", () => {
      console.log("account updated");
      this.activeSlide =0;
      this.activeTicket = 0;
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
        clickable: true
      }
    });
    this.swiper.on("slideChange", () => {
      this.activeSlide = this.swiper.activeIndex;
      this.setActiveTicket();
    });
  }
};
</script>

<style>
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
