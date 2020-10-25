<template>
  <div class="search-bar" ref="search">
    <v-touch
      @swipeleft="close"
      @swiperight="openSearchBar"
      class="search-bar-wrapper md-elevation-9"
    >
      <div class="search-field">
        <input
          v-model="searchInput"
          type="text"
          placeholder="What are you looking for?"
        />
      </div>
      <div class="search-icon" @click="toggle">
        <md-icon v-if="!isOpen">search</md-icon>
        <md-icon v-if="isOpen">close</md-icon>
      </div>
    </v-touch>
  </div>
</template>

<script>
export default {
  name: "searchBar",
  data() {
    return {
      searchInput: "",
      isOpen: false,
    };
  },
  props: {
    yPos: Number,
  },
  computed: {},
  watch: {
    yPos: function() {
      this.$refs["search"].style.top = `${this.yPos}px`;
    },
    searchInput: function() {
      this.$root.$emit("searchChange", this.searchInput);
    },
  },
  methods: {
    openSearchBar: function() {
      this.$refs["search"].classList.remove("invisible");
      this.$refs["search"].classList.add("open");
      this.isOpen = true;
    },
    close: function() {
      this.$refs["search"].classList.remove("invisible");
      this.$refs["search"].classList.remove("open");
      this.isOpen = false;
    },
    toggle: function() {
      this.$refs["search"].classList.remove("invisible");
      this.$refs["search"].classList.toggle("open");
      this.isOpen = !this.isOpen;
    },
    hide: function() {
      this.$refs["search"].classList.remove("open");
      this.$refs["search"].classList.add("invisible");
      this.isOpen = false;
    },
  },
  mounted: function() {
    this.$root.$on("openSearchBar", async () => {
      this.openSearchBar();
    });
    this.$root.$on("hideSearchBar", async () => {
      this.hide();
    });
    this.$root.$on("closeSearchBar", async () => {
      this.close();
    });
  },
  created: function() {
    
  },
};
</script>

<style scoped>
.search-icon {
  cursor: pointer;
}
.search-bar {
  z-index: 99;
  padding: 0.5rem 0.5rem;
  position: fixed;
  transform: translate(-80%, -100%);
  transition: transform 0.4s ease-in-out;
  width: 100vw;
  padding: 1rem;
}
.search-bar-wrapper {
  border-radius: 12px;
  padding: 1rem;
  background-color: #4c566a;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.search-bar-wrapper input {
  background-color: #4c566a !important;
  color: #eceff4;
  border: none;
}
.search-bar.open {
  transform: translate(0, -100%);
}
.search-bar.invisible {
  transform: translate(-100%, -100%);
}

.search-bar input {
}
</style>
