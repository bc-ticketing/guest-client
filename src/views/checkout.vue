<template>
  <div class="checkout">
    <div class="buy-category fungibles">
      <h2>Fungible Tickets</h2>
      <div
        class="ticket"
        v-for="(category, index) in fungibleTickets"
        v-bind:key="'fungible_' + index"
      >
        <div class="direct-buy">
          <div class="header-line">
            <span class="title">{{ category.metadata.title }}</span>
            <span class="price">{{ category.price }} ETH</span>
            <span class="free">{{ category.available }} available</span>
          </div>
          <div class="amount-selection">
            <div class="icon-wrap" @click="changeAmount(index, -1)">
              <md-icon>remove_circle</md-icon>
            </div>
            <input type="number" v-model="category.amount" />
            <div class="icon-wrap" @click="changeAmount(index, 1)">
              <md-icon>add_circle</md-icon>
            </div>
          </div>
        </div>
        <div class="createdOffers">
          <div
            class="offer"
            v-for="(offering, oIndex) in getOfferingsForIndex(index)"
            v-bind:key="'offering_' + oIndex"
          >
            <div class="infos">
              <span>Buy offering</span>
              <span
                >{{ offering.amount }} tickets for {{ offering.queue }}%</span
              >
            </div>
            <md-button class="md-raised" @click="removeAftermarketOrder(index)"
              >remove</md-button
            >
          </div>
        </div>
        <div class="create-buy-order">
          <md-button class="md-raised" @click="toggleBuyOffering(index)"
            >Create buy offering</md-button
          >
          <div class="percentage-selection" :ref="'aftermarketConfig' + index">
            <input
              type="range"
              :min="getStepSize(category.granularity)"
              max="100"
              :step="getStepSize(category.granularity)"
              v-model.number="category.selectedPrice"
            />
            {{ category.selectedPrice }}
            <div class="amount-selection">
              <div
                class="icon-wrap"
                @click="changeAftermarketAmount(index, -1)"
              >
                <md-icon>remove_circle</md-icon>
              </div>
              <input type="number" v-model="category.aftermarketAmount" />
              <div class="icon-wrap" @click="changeAftermarketAmount(index, 1)">
                <md-icon>add_circle</md-icon>
              </div>
            </div>
            <md-button class="md-raised" @click="confirmAftermarketOrder(index)"
              >confirm</md-button
            >
          </div>
        </div>
      </div>
    </div>
    <div class="buy-category nonfungibles">
      <h2>Non Fungible Tickets</h2>
      <div
        class="ticket"
        v-for="(seat, index) in nonfungibleTickets"
        v-bind:key="'nonfungible_' + index"
      >
        <div class="direct-buy">
          <div class="header-line">
            <span class="title">{{ seat.metadata.title }}</span>
            <span class="price">{{ seat.price }} ETH</span>
            <span class="status">{{ isFree(index) }}</span>
          </div>
          <div class="buttons">
            <md-button v-if="seat.isFree" class="md-raised">confirm</md-button>
            <md-button
              v-if="!seat.isFree"
              class="md-raised"
              @click="togglenfBuyOffering(index)"
              >Create buy offering</md-button
            >
          </div>
        </div>

        <div class="createdOffers">
          <div
            class="offer"
            v-for="(offering, oIndex) in getNFOfferingsForIndex(index)"
            v-bind:key="'offering_' + oIndex"
          >
            <div class="infos">
              <span>Buy offering</span>
              <span
                >Offering for {{ offering.queue }}%</span
              >
            </div>
            <md-button class="md-raised" @click="removeNFAftermarketOrder(index)"
              >remove</md-button
            >
          </div>
        </div>

        <div class="percentage-selection" :ref="'nfaftermarketConfig' + index">
          <input
            type="range"
            :min="getStepSize(seat.granularity)"
            max="100"
            :step="getStepSize(seat.granularity)"
            v-model.number="seat.selectedPrice"
          />
          {{ seat.selectedPrice }}

          <md-button class="md-raised" @click="confirmNFAftermarketOrder(index)"
            >confirm</md-button
          >
        </div>
      </div>
    </div>

    <div class="total">
      <div class="price">Cheapest Price: {{ bestSelection.price }} ETH</div>
      <md-button class="md-raised" @click="makePurchase">Purchase</md-button>
    </div>

    <!--
    <div class="buy-selection" v-bind:class="{ active: selected_ticket }">
      <div class="fungible" v-bind:class="{ active: selectedIsFungible }">
        <div
          class="selection-step amount"
          v-bind:class="{ active: selection_process_amount }"
        >
          <div class="icon-wrap" @click="changeAmount(-1)">
            <md-icon>remove_circle</md-icon>
          </div>
          <input type="number" v-model="amount" />
          <div class="icon-wrap" @click="changeAmount(1)">
            <md-icon>add_circle</md-icon>
          </div>
          <md-button class="md-raised" @click="selectionPrice"
            >Confirm</md-button
          >
        </div>
        <div
          class="selection-step price"
          v-bind:class="{ active: selection_process_price }"
        >
          <md-button v-if="selected_ticket" class="md-raised"
            >Buy {{ amount }} tickets for
            {{ selected_ticket.price * amount }} ETH</md-button
          >
         

          <md-button
            v-if="selected_ticket"
            class="md-raised"
            @click="showDialog = !showDialog"
            >Join Aftermarket</md-button
          >
        </div>
      </div>
      <div
        class="nonfungible"
        v-bind:class="{ active: !selectedIsFungible }"
      ></div>
    </div> -->
  </div>
