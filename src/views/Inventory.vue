<template>
  <div class="inventory">
    <!-- <h1>Tickets</h1> -->

    <div class="header">
      <v-touch
        class="tab-headers"
        @swiperight="selectTab(0)"
        @swipeleft="selectTab(1)"
      >
        <div id="header-owned" class="tab-header active" @click="selectTab(0)">
          owned
        </div>
        <div id="header-presales" class="tab-header" @click="selectTab(1)">
          presales
        </div>
        <md-progress-spinner
          v-if="loadingEvents"
          class="loading-icon"
          :md-diameter="20"
          :md-stroke="4"
          md-mode="indeterminate"
        ></md-progress-spinner>
      </v-touch>
    </div>
    <div class="container-fluid">
      <div class="tabs">
        <div class="tab tickets active" id="tab-owned">
          <div class="empty-message" v-if="noTicketsOwned">
            <div class="empty-icon">
              <md-icon>confirmation_number</md-icon>
            </div>
            <p>
              Looks like its empty here! Checkout some of our events to get your
              first ticket!
            </p>
          </div>
          <div
            ref="ticketList"
            class="container ticket-list"
            v-if="$store.state.activeUser"
          >
            <div
              class="ticket"
              v-for="(ticket, index) in fungibleTickets"
              v-bind:key="'fungible_' + index"
            >
              <Ticket
                v-bind:ticketTypeId="ticket.ticketType"
                v-bind:ticketId="ticket.ticketId"
                v-bind:eventContractAddress="ticket.eventContractAddress"
                v-bind:isNf="false"
                v-on:openOverlay="openTicketOverlay(ticket, false)"
                v-on:useTicket="useTicket(ticket, false)"
              />
            </div>
            <div
              class="ticket"
              v-for="(ticket, index) in nonFungibleTickets"
              v-bind:key="'nonfungible_' + index"
            >
              <Ticket
                v-bind:ticketTypeId="ticket.ticketType"
                v-bind:ticketId="ticket.ticketId"
                v-bind:eventContractAddress="ticket.eventContractAddress"
                v-bind:isNf="true"
                v-on:openOverlay="openTicketOverlay(ticket, true)"
                v-on:useTicket="useTicket(ticket, true)"
              />
            </div>
          </div>
        </div>
        <div class="tab presales" id="tab-presales">
          <div class="empty-message" v-if="noPresalesJoined">
            <div class="empty-icon">
              <md-icon>confirmation_number</md-icon>
            </div>
            <p>
              Looks like its empty here! Checkout some of our events to join an
              active presale!
            </p>
          </div>
          <div class="container presales">
            <div
              class="presale"
              v-for="(presale, index) in joinedPresales"
              v-bind:key="'presale_' + index"
            >
              <md-card>
                <md-card-content>
                  <div class="md-title">{{ getEventTitle(presale.event) }}</div>
                  <div class="md-subhead">
                    {{ getTicketTitle(presale.event, presale.ticketType) }}
                  </div>
                  <div v-if="getPresaleOver(presale.event, presale.ticketType)">
                    <md-button
                      @click="
                        makePresaleClaim(presale.event, presale.ticketType)
                      "
                    >
                      Claim</md-button
                    >
                  </div>
                  <div v-else>
                    This Presale is still running, wait until it is over to see
                    if you won the lottery
                  </div>
                </md-card-content>
              </md-card>
            </div>
          </div>
        </div>
      </div>
      <TicketOverlay
        v-bind:eventContractAddress="activeTicketEvent"
        v-bind:ticketId="activeTicket"
        v-bind:ticketTypeId="activeTicketType"
        v-bind:isNf="activeIsNf"
        v-bind:open="ticketOverlay.open"
        v-on:close="ticketOverlay.open = false"
      />
      <TicketScanner
        v-bind:eventContractAddress="activeTicketEvent"
        v-bind:ticketId="activeTicket"
        v-bind:ticketTypeId="activeTicketType"
        v-bind:isNf="activeIsNf"
        v-bind:open="ticketScanner.open"
        v-on:close="ticketScanner.open = false"
      />
    </div>
  </div>
