<template>
  <div class="container-fluid inventory">
    <h1>Tickets</h1>
    <md-tabs>
      <md-tab id="tab-owned" md-label="Owned">
        <div class="empty-message" v-if="noTicketsOwned">
          <div class="empty-icon">
            <md-icon>confirmation_number</md-icon>
          </div>
          <p>
            Looks like its empty here! Checkout some of our events to get your
            first ticket!
          </p>
        </div>
        <div class="container ticket-list" v-if="$store.state.activeUser">
          <div
            class="ticket"
            v-for="(ticket, index) in $store.state.activeUser.fungibleTickets"
            v-bind:key="'fungible_' + index"
          >
            <Ticket
              v-bind:ticketTypeId="ticket.ticketType"
              v-bind:ticketId="ticket.ticketId"
              v-bind:eventContractAddress="ticket.eventContractAddress"
              v-bind:isNf="false"
              v-on:openOverlay="openTicketOverlay(ticket, false)"
            />
          </div>
          <div
            class="ticket"
            v-for="(ticket, index) in $store.state.activeUser
              .nonFungibleTickets"
            v-bind:key="'nonfungible_' + index"
          >
            <Ticket
              v-bind:ticketTypeId="ticket.ticketType"
              v-bind:ticketId="ticket.ticketId"
              v-bind:eventContractAddress="ticket.eventContractAddress"
              v-bind:isNf="true"
              v-on:openOverlay="openTicketOverlay(ticket, true)"
            />
          </div>
        </div>
      </md-tab>
      <md-tab id="tab-presales" md-label="Presales">
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
                    @click="makePresaleClaim(presale.event, presale.ticketType)"
                  >
                    Claim</md-button
                  >
                </div>
                <div v-else>
                  This Presale is still running, wait until it is over to see if
                  you won the lottery
                </div>
              </md-card-content>
            </md-card>
          </div>
        </div>
      </md-tab>
    </md-tabs>
    <TicketOverlay
      v-bind:eventContractAddress="activeTicketEvent"
      v-bind:ticketId="activeTicket"
      v-bind:ticketTypeId="activeTicketType"
      v-bind:isNf="activeIsNf"
      v-bind:open="ticketOverlay.open"
      v-on:close="ticketOverlay.open = false"
    />
  </div>
</template>

<script>
import TicketOverlay from "./../components/TicketOverlay";
import Ticket from "./../components/Ticket";
import { presaleOver, claimPresale } from "./../util/tickets";
import { isNf, getTicketTypeIndex } from "idetix-utils";

const BigNumber = require("bignumber.js");

export default {
  name: "Inventory",
  data() {
    return {
      activeSlide: 0,
      activeTicket: 0,
      activeTicketType: 0,
      activeIsNf: false,
      activeTicketEvent: "",
      aftermarketPercentage: 100,
      aftermarketAmount: 0,
      sellOpen: false,
      ticketOverlay: { open: false, ticket: undefined },
    };
  },
  components: {
    Ticket,
    TicketOverlay,
  },
  computed: {
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
  beforeCreate: async function() {},
  mounted: function() {
    this.$root.$emit("hideSearchBar");
  },
};
</script>

<style>
.ticket {
  margin-bottom: 1rem;
}
h1 {
  margin-left: 1rem;
  margin-top: 2rem;
}
.tabs {
  width: 100%;
  display: flex;
  margin-bottom: 1rem;
  position: relative;
}
.tabs .tab {
  flex-basis: 50%;
  padding-bottom: 1rem;
  text-align: center;
  transition: color 0.3s ease-in-out;
}
.tabs .tab.active {
  color: var(--orange);
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
  height: 100vh;
  position: relative;
  overflow-y: hidden;
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
