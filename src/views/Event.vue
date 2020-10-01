<template>
  <div class="event">
    <div class="container-fluid header-img" ref="teaser" 
    :style="{ backgroundColor: `${event.color}` }">
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
          <span class="info-value">{{event_date}}</span>
        </div>
        <div class="info-group">
          <md-icon class="info-title">label</md-icon>
          <span class="info-value tag">{{event.category}}</span>
        </div>
        <div class="info-group">
          <md-icon class="info-title">local_offer</md-icon>
          <span class="info-value">From {{lowest_price}} ETH</span>
        </div>
        <div class="info-group">
          <md-icon class="info-title">link</md-icon>
          <a class="info-value" :href='event.url' target="_blank">Website</a>
        </div>
        <div class="info-group">
          <md-icon class="info-title">delete</md-icon>
          <a class="info-value" :href="event.twitter" target="_blank">Twitter</a>
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
              <span
                v-bind:class="{ active: !tooltip.isNf }"
                class="ticket-supply"
                ref="supply"
              >
                {{ tooltip.supply }} tickets left</span
              >
              <span v-if="tooltip.isNf">
                Seat Number: {{tooltip.seat}}
              </span>
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
            <h3>Ticket Description:</h3>
            <span class="ticket-desc"> {{ tooltip.desc }}</span>
            <h3>Aftermarket:</h3>
            <div class='aftermarket' v-if="tooltip.lowestSellOrder > 0">
                {{tooltip.lowestSellOrderAmount}} Listing for {{tooltip.lowestSellOrder}}%
            </div>
            <div v-else>
              No listings for this ticket
            </div>
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
 
          <SelectionView v-bind:selection="selection" v-bind:open="selection.active"
          v-on:close="clearSelection"></SelectionView>
      </div>
      <div class="event-info-wrapper" ref="content-checkout">
        <ShoppingCart></ShoppingCart>
      </div>
    </div>
  </div>
</template>

<script>
import ShoppingCart from './ShoppingCart';
import SelectionView from './SelectionView';

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
      tooltip: {},
      toolTipActive: false,
      navbarHeight: 0,
      selection: {
        active: false,
        ticket: {},
      },
      //tickets: [{ name: "fungible", price: 50 }],
    };
  },
  components: {
    ShoppingCart,
    SelectionView
  },
  props: {},
  computed: {
    lowest_price() {
      try {return this.event.getLowestPrice();} catch(e) { return 0;}
    },
    event_date() {
      try {return this.event.getTimeAndDate();} catch(e) { return 0;}
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
    },
  },
  watch: {},
  methods: {
    clearSelection() {
      this.selection = {
        active: false,
        ticket: {},
        amount: 1,
      }
    },
    findTicketIndex(col, row) {
      //console.log('searching for : '+col+'/'+row);
      let found_ticket = false;
      this.event.fungibleTickets.forEach(function(ticketType) {
        ticketType.seatMapping.forEach(function(mapping) {
          //console.log(Number(mapping.split('/')[0])+'/'+Number(mapping.split('/')[1]));
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
          //console.log(Number(mapping.split('/')[0])+'/'+Number(mapping.split('/')[1]));
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
      this.selection.active = true;
      //await this.buyTicket(selected_ticket.typeIndex, selected_ticket.index, selected_ticket.price, selected_ticket.isNF)
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
      this.event = this.$store.state.events.filter(
        (event) => event.contractAddress == this.contractAddress
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
      if (!this.event.fungibleTickets) {return;}
      this.event.fungibleTickets.forEach((ticket) => {
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
      this.event.fungibleTickets.forEach((ticket) => {
        ticket.seatMapping.forEach((mapping) => {
          let x = Number(mapping.split("/")[0]);
          let y = Number(mapping.split("/")[1]);
          // check if this fungible category still has seats available
          const seat = this.$refs[`seat_${x}_${y}`];
          seat[0].classList.add("fungible");
          if (ticket.numberFreeSeats() > ticket.supply / 2) {
            seat[0].dataset.status = "good";
          } else if (ticket.numberFreeSeats() > ticket.supply / 4) {
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
            if(ticket.hasSellOrder()) {
              seat[0].dataset.status = 'forsale'
            } else {
              seat[0].dataset.status = "occupied";
            }
            
          }
        }, this);
      }, this);
    },
    showToolTip: function(col, row) {
      const ticket = this.findTicketIndex(col, row);
      if (!ticket) {return;}
      let t= {};
      t.title = ticket.isNf ? ticket.ticketType.title : ticket.title;
      t.price = ticket.isNf ? ticket.ticketType.price : ticket.price;
      const total_supply = ticket.isNf ? ticket.ticketType.supply : ticket.supply;
      t.supply = ticket.isNf ? ticket.ticketType.numberFreeSeats() : ticket.numberFreeSeats();
      t.desc = ticket.isNf ? ticket.ticketType.description : ticket.description;
      if (ticket.isNf) {
        t.seat = ticket.ticketId;
        t.seat_status = ticket.isFree() ? 'free' : ticket.hasSellOrder() ? 'for sale' : 'occupied';
        t.isNf = true;
      } else {
        t.isNf = false;
        t.lowestSellOrder = ticket.getLowestSellOrder().queue;
        t.lowestSellOrderAmount = ticket.getLowestSellOrder().amount;
      }
      this.toolTipActive = true;
      if (t.supply > total_supply / 2) {
        this.$refs["supply"].dataset.status = "good";
      } else if (t.supply > total_supply / 4) {
        this.$refs["supply"].dataset.status = "neutral";
      } else {
        this.$refs["supply"].dataset.status = "bad";
      }
      this.tooltip = t;
    },
    hideToolTip: function() {
      setTimeout(() => {
        this.toolTipActive = false;
      }, 1000);
    },
  },
  created() {
    this.contractAddress = this.$route.params.id;
    this.$root.$on("loadedEvents", () => {
      this.fetchEventInfo();
    });
    this.$root.$on("loadedTickets", () => {
      this.fetchTicketInfo();
    });
  },
  mounted() {
    this.$root.$emit("hideSearchBar");
    this.fetchEventInfo();
    this.fetchTicketInfo();
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
.tooltip .ticket-title h2{
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top:0;
  margin-bottom:0.2rem;
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
</style>
