<template>
  <div class="message-bar invisible" ref="bar">
    <v-touch
      @swipeleft="hide"
      @swiperight="open"
      class="message-bar-wrapper"
      ref="wrapper"
      v-bind:class="type"
    >
      <div class="message" ref="message">
        {{ message }}
      </div>
    </v-touch>
  </div>
</template>

<script>
export default {
  name: "MessageBus",
  data() {
    return {
      isOpen: false,
      message: "",
      type: "neutral"
    };
  },
  props: {
    yPos: Number
  },
  computed: {},
  watch: {
    yPos: function() {
      this.$refs["bar"].style.top = `${this.yPos}px`;
    }
  },
  methods: {
    open: async function() {
      const delay = millis =>
        new Promise(resolve => {
          setTimeout(() => resolve(), millis);
        });
      this.$refs["bar"].classList.remove("invisible");
      this.$refs["bar"].classList.add("open");
      this.isOpen = true;
      await delay(2000);
      this.hide();
    },
    close: function() {
      this.$refs["bar"].classList.remove("invisible");
      this.$refs["bar"].classList.remove("open");
      this.isOpen = false;
    },
    toggle: function() {
      this.$refs["bar"].classList.remove("invisible");
      this.$refs["bar"].classList.toggle("open");
      this.isOpen = !this.isOpen;
    },
    hide: function() {
      this.$refs["bar"].classList.remove("open");
      this.$refs["bar"].classList.add("invisible");
      this.isOpen = false;
    }
  },
  mounted: function() {
    //this.openSearchBar();
  },
  created: function() {
    this.$root.$on("openMessageBus", async result => {
      this.message = result.message;
      if (result.status == 1) {
        this.type = "success";
        //this.$root.$emit('refreshData');
      } else if (result.status == 0) {
        this.type = "neutral";
      } else if (result.status == -1) {
        this.type = "error";
      }
      this.open();
    });
    this.$root.$on("hideMessageBus", async () => {
      this.message = "";
      this.type = "neutral";
      this.hide();
    });
    this.$root.$on("closeMessageBus", async () => {
      this.message = "";
      this.type = "neutral";
      this.hide();
    });
  }
};
</script>

<style scoped>
.search-icon {
  cursor: pointer;
}
.message-bar {
  top: 80px;
  padding: 2rem 0rem;
  z-index: 999;
  padding: 0.5rem 0.5rem;
  position: fixed;
  transform: translate(-90%, -100%);
  transition: transform 0.4s ease-in-out;
  width: 100vw;
}

.message-bar-wrapper {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}
.message-bar-wrapper.neutral {
  background-color: var(--button-neutral);
}
.message-bar-wrapper.error {
  background-color: var(--fg-light);
}
.message-bar-wrapper.success {
  background-color: var(--button-confirm);
}
.message-bar.open {
  transform: translate(0, -100%);
}
.message-bar.invisible {
  transform: translate(-100%, -100%);
}
</style>
