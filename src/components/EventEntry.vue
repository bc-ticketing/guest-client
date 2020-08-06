<template>
  <div class="event">
    <div class="event-wrapper">
      <div class="date-box">
        <div class="wrapper">
          <span class="month">{{ month }}</span>
          <span class="day">{{ dayInMonth }}</span>
        </div>
      </div>
      <div class="info-box">
        <span class="time">{{ weekday }} - {{ event_data.starttime }}</span>
        <span class="title">{{ event_data.name }}</span>
        <span class="location"
          >{{ event_data.venue }} - {{ event_data.location }}</span
        >
      </div>
      <div class="button-box" @click="goToDetails">
        <md-icon>arrow_forward_ios</md-icon>
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
    event_data: Object,
  },
  methods: {
    goToDetails: function() {
      this.$router.push({ name: "event", params: { id: this.event_data.id } });
    },
  },
  computed: {
    dayInMonth: function() {
      return this.event_data.date.split(".")[0];
    },
    weekday: function() {
      var d = new Date(
        this.event_data.date.split(".")[2],
        this.event_data.date.split(".")[1] - 1,
        this.event_data.date.split(".")[0]
      );
      console.log(d.getDay());
      return WEEKDAYS[d.getDay()];
    },
    month: function() {
      var d = new Date(
        this.event_data.date.split(".")[2],
        this.event_data.date.split(".")[1] - 1,
        this.event_data.date.split(".")[0]
      );
      console.log(d.getMonth());
      return MONTHS[d.getMonth()];
    },
  },
  mounted: function() {},
};
</script>

<style scoped>
.event-wrapper {
  display: grid;
  grid-template-columns: 80px 1fr 50px;
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
.date-box .month {
  text-transform: uppercase;
  margin-bottom: 5px;
}
.date-box .day {
  font-weight: bold;
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
  background-color: white;
}
</style>