</template>

<script>
import TicketOverlay from "./../components/TicketOverlay";
import TicketScanner from "./../components/TicketScanner";
import Ticket from "./../components/Ticket";
import { presaleOver, claimPresale } from "./../util/tickets";
import { isNf, getTicketTypeIndex } from "idetix-utils";

const BigNumber = require("bignumber.js");

export default {
  name: "Inventory",
  data() {
    return {
      loadingEvents: false,
      activeSlide: 0,
      activeTicket: 0,
      activeTicketType: 0,
      activeIsNf: false,
      activeTicketEvent: "",
      aftermarketPercentage: 100,
      aftermarketAmount: 0,
      sellOpen: false,
      ticketOverlay: { open: false, ticket: undefined },
      ticketScanner: { open: false, ticket: undefined },
    };
  },
  components: {
    Ticket,
    TicketOverlay,
    TicketScanner,
  },
  computed: {
    fungibleTickets() {
      return this.$store.state.activeUser.fungibleTickets;
    },
    nonFungibleTickets() {
      return this.$store.state.activeUser.nonFungibleTickets;
    },
    joinedPresales() {
      let presales = [];
      if (!this.$store.state.activeUser) {
        return presales;
      }
      for (const [eventAddress, presale] of Object.entries(
        this.$store.state.activeUser.presales.joined
      )) {
        for (const [ticketType, status] of Object.entries(presale)) {
          presales.push({
            event: eventAddress,
            ticketType: ticketType,
            joined: status,
          });
        }
      }
      return presales;
    },
    noPresalesJoined() {
      return (
        !this.$store.activeUser || !this.$store.activeUser.hasActivePresale()
      );
    },
    noTicketsOwned() {
      return (
        !this.$store.state.activeUser ||
        (this.$store.state.activeUser.fungibleTickets.length == 0 &&
          this.$store.state.activeUser.nonFungibleTickets.length == 0)
      );
    },
    amountOwned() {
      if (this.activeTicketType) {
        if (this.activeIsNf) {
          return 1;
        } else {
          return this.$store.state.activeUser.getNumberFungibleOwned(
            this.activeTicketEvent,
            this.activeTicketType
          );
        }
      } else {
        return 0;
      }
    },
  },
  methods: {
    selectTab(i) {
      if (i === 0) {
        document.getElementById("tab-owned").classList.add("active");
        document.getElementById("header-owned").classList.add("active");
        document.getElementById("tab-presales").classList.remove("active");
        document.getElementById("header-presales").classList.remove("active");
      } else {
        document.getElementById("tab-owned").classList.remove("active");
        document.getElementById("header-owned").classList.remove("active");
        document.getElementById("tab-presales").classList.add("active");
        document.getElementById("header-presales").classList.add("active");
      }
    },
    getEvent(eventAddress) {
      const event = this.$store.state.events.find(
        (e) => e.contractAddress === eventAddress
      );
      return event ? event : {};
    },
    getTicket(event, ticketId) {
      const ticketNr = Number(
        getTicketTypeIndex(new BigNumber(ticketId)).toFixed()
      );
      const nf = isNf(new BigNumber(ticketId).toFixed());
      const ticket = event.getTicketType(ticketNr, nf);
      return ticket;
    },
    async makePresaleClaim(eventAddress, ticketId) {
      const event = this.getEvent(eventAddress);
      const ticket = this.getTicket(event, ticketId);
      const result = await claimPresale(
        ticket,
        this.$store.state.activeUser.account,
        this.$store.state.web3.web3Instance,
        eventAddress
      );
      this.$root.$emit("openMessageBus", result);
    },
    getTicketTitle(eventAddress, ticketId) {
      const event = this.getEvent(eventAddress);
      const ticket = this.getTicket(event, ticketId);
      return ticket.title;
    },
    getEventTitle(eventAddress) {
      const event = this.getEvent(eventAddress);
      return event ? event.title : "";
    },
    getPresaleOver(eventAddress, ticketId) {
      const event = this.getEvent(eventAddress);
      const ticket = this.getTicket(event, ticketId);
      return presaleOver(ticket, this.$store.state.web3.currentBlock);
    },
    openTicketOverlay(ticket, isNf) {
      this.setActiveTicket(ticket, isNf);
      this.ticketOverlay.open = true;
      this.ticketOverlay.ticket = ticket;
    },
    useTicket(ticket, isNf) {
      this.setActiveTicket(ticket, isNf);
      this.ticketScanner.open = true;
      this.ticketScanner.ticket = ticket;
    },
    getTicketType(ticket) {
      for (const ticketType of this.event.nonFungibleTickets) {
        if (ticketType.typeId == ticket.ticketTypeId) {
          return ticketType;
        }
      }
    },
    getEventForTicket: function(ticket) {
      return this.$store.state.events.filter(
        (event) => event.contractAddress === ticket.eventContractAddress
      )[0];
    },
    setActiveTicket: function(ticket, isNf) {
      if (isNf) {
        this.activeTicket = ticket.ticketId;
        this.activeIsNf = true;
      } else {
        this.activeIsNf = false;
      }

      this.activeTicketEvent = ticket.eventContractAddress;
      this.activeTicketType = ticket.ticketType;
    },
  },
  beforeCreate: async function() {
    this.$root.$on("eventFactoryCreated", async () => {
      this.loadingEvents = true;
    });
    this.$root.$on("loadedEvents", async () => {
      this.loadingEvents = false;
    });
  },
  mounted: function() {
    this.$root.$emit("hideSearchBar");

    // this.$refs['ticketList'].style.height =
  },
};
</script>

