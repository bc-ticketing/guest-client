<template>
  <div class='search-bar' ref="search">
    <v-touch @swipeleft='close' @swiperight='openSearchBar' class='search-bar-wrapper'>
    <div class="search-field">
      <input v-model="searchInput" />
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
    yPos: Number
  },
  computed: {
  },
  watch: {
    yPos: function() {
      this.$refs["search"].style.top = `${this.yPos}px`;
    },
    searchInput: function() {
      this.$root.$emit('searchChange',this.searchInput);
    }
  },
  methods: {
    openSearchBar: function() {
      this.$refs["search"].classList.remove('invisible');
      this.$refs["search"].classList.add("open");
      this.isOpen = true;
    },
    close: function() {
      this.$refs["search"].classList.remove('invisible');
      this.$refs["search"].classList.remove("open");
      this.isOpen = false;
    },
    toggle: function() {
      this.$refs["search"].classList.remove('invisible');
      this.$refs['search'].classList.toggle('open');
      this.isOpen = !this.isOpen;
    },
    hide: function() {
      this.$refs["search"].classList.remove('open');
      this.$refs['search'].classList.add('invisible');
      this.isOpen = false;
    }
  },
  mounted: function() {
    //this.openSearchBar();
  },
  created: function() {
    this.$root.$on("openSearchBar", async () => {
      this.openSearchBar();
    });
    this.$root.$on('hideSearchBar', async () => {
      this.hide();
    });
    this.$root.$on('closeSearchBar', async () => {
      this.close();
    });
  }
};
</script>

<style scoped>
.search-icon {
  cursor: pointer;
}
.search-bar {
  z-index: 99;
  background-color: var(--fg-light);

  padding: 0.5rem 0.5rem;
  position: fixed;
  transform: translate(-90%, -100%);
  transition: transform 0.4s ease-in-out;
  width: 100vw;
}
.search-bar-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
