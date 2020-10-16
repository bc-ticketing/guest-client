<template>
  <div class="selection" v-bind:class="{ open: open }">
    <div class="wrapper">
      <span class="close-icon" @click="close">
        <md-icon>close</md-icon>
      </span>
      <div class="selection-group percentage-selection">
        <h3>Price</h3>
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
      <div v-if="!isNf" class="selection-group amount-selection">
        <h3>Amount</h3>
        <div class="selection-amount">
          <div class="icon-wrap" @click="changeSelectionAmount(-1)">
            <md-icon>remove_circle</md-icon>
          </div>
          <p>{{ amount }}</p>
          <div class="icon-wrap" @click="changeSelectionAmount(1)">
            <md-icon>add_circle</md-icon>
          </div>
        </div>
      </div>
      <md-button class="md-raised" @click="sellTicket"
        >Create Sell Order</md-button
      >
      <md-button v-if="hasBuyOrder" class="md-raised" @click="fillBuyOrder"
        >Sell for {{ highestBuyOrder.percentage }}%</md-button
      >
    </div>
  </div>
</template>

<script>
import {
  getLowestSellOrder,
  getHighestBuyOrder,
  makeSellOrderFungible,
  makeSellOrderNonFungible,
  fillBuyOrderNonFungible,
  fillBuyOrderFungible
  } from './../util/tickets';

export default {
  name: "SellView",
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
    eventContractAddress: String,
    leftToSell: Number,
    isNf: Boolean,
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
    granularity() {
      return this.ticketType ? this.ticketType.aftermarketGranularity : 1;
    },
    hasSellOrders() {
      return this.ticketType ? Object.getOwnPropertyNames(this.ticketType.sellOrders).length > 1 : false;
    },
    lowestSellOrder() {
      return this.ticketType ? getLowestSellOrder(this.ticketType).queue : 0;
    },
    lowestSellOrderAmount() {
      return this.ticketType ? getLowestSellOrder(this.ticketType).amount : 0;
    },
    highestBuyOrder() {
      return this.ticketType ? getHighestBuyOrder(this.ticketType) : 0;
    },
    hasBuyOrder() {
      return this.ticketType ? Object.getOwnPropertyNames(this.ticketType.buyOrders).length > 1 : false;
    },
    ticketsOwned() {
      return this.amount;
    },
  },
  methods: {
    changeSelectionAmount(amount) {
      this.amount += amount;
      this.amount = Math.max(
        Math.min(this.amount, Number(this.leftToSell)),
        1
      );
    },
    getStepSize(granularity) {
      return Math.floor(100 / granularity);
    },
    close: function() {
      this.$emit("close");
    },
    sellTicket: async function() {
      if (this.isNf) {
        const result = await makeSellOrderNonFungible(
          this.ticketTypeId,
          this.ticketId,
          this.percentage,
          this.$store.state.activeUser.account,
          this.$store.state.web3.web3Instance,
          this.eventContractAddress
        );
        if(result.status ==1) {
          await this.$store.dispatch('updateEvent', result.event);
          await this.$store.dispatch("registerActiveUser");
          this.$root.$emit('userUpdated');
        }
        this.$root.$emit("openMessageBus", result);
        this.close();
      } else {
        const result = await makeSellOrderFungible(
          this.ticketTypeId,
          this.amount,
          this.percentage,
          this.$store.state.activeUser.account,
          this.$store.state.web3.web3Instance,
          this.eventContractAddress,
        );
        if(result.status ==1) {
          await this.$store.dispatch('updateEvent', result.event);
          await this.$store.dispatch("registerActiveUser");
          this.$root.$emit('userUpdated');
        }
        this.$root.$emit("openMessageBus", result);
        this.close();
      }
      //this.$store.state.user.makeSellOrderFungible(this.$store.state.web3.web3Instance, this.activeTicket.ticketType, 100, 1);
    },
    fillBuyOrder: function() {
      if (this.isNf) {
        fillBuyOrderNonFungible(
          this.ticketTypeId,
          this.ticketId,
          this.highestBuyOrder.queue,
          this.$store.state.activeUser.account,
          this.$store.state.web3.web3Instance,
          this.eventContractAddress,
        );
      } else {
        fillBuyOrderFungible(
          this.ticketTypeId,
          1,
          this.highestBuyOrder.percentage,
          this.$store.state.activeUser.account,
          this.$store.state.web3.web3Instance,
          this.eventContractAddress,
        );
      }
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
  padding: 4rem 1rem;
  padding-bottom: 8rem;

  position: relative;
}
.selection-amount, .selection-amount p, .selection-amount .icon-wrap {
  display: inline-block;
}

.close-icon {
  position: absolute;
  top: 1rem;
  right: 1rem;
  cursor: pointer;
}
.selection-group {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}
.selection-group h3 {
  display: inline-block;
  margin: 0;
  margin-right: 1rem;
}
</style>
