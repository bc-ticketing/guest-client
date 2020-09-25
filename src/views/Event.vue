<template>
  <div class="event">
    <div class="container-fluid header-img" ref="teaser">
      <!-- <div class="parallax" ref="parallax">  -->
      <img
        ref="teaserImg"
        :src="event.img_url"
        alt=""
        class="img-fluid"
      />
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
          class="nav-entry checkout"
          ref="checkout"
          @click="toggleTab('checkout')"
        >
          Checkout
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
          <span class="info-value">{{
            event.location
          }}</span>
        </div>
        <div class="info-group">
          <md-icon class="info-title">home</md-icon>
          <span class="info-value">Hallenstadion</span>
        </div>
        <div class="info-group">
          <md-icon class="info-title">verified_user</md-icon>
          <span class="info-value">approvers </span>
        </div>
        <div class="info-group">
          <md-icon class="info-title">local_offer</md-icon>
          <span class="info-value">lowestPrice</span>
        </div>
      </div>

      <div class="event-info-wrapper" ref="content-tickets-plan">
        <div class="seat-info">
          <div class="tooltip" ref="tooltip">
            <span class="ticket-title">{{ tooltip_title }}</span>
            <div style="display: flex; justify-content: space-between;">
              <span
                v-bind:class="{ active: !tooltip_isNF }"
                class="ticket-supply"
                ref="supply"
              >
                {{ tooltip_supply }} tickets left</span
              >
              <span
                v-if="tooltip_isNF"
                :data-status="tooltip_seat_status"
                class="ticket-status"
                >{{ tooltip_seat_status }}</span
              >
              <span v-if="tooltip_isNF" class="ticket-nr"
                >Seat {{ tooltip_seat }}</span
              >
            </div>
            <span class="ticket-desc"> {{ tooltip_desc }}</span>
          </div>
        </div>

        <div class="seating-container" :ref="'cont'" draggable="false">
          <div class="col" v-for="col in cols" v-bind:key="'col_' + col">
            <div
              :ref="'seat_' + col + '_' + row"
              @click="selectTicket(col, row)"
              @mouseenter="showToolTip(col, row)"
              @mouseleave="hideToolTip(col, row)"
              data-status=""
              class="seat"
              v-for="row in rows"
              v-bind:key="'seat_' + row"
            ></div>
          </div>
        </div>
      </div>
      <div class="event-info-wrapper" ref="content-checkout">
        <checkout
          v-bind:fungibleTickets="selected_f_tickets"
          v-bind:nonfungibleTickets="selected_nf_tickets"
        ></checkout>
      </div>
    </div>
  </div>
</template>

<script>
import { EVENT_MINTABLE_AFTERMARKET_ABI } from "./../util/abi/eventMintableAftermarket";
import { fungibleBaseId, nonFungibleBaseId } from "idetix-utils";
import checkout from "./checkout";

