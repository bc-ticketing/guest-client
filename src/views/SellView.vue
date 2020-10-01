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
        >Sell for {{ highestBuyOrder }}%</md-button
      >
    </div>
  </div>
</template>

<script>
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
    ticket: Object,
    open: Boolean,
  },
  beforeCreate: function() {},
  mounted: function() {},
  computed: {
    granularity() {
      if (!this.ticket.ticketType) {
        return 0;
      }
      return this.ticket.ticketType.aftermarketGranularity;
    },
    isNf() {
      return this.ticket.isNf;
    },
    hasSellOrders() {
      if (!this.ticket.ticketType) {
        return false;
      }
      return (
        Object.getOwnPropertyNames(this.ticket.ticketType.sellOrders).length > 1
      );
    },
    lowestSellOrder() {
      if (!this.ticket.ticketType) {
        return 0;
      }
      return this.ticket.ticketType.getLowestSellOrder().queue;
    },
    lowestSellOrderAmount() {
      if (!this.ticket.ticketType) {
        return 0;
      }
      return this.ticket.ticketType.getLowestSellOrder().amount;
    },
    highestBuyOrder() {
      if (!this.ticket.ticketType) {
        return 0;
      }
      return this.ticket.ticketType.getHighestBuyOrder();
    },
    hasBuyOrder() {
      if (!this.ticket.ticketType) {
        return false;
      }
      return (
        Object.getOwnPropertyNames(this.ticket.ticketType.buyOrders).length > 1
      );
    },
    ticketsOwned() {
      return this.ticket.amount;
    },
  },
  methods: {
    changeSelectionAmount(amount) {
      this.amount += amount;
      this.amount = Math.max(
        Math.min(this.amount, Number(this.ticketsOwned)),
        0
      );
    },
    getStepSize(granularity) {
      return Math.floor(100 / granularity);
    },
    close: function() {
      this.$emit("close");
    },
    sellTicket: function() {
      if (this.isNf) {
        this.ticket.makeSellOrder(
          this.$store.state.web3.web3Instance,
          this.percentage,
          this.$store.state.user.account
        );
      } else {
        this.ticket.ticketType.makeSellOrder(
          this.$store.state.web3.web3Instance,
          this.amount,
          this.percentage,
          this.$store.state.user.account
        );
      }
      //this.$store.state.user.makeSellOrderFungible(this.$store.state.web3.web3Instance, this.activeTicket.ticketType, 100, 1);
    },
    fillBuyOrder: function() {
      if (this.isNf) {
        this.ticket.ticketType.fillBuyOrder(
          this.$store.state.web3.web3Instance,
          [this.ticket],
          [this.highestBuyOrder],
          this.$store.state.user.account
        );
      } else {
        this.ticket.ticketType.fillBuyOrder(
          this.$store.state.web3.web3Instance,
          1,
          this.highestBuyOrder,
          this.$store.state.user.account
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
