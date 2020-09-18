<template>
  <div class="ticket-wrapper">
    <div
      class="ticket-img"
      :style="{ backgroundImage: `url(${ticketData.eventMetadata.event.img_url})` }"
    ></div>
    <div class="ticket-content">
      <div class="event-title">
        <h3>{{ ticketData.eventMetadata.event.title }}</h3>
        <span class="date">
          Date (WIP)
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
    ticketData: Object,
  },
  methods: {
    flipCard: function() {
      this.$refs["card"].classList.toggle("flipped");
    },
    goToDetails: function() {
      this.$router.push({
        name: "event",
        params: { id: this.ticketData.eventAddress },
      });
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
  color: white !important;
  display: flex;
  justify-content: space-between;
}
.event-title h3 {
  margin-top: 0;
}
.ticket-wrapper {
  height: 200px;

  position: relative;
}
.ticket-img {
  filter: blur(4px);
  height: 200px;
  background-position: center;
  background-size: contain;
  position: absolute;
  width: 100%;

  top: 0;
}
.ticket-img .nrTickets {
  color: white;
  font-size: 2rem;
}
.background-overlay {
  position: absolute;
  height: 100%;
  width: 100%;
  background-color: white;
  opacity: 0.5;
  z-index: 0;
}
</style>
