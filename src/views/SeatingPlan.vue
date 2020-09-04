<template>
  <div class="seating-container" :ref='"cont"' @mouseup="disableMouseDown" @mousedown="enableMouseDown">
      <div class="col" v-for="col in cols" v-bind:key="'col_'+col">
          <div :ref='"seat_"+col+"_"+row' @mouseenter="mouseEnter(col, row)" @click="selectSeat(col, row)" class="seat" v-for="row in rows" v-bind:key="'seat_'+row"> </div>
      </div>
  </div>
</template>

<script>


export default {
  name: "Event",
  data() {
    return {
        rows: 12,
        cols: 5,
        selected_seats: [],
        mouseDown: false,
    };
  },
  props: {},
  computed: {
   
  },
  watch: {
    },
  methods: {
      disableMouseDown() {
          this.mouseDown = false;
      },
      enableMouseDown() {
          this.mouseDown = true;
      },
        mouseEnter(col, row) {
            if(this.mouseDown) {
                this.selectSeat(col, row);
            }
        },
      selectSeat(col, row) {
                    var seat = this.$refs[`seat_${col}_${row}`];
          seat[0].classList.add('selected');
      },
      getSeatStatus(col, row) {
          
      },
   
  },
  created() {
  },
  mounted() {
            this.$refs['cont'].style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;
            this.$refs['cont'].style.gridTemplateRows = `repeat(${this.rows}, 20px)`;
  },
};
</script>

<style scoped>
.seating-container {
    display: grid;
    grid-gap: 2px;
}
.seat {
    margin-bottom: 2px;
    background-color: green;
    height: 100%;
}
.seat:hover {
    background-color: gray;
}
.seat.occupied {
    background-color: darkgrey;
}
.seat.selected {
    background-color: darkolivegreen;
}

</style>
