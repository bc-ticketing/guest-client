<template>
  <div class="events">
    <div class="container-fluid"></div>
    <div class="container">
      <div class="event-list">
        <div class="event" v-for="event in events" v-bind:key="event.id">
          <div class="event-info">
            <h3>{{ event.name }}</h3>
            <div class="info-group">
              <span class="info-title">Date</span>
              <span class="info-value">{{ event.date }}</span>
            </div>
             <div class="info-group">
              <span class="info-title">Location</span>
              <span class="info-value">{{ event.location }}</span>
            </div>
            <div class="info-group">
              <span class="info-title">Price</span>
              <span class="info-value">{{ event.price }}</span>
            </div>
            <div class="info-group">
              <span class="info-title">Description</span>
              <span class="info-value">{{ event.description }}</span>
            </div>
             <div class="info-group">
              <span class="info-title">Organizer</span>
              <span class="info-value">{{ event.organizer }}</span>
            </div>
          </div>
          <div class="event-tickets">
            <div class="info-group">
              <Button v-bind:label="'Tickets'"></Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Button from './../components/basics/Button';

export default {
  name: "Events",
  components: {
    Button
  },
  data() {
    return {
      events: [
        {
          name: "Openair",
          Type: "Concert",
          price: "50-70",
          date: "15.12.20",
          location: "Zurich",
          id: "1",
          organizer: "Events Gmbh",
          description: "This will be an awesome open air if covid-19 does not fuck it up and it will be super cool for sure"
        },
        {
          name: "Theatre",
          Type: "Arts",
          price: "80",
          date: "03.05.20",
          location: "Zurich",
          id: "2",
          organizer: "Sick Theaters",
          description: "Sick Theaters will host this screening for the fist time since the covid outbreak and it will be super awesome so dont fucking miss it"
        }
      ],
    };
  },
};
</script>

<style scoped>
.event-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  grid-gap:20px;
}
.event {
  margin: 0.5rem 0 1rem 0;
  background-color: #fff;
  transition: box-shadow 0.25s;
  border-radius: 2px;
  box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.16), 0 2px 10px 0 rgba(0, 0, 0, 0.12);
}
.event-info {
  padding: 20px;
}
.event-tickets {
  padding:20px;
}
.event h3 {
  margin-bottom: 20px;
  margin-top: 0px;
}
.info-title {
  display: inline-block;
  color: var(--accent);
  min-width: 100px;
}
</style>
