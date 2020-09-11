<template>
<div class="wrapper">
    <div class="settings">
        <div class="menu-group">
            <h3>Venue Size</h3>
      <label for="rows">Rows:</label>
      <input type="number" name="rows" id="rows" v-model="rows">
        <label for="cols">Cols:</label>
      <input type="number" name="cols" id="cols" v-model="cols">
      
      </div>
                  <h3>Create new Ticket Type and Seating Plan</h3>

      <div class="menu-group">
            <label for="fungible">Fungible</label>
            <input type="radio" name="fungible" value=1 v-model.number="fungible">
            <label for="nonfungible">Non Fungible</label>
            <input type="radio" name="nonfungible" value=0 v-model.number="fungible">
      </div>
      <div class="menu-group" v-show="isFungible">
        <label for="nrTickets">Number of fungible tickets</label>
        <input type="text" name="nrFungible" v-model="nrFungible">
      </div>
      <div class="menu-group">
            <label for="name">Name</label>
            <input type="text" v-model="ticketName" placeholder="Ticket Category Name">
        </div>
        <div class="menu-group">
            <label for="price">Price</label>
            <input type="number" name="number" v-model="ticketPrice">
      </div>
      
  </div>
  <div class="seating-container" :ref='"cont"' @mouseup="disableMouseDown" @mousedown="enableMouseDown" @mouseleave="leaveGrid" draggable="false">
      <div class="col" v-for="col in cols" v-bind:key="'col_'+col">
          <div :ref='"seat_"+col+"_"+row' data-status='free' @mousedown="mouseDownOnTile(col, row)" @mouseup="mouseUpOnTile(col, row)" @mouseenter="mouseEnter(col, row)" @click="selectSeat(col, row)" class="seat" v-for="row in rows" v-bind:key="'seat_'+row"> </div>
      </div>
  </div>
  <div class="design-settings">
      <div class="section">
 <div class="menu-group">
                    <h3>Design Options</h3>

          <label for="color-selction">Color</label>
          <input class="radio-color yellow" type="radio" name='color-1' v-model="color" value="#D08770">
          <input class="radio-color orange" type="radio" name='color-2' v-model="color" value="#EBCB8B">
          <input class="radio-color red" type="radio" name='color-3' v-model="color" value="#bf616a">
      </div>
      <div class="menu-group">
          <label for="block-selection">Block selection</label>
          <input type="checkbox" v-model="block_selection" value=true>
      </div>
      <div class="menu-group">
          <button class='btn btn-danger' @click="resetAll">Reset</button>
          <button class='btn btn-success' @click="submit">Submit</button>
      </div>
      </div>
      <div class="section legend">
          <h3>Legend</h3>
          <div class="menu-group">
              <div class="seat free"></div>
              <span>Free</span>
          </div>
      </div>
     
  </div>

  
  </div>
</template>

<script>
/* This view is a demo for our seating plan generator, which will be used in the host client to let an event host generate somewhat accurate, yet arbitrary, seating plans for their venue. 
    The code will also be adapted and used in the guest client for displaying which seats are available for purchase to a customer.
 */

