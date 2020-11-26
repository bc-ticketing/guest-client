<template>
  <div class="events">
    <div class="header">
      <div class="container">
        <h3>{{ $store.state.events.length }} events</h3>
      </div>
    </div>
    <div class="container">
      <isotope
        ref="isotope"
        class="event-list"
        :options="getOptions()"
        :list="events"
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
    events() {
      return this.$store.state.events;
    },
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
    // this.$refs["isotope"].arrange("isotope");
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
.header h3 {
  margin: 0 !important;
}
.header {
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  background: white;
  z-index: 999;
  padding: 1rem 0;
  box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2),
    0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12);
}
.events {
  min-height: 100vh;
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
  margin-top: 1rem;
  z-index: 5;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}
</style>
