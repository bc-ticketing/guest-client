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
          :center="{ lat: 47.3774338, lng: 8.4666756 }"
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
        <div
          class="tooltip"
          v-bind:class="{ active: tooltipActive }"
          ref="tooltip"
        >
          <div>
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
      selectedEvent: {},
      tooltipActive: false,
      searchInput: "",
      mapStyles: GMAP_STYLES,
    };
  },
  methods: {
    showTooltip: function(e) {
      this.tooltipActive = true;
      this.selectedEvent = e;
    },
    hideTooltip: function() {
      this.tooltipActive = false;
    },
  },
  computed: {
    google: gmapApi,
  },
  watch: {},
  mounted() {
    this.$root.$emit("hideSearchBar");
    this.$refs.map.$mapPromise.then((map) => {
      this.map = map;
    });
  },
};
</script>

<style scoped>
.tooltip {
  position: absolute;
  padding: 1rem;
  top: 0;
  background-color: white;
  transform: translateX(-100%);
  transition: transform 0.4s ease-in-out;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.tooltip.active {
  transform: translateX(0);
}
.tt-icon {
  cursor: pointer;
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
</style>
