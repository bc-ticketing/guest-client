<template>
  <div class="selection" v-bind:class="{ open: open }">
    <div class="wrapper">
      <span class="close-icon" @click="close">
        <md-icon>close</md-icon>
      </span>
      <h3 v-if="!selection.ticket.isNf">{{ selection.ticket.title }}</h3>
      <h3 v-if="selection.ticket.isNf">
        {{ selection.ticket.ticketType.title }}
      </h3>
      <div class="group">
        <div v-if="!selection.ticket.isNf" class="amount-selection">
          <div class="icon-wrap" @click="changeSelectionAmount(-1)">
            <md-icon>remove_circle</md-icon>
          </div>
          <input type="number" v-model="amount" />
          <div class="icon-wrap" @click="changeSelectionAmount(1)">
            <md-icon>add_circle</md-icon>
          </div>
        </div>
        <div v-if="nfSold && !nfForSale">
          This Ticket has already been sold, you can create an aftermarket listing if you want to queue up for it.
        </div>
        <div v-if="fSoldOut">
          This Ticket Category is sold out, you can create an aftermarket listing if you want to queue up for it. 
        </div>
        <md-button v-if="available" class="md-raised" @click="addToCart">Add To Cart</md-button>
      </div>
      <hr />
      <div class="group">
         <div class="percentage-selection">
            <input
              type="range"
              :min="getStepSize(granularity)"
              max="100"
              :step="getStepSize(granularity)"
              v-model.number="percentage"
            />
            {{ percentage }}
            %
          </div>
        <md-button class="md-raised" @click="createBuyOrder"
          >Create Aftermarket Listing</md-button
        >
      </div>
      <hr />
      <div class="group" v-if="hasSellOrders">
        <p>{{lowestSellOrderAmount}} Available on the aftermarket for {{lowestSellOrder}}%</p>
        <md-button class="md-raised" @click="fillSellOrder"
          >Buy from Aftermarket</md-button
        >
      </div>
    </div>
  </div>
</template>

<script>

import {
  makeBuyOrder,
  ticketsAvailable, 
  isFree, 
  hasSellOrder, 
  hasSellOrders, 
  getLowestSellOrder, 
  getHighestBuyOrder
} from './../util/tickets'

export default {
  name: "SelectionView",
  components: {},
  data() {
    return {
      percentage: 100,
      amount: 1,
    };
  },
  props: {
    selection: Object,
    open: Boolean,
  },
  beforeCreate: function() {},
  mounted: function() {},
  computed: {
    granularity() {
      return this.selection.ticket.isNf ? this.selection.ticket.ticketType.aftermarketGranularity : this.selection.ticket.aftermarketGranularity;
    },
    hasSellOrders() {
      if (!this.selection.active) {return false;}
      if (this.selection.ticket.isNf) {
        return hasSellOrder(this.selection.ticket);
      }
      return Object.getOwnPropertyNames(this.selection.ticket.sellOrders).length > 1;
    },
    lowestSellOrder() {
      if (!this.selection.active) {return 0;}
      if (this.selection.ticket.isNf) {
        if (hasSellOrder(this.selection.ticket)) { return this.selection.ticket.sellOrder.percentage;}
        return 0;
      }
      return getLowestSellOrder(this.selection.ticket).queue;
    },
    lowestSellOrderAmount() {
      if (!this.selection.active) {return 0;}
      if (this.selection.ticket.isNf) {return 1;}
      return getLowestSellOrder(this.selection.ticket).amount;
    },
    nfSold() {
      return this.selection.active && this.selection.ticket.isNf && !isFree(this.selection.ticket);
    },
    nfForSale() {
      return this.selection.active && hasSellOrder(this.selection.ticket);
    },
    fSoldOut() {
      return this.selection.active && !this.selection.ticket.isNf && !ticketsAvailable(this.selection.ticket);
    },
    available() {
      return this.selection.active && (
        (!this.selection.ticket.isNf && ticketsAvailable(this.selection.ticket)) 
        || 
        (this.selection.ticket.isNf && isFree(this.selection.ticket))
        )
    }
  },
  methods: {
    changeSelectionAmount(amount) {
      this.amount += amount;
    },
    getStepSize(granularity) {
      return Math.floor(100 / granularity);
    },
    addToCart: async function() {
      await this.$store.dispatch("addTicketToCart", {
        ticket: this.selection.ticket, 
        amount: this.amount});
      this.$root.$emit("shoppingCartChanged");
    },
    createBuyOrder: async function() {
      if (this.selection.ticket.isNf) {
        await makeBuyOrder(
          this.selection.ticket.ticketType,
          this.$store.state.web3.web3Instance,
          this.amount,
          this.percentage,
          this.$store.state.user.account
        );
      } else {
        await makeBuyOrder(
          this.selection.ticket,
          this.$store.state.web3.web3Instance,
          this.amount,
          this.percentage,
          this.$store.state.user.account
        );
      }
    },
    fillSellOrder: async function() {
      await this.selection.ticket.fillSellOrder(
          this.$store.state.web3.web3Instance,
          this.amount,
          this.lowestSellOrder,
          this.$store.state.user.account
      );
    },
    close: function() {
      this.$emit("close");
    },
  },
};
</script>

<style scoped>
.selection {
  position: absolute;
  top: 100vh;
  left: 0;
  transition: transform 0.5s ease-in-out;
  width: 100vw;
  background-color: aliceblue;
  z-index: 9999;
}

.selection.open {
  transform: translateY(-100%);
}

.wrapper {
  position: relative;
  padding: 2rem;
  padding-bottom: 4rem;

}

.amount-selection {
  display: inline-block;
}
.amount-selection input {
  -moz-appearance: textfield;
  width: 2rem;
}
.amount-selection .icon-wrap {
  display: inline-block;
}
.close-icon {
  position: absolute;
  top: 1rem;
  right: 1rem;
  cursor: pointer;
}
</style>
