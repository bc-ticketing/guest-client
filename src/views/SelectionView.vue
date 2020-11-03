<template>
  <div class="selection" v-bind:class="{ open: open }">
    <v-touch v-on:swipedown="close" class="wrapper">
      <span class="close-icon" @click="close">
        <md-icon>close</md-icon>
      </span>
      <section>
        <h3>{{ ticketTitle }}</h3>
        <p>{{ ticketDescription }}</p>
        <p v-if="isNf">Seat Number {{ seatNumber }}</p>
        <div class="group">
          <div class="label">Price</div>
          <div class="value">
            <div>{{ price }} ETH</div>
            <div v-if="!isNf">{{ ticketsAvailable }} available</div>
            <div v-else>
              {{ available ? "available" : "sold" }}
            </div>
          </div>
        </div>

        <div class="availability">
          <div v-if="!userNotOwner">
            You are the owner of this ticket, you can create a sell offering in
            your inventory!
          </div>
          <div v-if="!available && !nfForSale">
            This Ticket has already been sold, you can create an aftermarket
            listing if you want to queue up for it.
          </div>
          <div v-if="!available && nfForSale">
            This ticket is sold but listed on the aftermarket, you can buy it
            from there or create your own listing.
          </div>
          <div v-if="!available">
            This Ticket Category is sold out, you can create an aftermarket
            listing if you want to queue up for it.
          </div>
        </div>
        <div class="group" v-if="available">
          <div v-if="!isNf" class="amount-selection">
            <div class="icon-wrap" @click="changeSelectionAmount(-1)">
              <md-icon>remove_circle</md-icon>
            </div>
            <input type="number" v-model="amount" />
            <div class="icon-wrap" @click="changeSelectionAmount(1)">
              <md-icon>add_circle</md-icon>
            </div>
          </div>

          <md-button v-if="available" class="md-raised" @click="buy"
            >Buy</md-button
          >
        </div>
      </section>
    </v-touch>
  </div>
</template>

<script>
import {
  fillSellOrderFungible,
  fillSellOrderNonFungible,
  makeBuyOrderNonFungible,
  makeBuyOrderFungible,
  buyFungible,
  buyNonFungible,
} from "./../util/tickets";
import { EVENT_MINTABLE_AFTERMARKET_ABI } from "./../util/abi/eventMintableAftermarket";

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
      return this.$store.state.events.find(
        (e) => e.contractAddress === this.eventContractAddress
      );
    },
    
    ticketType() {
      return this.event
        ? this.event.getTicketType(this.ticketTypeId, this.isNf)
        : undefined;
    },
    ticketTitle() {
      return this.ticketType ? this.ticketType.title : "";
    },
    ticketsAvailable() {
      return this.ticketType
        ? this.ticketType.supply - this.ticketType.ticketsSold
        : 0;
    },
    seatNumber() {
      return this.isNf ? this.ticketId : 0;
    },
    ticketDescription() {
      return this.ticketType ? this.ticketType.description : "";
    },
    price() {
      return this.ticketType ? this.$store.state.web3.web3Instance.utils.fromWei(this.ticketType.price) : 0;
    },
    granularity() {
      return this.ticketType ? this.ticketType.aftermarketGranularity : 1;
    },
    ticketHasSellOrders() {
      if (!this.event) {
        return false;
      }
      if (this.isNf) {
        return this.event.hasSellOrders(this.ticketTypeId, this.ticketId);
      }
      return this.event.hasSellOrders(this.ticketTypeId);
    },
    lowestSellOrder() {
      if (!this.event) {
        return false;
      }
      if (this.isNf) {
        return this.event.getLowestSellOrder(this.ticketTypeId, this.ticketId)
          .queue;
      } else {
        return this.event.getLowestSellOrder(this.ticketTypeId).percentage;
      }
    },
    lowestSellOrderAmount() {
      if (!this.event || !this.ticketHasSellOrders) {
        return false;
      }
      if (this.isNf) {
        return this.event.getLowestSellOrder(this.ticketTypeId, this.ticketId)
          .amount;
      } else {
        return this.event.getLowestSellOrder(this.ticketTypeId).quantity;
      }
    },
    available() {
      return this.event
        ? this.event.isAvailable(this.ticketTypeId, this.ticketId)
        : false;
    },
    userNotOwner() {
      return this.event && this.isNf
        ? this.event.getNfOwner(this.ticketTypeId, this.ticketId) !==
            this.$store.state.activeUser.account
        : true;
    },
    nfForSale() {
      return this.event
        ? this.event.hasSellOrders(this.ticketTypeId, this.ticketId)
        : false;
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
      this.$root.$emit("openMessageBus", {
        message: "Ticket added to cart",
        status: 1,
      });
      this.close();
    },
    buy: async function() {
      if (!this.isNf) {
        const result = await buyFungible(
          this.ticketTypeId,
          this.amount,
          this.price,
          this.$store.state.web3.web3Instance,
          EVENT_MINTABLE_AFTERMARKET_ABI,
          this.$store.state.activeUser.account,
          this.eventContractAddress
        );
        this.$root.$emit("openMessageBus", result);
      } else {
        const result = await buyNonFungible(
          this.ticketTypeId,
          this.ticketId,
          this.price,
          this.$store.state.web3.web3Instance,
          EVENT_MINTABLE_AFTERMARKET_ABI,
          this.$store.state.activeUser.account,
          this.eventContractAddress
        );
        this.$root.$emit("openMessageBus", result);
      }
      await this.$store.dispatch("updateEvent", this.eventContractAddress);
      await this.$store.dispatch("registerActiveUser");
      this.$root.$emit("userUpdated");
    },
    createBuyOrder: async function() {
      if (this.isNf) {
        const result = await makeBuyOrderNonFungible(
          this.ticketTypeId,
          this.amount,
          this.percentage,
          this.price,
          this.$store.state.activeUser.account,
          this.$store.state.web3.web3Instance,
          this.eventContractAddress
        );
        this.$root.$emit("openMessageBus", result);
      } else {
        const result = await makeBuyOrderFungible(
          this.ticketTypeId,
          this.amount,
          this.percentage,
          this.price,
          this.$store.state.activeUser.account,
          this.$store.state.web3.web3Instance,
          this.eventContractAddress
        );
        this.$root.$emit("openMessageBus", result);
      }
    },
    fillSellOrder: async function() {
      if (this.isNf) {
        const result = await fillSellOrderNonFungible(
          this.ticketTypeId,
          this.ticketId,
          this.lowestSellOrder,
          this.price,
          this.$store.state.activeUser.account,
          this.$store.state.web3.web3Instance,
          this.eventContractAddress
        );
        this.$root.$emit("openMessageBus", result);
      } else {
        const result = await fillSellOrderFungible(
          this.ticketTypeId,
          this.amount,
          this.price,
          this.lowestSellOrder,
          this.$store.state.activeUser.account,
          this.$store.state.web3.web3Instance,
          this.eventContractAddress
        );
        this.$root.$emit("openMessageBus", result);
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
  position: fixed;
  top: 100vh;
  left: 0;
  transition: transform 0.5s ease-in-out;
  width: 100%;
  z-index: 9999;
  padding: 1rem;
}

.selection.open {
  transform: translateY(-100%);
}

.wrapper {
  background: #eceff4;
  border-radius: 15px;
  position: relative;
  padding: 2rem;
  box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2),
    0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12);
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
