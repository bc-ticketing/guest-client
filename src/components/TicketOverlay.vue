<template>
  <div class="overlay" v-bind:class="{ open: open }">
    <v-touch v-on:swipedown="$emit('close')" class="close-bar">
      <div class="close-icon" @click="$emit('close')">
        <md-icon>close</md-icon>
      </div>
    </v-touch>
    <div class="ticket">
      <div
        class="ticket-section image"
        :style="{
          backgroundImage: `url(${eventImage})`,
          backgroundColor: `${eventColor}`,
        }"
      ></div>
      <div class="ticket-section">
        <div class="group">
          <div class="label">Ticket Category</div>
          <div class="value">{{ ticketTitle }}</div>
        </div>
        <div class="group">
          <div class="value">{{ ticketDescription }}</div>
        </div>
        <div class="group">
          <div class="label">Event</div>
          <div class="value">{{ eventTitle }}</div>
        </div>
        <div class="group">
          <div class="label">Location</div>
          <div class="value">{{ eventLocation }}</div>
        </div>
        <div class="group">
          <div class="label">Date</div>
          <div class="value">{{ eventDate }}</div>
        </div>
        <div class="group">
          <div v-if="isNf || amountOwned == 1" class="label">
            Your Ticket
          </div>
          <div v-if="!isNf && amountOwned > 1" class="label">
            Your Tickets
          </div>
          <div v-if="!isNf" class="value">{{ amountOwned }} tickets</div>
          <div v-else class="value">Seat Number {{ ticketId }}</div>
        </div>
      </div>
      <div class="ticket-section">
        <h3>Sell this ticket</h3>
        <div class="group" v-if="hasBuyOrder">
          <div class="label">
            People want your ticket! If you don't plan on using it, you can sell
            it right now for
            {{ highestBuyOrder.percentage }}% of it's original price.
          </div>
          <md-button class="md-raised" @click="fillBuyOrder()">Sell</md-button>
        </div>
        <div class="group" v-if="amountOwned > amountOnAftermarket">
          <div class="label">
            You can always put your ticket on the market to see if anyone wants
            to buy it. <br />
            Tip: You can check how many people are queued up for buying and
            selling in the <i>aftermaket</i>
            tab of the event!
          </div>
          <div v-if="!isNf" class="selection-group amount-selection">
            <p>Sell</p>
            <div class="selection-amount">
              <div class="icon-wrap" @click="changeSelectionAmount(-1)">
                <md-icon>remove_circle</md-icon>
              </div>
              <p>{{ amountToSell }}</p>
              <div class="icon-wrap" @click="changeSelectionAmount(1)">
                <md-icon>add_circle</md-icon>
              </div>
            </div>
            <p>tickets for</p>
          </div>
          <div class="selection-group percentage-selection">
            <input
              type="range"
              :min="getStepSize(granularity)"
              max="100"
              :step="getStepSize(granularity)"
              v-model.number="percentageToSell"
            />
            {{ percentageToSell }}
            % of the price
          </div>

          <md-button class="md-raised" @click="sellTicket"
            >Create Sell Order</md-button
          >
        </div>
        <div class="group">
          <div class="active-sell-order" v-if="getUserSellOrders.length > 0">
            <div
              class="sell-order"
              v-for="(order, index) in getUserSellOrders"
              v-bind:key="'sellorder_' + order.percentage + '_' + index"
            >
              <div class="label">
                You have listed {{ order.quantity }} of this ticket for
                {{ order.percentage }}% of its price
              </div>

              <md-button
                class="md-raised"
                @click="withdrawSellOrder(order.percentage, order.quantity)"
                >withdraw</md-button
              >
            </div>
          </div>
        </div>
      </div>
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
  fillBuyOrderFungible,
  hasBuyOrder,
  withdrawSellOrderNonFungible,
  withdrawSellOrderFungible,
} from "./../util/tickets";

import { getNumberFungibleOwned } from "./../util/User";

