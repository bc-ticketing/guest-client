<template>
  <div class="home">
    <div class="container-fluid content" ref="content">
      <div id="map">
        <!--
        <div class="search-wrapper">
          <div class="drag-wrapper">
            <md-icon>drag_handle</md-icon>
          </div>
          
          <div class="search-bar">
             <md-input placeholder="Search" v-model="searchInput"></md-input> 
          </div>
          
        </div>
        -->
        <GmapMap
          :center="{ lat: 55.3774338, lng: 8.4666756 }"
          :zoom="3"
          :options="{
            zoomControl: false,
            mapTypeControl: false,
            scaleControl: false,
            streetViewControl: false,
            rotateControl: false,
            fullscreenControl: false,
            disableDefaultUI: false,
            styles: mapStyles,
          }"
          map-type-id="roadmap"
          style="width: 100%; height: 100%"
          ref="map"
        >
          <GmapMarker
            :key="e.contractAddress"
            v-for="e in $store.state.events"
            :position="e.latlong"
            :icon="require('@/assets/location_white.png')"
            :clickable="true"
            :draggable="true"
            @click="showTooltip(e, $event)"
          >
          </GmapMarker>
        </GmapMap>
        <div class="loading-icon" v-if="loadingEvents">
          <md-progress-spinner
            class="loading-icon"
            :md-diameter="20"
            :md-stroke="4"
            md-mode="indeterminate"
          ></md-progress-spinner>
        </div>
        <div
          class="tooltip"
          v-bind:class="{
            active: tooltipActive,
            closing: tooltipClosing,
            changing: tooltipChanging,
            entering: tooltipEntering,
          }"
          ref="tooltip"
        >
          <div class="header">
            <div class="event-link" @click="gotoEvent(selectedEvent)">
              <h2>{{ selectedEvent.title }}</h2>
              <span class="location">{{ selectedEvent.location }}</span>
            </div>
            <div class="tt-icon" @click="hideTooltip()">
              <md-icon>close</md-icon>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import { gmapApi } from "gmap-vue";
import { MdContent, MdIcon } from "vue-material/dist/components";
import { GMAP_STYLES } from "./../util/constants/mapStyles";

Vue.use(MdContent);
Vue.use(MdIcon);
import * as VueGoogleMaps from "gmap-vue";

Vue.use(VueGoogleMaps, {
  load: {
    key: "AIzaSyC698VZ_qNCEtFGDRtevgX2f1n9uK4P7Gw",
    libraries: "places",
  },
  installComponents: true,
});
// import Button from "./../components/basics/Button";
export default {
  name: "Home",
  components: {
    //Button
  },
  data() {
    return {
      loadingEvents: false,
      selectedEvent: {},
      tooltipEntering: false,
      tooltipActive: false,
      tooltipClosing: false,
      tooltipChanging: false,
      searchInput: "",
      mapStyles: GMAP_STYLES,
    };
  },
  methods: {
    panTo(event) {
      if (event.latlong) {
        console.log("new event");
        try {
          this.$refs.map.$mapPromise.then((map) => map.panTo(event.latlong));
        } catch (e) {
          console.log(e);
        }
      }
    },
    showTooltip: function(e) {
      if (this.tooltipActive) {
        this.tooltipChanging = true;
        setTimeout(() => {
          this.selectedEvent = e;
        }, 500);
        setTimeout(() => {
          this.tooltipChanging = false;
        }, 1000);
      } else {
        this.tooltipActive = true;
        this.tooltipEntering = true;
        setTimeout(() => {
          this.tooltipEntering = false;
        }, 1000);
        this.selectedEvent = e;
      }
      this.$refs.map.$mapPromise.then((map) => map.panTo(e.latlong));
    },
    hideTooltip: function() {
      this.tooltipActive = false;
      this.tooltipClosing = true;
      setTimeout(() => {
        this.tooltipClosing = false;
      }, 1000);
    },
    gotoEvent(event) {
      this.$router.push({
        name: "event",
        params: { id: event.contractAddress },
      });
    },
  },
  computed: {
    google: gmapApi,
    events() {
      return this.$store.state.events;
    },
  },
  watch: {
    events(newEvents) {
      this.panTo(newEvents[newEvents.length - 1]);
    },
  },
  mounted() {
    this.$root.$emit("hideSearchBar");
    this.$refs.map.$mapPromise.then((map) => {
      this.map = map;
    });
  },
  beforeCreate() {
    this.$root.$on("eventFactoryCreated", async () => {
      this.loadingEvents = true;
    });
    this.$root.$on("loadedEvents", async () => {
      this.loadingEvents = false;
    });
  },
};
</script>

<style scoped>
.header {
  padding: 0.5rem 1rem;
  width: 100%;
  position: relative;
  border-radius: 12px;
  color: black;
  display: flex;
  justify-content: space-between;
  background: white;
  box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2),
    0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12);
}
.header h2 {
  margin: 0;
  margin-bottom: 0.5rem;
}

.loading-icon {
  position: absolute;
  padding: 5px;
  top: 0;
  right: 0;
}

.tooltip {
  position: absolute;
  padding: 5px;
  top: 0;
  transform: translateX(-100%);
  transition: transform 0.4s ease-in-out;
  width: 100%;
  display: flex;
  align-items: center;
}
.tooltip.active {
  transform: translateX(0%);
}
.event-link {
  transition: 0.3s ease-in-out;
  cursor: pointer;
}
.event-link:hover {
  color: var(--green);
}
.tooltip.entering {
  animation: slidein 1s ease-in-out;
  animation-fill-mode: forwards;
  animation-delay: 0s;
  animation-iteration-count: 1;
}
.tooltip.closing {
  animation: slideout 1s ease-in-out;
  animation-fill-mode: forwards;
  animation-delay: 0s;
  animation-iteration-count: 1;
}
.tooltip.changing {
  animation: change 1s ease-in-out;
  animation-fill-mode: forwards;
  animation-delay: 0s;
  animation-iteration-count: 1;
}
.tt-icon {
  cursor: pointer;
}
.tt-icon i {
  color: var(--red) !important;
  font-size: 1.5rem;
}
.content-container {
  height: 100vh;
}
#map {
  height: 100%;
  width: 100%;
}
.content {
  position: relative;
  max-height: 608px;
  height: 608px;
}
.content .search-wrapper {
  position: absolute;
  bottom: 55px;
  left: 0;
  z-index: 100;
  width: var(--vw);
  background-color: rgba(0, 0, 0, 0.2);
}
.search-bar {
  width: 95vw;
  margin: 10px auto;
  margin-top: 0;
}
.search-bar input {
  width: 100%;
}
.info-container {
  padding: 10px;
}
.drag-wrapper {
  display: flex;
  justify-content: center;
}

@keyframes slidein {
  0% {
    transform: translateX(-100%);
  }
  40% {
    transform: translateX(0%);
  }
  60% {
    transform: translateX(-15%);
  }
  100% {
    transform: translateX(0%);
  }
}
@keyframes slideout {
  0% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(100%);
  }
}
@keyframes change {
  0% {
    transform: translateY(0%);
  }
  50% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(0%);
  }
}

.popin-enter-active,
.popin-leave-active {
  transition: 300ms;
}
.popin-enter {
  transform: scale(0);
}
.popin-enter-to {
  transform: scale(0);
}
</style>
