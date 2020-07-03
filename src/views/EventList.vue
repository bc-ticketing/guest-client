<template>
  <div class="events">
    <div class="container-fluid"></div>
    <div class="container">
      <div class="search-filter-wrapper">
        <div class="search-bar">TODO: search bar</div>
        <div class="filter-burger">filt</div>
      </div>
      <div class="event-list">
        <div class="event" v-for="event in events" v-bind:key="event.id">
          <div class="event-front">
            <div class="event-info">
              <span class="info-date">{{ event.date }}</span>
              <h5>{{ event.name }}</h5>
              <div class="info-group">
                <span class="info-title">Location</span>
                <span class="info-value">{{ event.location }}</span>
              </div>
              <div class="info-group">
                <span class="info-title">Price</span>
                <span class="info-value">{{ event.lowestPrice }} ETH</span>
              </div>
              <div class="info-group">
                <span class="info-title">Conversion</span>
                <span class="info-value"
                  >~{{ event.lowestPrice * 250 }} CHF</span
                >
              </div>
            </div>
            <div class="event-tickets">
              <div class="info-group" id="ticket-link">
                <router-link :to="{ name: '/event', params: { id: event.id } }"
                  >Tickets</router-link
                >
              </div>
            </div>
          </div>
          <div class="show-preview">
            <span class="show-details" @click="toggleDetails(event.id)">
              Show details
            </span>
          </div>
          <div class="event-details" :ref="'details_' + event.id">
            <div class="info-group">
              <span class="info-title">Required Approvers</span>
              <span class="info-value">{{ event.approvers }}</span>
            </div>
            <div class="info-group">
              <span class="info-title">Organizer</span>
              <span class="info-value">{{ event.organizer }}</span>
            </div>
            <div class="info-group">
              <span class="info-title">Description</span>
              <span class="info-value">{{ event.description }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import Button from "./../components/basics/Button";

export default {
  name: "EventList",
  // components: {
  //   Button
  // },
  data() {
    return {
      events: [
        {
          name: "Bastille",
          Type: "Concert",
          lowestPrice: "0.2",
          date: "15.12.20",
          location: "Zurich",
          id: "1",
          organizer: "Events Gmbh",
          description:
            "This will be an awesome open air if covid-19 does not fuck it up and it will be super cool for sure",
          approvers: "Idetix"
        },
        {
          name: "Theatre",
          Type: "Arts",
          lowestPrice: "0.35",
          date: "03.05.20",
          location: "Zurich",
          id: "2",
          organizer: "Sick Theaters",
          description:
            "Sick Theaters will host this screening for the fist time since the covid outbreak and it will be super awesome so dont fucking miss it",
          approvers: "SBB"
        },
        {
          name: "Robin Schulz",
          Type: "Concert",
          lowestPrice: "0.11",
          date: "04.05.20",
          location: "Zurich",
          id: "3",
          organizer: "GN",
          description: "",
          approvers: "Idetix"
        }
      ]
    };
  },
  methods: {
    toggleDetails: function(event_id) {
      var event = `details_${event_id}`;
      var element = this.$refs[event][0];
      if (element.classList.contains("open")) {
        element.classList.remove("open");
      } else {
        element.classList.add("open");
      }
    }
  }
};
</script>

<style scoped>
.search-filter-wrapper {
  /*margin-bottom: 0.1rem;*/
  /*margin-top: 0.1rem;*/
  display: inline;
}
.search-bar {
  display: inline-block;
  margin-left: 0.5rem;
  width: 85%;
  border: black dotted 0.001rem;
}
.filter-burger {
  float: right;
  margin-right: 0.5rem;
  border: black dotted 0.001rem;
}
.event-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}
.event {
  margin: 0.5rem 0.5rem 0.5rem 0.5rem;
  background-color: #fff;
  transition: box-shadow 0.25s;
  border-radius: 1px;
  box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.16), 0 2px 10px 0 rgba(0, 0, 0, 0.12);
}
.event-front {
  display: flex;
}
.event-tickets {
  margin-top: auto;
  margin-bottom: auto;
}
#ticket-link {
  margin-right: 1rem;
}
.event-details {
  margin-bottom: 1rem;
  max-height: 0;
  transition: max-height 0.5s linear;
  overflow: hidden;
}
.event-details.open {
  max-height: 500px;
}
.event-info {
  padding: 10px;
}
.info-group {
  float: left;
}
.show-details {
  border: 1px dashed black;
  display: block;
  margin: 1px;
  text-align: center;
  margin-top: 1rem;
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
  color: var(--accent);
  min-width: 100px;
}
</style>
