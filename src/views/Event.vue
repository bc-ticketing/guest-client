<template>
  <div class="event">
    <div
      class="container-fluid header-img"
      ref="teaser"
      :style="{ backgroundColor: `${event.color}` }"
    >
      <!-- <div class="parallax" ref="parallax">  -->
      <img ref="teaserImg" :src="event.img_url" alt="" class="img-fluid" />
      <!-- </div> -->
      <div class="return-arrow">
        <router-link to="/event-list"
          ><md-icon>arrow_back_ios</md-icon></router-link
        >
      </div>
      <div class="event-header" ref="headerTitle">
        <span class="event-title">{{ event.title }}</span>
        <span class="event-cat">Concert</span>
      </div>
      <div class="nav-bar" ref="navigation">
        <div
          class="nav-entry about active"
          ref="about"
          @click="toggleTab('about')"
        >
          About
        </div>
        <div
          class="nav-entry tickets"
          ref="tickets-plan"
          @click="toggleTab('tickets-plan')"
        >
          Tickets
        </div>
        <div
          class="nav-entry aftermarket"
          ref="aftermarket"
          @click="toggleTab('aftermarket')"
        >
          Aftermarket
        </div>
        <div
          class="nav-entry checkout"
          ref="checkout"
          @click="toggleTab('checkout')"
        >
          <md-badge :md-content="shoppingCartItems">
            <md-icon class="shopping-cart">shopping_cart</md-icon>
          </md-badge>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="event-info-wrapper active" ref="content-about">
        <span class="event-title">
          <h2>{{ event.title }}</h2>
        </span>
        <div class="info-group description">
          {{ event.description }}
        </div>
        <div class="info-group">
          <md-icon class="info-title">location_on</md-icon>
          <span class="info-value">{{ event.location }}</span>
        </div>
        <div class="info-group">
          <md-icon class="info-title">event</md-icon>
          <span class="info-value">{{ event_date }}</span>
        </div>
        <div class="info-group">
          <md-icon class="info-title">label</md-icon>
          <span class="info-value tag">{{ event.category }}</span>
        </div>
        <div class="info-group">
          <md-icon class="info-title">local_offer</md-icon>
          <span class="info-value">From {{ lowest_price }} ETH</span>
        </div>
        <div class="info-group">
          <md-icon class="info-title">link</md-icon>
          <a class="info-value" :href="event.url" target="_blank">Website</a>
        </div>
        <div class="info-group">
          <md-icon class="info-title">delete</md-icon>
          <a class="info-value" :href="event.twitter" target="_blank"
            >Twitter</a
          >
        </div>
        <h3>Identity</h3>
        <div class="info-group">
          <md-icon class="info-title">supervised_user_circle</md-icon>
          <span class="info-value">{{approverTitle}}</span>
        </div>
        <div class="info-group">
          <md-icon class="info-title">mail_outline</md-icon>
          <span class="info-value">{{requiredIdentityLevel}} - {{requiredIdentityMethod}}</span>
        </div>
        <div class="info-group" v-if="userIsApproved">
          You are approved with {{approverTitle}} at the required level to buy tickets.
        </div>
      </div>

      <div class="event-info-wrapper" ref="content-tickets-plan">
        <div class="seat-info">
          <div class="tooltip" ref="tooltip">
            <span class="ticket-title">
              <h2>{{ tooltip.title }}</h2>
              <span>{{ tooltip.price }} ETH</span>
            </span>
            <div style="display: flex; justify-content: space-between;">
              <span v-if="!tooltip.isNf" class="ticket-supply" ref="supply">
                {{ tooltip.supply }} tickets left
              </span>
              <span v-if="tooltip.isNf"> Seat Number: {{ tooltip.seat }} </span>
              <span
                v-if="tooltip.isNf"
                :data-status="tooltip.seat_status"
                class="ticket-status"
                >{{ tooltip.seat_status }}</span
              >
              <span v-if="tooltip.isNF" class="ticket-nr"
                >Seat {{ tooltip.seat }}</span
              >
            </div>
            <span class="ticket-desc"> {{ tooltip.desc }}</span>
            <div v-if="!tooltip.isNf && activeTicketsOwned">
              You own {{ activeTicketsOwned }} tickets of this category
            </div>
            <div v-if="tooltip.isNf && activeTicketsOwned">
              You own this ticket
            </div>
          </div>
        </div>

        <div class="seating-container" :ref="'cont'" draggable="false">
          <div class="col" v-for="col in cols" v-bind:key="'col_' + col">
            <div
              :ref="'seat_' + col + '_' + row"
              @click="selectTicket(col, row)"
              @mouseenter="showToolTip(col, row)"
              data-status=""
              class="seat"
              v-for="row in rows"
              v-bind:key="'seat_' + row"
            ></div>
          </div>
        </div>
      </div>
      <div class="event-info-wrapper" ref="content-aftermarket">
        <div
          class="ticket-type-am"
          v-for="ticket in fungibleTickets"
          v-bind:key="'fungible_' + ticket.typeId"
        >
          <h3>{{ ticket.title }}</h3>
          <div class="queue-wrapper buying">
            <div class="queue-label">
              buy
            </div>
            <div class="queue">
              <div
                class="step-wrapper"
                @mouseenter="setActiveQueueTip(ticket)"
                :style="{
                  left: `calc(${(100 / (ticket.aftermarketGranularity - 1)) *
                    (i - 1)}% - 10px)`
                }"
                v-for="i in Number(ticket.aftermarketGranularity)"
                :key="'fungible_buy_' + i"
              >
                <div
                  class="step"
                  :data-orders="
                    numBuyOrdersByPercent(
                      ticket,
                      (100 / ticket.aftermarketGranularity) * i
                    )
                  "
                ></div>
                <md-tooltip>
                  {{
                    numBuyOrdersByPercent(
                      ticket,
                      (100 / ticket.aftermarketGranularity) * i
                    )
                  }}
                  offers
                </md-tooltip>
              </div>
            </div>
          </div>
          <div class="queue-wrapper selling">
            <div class="queue-label">
              sell
            </div>
            <div class="queue">
              <div
                class="step-wrapper"
                @mouseenter="setActiveQueueTip(ticket)"
                :style="{
                  left: `calc(${(100 / (ticket.aftermarketGranularity - 1)) *
                    (i - 1)}% - 10px)`
                }"
                v-for="i in Number(ticket.aftermarketGranularity)"
                :key="'fungible_buy_' + i"
              >
                <div
                  class="step"
                  :data-orders="
                    numSellOrdersByPercent(
                      ticket,
                      (100 / ticket.aftermarketGranularity) * i
                    )
                  "
                ></div>

                <md-tooltip>
                  {{
                    numSellOrdersByPercent(
                      ticket,
                      (100 / ticket.aftermarketGranularity) * i
                    )
                  }}
                  offers
                </md-tooltip>
              </div>
            </div>
          </div>
        </div>
        <div
          class="ticket-type-am"
          v-for="ticket in nonFungibleTickets"
          v-bind:key="'nonfungible_' + ticket.typeId"
        >
          <h3>{{ ticket.title }}</h3>
          <div class="queue-wrapper buying">
            <div class="queue-label">
              buy
            </div>
            <div class="queue">
              <div
                class="step-wrapper"
                :ref="'fungible_buy_' + ticket.typeId + '_' + i"
                @mouseenter="setActiveQueueTip(ticket)"
                :style="{
                  left: `calc(${(100 / (ticket.aftermarketGranularity - 1)) *
                    (i - 1)}% - 10px)`
                }"
                v-for="i in Number(ticket.aftermarketGranularity)"
                :key="'fungible_buy_' + i"
              >
                <div
                  class="step"
                  :data-orders="
                    numBuyOrdersByPercent(
                      ticket,
                      (100 / ticket.aftermarketGranularity) * i
                    )
                  "
                ></div>

                <md-tooltip>
                  {{
                    numBuyOrdersByPercent(
                      ticket,
                      (100 / ticket.aftermarketGranularity) * i
                    )
                  }}
                  offers
                </md-tooltip>
              </div>
            </div>
          </div>
          <div class="selling">
            <h3>sell</h3>
            <div class="sell-offers-nf">
              <div
                class="sell-offering"
                v-for="(offering, index) in allSellOferingsNfTicketType(ticket)"
                v-bind:key="'sellOffering_' + index"
              >
                <span class="ticket-number"
                  >Seat Number {{ offering.ticketId }}</span
                >
                <span class="percentage">{{ offering.percentage }}%</span>
                <span
                  class="fill-sell"
                  @click="
                    fillSellOrderNonFungible(
                      ticket.typeId,
                      offering.ticketId,
                      offering.percentage,
                      ticket.price
                    )
                  "
                >
                  <md-icon>shop</md-icon>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="event-info-wrapper" ref="content-checkout">
        <ShoppingCart></ShoppingCart>
      </div>
    </div>
    <SelectionView
      v-bind:ticketId="selection.ticketId"
      v-bind:ticketTypeId="selection.ticketTypeId"
      v-bind:eventContractAddress="selection.eventContractAddress"
      v-bind:isNf="selection.isNf"
      v-bind:open="selection.active"
      v-on:close="clearSelection"
    ></SelectionView>
  </div>
