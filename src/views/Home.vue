<template>
  <div class="home">
    <div class="container-fluid content-container" ref="content">
      <div class="content" id="map">
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
            v-for="e in events"
            :position="e.latlong"
            :icon="require('@/assets/location_white.png')"
            :clickable="true"
            :draggable="true"
            @click="toggleInfo(e)"
          >
          </GmapMarker>
        </GmapMap>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import axios from "axios";
import { gmapApi } from "gmap-vue";
import { MdContent, MdIcon } from "vue-material/dist/components";
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

  methods: {
    updateEvents: function() {
      console.log("updating events");
      for (const a in this.$store.state.events) {
        var e = this.$store.state.events[a];
        e.contractAddress = a;
        this.events.push(e);
      }
    },
    async getLocation() {
      return new Promise((resolve, reject) => {
        if (!("geolocation" in navigator)) {
          reject(new Error("Geolocation is not available."));
        }

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            console.log(pos);
            resolve(pos);
          },
          (err) => {
            console.log(err);
            reject(err);
          }
        );
      });
    },
    buildInfoContent: function(event) {
      return `
      <div class='info-container' style='margin-right:10px; margin-bottom:10px;'>
      <div>
      <span style='color: #2a313a'>${event.name}</span> in <span style='color: #2a313a'> ${event.location}</span>
      </div>
      <Button>see tickets</Button>
      </div>`;
    },
    toggleInfo: function(event) {
      var infowindow = new this.google.maps.InfoWindow({
        content: this.buildInfoContent(event),
        position: event.latlong,
      });
      infowindow.open(this.map);
    },
    fetchLocations: function() {
      this.events.forEach((event) => {
        if (event.metadata) {
          axios
            .get(
              `https://api.opencagedata.com/geocode/v1/json?q=${event.metadata.event.location}&key=9b5c0f0e97664b69baf8d617c4d0f1c6&language=en&pretty=1`
            )
            .then((response) => {
              // handle success
              console.log(response.data.results);
              var first = response.data.results[0];
              var latlong = {
                lat: first.geometry.lat,
                lng: first.geometry.lng,
              };
              event.latlong = latlong;
            })
            .catch((error) => {
              // handle error
              console.log(error);
            });
        }

        //var test = this.getLatLong(event.location);
        //console.log('test: '+ test.lat);
        //event.latlong = this.getLatLong(event.location)
      });
    },
  },
  computed: {
    google: gmapApi,
  },
  watch: {
    location: function(newVal, oldVal) {
      console.log(oldVal);
      this.map.panTo(newVal);
      //this.map.panTo({lat: 1.38, lng: 103.80})
    },
  },
  created: async function() {
    //this.location = await this.getLocation();
  },
  beforeCreate: async function() {
    this.$root.$on("loadedEventMetadata", () => {
      this.updateEvents();
      this.fetchLocations();
    });
  },

  beforeMount() {
    this.updateEvents();
    this.fetchLocations()
  },
  mounted() {
this.$refs.map.$mapPromise.then((map) => {
      this.map = map;
    });
  },
  data() {
    return {
      location: undefined,
      searchInput: "",
      events: [],
      mapStyles: [
        {
          featureType: "all",
          elementType: "all",
          stylers: [
            {
              visibility: "on",
            },
          ],
        },
        {
          featureType: "all",
          elementType: "labels",
          stylers: [
            {
              visibility: "off",
            },
            {
              saturation: "-100",
            },
          ],
        },
        {
          featureType: "all",
          elementType: "labels.text.fill",
          stylers: [
            {
              saturation: 36,
            },
            {
              color: "#000000",
            },
            {
              lightness: 40,
            },
            {
              visibility: "off",
            },
          ],
        },
        {
          featureType: "all",
          elementType: "labels.text.stroke",
          stylers: [
            {
              visibility: "off",
            },
            {
              color: "#000000",
            },
            {
              lightness: 16,
            },
          ],
        },
        {
          featureType: "all",
          elementType: "labels.icon",
          stylers: [
            {
              visibility: "off",
            },
          ],
        },
        {
          featureType: "administrative",
          elementType: "geometry.fill",
          stylers: [
            {
              color: "#000000",
            },
            {
              lightness: 20,
            },
          ],
        },
        {
          featureType: "administrative",
          elementType: "geometry.stroke",
          stylers: [
            {
              color: "#000000",
            },
            {
              lightness: 17,
            },
            {
              weight: 1.2,
            },
          ],
        },
        {
          featureType: "landscape",
          elementType: "geometry",
          stylers: [
            {
              color: "#000000",
            },
            {
              lightness: 20,
            },
          ],
        },
        {
          featureType: "landscape",
          elementType: "geometry.fill",
          stylers: [
            {
              color: "#4d6059",
            },
          ],
        },
        {
          featureType: "landscape",
          elementType: "geometry.stroke",
          stylers: [
            {
              color: "#4d6059",
            },
          ],
        },
        {
          featureType: "landscape.natural",
          elementType: "geometry.fill",
          stylers: [
            {
              color: "#4d6059",
            },
          ],
        },
        {
          featureType: "poi",
          elementType: "geometry",
          stylers: [
            {
              lightness: 21,
            },
          ],
        },
        {
          featureType: "poi",
          elementType: "geometry.fill",
          stylers: [
            {
              color: "#4d6059",
            },
          ],
        },
        {
          featureType: "poi",
          elementType: "geometry.stroke",
          stylers: [
            {
              color: "#4d6059",
            },
          ],
        },
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [
            {
              visibility: "on",
            },
            {
              color: "#7f8d89",
            },
          ],
        },
        {
          featureType: "road",
          elementType: "geometry.fill",
          stylers: [
            {
              color: "#7f8d89",
            },
          ],
        },
        {
          featureType: "road.highway",
          elementType: "geometry.fill",
          stylers: [
            {
              color: "#7f8d89",
            },
            {
              lightness: 17,
            },
          ],
        },
        {
          featureType: "road.highway",
          elementType: "geometry.stroke",
          stylers: [
            {
              color: "#7f8d89",
            },
            {
              lightness: 29,
            },
            {
              weight: 0.2,
            },
          ],
        },
        {
          featureType: "road.arterial",
          elementType: "geometry",
          stylers: [
            {
              color: "#000000",
            },
            {
              lightness: 18,
            },
          ],
        },
        {
          featureType: "road.arterial",
          elementType: "geometry.fill",
          stylers: [
            {
              color: "#7f8d89",
            },
          ],
        },
        {
          featureType: "road.arterial",
          elementType: "geometry.stroke",
          stylers: [
            {
              color: "#7f8d89",
            },
          ],
        },
        {
          featureType: "road.local",
          elementType: "geometry",
          stylers: [
            {
              color: "#000000",
            },
            {
              lightness: 16,
            },
          ],
        },
        {
          featureType: "road.local",
          elementType: "geometry.fill",
          stylers: [
            {
              color: "#7f8d89",
            },
          ],
        },
        {
          featureType: "road.local",
          elementType: "geometry.stroke",
          stylers: [
            {
              color: "#7f8d89",
            },
          ],
        },
        {
          featureType: "transit",
          elementType: "geometry",
          stylers: [
            {
              color: "#000000",
            },
            {
              lightness: 19,
            },
          ],
        },
        {
          featureType: "water",
          elementType: "all",
          stylers: [
            {
              color: "#2b3638",
            },
            {
              visibility: "on",
            },
          ],
        },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [
            {
              color: "#2b3638",
            },
            {
              lightness: 17,
            },
          ],
        },
        {
          featureType: "water",
          elementType: "geometry.fill",
          stylers: [
            {
              color: "#24282b",
            },
          ],
        },
        {
          featureType: "water",
          elementType: "geometry.stroke",
          stylers: [
            {
              color: "#24282b",
            },
          ],
        },
        {
          featureType: "water",
          elementType: "labels",
          stylers: [
            {
              visibility: "off",
            },
          ],
        },
        {
          featureType: "water",
          elementType: "labels.text",
          stylers: [
            {
              visibility: "off",
            },
          ],
        },
        {
          featureType: "water",
          elementType: "labels.text.fill",
          stylers: [
            {
              visibility: "off",
            },
          ],
        },
        {
          featureType: "water",
          elementType: "labels.text.stroke",
          stylers: [
            {
              visibility: "off",
            },
          ],
        },
        {
          featureType: "water",
          elementType: "labels.icon",
          stylers: [
            {
              visibility: "off",
            },
          ],
        },
      ],
    };
  },
};
</script>

<style scoped>
.content-container {
  height: 100vh;
}
.content-container .content {
  height: 100%;
  width: 100%;
  position: relative;
}
.content .search-wrapper {
  position: absolute;
  bottom: 55px;
  left: 0;
  z-index: 100;
  width: 100vw;
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
