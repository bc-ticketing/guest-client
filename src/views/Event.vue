<template>
  <div class="event">
    <div class="container-fluid parallax" ref="parallax">
      <!--<img :src="event_data.img_url" alt="" class="img-fluid" /> -->
    </div>
    <div class="container">
      <div class="event-info-wrapper">
        <span class="event-title">
          <h2>{{ event_data.name }}</h2>
        </span>
        <div class="info-group description">
          {{ event_data.description }}
        </div>
        <div class="info-group">
          <span class="info-title">Location</span>
          <span class="info-value">{{ event_data.location }}</span>
        </div>
        <div class="info-group">
          <span class="info-title">Venue</span>
          <span class="info-value">Placeholder</span>
        </div>
        <div class="info-group">
          <span class="info-title">Organizer</span>
          <span class="info-value">{{ event_data.organizer }}</span>
        </div>
      </div>
      <div class="info-group">
        <span class="info-title">Approvers</span>
        <span class="info-value">{{ event_data.approvers }}</span>
      </div>
      <div class="info-group">
        <span class="info-title">Price</span>
        <span class="info-value">{{ event_data.lowestPrice }} ETH</span>
      </div>
      <div class="return-arrow">
        <router-link to="/events">go back</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import getEvent from "./../util/mockData.js";

export default {
  name: "Event",
  data() {
    return {};
  },
  props: {},
  methods: {
    fetchEventInfo: function() {
      console.log(`fetching event info ${this.event_id}`);
      this.event_data = getEvent(this.event_id);
      console.log(`got event: ${this.event_data.name}`);
    },
  },
  created() {
    this.event_id = this.$route.params.id;
    this.fetchEventInfo();
  },
  mounted() {
    this.$refs[
      "parallax"
    ].style.backgroundImage = `url(${this.event_data.img_url})`;
  },
};
</script>

<style scoped>
.event-title {
  margin-top: 2rem;
  display: inline-block;
}
.description {
  margin-bottom: 2rem;
}
.info-title {
  display: inline-block;
  color: var(--accent);
  min-width: 100px;
}
.info-value {
  display: inline-block;
  color: var(--fg);
  min-width: 100px;
}
.event-info {
  padding: 10px;
}
.parallax {
  /* The image used */

  /* Set a specific height */
  min-height: 300px;

  /* Create the parallax scrolling effect */
  background-attachment: fixed;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}
</style>