export default {
  name: "Event",
  data() {
    return {
      event: {},
      aftermarket_price: 0,
      showDialog: false,
      contractAddress: Number,
      tabs: ["about", "tickets-plan", "checkout"],
      rows: 0,
      cols: 0,
      tooltip_title: "",
      tooltip_supply: "",
      tooltip_desc: "",
      tooltip_seat: 0,
      tooltip_seat_status: "",
      tooltip_isNF: false,
      toolTipActive: false,
      navbarHeight: 0,
      selected_f_tickets: [],
      selected_nf_tickets: [],
      //tickets: [{ name: "fungible", price: 50 }],
    };
  },
  components: {
    checkout,
  },
  props: {},
  computed: {
    tickets() {
      if (this.$store.state.events[this.event_id]) {
        return this.$store.state.events[this.event_id].tickets;
      } else {
        return [];
      }
    },
  },
  watch: {},
  methods: {
    findTicketIndex(col, row) {
      //console.log('searching for : '+col+'/'+row);
      let found_ticket = false;
      this.event.fungibleTickets.forEach(function(ticketType, typeIndex) {
        ticketType.metadata.mapping.forEach(function(mapping, index) {
          //console.log(Number(mapping.split('/')[0])+'/'+Number(mapping.split('/')[1]));
          if (
            Number(mapping.split("/")[0]) == col &&
            Number(mapping.split("/")[1]) == row
          ) {
            found_ticket = {
              typeIndex: typeIndex,
              metadata: ticketType.metadata,
              index: index,
              selectedPrice: 0,
              aftermarketAmount: 0,
              isNF: false,
              price: ticketType.price,
              available: ticketType.supply - ticketType.ticketsSold,
              granularity: ticketType.granularity,
              amount: 1,
            };
          }
        });
      });
      this.event.nonFungibleTickets.forEach(function(
        ticketType,
        typeIndex
      ) {
        ticketType.metadata.mapping.forEach(function(mapping, index) {
          //console.log(Number(mapping.split('/')[0])+'/'+Number(mapping.split('/')[1]));
          if (
            Number(mapping.split("/")[0]) == col &&
            Number(mapping.split("/")[1]) == row
          ) {
            found_ticket = {
              typeIndex: typeIndex,
              metadata: ticketType.metadata,
              selectedPrice: 0,
              index: index,
              title: ticketType.metadata.title,
              isNF: true,
              price: ticketType.price,
              isFree: false,
              granularity: ticketType.granularity,
            };
          }
        });
      });
      return found_ticket;
    },
    selectTicket: async function(col, row) {
      this.selectionAmount();
      const seat = this.$refs[`seat_${col}_${row}`];
      const selected_ticket = this.findTicketIndex(col, row);
      console.log(selected_ticket);
      //seat[0].classList.add('bought');
      if (!selected_ticket.isNF) {
        console.log("fungible");
        this.selected_f_tickets.push(selected_ticket);
      } else {
        console.log("non fungible");
        seat[0].classList.add("selected");
        this.selected_nf_tickets.push(selected_ticket);
      }
      return;

      //await this.buyTicket(selected_ticket.typeIndex, selected_ticket.index, selected_ticket.price, selected_ticket.isNF)
    },
    buyTicket: async function(typeIndex, ticketIndex, price, isNF) {
      console.log(
        `buying ticket type ${typeIndex} for event ${this.event_id} - NF: ${isNF}`
      );
      const eventSC = new this.$store.state.web3.web3Instance.eth.Contract(
        EVENT_MINTABLE_AFTERMARKET_ABI,
        this.event_id
      );
      let type;
      if (!isNF) {
        type = fungibleBaseId.plus(typeIndex);
        var amount = "1";
        console.log(
          "buying from account: " +
            this.$store.state.web3.account +
            "for " +
            price
        );
        const buy = await eventSC.methods.mintFungible(type, amount).send({
          from: this.$store.state.web3.account,
          value: price * this.$store.state.web3.web3Instance.utils.toWei(price),
        });
        console.log(buy);
      } else {
        type = nonFungibleBaseId.plus(typeIndex).plus(ticketIndex);
        const buy = await eventSC.methods.mintNonFungibles([type]).send({
          from: this.$store.state.web3.account,
          value: price * this.$store.state.web3.web3Instance.utils.toWei(price),
        });
        console.log(buy);
      }
    },
    toggleTab: function(tab) {
      this.tabs.forEach((t) => {
        this.$refs[t].classList.remove("active");
        this.$refs[`content-${t}`].classList.remove("active");
      });
      this.$refs[tab].classList.add("active");
      this.$refs[`content-${tab}`].classList.add("active");
      if (tab === "tickets-plan" || tab === "checkout") {
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
      this.event = this.$store.state.events.filter(event => event.contractAddress == this.contractAddress)[0];
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
      console.log(this.event.fungibleTickets.length)
      this.event.fungibleTickets.forEach((ticket) => {
        console.log('ticket');
        ticket.seatMapping.forEach((mapping) => {
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
      this.event.nonFungibleTickets.forEach((nfticketType) => {
        nfticketType.tickets.forEach((ticket) => {
          max_row = max_row > ticket.seatMapping.split('/')[1] ? max_row : ticket.seatMapping.split('/')[1];
          max_row = max_col > ticket.seatMapping.split('/')[0] ? max_col : ticket.seatMapping.split('/')[0];
        })
      })
      this.rows = max_row;
      this.cols = max_col;
      console.log(this.rows);
      console.log(this.cols);
      this.$refs[
        "cont"
      ].style.gridTemplateColumns = `repeat(${this.cols},minmax(25px,1fr))`;
      this.$refs["cont"].style.gridTemplateRows = `repeat(${this.rows}, 20px)`;
    },
    markSeats: function() {
      this.event.fungibleTickets.forEach((ticket) => {
        ticket.seatMapping.forEach((mapping) => {
          let x = Number(mapping.split("/")[0]);
          let y = Number(mapping.split("/")[1]);
          // check if this fungible category still has seats available
          let nrFreeSeats = ticket.supply - ticket.ticketsSold;
          const seat = this.$refs[`seat_${x}_${y}`];
          console.log(seat);
          seat[0].classList.add("fungible");
          if (nrFreeSeats > ticket.supply / 2) {
            seat[0].dataset.status = "good";
          } else if (nrFreeSeats > ticket.supply / 4) {
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
          if (ticket.isFree()) {
            seat[0].dataset.status = "free";
          } else {
            seat[0].dataset.status = "occupied";
          }
        }, this);
      }, this);
    },
    getTicketInfoForCoords: function(col, row) {
      let found_ticket = false;
      this.event.fungibleTickets.forEach((ticketType) => {
        ticketType.seatMapping.forEach((mapping) => {
          //console.log(Number(mapping.split('/')[0])+'/'+Number(mapping.split('/')[1]));
          if (
            Number(mapping.split("/")[0]) == col &&
            Number(mapping.split("/")[1]) == row
          ) {
            found_ticket = ticketType;
          }
        });
      });
      if (found_ticket) {
        return found_ticket;
      }
      this.event.nonFungibleTickets.forEach((ticketType) => {
        ticketType.metadata.mapping.forEach(function(mapping, index) {
          //console.log(Number(mapping.split('/')[0])+'/'+Number(mapping.split('/')[1]));
          if (
            Number(mapping.split("/")[0]) == col &&
            Number(mapping.split("/")[1]) == row
          ) {
            found_ticket = ticketType;
            found_ticket.index = index;
            found_ticket.isNF = true;
          }
        });
      });
      return found_ticket;
    },
    showToolTip: function(col, row) {
      let ticket = this.getTicketInfoForCoords(col, row);
      this.tooltip_title = ticket.metadata.title;
      this.tooltip_supply = ticket.supply - ticket.ticketsSold;
      this.tooltip_desc = ticket.metadata.description;
      if (ticket.isNF) {
        this.tooltip_seat = ticket.index;
        this.tooltip_seat_status =
          ticket.metadata.soldIndexes.indexOf(ticket.index + 1) == -1
            ? "free"
            : "sold";
        this.tooltip_isNF = true;
      } else {
        this.tooltip_isNF = false;
      }

      this.toolTipActive = true;
      if (this.tooltip_supply > ticket.supply / 2) {
        this.$refs["supply"].dataset.status = "good";
      } else if (this.tooltip_supply > ticket.supply / 4) {
        this.$refs["supply"].dataset.status = "neutral";
      } else {
        this.$refs["supply"].dataset.status = "bad";
      }
    },
    hideToolTip: function() {
      setTimeout(() => {
        this.toolTipActive = false;
      }, 1000);
    },
  },
  created() {
    this.contractAddress = this.$route.params.id;
    this.$root.$on('loadedEvents', () => {
      this.fetchEventInfo();
    })
    this.$root.$on('loadedTickets', () => {
      this.fetchTicketInfo();
    })
  },
  mounted() {
    this.$root.$emit("hideSearchBar");
    console.log(this.navbarHeight);
  },
};
</script>

<style scoped>
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
  padding: 15px 25px;
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
  padding: 5px;
  margin-top: 2rem;
  width: max-content;
  background-color: #d8dee9;
  display: grid;
  /*grid-gap: 2px;*/
  position: relative;
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
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 0.5rem;
  font-size: 1.3rem;
}
.ticket-supply.active {
  display: block;
}
.ticket-supply {
  display: none;
  font-weight: lighter;
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
</style>