</template>

<script>
import ShoppingCart from "./ShoppingCart";
import SelectionView from "./SelectionView";
import {
  hasSellOrder,
  getLowestSellOrder,
  numberFreeSeats,
  isFree,
  getHighestBuyOrder,
  getNumBuyOrdersByPercent,
  getNumSellOrdersByPercent,
  getAllSellOferingsNfTicketType,
  fillSellOrderNonFungible
} from "./../util/tickets";
import { getNumberFungibleOwned, ownsNonFungible } from "./../util/User";
export default {
  name: "Event",
  data() {
    return {
      event: {},
      activeQueueTip: {
        ticketType: 0,
        index: 0,
        type: "",
        isNf: false
      },
      aftermarket_price: 0,
      showDialog: false,
      contractAddress: Number,
      tabs: ["about", "tickets-plan", "aftermarket", "checkout"],
      rows: 0,
      cols: 0,
      tooltip: {},
      toolTipActive: false,
      navbarHeight: 0,
      selection: {
        active: false,
        ticketId: 0,
        ticketTypeId: 0,
        price: 0,
        eventContractAddress: "",
        isNf: false
      }
      //tickets: [{ name: "fungible", price: 50 }],
    };
  },
  components: {
    ShoppingCart,
    SelectionView
  },
  props: {},
  computed: {
    approver() {
      return this.event.identityContractAddress
        ? this.$store.state.approvers.find(
            a =>
              String(a.approverAddress) ===
              String(this.event.identityContractAddress)
          )
        : undefined;
    },
    approverTitle() {
      return this.approver ? this.approver.title : "";
    },
    requiredIdentityLevel() {
      return Number(this.event.identityLevel);
    },
    requiredIdentityMethod() {
      return this.approver && this.approver.getMethodFromLevel(this.requiredIdentityLevel);
    },
    userIsApproved() {
      return this.approver &&
      this.$store.state.activeUser.approvalLevels &&
      this.$store.state.activeUser.approvalLevels[this.approver.approverAddress] &&
      Number(this.$store.state.activeUser.approvalLevels[this.approver.approverAddress].level) >= this.requiredIdentityLevel;
    },
    fungibleTickets() {
      return this.event.fungibleTickets ? this.event.fungibleTickets : [];
    },
    nonFungibleTickets() {
      return this.event.nonFungibleTickets ? this.event.nonFungibleTickets : [];
    },
    activeTicketsOwned() {
      if (this.toolTipActive) {
        if (this.tooltip.isNf) {
          return ownsNonFungible(
            this.$store.state.activeUser,
            this.tooltip.eventContractAddress,
            this.tooltip.ticketType,
            this.tooltip.seat
          );
        }
        return getNumberFungibleOwned(
          this.$store.state.activeUser,
          this.tooltip.eventContractAddress,
          this.tooltip.ticketType
        );
      }
      return 0;
    },
    lowest_price() {
      try {
        return this.event.getLowestPrice();
      } catch (e) {
        return 0;
      }
    },
    event_date() {
      try {
        return this.event.getTimeAndDate();
      } catch (e) {
        return 0;
      }
    },
    shoppingCartItems() {
      return this.$store.state.shoppingCart.getAmountOfItems();
    },
    tickets() {
      if (this.$store.state.events[this.event_id]) {
        return this.$store.state.events[this.event_id].tickets;
      } else {
        return [];
      }
    },
    tooltipIsNf() {
      return this.tooltip.isNf == true;
    }
  },
  watch: {},
  methods: {
    async fillSellOrderNonFungible(ticketTypeId, ticketId, percentage, price) {
      const result = await fillSellOrderNonFungible(
        ticketTypeId,
        ticketId,
        percentage,
        price,
        this.$store.state.activeUser.account,
        this.$store.state.web3.web3Instance,
        this.event.contractAddress
      );
      this.$root.$emit("openMessageBus", result);
    },
    setActiveQueueTip(ticket) {
      this.activeQueueTip.ticketType = ticket;
    },
    numSellOrdersByPercent(ticket, percentage) {
      return getNumSellOrdersByPercent(ticket, percentage);
    },
    numBuyOrdersByPercent(ticket, percentage) {
      return getNumBuyOrdersByPercent(ticket, percentage);
    },
    allSellOferingsNfTicketType(ticket) {
      return getAllSellOferingsNfTicketType(ticket);
    },
    getTicketType(ticket) {
      for (const ticketType of this.event.nonFungibleTickets) {
        if (ticketType.typeId == ticket.ticketTypeId) {
          return ticketType;
        }
      }
    },
    clearSelection() {
      this.selection = {
        active: false,
        ticketId: 0,
        price: 0,
        ticketTypeId: 0,
        isNf: false,
        amount: 1
      };
    },
    findTicketIndex(col, row) {
      let found_ticket = false;
      this.event.fungibleTickets.forEach(function(ticketType) {
        ticketType.seatMapping.forEach(function(mapping) {
          if (
            Number(mapping.split("/")[0]) == col &&
            Number(mapping.split("/")[1]) == row
          ) {
            found_ticket = ticketType;
          }
        });
      });
      this.event.nonFungibleTickets.forEach(function(ticketType) {
        ticketType.tickets.forEach(function(ticket) {
          if (
            Number(ticket.seatMapping.split("/")[0]) == col &&
            Number(ticket.seatMapping.split("/")[1]) == row
          ) {
            found_ticket = ticket;
          }
        });
      });
      return found_ticket;
    },
    selectTicket: async function(col, row) {
      //const seat = this.$refs[`seat_${col}_${row}`];
      const ticket = this.findTicketIndex(col, row);
      this.selection.ticket = ticket;
      if (ticket.isNf) {
        this.selection.ticketId = ticket.ticketId;
        this.selection.ticketTypeId = ticket.ticketTypeId;
        this.selection.isNf = true;
        this.selection.eventContractAddress = ticket.eventContractAddress;
      } else {
        this.selection.ticketTypeId = ticket.typeId;
        this.selection.ticketId = 0;
        this.selection.isNf = false;
        this.selection.eventContractAddress = ticket.eventContractAddress;
      }
      this.selection.active = true;
      //await this.buyTicket(selected_ticket.typeIndex, selected_ticket.index, selected_ticket.price, selected_ticket.isNF)
    },
    toggleTab: function(tab) {
      this.tabs.forEach(t => {
        this.$refs[t].classList.remove("active");
        this.$refs[`content-${t}`].classList.remove("active");
      });
      this.$refs[tab].classList.add("active");
      this.$refs[`content-${tab}`].classList.add("active");
      if (
        tab === "tickets-plan" ||
        tab === "checkout" ||
        tab == "aftermarket"
      ) {
        this.navbarHeight =
          this.$refs["navigation"].getBoundingClientRect().height +
          this.$refs["headerTitle"].getBoundingClientRect().height;
        this.$refs["teaser"].style.minHeight = `${this.navbarHeight}px`;
        this.$refs["headerTitle"].style.transform = `translateX(-120%)`;
        //this.$refs['teaser'].style.alignItems = `start`;
        //this.$refs['parallax'].classList.add('hidden');
        this.$refs["navigation"].classList.add("top");
      } else {
        this.$refs["teaser"].style.justifyContent = `start`;
        this.$refs["headerTitle"].style.transform = `translateX(0)`;

        this.$refs["teaser"].style.minHeight = "300px";
        //this.$refs['parallax'].classList.remove('hidden');
        this.$refs["navigation"].classList.remove("top");
      }
    },
    fetchEventInfo: function() {
      this.event = this.$store.state.events.filter(
        event => event.contractAddress == this.contractAddress
      )[0];
      if (!this.event) {
        this.event = {};
      }
      //this.markSeats();
    },
    fetchTicketInfo: function() {
      this.setGridSizes();
      setTimeout(() => {
        this.markSeats();
      }, 1000);
    },
    setGridSizes: function() {
      let max_row = 0;
      let max_col = 0;
      if (!this.event.fungibleTickets) {
        return;
      }
      this.event.fungibleTickets.forEach(ticket => {
        ticket.seatMapping.forEach(mapping => {
          max_col =
            Number(mapping.split("/")[0]) > max_col
              ? Number(mapping.split("/")[0])
              : max_col;
          max_row =
            Number(mapping.split("/")[1]) > max_row
              ? Number(mapping.split("/")[1])
              : max_row;
        });
      });
      this.event.nonFungibleTickets.forEach(nfticketType => {
        nfticketType.tickets.forEach(ticket => {
          max_row =
            max_row > ticket.seatMapping.split("/")[1]
              ? max_row
              : Number(ticket.seatMapping.split("/")[1]);
          max_col =
            max_col > ticket.seatMapping.split("/")[0]
              ? max_col
              : Number(ticket.seatMapping.split("/")[0]);
        });
      });
      this.rows = max_row;
      this.cols = max_col;
      this.$refs[
        "cont"
      ].style.gridTemplateColumns = `repeat(${this.cols},minmax(25px,1fr))`;
      this.$refs["cont"].style.gridTemplateRows = `repeat(${this.rows}, 20px)`;
    },
    markSeats: function() {
      if (!this.event.contractAddress) {
        return;
      }
      this.event.fungibleTickets.forEach(ticket => {
        ticket.seatMapping.forEach(mapping => {
          let x = Number(mapping.split("/")[0]);
          let y = Number(mapping.split("/")[1]);
          // check if this fungible category still has seats available
          const seat = this.$refs[`seat_${x}_${y}`];
          seat[0].classList.add("fungible");
          if (numberFreeSeats(ticket) > ticket.supply / 2) {
            seat[0].dataset.status = "good";
          } else if (numberFreeSeats(ticket) > ticket.supply / 4) {
            seat[0].dataset.status = "neutral";
          } else {
            seat[0].dataset.status = "bad";
          }
        });
      });
      this.event.nonFungibleTickets.forEach(function(ticketType) {
        ticketType.tickets.forEach(function(ticket) {
          let x = Number(ticket.seatMapping.split("/")[0]);
          let y = Number(ticket.seatMapping.split("/")[1]);

          const seat = this.$refs[`seat_${x}_${y}`];
          if (isFree(ticket)) {
            seat[0].dataset.status = "free";
          } else {
            if (hasSellOrder(ticket)) {
              seat[0].dataset.status = "forsale";
            } else {
              seat[0].dataset.status = "occupied";
            }
          }
        }, this);
      }, this);
    },
    showToolTip: function(col, row) {
      const ticket = this.findTicketIndex(col, row);
      let t = {};
      //let totalSupply;
      if (!ticket) {
        return;
      }
      if (ticket.isNf) {
        const ticketType = this.getTicketType(ticket);
        t.title = ticketType.title;
        t.ticketType = ticketType.typeId;
        t.eventContractAddress = ticketType.eventContractAddress;
        t.price = ticketType.price;
        //totalSupply = ticketType.supply;
        t.supply = numberFreeSeats(ticketType);
        t.desc = ticketType.description;
        t.seat = ticket.ticketId;
        t.lowestSellOrder = getLowestSellOrder(ticket).percentage;
        t.lowestSellOrderAmount = getLowestSellOrder(ticket).quantity;
        t.highestBuyOrder = getHighestBuyOrder(ticketType).percentage;
        t.highestBuyOrderAmount = getHighestBuyOrder(ticketType).quantity;
        t.seat_status = isFree(ticket)
          ? "free"
          : hasSellOrder(ticket)
          ? "for sale"
          : "occupied";
        t.isNf = true;
      } else {
        t.title = ticket.title;
        t.price = ticket.price;
        t.ticketType = ticket.typeId;
        t.eventContractAddress = ticket.eventContractAddress;
        //totalSupply = ticket.supply;
        t.supply = numberFreeSeats(ticket);
        t.desc = ticket.description;
        t.isNf = false;
        t.lowestSellOrder = getLowestSellOrder(ticket).percentage;
        t.lowestSellOrderAmount = getLowestSellOrder(ticket).quantity;
        t.highestBuyOrder = getHighestBuyOrder(ticket).percentage;
        t.highestBuyOrderAmount = getHighestBuyOrder(ticket).quantity;
        t.isNf = false;
      }

      this.toolTipActive = true;
      /*
      if (t.supply > totalSupply / 2) {
        this.$refs["supply"].dataset.status = "good";
      } else if (t.supply > totalSupply / 4) {
        this.$refs["supply"].dataset.status = "neutral";
      } else {
        this.$refs["supply"].dataset.status = "bad";
      }*/
      this.tooltip = t;
    },
    hideToolTip: function() {
      setTimeout(() => {
        this.toolTipActive = false;
      }, 1000);
    }
  },
  created() {
    this.contractAddress = this.$route.params.id;
    this.$root.$on("loadedEvents", () => {
      this.fetchEventInfo();
      this.fetchTicketInfo();
    });
  },
  mounted() {
    this.$root.$emit("hideSearchBar");
    this.fetchEventInfo();
    this.fetchTicketInfo();
  }
};
</script>

