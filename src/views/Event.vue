<template>
  <div class="event">
    <div class="container-fluid header-img">
      <div class="parallax" ref="parallax">
        <!--<img :src="event_data.img_url" alt="" class="img-fluid" /> -->
      </div>
      <div class="return-arrow">
        <router-link to="/event-list"
          ><md-icon>arrow_back_ios</md-icon></router-link
        >
      </div>
      <div class="event-header">
        <span class="event-title">{{ event_data.metadata.event.title }}</span>
        <span class="event-cat">Concert</span>
      </div>
      <div class="nav-bar">
        <div
          class="nav-entry about active"
          ref="about"
          @click="toggleTab('about')"
        >
          About
        </div>
        <div
          class="nav-entry tickets"
          ref="tickets"
          @click="toggleTab('tickets')"
        >
          Tickets
        </div>
      </div>
    </div>

    <div class="container">
      <div class="event-info-wrapper active" ref="content-about">
        <span class="event-title">
          <h2>{{ event_data.metadata.event.title }}</h2>
        </span>
        <div class="info-group description">
          {{ event_data.metadata.event.description }}
        </div>
        <div class="info-group">
          <md-icon class="info-title">location_on</md-icon>
          <span class="info-value">{{
            event_data.metadata.event.location
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
      <div class="event-info-wrapper" ref="content-tickets">
        <span class="event-title"><h2>Tickets</h2></span>
        <div class="ticket-container">
          <div
            class="ticket-category"
            v-for="(ticket, index) in tickets"
            v-bind:key="index"
          >
            <div class="ticket-info">
              <span class="ticket-price">{{ ticket.price }} ETH</span>
              <span class="ticket-available"
                >{{ ticket.supply - ticket.ticketsSold }} left</span
              >
            </div>
            <div class="ticket-select">
              <md-button
                class="md-raised md-primary"
                v-bind:disabled="ticket.ticketsSold >= ticket.supply"
                @click="buyTicket(ticket.ticketTypeNr, ticket.price)"
                >Buy</md-button
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { EVENT_MINTABLE_AFTERMARKET_ABI } from "./../util/abi/eventMintableAftermarket";
import { fungibleBaseId } from "idetix-utils";

export default {
  name: "Event",
  data() {
    return {
      event_id: Number,
      event_data: { metadata: { event: {} } },
      tabs: ["about", "tickets"],
      //tickets: [{ name: "fungible", price: 50 }],
    };
  },
  props: {},
  computed: {
    eventStore() {
      return this.$store.state.events;
    },
    tickets() {
      if (this.$store.state.events[this.event_id]) {
        return this.$store.state.events[this.event_id].tickets;
      } else {
        return [];
      }
    },
  },
  beforeCreate() {
    this.$root.$on("loadedEventMetadata", () => {
      this.fetchEventInfo();
    });
  },
  watch: {
    eventStore(newEvents) {
      console.log("event store changed");
      if (newEvents[this.event_id].metadata) {
        console.log("fetching infos");
        this.fetchEventInfo();
      }
    },
  },
  methods: {
    buyTicket: async function(nr, price) {
      console.log(`buying ticket nr ${nr} for event ${this.event_id}`);
      const eventSC = new this.$store.state.web3.web3Instance.eth.Contract(
        EVENT_MINTABLE_AFTERMARKET_ABI,
        this.event_id
      );
      var type = fungibleBaseId.plus(nr);
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
    },
    loadTickets: async function(nr) {
      const eventSC = new this.$store.state.web3.web3Instance.eth.Contract(
        EVENT_MINTABLE_AFTERMARKET_ABI,
        this.event_id
      );
      var type = fungibleBaseId.plus(nr);
      var myTickets = await eventSC.methods
        .tickets(type, this.$store.state.web3.account)
        .call();
      console.log(myTickets);
    },
    toggleTab: function(tab) {
      this.tabs.forEach((t) => {
        this.$refs[t].classList.remove("active");
        this.$refs[`content-${t}`].classList.remove("active");
      });
      this.$refs[tab].classList.add("active");
      this.$refs[`content-${tab}`].classList.add("active");
    },
    fetchEventInfo: function() {
      console.log(`fetching event info ${this.event_id}`);
      this.event_data = this.$store.state.events[this.event_id];
      this.$refs[
        "parallax"
      ].style.backgroundColor = `${this.event_data.metadata.event.color}`;
      console.log(`got event: ${this.event_data.metadata.event.title}`);
    },
  },
  created() {
    this.event_id = this.$route.params.id;
    //this.fetchEventInfo();
  },
  mounted() {
    this.fetchEventInfo();
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
}
.header-img .event-header {
  position: absolute;
  top: 30%;
  left: 20px;
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
  margin-top: 2rem;
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
  min-height: 300px;
  position: relative;
}
</style>
