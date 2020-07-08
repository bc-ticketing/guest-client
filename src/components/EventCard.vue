<template>
  <div class="event">
    <div class="flip-card" ref="card">
      <div class="flip-card-inner">
        <div class="flip-card-front" @click="flipCard">
          <div class="img-container">
            <img :src="event_data.img_url" alt="" class="img-fluid" />
          </div>
          <div class="event-info">
            <div class="event-header">
              <h5>{{ event_data.name }}</h5>
              <span class="info-date">{{ event_data.date }}</span>
            </div>
            <div class="info-group">
              <span class="info-title">Location</span>
              <span class="info-value">{{ event_data.location }}</span>
            </div>
            <div class="info-group">
              <span class="info-title">Price</span>
              <span class="info-value">{{ event_data.lowestPrice }} ETH</span>
            </div>
            <div class="info-group">
              <span class="info-title">Conversion</span>
              <span class="info-value"
                >{{ event_data.lowestPrice * 250 }} CHF</span
              >
            </div>
          </div>
        </div>
        <!--
        <div class="show-preview">
          <span class="show-details" @click="toggleDetails(event_data.id)">
            Show details
          </span>
        </div>
        
        <div class="event-details" :ref="'details_' + event_data.id"></div>
        -->
        <div class="flip-card-back" @click="flipCard">
          <div class="event-info">
            <div class="info-group">
              <span class="info-value">{{ event_data.description }}</span>
            </div>
            <div class="info-group">
              <span class="info-title">Required Approvers</span>
              <span class="info-value">{{ event_data.approvers }}</span>
            </div>
            <div class="info-group">
              <span class="info-title">Organizer</span>
              <span class="info-value">{{ event_data.organizer }}</span>
            </div>
            <div class="event-tickets">
              <div class="info-group" id="ticket-link">
                <router-link
                  :to="{ name: '/event', params: { id: event_data.id } }"
                  >Tickets</router-link
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "EventCard",
  data() {
    return {};
  },
  props: {
    event_data: Object,
    name: String,
    date: String,
    location: String,
    price_eth: String,
    price_chf: String,
    organizer: String,
    description: String,
    approvers: Array,
    img_url: String,
  },
  methods: {
      flipCard: function() {
          this.$refs['card'].classList.toggle('flipped');
      }
  },
  computed: {},
  mounted: function() {},
};
</script>

<style scoped>
.event {
  background-color: #fff;
  transition: box-shadow 0.25s;
  border-radius: 1px;
  z-index: 10;
  transform: scale(1);
  transition: transform 0.3s linear;
}
.event.raised {
  transform: scale(1.05);
  z-index: 11;
}
.event-header {
  display: flex;
  justify-content: space-between;
}

.event-info {
  padding: 10px;
}

.event h3 {
  margin-bottom: 20px;
  margin-top: 0;
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
.flip-card-back .info-title {
  color: var(--accent);
}

/* Flipping animation */

.flip-card {
  background-color: transparent;
  height: 350px;
  perspective: 1000px;
}

.flip-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
}

.flip-card:hover .flip-card-inner, .flip-card.flipped .flip-card-inner {
  transform: rotateY(180deg);
}

.flip-card-front,
.flip-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}

.flip-card-back {
  border: 4px solid var(--accent);
  background-color: white;
  transform: rotateY(180deg);
}
</style>
