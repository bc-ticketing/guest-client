<template>
  <div class="selection" v-bind:class="{ open: open }">
    <div class="wrapper">
      <span class="close-icon" @click="close">
        <md-icon>close</md-icon>
      </span>
      <h3>{{ ticketTitle }}</h3>
      <div class="group">
        <div v-if="!isNf" class="amount-selection">
          <div class="icon-wrap" @click="changeSelectionAmount(-1)">
            <md-icon>remove_circle</md-icon>
          </div>
          <input type="number" v-model="amount" />
          <div class="icon-wrap" @click="changeSelectionAmount(1)">
            <md-icon>add_circle</md-icon>
          </div>
        </div>
        <div v-if="!available && !nfForSale">
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
    ticketId: Number,
    ticketTypeId: Number,
    isNf: Boolean,
    eventContractAddress: String,
    open: Boolean,
  },
  beforeCreate: function() {},
  mounted: function() {},
  computed: {
    event() {
      if (!this.eventContractAddress) return undefined;
      return this.$store.state.events.find(e => e.contractAddress === this.eventContractAddress);
    },
    ticket() {
      return this.event ? this.event.getNfTicket(this.ticketTypeId, this.ticketId) : undefined;
    },
    ticketType() {
      return this.event ? this.event.getTicketType(this.ticketTypeId, this.isNf) : undefined;
    },
    ticketTitle() {
      return this.ticketType ? this.ticketType.title : '';
    },
    price() {
      return this.ticketType ? this.ticketType.price: 0;
    },
    granularity() {
      return this.ticketType ? this.ticketType.aftermarketGranularity : 1;
    },
    ticketHasSellOrders() {
      if (!this.event) {
        return false;
      }
      if (this.isNf) {
        return this.event.hasSellOrders(
          this.ticketTypeId,
          this.ticketId
        );
      }
      return this.event.hasSellOrders(this.ticketTypeId);
    },
    lowestSellOrder() {
      if (!this.event) {
        return false;
      }
      if (this.isNf) {
        return this.event.getLowestSellOrder(
          this.ticketTypeId,
          this.ticketId
        ).queue;
      }
      return this.event.getLowestSellOrder(this.ticketTypeId).queue;
    },
    lowestSellOrderAmount() {
      if (!this.event || !this.ticketHasSellOrders) {
        return false;
      }
      console.log('ticket has sell orders');
      return this.event.getLowestSellOrder(this.ticketId).amount;
    },
    available() {
      return this.event ? this.event.isAvailable(this.ticketTypeId, this.ticketId) : false;
    },
    nfForSale() {
      if (!this.event) {
        return false;
      }
      return  this.event.hasSellOrders(this.ticketTypeId, this.ticketId);
    },
    fSoldOut() {
      return this.event ? !this.event.isAvailable(this.ticketTypeId) : false;
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
        ticket: this.ticketId,
        ticketType: this.ticketTypeId,
        price: this.price,
        eventContractAddress: this.eventContractAddress,
        amount: this.amount,
        isNf: this.isNf,
      });
      this.$root.$emit("shoppingCartChanged");
    },
    createBuyOrder: async function() {
      if (this.isNf) {
        await makeBuyOrderNonFungible(
          this.ticketTypeId,
          this.ticketId,
          this.amount,
          this.percentage,
          this.price,
          this.$store.state.user.account,
          this.$store.state.web3.web3Instance,
          this.eventContractAddress
        );
      } else {
        await makeBuyOrderFungible(
          this.ticketTypeId,
          this.amount,
          this.percentage,
          this.price,
          this.$store.state.user.account,
          this.$store.state.web3.web3Instance,
          this.eventContractAddress
        );
      }
    },
    fillSellOrder: async function() {
      if (this.isNf) {
        await fillSellOrderNonFungible(
          this.ticketTypeId,
          this.ticketId,
          this.lowestSellOrder,
          this.price,
          this.$store.state.user.account,
          this.$store.state.web3.web3Instance,
          this.eventContractAddress
        );
      } else {
        await fillSellOrderFungible(
          this.ticketTypeId,
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
