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
        <div v-if="available && !nfForSale">
          This Ticket has already been sold, you can create an aftermarket
          listing if you want to queue up for it.
        </div>
        <div v-if="fSoldOut">
          This Ticket Category is sold out, you can create an aftermarket
          listing if you want to queue up for it.
        </div>
        <md-button v-if="available" class="md-raised" @click="addToCart"
          >Add To Cart</md-button
        >
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
      <div class="group" v-if="ticketHasSellOrders">
        <p>
          {{ lowestSellOrderAmount }} Available on the aftermarket for
          {{ lowestSellOrder }}%
        </p>
        <md-button class="md-raised" @click="fillSellOrder"
          >Buy from Aftermarket</md-button
        >
      </div>
    </div>
  </div>
</template>

<script>
import {
  fillSellOrderFungible,
  fillSellOrderNonFungible,
  makeBuyOrderNonFungible,
  makeBuyOrderFungible,
} from "./../util/tickets";

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
    eventContractAddress: String,
    open: Boolean,
    price: Number,
  },
  beforeCreate: function() {},
  mounted: function() {},
  computed: {
    event() {
      return this.$store.state.events.find(
        (e) => e.contractAddress === this.eventContractAddress
      );
    },
    granularity() {
      if (!this.event) {
        return 1;
      }
      return this.event.getGranularity(this.selection.ticketType);
    },
    ticketHasSellOrders() {
      if (!this.event) {
        return false;
      }
      if (this.selection.isNf) {
        return this.event.hasSellOrders(
          this.selection.ticketType,
          this.selection.ticket
        );
      }
      return this.event.hasSellOrders(this.selection.ticketType);
    },
    lowestSellOrder() {
      if (!this.event) {
        return false;
      }
      if (this.selection.isNf) {
        return this.event.getLowestSellOrder(
          this.selection.ticketType,
          this.selection.ticket
        ).queue;
      }
      return this.event.getLowestSellOrder(this.selection.ticketType).queue;
    },
    lowestSellOrderAmount() {
      if (!this.event) {
        return false;
      }
      return this.event.getLowestSellOrder(this.selection.ticket).amount;
    },
    available() {
      if (!this.event) {
        return false;
      }
      return !this.event.isAvailable(this.selection.ticketType, this.selection.ticket);
    },
    nfForSale() {
      if (!this.event) {
        return false;
      }
      return  this.event.hasSellOrders(this.selection.ticketType, this.selection.ticket);
    },
    fSoldOut() {
      if (!this.event) {
        return false;
      }
      return this.event.isAvailable(this.selection.ticketType);
    },
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
        amount: this.amount,
      });
      this.$root.$emit("shoppingCartChanged");
    },
    createBuyOrder: async function() {
      if (this.selection.ticket.isNf) {
        await makeBuyOrderNonFungible(
          this.selection.ticketType,
          this.amount,
          this.percentage,
          this.price,
          this.$store.state.user.account,
          this.$store.state.web3.web3Instance,
          this.selection.eventContractAddress
        );
      } else {
        await makeBuyOrderFungible(
          this.selection.ticketType,
          this.amount,
          this.percentage,
          this.price,
          this.$store.state.user.account,
          this.$store.state.web3.web3Instance,
          this.selection.eventContractAddress
        );
      }
    },
    fillSellOrder: async function() {
      if (this.selection.ticket.isNf) {
        await fillSellOrderNonFungible(
          this.selection.ticketType,
          this.selection.ticket,
          this.lowestSellOrder,
          this.price,
          this.$store.state.user.account,
          this.$store.state.web3.web3Instance,
          this.selection.eventContractAddress
        );
      } else {
        await fillSellOrderFungible(
          this.selection.ticketType,
          this.amount,
          this.price,
          this.lowestSellOrder,
          this.$store.state.user.account,
          this.$store.state.web3.web3Instance,
          this.lowestSellOrder
        );
      }
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
