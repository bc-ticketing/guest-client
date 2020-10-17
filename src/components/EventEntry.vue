<template>
  <div class="event">
    <div class="event-wrapper" @click="goToDetails">
      <div class="date-box" :style="{ backgroundColor: event.color }">
        <div class="wrapper">
          <span class="month">{{ monthName }}</span>
          <span class="day">{{ event.getDay() }}</span>
        </div>
      </div>
      <div class="info-box">
        <span class="time">{{ weekday }} - {{ event.getTime() }}</span>
        <span class="title">{{ event.title }}</span>
        <span class="location">{{ event.location }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { WEEKDAYS, MONTHS } from "./../util/constants/constants.js";
export default {
  name: "EventEntry",
  data() {
    return {};
  },
  props: {
    event: Object,
  },
  methods: {
    goToDetails: function() {
      this.$router.push({
        name: "event",
        params: { id: this.event.contractAddress },
      });
    },
  },
  computed: {
    weekday: function() {
      return WEEKDAYS[this.event.getDay()];
    },
    monthName: function() {
      return MONTHS[this.event.getMonth()];
    },
    dateString: function() {
      return ``;
    },
  },
  mounted: function() {},
};
</script>

<style scoped>
.event-wrapper {
  display: flex;
  cursor: pointer;
}
.button-box {
  display: flex;
  justify-content: center;
  align-items: center;
}
.button-box .md-icon {
  color: #ffab40;
  cursor: pointer;
}
.button-box .date-box {
  display: flex;
  justify-content: center;
  align-items: top;
}
.date-box {
  border-radius: 10px;
  margin-right: 1rem;
  height: 80px;
  width: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.date-box .month {
  text-transform: uppercase;
  margin-bottom: 5px;
}
.date-box .day {
  font-weight: bold;
}
.info-box {
}
.date-box span {
  display: block;
  margin: auto;
  width: max-content;
}
.info-box span {
  display: block;
}
.info-box .time {
  opacity: 0.8;
  margin-bottom: 5px;
}
.info-box .title {
  margin-bottom: 5px;
}
.info-box .location {
  opacity: 0.6;
}
.event {
  padding: 20px 0;
}
</style>
