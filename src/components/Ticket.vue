<template>
  <div
    class="ticket-wrapper"
    :style="{ backgroundImage: 'url(' + eventinfo.img_url + ')' }"
  >
    <div class="background-overlay"></div>
    <div class="ticket-content">
      <div class="event-title">
        <h3>{{ eventinfo.name }}</h3>
        <span class="date">
          {{ eventinfo.date }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Ticket",
  data() {
    return {};
  },
  props: {
    eventinfo: Object,
  },
  methods: {
    flipCard: function() {
      this.$refs["card"].classList.toggle("flipped");
    },
    goToDetails: function() {
      this.$router.push({ name: "event", params: { id: this.event_data.id } });
    },
  },
  computed: {},
  mounted: function() {},
};
</script>

<style scoped>
.ticket-content {
  padding: 10px;
  z-index: 1;
  position: relative;
}
.event-title {
  color: black !important;
  display: flex;
  justify-content: space-between;
}
.event-title h3 {
  margin-top: 0;
}
.ticket-wrapper {
  width: 100%;
  border-radius: 12px;
  height: 200px;
  background-position: center;
  background-size: contain;
  position: relative;
}
.background-overlay {
  position: absolute;
  height: 100%;
  width: 100%;
  background-color: white;
  border-radius: 12px;
  opacity: 0.5;
  z-index: 0;
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

.flip-card:hover .flip-card-inner,
.flip-card.flipped .flip-card-inner {
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
