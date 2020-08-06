<template>
  <div class="events">
    <div class="search-filter-wrapper container-fluid" id="search-container">
      <!--
      <div class="search-field">
        <md-icon>search</md-icon>
        <md-input v-model="searchInput"></md-input>
      </div>
      -->
      <!--<md-field>
        <md-icon>search</md-icon>
        <label>Search</label>
        <md-input v-model="searchInput"></md-input>
      </md-field> -->
    </div>
    <div class="container-fluid">
      <isotope
        ref="isotope"
        class="event-list"
        :options="getOptions()"
        :list="events"
        @filter="filterOption = arguments[0]"
        @sort="sortOption = arguments[0]"
      >
        <EventEntry
          v-for="event in events"
          v-bind:key="event.id"
          v-bind:event_data="event"
        ></EventEntry>
      </isotope>
    </div>
    <div class="test" @click="loadEvents">Fetch events (click me)</div>
  </div>
</template>

<script>
// import Button from "./../components/basics/Button";
import EventEntry from "./../components/EventEntry";
import isotope from "vueisotope";
import { EVENT_ABI, EVENT_FACTORY_ABI } from "./../util/constants/abi";
import {
  TEST_EVENT_ADDRESS,
  EVENT_FACTORY_ADDRESS,
} from "./../util/constants/addresses";
//import func from "../../vue-temp/vue-editor-bridge";

export default {
  name: "EventList",
  components: {
    EventEntry,
    isotope,
  },
  computed: {
    web3() {
      return this.$store.state.web3.web3Instance;
    },
  },
  data() {
    return {
      searchInput: "",
      sortOption: null,
      filterOption: null,
      filterText: "",
      events: [
        {
          name: "Bastille",
          Type: "Concert",
          lowestPrice: "0.2",
          date: "15.12.20",
          starttime: "18:30",
          venue: "Hallenstadion",

          location: "Zurich",
          id: "1",
          organizer: "Events Gmbh",
          description:
            "This will be an awesome open air if covid-19 does not fuck it up and it will be super cool for sure",
          approvers: "Idetix",
          img_url: require("@/assets/event_img/event_1.jpg"),
        },
        {
          name: "Theatre",
          Type: "Arts",
          lowestPrice: "0.35",
          date: "03.05.20",
          starttime: "20:30",
          venue: "Hallenstadion",
          location: "Zurich",
          id: "2",
          organizer: "Sick Theaters",
          description:
            "Sick Theaters will host this screening for the fist time since the covid outbreak and it will be super awesome so dont fucking miss it",
          approvers: "SBB",
          img_url: require("@/assets/event_img/event_2.jpg"),
        },
        {
          name: "Robin Schulz",
          Type: "Concert",
          lowestPrice: "0.11",
          date: "04.05.20",
          starttime: "12:00",
          venue: "Big Ben",
          location: "London",
          id: "3",
          organizer: "GN",
          description: "",
          approvers: "Idetix",
          img_url: require("@/assets/event_img/event_3.jpg"),
        },
      ],
    };
  },
  watch: {
    searchInput: function() {
      console.log(`current search: ${this.searchInput}`);
      this.filterText = this.searchInput;
      this.$refs["isotope"].filter("filterByText");
    },
  },
  mounted: function() {
    window.addEventListener("scroll", this.handleScroll);
  },
  methods: {
    /* Load all event contract addresses from event factory */
    loadEvents: async function() {
      const eventFactory = new this.web3.eth.Contract(
        EVENT_FACTORY_ABI,
        EVENT_FACTORY_ADDRESS
      );
      const eventAddresses = await eventFactory.methods.getEvents().call();
      this.loadEventDetails(TEST_EVENT_ADDRESS);
      console.log(eventAddresses);
    },
    /* Load event details from event contract address and ipfs */
    loadEventDetails(event_address) {
      const event = new this.web3.eth.Contract(EVENT_ABI, event_address);
      console.log(event.proberties);
      var result = event.methods.owner;
      console.log(result);
    },
    toggleDetails: function(event_id) {
      var event = `details_${event_id}`;
      var element = this.$refs[event][0];
      if (element.classList.contains("open")) {
        element.classList.remove("open");
      } else {
        element.classList.add("open");
      }
    },
    getOptions: function() {
      var _this = this;
      return {
        masonry: {
          columnWidth: 100,
        },
        getSortData: {
          id: "id",
          name: function(itemElem) {
            return itemElem.name.toLowerCase();
          },
        },
        getFilterData: {
          filterByText: function(itemElem) {
            return (
              itemElem.name
                .toLowerCase()
                .includes(_this.filterText.toLowerCase()) ||
              itemElem.location
                .toLowerCase()
                .includes(_this.filterText.toLowerCase())
            );
          },
        },
      };
    },
    sort: function(key) {
      this.isotopeSort(key);
      this.sortOption = key;
    },
    filter: function(key) {
      if (this.filterOption == key) key = null;
      this.isotopeFilter(key);
      this.filterOption = key;
    },
    handleScroll: function() {
      var scrollTop = window.scrollY;
      //var nav_height = document.getElementById("nav").offsetHeight;
      var nav_height = 0;
      if (scrollTop > nav_height) {
        var scrollbox = document.getElementById("search-container");
        scrollbox.classList.add("sticky");
        scrollbox.style.top = nav_height + "px";
      }
      var window_height = window.screen.height / 2;

      var cards = document.getElementsByClassName("event");
      cards.forEach((card) => {
        var card_center =
          (card.getBoundingClientRect().top + card.offsetHeight) / 2;
        if (Math.abs(window_height - card_center) < 80) {
          card.classList.add("raised");
        } else {
          card.classList.remove("raised");
        }
      });
    },
  },
};
</script>

<style scoped>
.events {
  background-color: rgb(241, 235, 235);
  min-height: 100vh;
}
.item {
  width: 100%;
  margin-bottom: 7px;
}
.search-filter-wrapper {
  margin-bottom: 2rem;
  z-index: 6;
  background-color: rgb(241, 235, 235);
  padding: 5px;
}
.search-filter-wrapper .search-field {
  background-color: white;
  border-radius: 12px;
  padding: 5px;
}
.search-filter-wrapper .search-field input {
  outline: none;
  border: none;
  width: 80%;
  margin-left: 5px;
}
.search-filter-wrapper.sticky {
  position: sticky;
}
.search-bar {
  display: inline-block;
  margin-left: 0.5rem;
  width: 85%;
  border: black dotted 0.001rem;
}
.filter-burger {
  float: right;
  margin-right: 0.5rem;
  border: black dotted 0.001rem;
}
.event-list {
  z-index: 5;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}
</style>
