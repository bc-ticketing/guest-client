<template>
  <div class="events">
    <div class="container">
      <h3>{{ $store.state.events.length }} events</h3>
      <isotope
        ref="isotope"
        class="event-list"
        :options="getOptions()"
        :list="$store.state.events"
        @filter="filterOption = arguments[0]"
        @sort="sortOption = arguments[0]"
      >
        <EventEntry
          v-for="event in $store.state.events"
          v-bind:key="event.contractAddress"
          v-bind:event="event"
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
  },
  data() {
    return {
      sortOption: null,
      filterOption: null,
      filterText: "",
    };
  },
  watch: {},
  beforeCreate: async function() {
    this.$root.$on("searchChange", (val) => {
      this.updateFilters(val);
    });
  },
  mounted: function() {
    this.$root.$emit("openSearchBar");
  },
  methods: {
    updateFilters: function(value) {
      this.filterText = value;
      this.$refs["isotope"].filter("filterByText");
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
            return itemElem.title.toLowerCase();
          },
        },
        getFilterData: {
          filterByText: function(itemElem) {
            return (
              itemElem.title
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
  },
};
</script>

<style scoped>
.events {
  background-color: #eceff4;
  min-height: 100vh;
  padding-top: 2rem;
}
.item {
  width: 100%;
  margin-bottom: 7px;
  padding: 0;
  margin-bottom: 1rem;
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