export default {
  name: "SeatingPlan",
  data() {
    return {
        nrFungible: 0,
        ticketPrice: 0,
        ticketName: '',
        color: '#B48EAD',
        emptyColor: '#8fbcbb',
        occupiedColor: '#4c566a',
        stageColor: '#d8dee9',
        block_selection: false,
        selection_start: {x: 0,y: 0},
        fungible: true,
        rows: 12,
        cols: 12,
        selected_seats: [],
        last_selected: {x: 0, y: 0},
        mouseDown: false,
        seatingObject: {
            rows:0,
            cols:0,
            assignedSeats: [],
        }
    };
  },
  props: {},
    computed: { 
        isFungible() {
            return this.fungible;
        }
  },
  /* Watch over rows and cols to adjust grid size dynamically */
  watch: {
      rows: function(val) {
          this.rows = Number(val);
          this.updateGridSize();
      },
      cols: function(val) {
          this.cols = Number(val);
          this.updateGridSize();
      }
    },
  methods: {
      // Update styles for the grid
      updateGridSize() {
          this.$refs['cont'].style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;
            this.$refs['cont'].style.gridTemplateRows = `repeat(${this.rows}, 20px)`;
      },
      // on mouse click release handler, if we are not on a tile we still want to act like we were on the previous tile
      disableMouseDown() {
          this.mouseUpOnTile(this.last_selected.x, this.last_selected.y);
      },
      // on mouse down handler
      enableMouseDown(event) {
          event.preventDefault();
          this.mouseDown = true;
          
      },
      // mouse down handler for when we are not on a tile
      mouseDownOnTile(col, row) {
          this.mouseDown = true;
          if(this.block_selection) {
              this.selection_start = {x: col, y: row};
          } else {
            this.selectSeat(col, row);
          }
      },
      // mouse release handler, check if we are doing block selection to select all tiles within the rectangle spaned by the starting and the releasing point
      mouseUpOnTile(col, row ){
          this.mouseDown = false;
          if(this.block_selection) {
              let start_x = this.selection_start.x < col ? this.selection_start.x : col;
                let start_y = this.selection_start.y < row ? this.selection_start.y : row;
                let end_x = this.selection_start.x > col ? this.selection_start.x : col;
                let end_y = this.selection_start.y > row ? this.selection_start.y : row;
               for(let i = start_x; i<= end_x; i++) {
                  for (let j = start_y; j <= end_y; j++) {
                      this.selectSeat(i,j);
                  }
              }
              this.removeAllTempSelections();
          }
          },
        // select a tile if we hover it while holding the mouse trigger 
        mouseEnter(col, row) {
            if(this.mouseDown) {
                if(this.block_selection) {
                    let start_x = this.selection_start.x < col ? this.selection_start.x : col;
                    let start_y = this.selection_start.y < row ? this.selection_start.y : row;
                    let end_x = this.selection_start.x > col ? this.selection_start.x : col;
                    let end_y = this.selection_start.y > row ? this.selection_start.y : row;
                    this.removeAllTempSelections();
                    for(let i = start_x; i<= end_x; i++) {
                        for (let j = start_y; j <= end_y; j++) {
                            this.markForSelection(i,j);
                        }
                    }
                } else {
                    this.selectSeat(col, row);
                }
            }
            
        },
        // mark a specific seat for the ticket type
      selectSeat(col, row) {
            var seat = this.$refs[`seat_${col}_${row}`];
            if(seat[0].dataset.status != 'occupied') {
          seat[0].dataset.status = 'selected';
          if(this.fungible) {
              seat[0].classList.add('fungible');
          }
          seat[0].style.backgroundColor = this.color;
            }


          this.last_selected = {x:col, y: row};
      },
      // mark a specific seat for temporary selection in the block selection
      markForSelection(col, row) {
            var seat = this.$refs[`seat_${col}_${row}`];
            if(seat[0].dataset.status != 'occupied') {
                seat[0].classList.add('temporary-selected');
            }
          
          this.last_selected = {x:col, y: row};
      },
      // clear all temporary selections
      removeAllTempSelections() {
          for (let i = 1; i <= this.cols; i++) {
              for (let j = 1; j <= this.rows; j++) {
                var seat = this.$refs[`seat_${i}_${j}`];
                seat[0].classList.remove('temporary-selected');
                //this.last_selected = {x:col, y: row};
              }
              
          }
      },
      // mouse grid leave handler
      leaveGrid() {
          this.mouseDown = false;
          if(this.block_selection) {
              this.mouseUpOnTile(this.last_selected.x, this.last_selected.y);
          }
      },
      // returns seat status: 'free', 'occupied'
      getSeatStatus(col, row) {
            var seat = this.$refs[`seat_${col}_${row}`];
            return seat[0].dataset.status;
      },
      // reset all selected but not yet assigned seats
      resetAll() {
        for (let i = 1; i <= this.cols; i++) {
            for (let j = 1; j <= this.rows; j++) {
                var seat = this.$refs[`seat_${i}_${j}`];
                if( this.getSeatStatus(i,j) != 'occupied'){
                    seat[0].dataset.status = 'free';
                    seat[0].style.backgroundColor = this.emptyColor;
                }
              }
              
          }
      },
      // TODO Michael: finish implementations with SC calls and IPFS uploads for host client
      submit() {
          let selected_seats = [];
        for (let i = 1; i <= this.cols; i++) {
            for (let j = 1; j <= this.rows; j++) {
                var seat = this.$refs[`seat_${i}_${j}`];
                    if(seat[0].dataset.status == 'selected') {
                        seat[0].dataset.status = 'occupied';
                        seat[0].style.backgroundColor = this.occupiedColor;
                        selected_seats.push(`${i}/${j}`);
                    }

                //this.last_selected = {x:col, y: row};
              }
              
          }
          console.log(JSON.stringify(selected_seats));
          /*
          selected_seats is a list of x/y coordinates. it contains all seats in the venue that have been marked for the ticket to be created
          for NF tickets: create 1 ticket per selected seat, store on ipfs for each ticket: the x/y index in the grid, the ticket address itself
          for F tickets: the host can select how many tickets should be created for the selected standing area and the ticket type. Store on IPFS: list of all indices of the seats (for frontend display on guest client).  
           */
          //TODO: call SC to create tickets + store metadata on ipfs including ticket mapping
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
.btn {
    padding: 0.75rem 1.5rem;
    border: none;
    margin-right: 2rem;
    margin-top: 1rem;
    cursor: pointer;
}
.btn-danger {
    background-color: #bf616a;
}
.btn-success {
    background-color: #a3be8c;
}
.radio-color.red{
    background-color: #bf616a;
}
.radio-color.yellow{
    background-color: #ebcb8b;
}
.radio-color.orange{
    background-color: #d08770;
}
.wrapper {
    width: 80%;
    margin: auto;
    max-width: 1440px;
}
.seating-container {
    width: max-content;

    display: grid;
    grid-gap: 2px;
}
.seat {
    margin-bottom: 2px;
    background-color: #8fbcbb;
    height: 100%;
    width: 20px;
}
.seat.fungible {
    transform: scale(1.06);
}
.legend .seat {
    display: inline-block;
    margin-right: 1rem;
    margin-bottom: 2px;
    background-color: #8fbcbb;
    height: 20px;
    width: 20px;
}
.seat:hover {
    background-color: gray;
}
.seat.occupied {
    background-color: red;
}
.seat.selected {
    background-color: blue;
}
.seat.temporary-selected {
    background-color: #88c0d0 !important;
}

</style>