<style scoped>
.event {
  height: 100vh;
  overflow-y: hidden;
  position: relative;
}
.ticket-category {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}
.ticket-info .ticket-title {
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 5px;
}
.ticket-available {
  color: var(--accent);
}
.ticket-info .ticket-price {
  opacity: 0.8;
}
.ticket-info span {
  display: block;
}
.return-arrow {
  position: absolute;
  top: 20px;
  left: 20px;
}
.return-arrow a {
  border-bottom: none;
}
.return-arrow .md-icon {
  color: white;
}
.event-info-wrapper {
  display: none;
}
.event-info-wrapper.active {
  display: block;
}
.header-img {
  min-height: 300px;
  position: relative;
  display: flex;
  align-items: center;
  transition: min-height 0.5s ease-in-out;
  padding: 1rem;
  overflow-y: hidden;
}
.header-img .img-fluid {
  position: absolute;
  top: 0;
  left: 0;
  min-height: 100%;
  width: 100%;
}
.header-img .event-header {
  z-index: 999;
  transition: transform 0.3s linear;
}
.event-header span {
  color: white;
  display: block;
}
.event-header .event-cat {
  opacity: 0.8;
}
.event-header .event-title {
  font-size: 1.3rem;
  margin-bottom: 10px;
}
.header-img .nav-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.8);
  width: 100%;
  display: flex;
  justify-content: flex-start;
  padding-left: 20px;
}