</template>

<script>
export default {
  name: "Checkout",
  components: {},
  data() {
    return {
      aftermarketOrders: {
        fungibleTickets: [],
        nonfungibleTickets: [],
      },
    };
  },
  props: {
    fungibleTickets: Array,
    nonfungibleTickets: Array,
  },
  mounted: function() {},
  computed: {
    bestSelection() {
      let totalPrice = 0;
      let selection = [];
      this.fungibleTickets.forEach((ticket) => {
        let selected_tickets = 0;
        for (const [queue, amount] of Object.entries(
          ticket.metadata.sellOrders
        )) {
          const percentage = queue / 100;
          if (selected_tickets >= ticket.amount) {
            return;
          } else {
            if (amount > ticket.amount - selected_tickets) {
              totalPrice +=
                percentage * (ticket.amount - selected_tickets) * ticket.price;
              selection.push({
                type: 'aftermarket_buy',
                ticketType: ticket.typeIndex,
                queue: queue,
                amount: ticket.amount - selected_tickets,
              });
              selected_tickets += ticket.amount - selected_tickets;
            } else {
              totalPrice += percentage * amount * ticket.price;
              selection.push({
                type: 'aftermarket_buy',
                ticketType: ticket.typeIndex,
                queue: queue,
                amount: amount,
              });
              selected_tickets += amount;
            }
          }
        }
        if (selected_tickets < ticket.amount) {
          totalPrice += ticket.price * (ticket.amount - selected_tickets);
          selection.push({
            type: 'direct',
            ticketType: ticket.typeIndex,
            price: ticket.price,
            amount: ticket.amount - selected_tickets,
          });
        }
      });
      this.nonfungibleTickets.forEach((ticket) => {
        if(ticket.isFree) {
          totalPrice += ticket.price;
          selection.push({
            type: 'direct',
            ticketType: ticket.typeIndex,
            price: ticket.price,
            isNF: true,
          })
        }
      });
      this.aftermarketOrders.fungibleTickets.forEach(offer => {
        selection.push({
          type: 'aftermarket_offering',
          queue: offer.queue,
          price: offer.queue/100 * this.f_getPriceByIndex(offer.ticketIndex) * offer.amount,
          amount: offer.amount,
        })
        totalPrice += offer.queue/100 * this.f_getPriceByIndex(offer.ticketIndex) * offer.amount
      })
      this.aftermarketOrders.nonfungibleTickets.forEach(offer => {
        selection.push({
          type: 'aftermarket_offering',
          ticketType: this.nonfungibleTickets[offer.ticketIndex].typeIndex,
          ticketNr: this.nonfungibleTickets[offer.ticketIndex].index,
          queue: offer.queue,
          price: offer.queue/100 * this.nf_getPriceByIndex(offer.ticketIndex),
        })
        totalPrice += offer.queue/100 * this.nf_getPriceByIndex(offer.ticketIndex);
      })

      return { price: totalPrice, selection: selection };
    },
  },
  methods: {
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
    makePurchase() {},
  },
};
</script>

<style scoped>
.ticket {
  margin-bottom: 1rem;
}
.direct-buy {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-line {
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

</style>