<style scoped>
.container-fluid {
  height: 545px;
  position: relative;
  overflow-y: hidden;
  overflow-x: hidden;
}
.header {
  position: sticky;
  top: 0;
  padding: 5px;
}
.tab-headers {
  position: relative;
  border-radius: 12px;
  color: black;
  display: flex;
  justify-content: space-around;
  background: white;
  box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2),
    0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12);
}
.loading-icon {
  position: absolute;
  top: 5px;
  right: 5px;
}
.tab-header {
  transition: 0.3s ease-in-out;
  border-bottom: 2px solid white;
  padding: 1rem;
}
.tab-header.active {
  border-bottom: 2px solid #1dba9d;
}
.tabs {
  position: relative;
  overflow-x: hidden;
  width: var(--vw);
  overflow-y: scroll;
  height: 545px;
}

.tab {
  padding-top: 1rem;
  position: absolute;
  top: 0;
  transition: 0.3s ease-in-out;
  transform: translateX(0);
  width: var(--vw);
}
.tab.tickets {
  transform: translateX(var(--negative-vw));
}
.tab.presales {
  transform: translateX(var(--vw));
}
.tab.tickets.active {
  transform: translateX(0);
}
.tab.presales.active {
  transform: translateX(0);
}

.ticket {
  margin-bottom: 1rem;
}
.ticket-list {
}
h1 {
  margin-left: 1rem;
  margin-top: 2rem;
}

.tabs .underline {
  position: absolute;
  width: 50%;
  height: 2px;
  background: var(--orange);
  left: 0;
  bottom: 0;
  transition: transform 0.3s ease-in-out;
}
.tabs .underline.moved {
  transform: translateX(100%);
}
.empty-message {
  padding: 2rem;
  opacity: 0.7;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  display: flex;
}
.empty-message .empty-icon {
  padding: 2rem;
  border: 2px solid;
  border-radius: 50%;
}
.empty-message p {
  text-align: center;
}

.img {
  display: flex;
  justify-content: center;
  align-items: center;
}
.img .nrTickets {
  color: white;
  font-size: 2rem;
}
.inventory {
}

.amount-selection {
  display: inline-block;
}
.amount-selection p {
  display: inline-block;
  margin-left: 1rem;
  margin-right: 1rem;
}
.amount-selection .icon-wrap {
  display: inline-block;
}
.ticket-sell h3 {
  margin: 0;
}
.sell-config {
  display: none;
}
.sell-config.active {
  display: block;
}
</style>
