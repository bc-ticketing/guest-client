<template>
  <div class="events">

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
          v-bind:key="event.contractAddress"
          v-bind:event_data="event"
        ></EventEntry>
      </isotope>
    </div>
  </div>
</template>

<script>
import EventEntry from "./../components/EventEntry";
import isotope from "vueisotope";

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
    eventsWithMetadata() {
      return this.events.filter((e) => e.metadata != undefined);
    },
  },
  data() {
    return {
      sortOption: null,
      filterOption: null,
      filterText: "",
      events: [],
    };
  },
  watch: {
    searchInput: function() {
      console.log(`current search: ${this.searchInput}`);
    },
  },
  beforeCreate: async function() {
    this.$root.$on("searchChange", (val) => {
      this.updateFilters(val);
    });
    this.$root.$on("loadedEventMetadata", () => {
      this.updateEvents();
    });
  },
  beforeMount: function() {
    this.updateEvents();
  },
  mounted: function() {
    this.$root.$emit('openSearchBar');
  },
  methods: {
    updateFilters: function(value) {
      this.filterText = value;
      this.$refs["isotope"].filter("filterByText");
    },
    updateEvents: function() {
      for (const a in this.$store.state.events) {
        var e = this.$store.state.events[a];
        e.contractAddress = a;
        if (e.metadata != undefined) {
          this.events.push(e);
        }
      }
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
            return itemElem.metadata.event.title.toLowerCase();
          },
        },
        getFilterData: {
          filterByText: function(itemElem) {
            return (
              itemElem.metadata.event.title
                .toLowerCase()
                .includes(_this.filterText.toLowerCase()) ||
              itemElem.metadata.event.location
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