export default {
  name: "TicketOverlay",
  components: {},
  data() {
    return {
      percentage: 100,
      amount: 1,
      amountToSell: 1,
      percentageToSell: 100,
    };
  },
  props: {
    ticketId: Number,
    ticketTypeId: Number,
    eventContractAddress: String,
    isNf: Boolean,
    open: Boolean,
  },
  beforeCreate: function() {},
  mounted: function() {},
  computed: {
    event() {
      if (!this.eventContractAddress) return undefined;
      return this.$store.state.events.find(
        (e) => e.contractAddress === this.eventContractAddress
      );
    },
    eventTitle() {
      return this.event ? this.event.title : "";
    },
    eventDate() {
      return this.event ? this.event.getTimeAndDate() : "";
    },
    eventImage() {
      return this.event ? this.event.img_url : "";
    },
    eventLocation() {
      return this.event ? this.event.location : "";
    },
    eventColor() {
      return this.event ? this.event.color : "";
    },
    ticket() {
      return this.event
        ? this.event.getNfTicket(this.ticketTypeId, this.ticketId)
        : undefined;
    },
    ticketType() {
      return this.event
        ? this.event.getTicketType(this.ticketTypeId, this.isNf)
        : undefined;
    },
    ticketTitle() {
      return this.ticketType ? this.ticketType.title : "";
    },
    ticketDescription() {
      return this.ticketType ? this.ticketType.description : "";
    },
    granularity() {
      return this.ticketType ? this.ticketType.aftermarketGranularity : 1;
    },
    getUserSellOrders() {
      if (!this.$store.state.activeUser) return [];
      let userTicket;
      if (this.isNf) {
        userTicket = this.$store.state.activeUser.nonFungibleTickets.find(
          (t) =>
            t.eventContractAddress === this.eventContractAddress &&
            t.ticketType === this.ticketTypeId
        );
      } else {
        userTicket = this.$store.state.activeUser.fungibleTickets.find(
          (t) =>
            t.eventContractAddress === this.eventContractAddress &&
            t.ticketType === this.ticketTypeId
        );
      }
      console.log(userTicket);
      if (userTicket) {
        return userTicket.sellOrders ? userTicket.sellOrders : [];
      }
      return [];
    },
    amountOnAftermarket() {
      const orders = this.getUserSellOrders;
      if (!orders) return 0;
      let total = 0;
      orders.forEach((o) => {
        total += o.quantity;
      });
      return total;
    },
    ticketsLeftToSell() {
      let total = 0;
      this.activeSellOrders.forEach((o) => {
        total += o.quantity;
      });
      return this.amountOwned - total;
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
      return this.ticketType ? hasBuyOrder(this.ticketType) : false;
    },
    amountOwned() {
      if (this.ticketType) {
        if (this.isNf) {
          return 1;
        } else {
          return getNumberFungibleOwned(
            this.$store.state.activeUser,
            this.eventContractAddress,
            this.ticketTypeId
          );
        }
      } else {
        return 0;
      }
    },
  },
  methods: {
    changeSelectionAmount(amount) {
      this.amountToSell += amount;
      this.amountToSell = Math.max(
        Math.min(this.amountToSell, Number(this.ticketsLeftToSell)),
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
          this.percentageToSell,
          this.$store.state.activeUser.account,
          this.$store.state.web3.web3Instance,
          this.eventContractAddress
        );
        console.log(result);
        if (result.status == 1) {
          await this.$store.dispatch("updateEvent", result.event);
          await this.$store.dispatch("registerActiveUser");
          this.$root.$emit("userUpdated");
        }
        this.$root.$emit("openMessageBus", result);
        this.close();
      } else {
        const result = await makeSellOrderFungible(
          this.ticketTypeId,
          this.amount,
          this.percentageToSell,
          this.$store.state.activeUser.account,
          this.$store.state.web3.web3Instance,
          this.eventContractAddress
        );
        if (result.status == 1) {
          await this.$store.dispatch("updateEvent", result.event);
          await this.$store.dispatch("registerActiveUser");
          this.$root.$emit("userUpdated");
        }
        this.$root.$emit("openMessageBus", result);
        this.close();
      }
      //this.$store.state.user.makeSellOrderFungible(this.$store.state.web3.web3Instance, this.activeTicket.ticketType, 100, 1);
    },
    async withdrawSellOrder(percentage, quantity) {
      let result;
      if (this.activeIsNf) {
        result = await withdrawSellOrderNonFungible(
          this.ticketTypeId,
          this.ticketId,
          this.$store.state.activeUser.account,
          this.$store.state.web3.web3Instance,
          this.eventContractAddress
        );
      } else {
        result = await withdrawSellOrderFungible(
          this.ticketTypeId,
          quantity,
          percentage,
          this.$store.state.activeUser.account,
          this.$store.state.web3.web3Instance,
          this.eventContractAddress
        );
      }
      if (result.status == 1) {
        await this.$store.dispatch("updateEvent", result.event);
        await this.$store.dispatch("registerActiveUser");
        this.$root.$emit("userUpdated");
      }
      this.$root.$emit("openMessageBus", result);
    },
    fillBuyOrder: async function() {
      if (this.isNf) {
        const result = await fillBuyOrderNonFungible(
          this.ticketTypeId,
          this.ticketId,
          this.highestBuyOrder.percentage,
          this.$store.state.activeUser.account,
          this.$store.state.web3.web3Instance,
          this.eventContractAddress
        );
        this.$root.$emit("openMessageBus", result);
      } else {
        const result = await fillBuyOrderFungible(
          this.ticketTypeId,
          1,
          this.highestBuyOrder.percentage,
          this.$store.state.activeUser.account,
          this.$store.state.web3.web3Instance,
          this.eventContractAddress
        );
        this.$root.$emit("openMessageBus", result);
      }
      await this.$store.dispatch("updateEvent", this.eventContractAddress);
      await this.$store.dispatch("registerActiveUser");
      this.$root.$emit("userUpdated");
      this.$root.$emit("updateCharts");
    },
  },
};
</script>

<style scoped>
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  transform: translateY(100%);
  transition: 0.4s transform ease-in-out;
  background: rgb(245, 222, 242);
  background: linear-gradient(
    0deg,
    rgba(208, 135, 122, 1) 0%,
    rgba(208, 135, 122, 1) 34%,
    rgba(208, 135, 122, 0) 100%
  );
  overflow-y: scroll;
}
.overlay.open {
  transform: translateY(0);
}

.close-bar {
  width: 100%;
  background: white;
  box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2),
    0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12);
  padding: 1rem;
  display: flex;
  justify-content: end;
  position: sticky;
  top: 0;
  opacity: 0;
  transition: opacity 1s ease-in-out;
}
.overlay.open .close-bar {
  opacity: 1;
}
.close-bar .md-icon {
  margin: 0;
  cursor: pointer;
}
.ticket {
  width: 90%;
  margin: auto;
  margin-top: 1rem;
  padding-bottom: 80px;
}
.ticket-section {
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.171);
  border-bottom: 1px dashed rgba(0, 0, 0, 0.171);
  box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2),
    0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12);
  padding: 2rem;
  background: #eceff4;
}
.ticket-section.image {
  height: 200px;
  padding: 0;
}
.group {
  margin-bottom: 1rem;
}
.label {
  color: #4c566a;
}
.value {
  color: #2e3440;
}
.selection-group p,
.selection-group .selection-amount {
  display: inline-block;
  margin: 0;
}
.selection-group .selection-amount i {
  margin-left: 0.4rem;
  margin-right: 0.4rem;
}
</style>
