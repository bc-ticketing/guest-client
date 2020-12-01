<template>
  <div class="cont" v-bind:class="{ open: isOpen }">
    <div class="overlay invisible" ref="overlay">
      <div class="message-wrapper">
        <div class="message" ref="message">
          {{ message }}
        </div>
        <div class="loader">
          <div class="blob"></div>
          <div class="blob"></div>
          <div class="blob"></div>
          <div class="blob"></div>
          <div class="blob"></div>
          <div class="blob"></div>
          <div class="blob"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "OverlayMessage",
  data() {
    return {
      isOpen: false,
    };
  },
  props: {
    message: String,
    yPos: Number,
    autoClose: Boolean,
  },
  computed: {},
  watch: {},
  methods: {
    open: async function() {
      this.isOpen = true;
      /* const delay = (millis) =>
        new Promise((resolve) => {
          setTimeout(() => resolve(), millis);
        }); */
      this.$refs["overlay"].classList.remove("invisible");
      this.$refs["overlay"].classList.add("open");

      // await delay(20000);
      // this.hide();
    },
    close: function() {
      this.$refs["overlay"].classList.remove("invisible");
      this.$refs["overlay"].classList.remove("open");
      this.isOpen = false;
    },
    toggle: function() {
      this.$refs["overlay"].classList.remove("invisible");
      this.$refs["overlay"].classList.toggle("open");
      this.isOpen = !this.isOpen;
    },
    hide: function() {
      this.$refs["overlay"].classList.remove("open");
      this.$refs["overlay"].classList.add("invisible");
      this.isOpen = false;
    },
  },
  mounted: function() {
    //this.openSearchBar();
  },
  created: function() {
    this.$root.$on("openMessageOverlay", async () => {
      //this.message = message;
      this.open();
    });
    this.$root.$on("hideMessageOverlay", async () => {
      //this.message = "";
      this.hide();
    });
    this.$root.$on("closeMessageOverlay", async () => {
      //this.message = "";
      this.hide();
    });
  },
};
</script>

<style scoped>
.search-icon {
  cursor: pointer;
}
.cont {
  transform: translateX(var(--vw));
  position: absolute;
  top: 0px;
  z-index: 99999999999;
  left: 0px;
}
.cont.open {
  transform: translateX(0);
}
.overlay {
  position: relative;
  height: var(--vh);
  width: var(--vw);
  position: absolute;
  transition: opacity 0.4s ease-in-out;
  opacity: 0;
  background-color: var(--button-confirm);
  display: flex;
  justify-content: center;
  align-items: center;
}
.overlay.open {
  opacity: 1;
}

.message-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;

  position: relative;
}
.message {
  width: 60%;
  max-width: 400px;
  text-align: center;
}

.loader {
  position: absolute;
  width: 400px;
  height: 400px;
  -webkit-filter: contrast(30);
  filter: contrast(30);
}

.blob {
  position: absolute;
  left: 180px;
  top: 180px;
  width: 30px;
  height: 30px;
  border-radius: 15px;
  background-color: #00ffeb;
  content: "";
  -webkit-filter: blur(10px);
  filter: blur(10px);
  -webkit-transform: translateY(-100px);
  transform: translateY(-100px);
}
.blob:nth-child(1) {
  -webkit-animation: spin 2.5s infinite ease-in-out;
  animation: spin 2.5s infinite ease-in-out;
  -webkit-animation-delay: 0.1s;
  animation-delay: 0.1s;
}
.blob:nth-child(2) {
  -webkit-animation: spin 2.5s infinite ease-in-out;
  animation: spin 2.5s infinite ease-in-out;
  -webkit-animation-delay: 0.2s;
  animation-delay: 0.2s;
}
.blob:nth-child(3) {
  -webkit-animation: spin 2.5s infinite ease-in-out;
  animation: spin 2.5s infinite ease-in-out;
  -webkit-animation-delay: 0.3s;
  animation-delay: 0.3s;
}
.blob:nth-child(4) {
  -webkit-animation: spin 2.5s infinite ease-in-out;
  animation: spin 2.5s infinite ease-in-out;
  -webkit-animation-delay: 0.4s;
  animation-delay: 0.4s;
}
.blob:nth-child(5) {
  -webkit-animation: spin 2.5s infinite ease-in-out;
  animation: spin 2.5s infinite ease-in-out;
  -webkit-animation-delay: 0.5s;
  animation-delay: 0.5s;
}
.blob:nth-child(6) {
  -webkit-animation: spin 2.5s infinite ease-in-out;
  animation: spin 2.5s infinite ease-in-out;
  -webkit-animation-delay: 0.6s;
  animation-delay: 0.6s;
}
.blob:nth-child(7) {
  -webkit-animation: spin 2.5s infinite ease-in-out;
  animation: spin 2.5s infinite ease-in-out;
  -webkit-animation-delay: 0.7s;
  animation-delay: 0.7s;
}

@-webkit-keyframes spin {
  0% {
    -webkit-transform: rotate(0deg) translateY(-100px) rotate(0deg);
    transform: rotate(0deg) translateY(-100px) rotate(0deg);
  }
  70% {
    -webkit-transform: rotate(360deg) translateY(-100px) rotate(-360deg);
    transform: rotate(360deg) translateY(-100px) rotate(-360deg);
  }
}

@keyframes spin {
  0% {
    -webkit-transform: rotate(0deg) translateY(-100px) rotate(0deg);
    transform: rotate(0deg) translateY(-100px) rotate(0deg);
  }
  70% {
    -webkit-transform: rotate(360deg) translateY(-100px) rotate(-360deg);
    transform: rotate(360deg) translateY(-100px) rotate(-360deg);
  }
}
</style>
