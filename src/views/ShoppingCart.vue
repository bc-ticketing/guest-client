<template>
  <div class="checkout">
    <div
      class="buy-category fungibles"
      v-if="$store.state.shoppingCart.fungibleTickets.length > 0"
    >
      <h2>Fungible Tickets</h2>
      <div
        class="ticket"
        v-for="(selection, index) in $store.state.shoppingCart.fungibleTickets"
        v-bind:key="'fungible_' + index"
      >
        <div class="direct-buy">
          <div class="header-line">
            <span class="title">{{ selection.ticket.title }}</span>
            <span class="price">{{ selection.ticket.price }} ETH</span>
            <span class="amount">{{ selection.amount }} Tickets</span>
          </div>

          <div class="remove" @click="removeTicket(index, true)">
            <md-icon>delete</md-icon>
          </div>
        </div>
      </div>
    </div>
    <div
      class="buy-category nonfungibles"
      v-if="$store.state.shoppingCart.nonFungibleTickets.length > 0"
    >
      <h2>Non Fungible Tickets</h2>
      <div
        class="ticket"
        v-for="(selection, index) in $store.state.shoppingCart
          .nonFungibleTickets"
        v-bind:key="'nonfungible_' + index"
      >
        <div class="direct-buy">
          <div class="header-line">
            <span class="title"
              >{{ selection.ticketType }} - Seat Nr {{ selection.ticket }}</span
            >
            <span class="price">{{ selection.price }} ETH</span>
          </div>

          <div class="remove" @click="removeTicket(index, false)">
            <md-icon>delete</md-icon>
          </div>
        </div>
      </div>
    </div>
    <div
      class="empty"
      v-if="
        $store.state.shoppingCart.fungibleTickets.length == 0 &&
          $store.state.shoppingCart.nonFungibleTickets.length == 0
      "
    >
      No items currently in Shopping Cart
    </div>

    <div
      class="total"
      v-if="
        $store.state.shoppingCart.fungibleTickets.length > 0 ||
          $store.state.shoppingCart.nonFungibleTickets.length > 0
      "
    >
      <span class="total"> Total: {{ totalPrice }} ETH</span>
      <md-button class="md-raised" @click="checkout">Purchase</md-button>
    </div>
  </div>
</template>

<script>
export default {
  name: "ShoppingCart",
  components: {},
  data() {
    return {
      totalPrice: 0,
    };
  },
  props: {},
  beforeCreate: function() {
    this.$root.$on("shoppingCartChanged", async () => {
      this.calculateTotalPrice();
    });
  },
  mounted: function() {},
  computed: {},
  methods: {
    async checkout() {
      const results = await this.$store.state.shoppingCart.checkout(
        this.$store.state.web3.web3Instance,
        this.$store.state.user.account
      );
      for (const res of results) {
        this.$root.$emit("openMessageBus", res, "success");
      }
    },
    async removeTicket(index, fungible) {
      await this.$store.dispatch("removeTicketFromCart", {
        index: index,
        fungible: fungible,
      });
      this.calculateTotalPrice();
    },
    calculateTotalPrice() {
      let totalPrice = 0;
      this.$store.state.shoppingCart.fungibleTickets.forEach((selection) => {
        totalPrice += Number(selection.ticket.price * selection.amount);
      });
      this.$store.state.shoppingCart.nonFungibleTickets.forEach((selection) => {
        totalPrice += Number(selection.ticket.ticketType.price);
      });
      this.totalPrice = totalPrice;
    },
    f_getPriceByIndex(index) {
      return this.fungibleTickets[index].price;
    },
    nf_getPriceByIndex(index) {
      return this.nonfungibleTickets[index].price;
    },

    getOfferingsForIndex(index) {
      return this.aftermarketOrders.fungibleTickets.filter(
        (order) => order.ticketIndex == index
      );
    },
    getNFOfferingsForIndex(index) {
      return this.aftermarketOrders.nonfungibleTickets.filter(
        (order) => order.ticketIndex == index
      );
    },
    toggleBuyOffering: function(index) {
      this.$refs[`aftermarketConfig` + index][0].classList.toggle("active");
    },
    togglenfBuyOffering: function(index) {
      this.$refs[`nfaftermarketConfig` + index][0].classList.toggle("active");
    },
    confirmAftermarketOrder(index) {
      this.aftermarketOrders.fungibleTickets.push({
        ticketIndex: index,
        queue: this.fungibleTickets[index].selectedPrice,
        amount: this.fungibleTickets[index].aftermarketAmount,
      });
      this.toggleBuyOffering(index);
    },
    confirmNFAftermarketOrder(index) {
      this.aftermarketOrders.nonfungibleTickets.push({
        ticketIndex: index,
        ticketNr: this.nonfungibleTickets[index].index,
        queue: this.nonfungibleTickets[index].selectedPrice,
      });
      this.togglenfBuyOffering(index);
    },
    removeAftermarketOrder(index) {
      this.aftermarketOrders.fungibleTickets = this.aftermarketOrders.fungibleTickets.filter(
        (order) => order.ticketIndex != index
      );
    },
    removeNFAftermarketOrder(index) {
      this.aftermarketOrders.nonfungibleTickets = this.aftermarketOrders.nonfungibleTickets.filter(
        (order) => order.ticketIndex != index
      );
    },
    getStepSize(granularity) {
      return Math.floor(100 / granularity);
    },
    isFree: function(index) {
      return this.nonfungibleTickets[index].isFree ? "Available" : "Sold";
    },
    changeAmount(index, val) {
      this.fungibleTickets[index].amount += val;
    },
    changeAftermarketAmount(index, val) {
      this.fungibleTickets[index].aftermarketAmount += val;
    },
  },
};
</script>

<style scoped>
.empty {
  margin-top: 3rem;
}

.ticket {
  margin-bottom: 1rem;
}
.direct-buy {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-line span {
  display: block;
}
.amount-selection input {
  -moz-appearance: textfield;
  width: 2rem;
}
.amount-selection .icon-wrap {
  display: inline-block;
}
.total {
  margin-top: 2rem;
}
.percentage-selection {
  max-height: 0;
  overflow: hidden;
}
.percentage-selection.active {
  max-height: unset;
}
.checkout {
  margin-bottom: 5rem;
}
.offer {
  display: flex;
  justify-content: space-between;
}
.infos span {
  display: block;
}
.remove {
  cursor: pointer;
}
</style>