.nav-entry {
  padding: 15px 15px;
  color: white;
  cursor: pointer;
}
.nav-entry.active {
  border-bottom: 2px solid white;
}
.event-title {
  display: inline-block;
}
.description {
  margin-bottom: 2rem;
}
.info-title {
  display: inline-block;
  color: var(--accent);
  min-width: 30px;
}
.info-title.md-icon {
  color: var(--accent);
}
.info-value {
  display: inline-block;
  color: var(--fg);
  min-width: 100px;
}
.event-info {
  padding: 10px;
}
.parallax {
  /* The image used */

  /* Set a specific height */

  /* Create the parallax scrolling effect */
  background-attachment: fixed;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  filter: blur(4px);
  position: relative;
}
.parallax.hidden {
  display: none;
}

.seating-container {
  position: absolute;
  bottom: 70px;
  left: 0;
  padding: 5px;
  margin-top: 2rem;
  width: max-content;
  background-color: #d8dee9;
  display: grid;
  /*grid-gap: 2px;*/
  width: 100%;
  overflow-x: scroll;
}
.seat {
  /*margin-bottom: 2px;*/
  background-color: #d8dee9;
  height: 100%;
  border: 2px solid #d8dee9;
  transition: transform 0.8s linear, background-color 0.3s linear;
}
.seat.fungible {
  border: none;
  /*transform: scale(1.1);*/
}
.seat.fungible[data-status="good"] {
  background-color: #a3be8c;
  cursor: pointer;
}
.seat.fungible[data-status="neutral"] {
  background-color: #ebcb8b;
  cursor: pointer;
}
.seat.fungible[data-status="bad"] {
  background-color: #bf616a;
}
.seat.selected {
  border: 1px solid black;
}
.seat[data-status="free"] {
  background-color: #a3be8c;
  cursor: pointer;
}
.seat[data-status="occupied"] {
  background-color: #bf616a;
}
.seat[data-status="forsale"] {
  background-color: #ebcb8b;
}
.seat.bought {
  background-color: #bf616a !important;
}
.tooltip {
  padding: 4px;
  margin-top: 2rem;
  min-height: 100px;
}
.tooltip span {
  display: block;
}
.tooltip .ticket-title {
  display: flex;
  justify-content: space-between;
}
.tooltip .ticket-title h2 {
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 0;
  margin-bottom: 0.2rem;
  font-size: 1.3rem;
}
.tooltip .ticket-title span {
  font-size: 1.2rem;
}
.ticket-supply.active {
  display: block;
}
.ticket-supply {
  display: none;
  font-weight: lighter;
  margin-bottom: 1rem;
}
.ticket-supply[data-status="good"] {
  color: #a3be8c;
}
.ticket-supply[data-status="neutral"] {
  color: #ebcb8b;
}
.ticket-supply[data-status="bad"] {
  color: #bf616a;
}
.ticket-status[data-status="free"] {
  color: #a3be8c;
}
.ticket-status[data-status="sold"] {
  color: #bf616a;
}

