<template>
  <div class="container-fluid inventory">
    <div class="ticket-preview">
      <Ticket v-bind:eventinfo="activeTicket" />
    </div>
    <div class="ticket-swiper">
      <div class="swiper-container">
        <!-- Additional required wrapper -->
        <div class="swiper-wrapper">
          <!-- Slides -->
          <div
            class="swiper-slide"
            v-for="(ticket, index) in tickets"
            v-bind:key="index"
          >
            <div
              class="img"
              :style="{ backgroundImage: 'url(' + ticket.img_url + ')' }"
            ></div>
            <div class="info">
              <span class="title">{{ ticket.name }}</span>
              <span class="date">{{ ticket.date }}</span>
              <span class="location">{{ ticket.location }}</span>
            </div>
          </div>
        </div>
        <div class="swiper-pagination"></div>
      </div>
    </div>
    <div class="ticket-list"></div>
  </div>
</template>

<script>
import Ticket from "./../components/Ticket";
import Swiper, { Pagination } from "swiper";
Swiper.use([Pagination]);
import "swiper/swiper-bundle.css";

export default {
  name: "Inventory",
  data() {
    return {
      activeTicket: undefined,
      activeSlide: 0,
      tickets: [
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
          approvers: "Idetix",
          img_url: require("@/assets/event_img/event_1.jpg"),
        },
        {
          name: "Robin",
          Type: "Concert",
          lowestPrice: "0.2",
          date: "15.12.20",
          location: "Zurich",
          id: "1",
          organizer: "Events Gmbh",
          description:
            "This will be an awesome open air if covid-19 does not fuck it up and it will be super cool for sure",
          approvers: "Idetix",
          img_url: require("@/assets/event_img/event_1.jpg"),
        },
      ],
    };
  },
  components: {
    Ticket,
  },
  methods: {},
  created: function() {
    this.activeTicket = this.tickets[0];
  },
  mounted: function() {
    this.swiper = new Swiper(".swiper-container", {
      slidesPerView: 1,
      spaceBetween: 10,
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
    });
    this.swiper.on("slideChange", () => {
      console.log("active slide = " + this.swiper.activeIndex);
      this.activeSlide = this.swiper.activeIndex;
      this.activeTicket = this.tickets[this.activeSlide];
    });
  },
};
</script>

<style>
.inventory {
  height: 90vh;
  position: relative;
}
.ticket-swiper {
  width: 90%;
  margin: auto;
  height: 200px;
  position: absolute;
  bottom: 0;
  left: 5%;
}
.swiper-container {
  width: 100%;
  height: 100%;
}

.ticket-swiper .swiper-slide {
  height: 80%;
  border-radius: 12px;
  width: 100%;
  background-color: whitesmoke;
  display: grid;
  grid-template-columns: 1fr 1fr;
}
.ticket-swiper .swiper-slide .img {
  background-position: center;
  background-size: cover;
  border-top-left-radius: 12px;
  border-bottom-left-radius: 12px;
  height: 100%;
}
.ticket-swiper .swiper-slide .info {
  padding: 10px;
}
.swiper-slide .info span {
  display: block;
}
.ticket-swiper .swiper-pagination-bullet-active {
  background: var(--accent);
}
</style>