.buy-selection,
.selection-step {
  display: none;
}
.buy-selection.active,
.selection-step.active {
  display: block;
}
.buy-selection .icon-wrap {
  cursor: pointer;
}

.shopping-cart {
  padding-right: 1rem;
  color: white;
}
i.shopping-cart {
  color: white !important;
}
.queue-wrapper {
  display: flex;
  margin-bottom: 3rem;
}
.queue-label {
  width: 10%;
  margin-right: 2rem;
}
.queue-wrapper .queue {
  width: 80%;
  position: relative;
  height: 20px;
  overflow-x: visible;
}
.step {
  height: 20px;
  width: 100%;
  background-color: var(--green);
}
.step-wrapper {
  position: absolute;
  bottom: 0%;
  background-color: white;
  height: 20px;
  width: 20px;
  display: flex;
  align-items: flex-end;
}
.step[data-orders="0"] {
  background-color: var(--red);
  height: 5px;
}
.step[data-orders="1"],
.step[data-orders="2"],
.step[data-orders="3"] {
  background-color: var(--orange);
  height: 10px;
}
.step[data-orders="4"],
.step[data-orders="5"] {
  background-color: var(--yellow);
  height: 15px;
}

.sell-offering {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}
.fill-sell {
  cursor: pointer;
}
</style>
