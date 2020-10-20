<template>
  <div class="chart-container">
    <canvas class="chart-canvas" :id="'canvas_' + chartId"></canvas>
  </div>
</template>
<script>
import { Chart } from "chart.js";
export default {
  data() {
    return {
      chart: {},
      options: {
        responsive: true,
        maintainAspectRation: true,
        elements: {
          point: {
            radius: 2,
          },
        },
        tooltips: {
          displayColors: false,
          callbacks: {
            title: function(tooltipItems) {
              var title = tooltipItems[0].xLabel || "";
              if (title) {
                title += "%";
                return title;
              }
            },
          },
        },
        legend: {
          display: false,
        },
        layout: {
          padding: {
            let: 0,
            right: 0,
            top: 0,
            bottom: 0,
          },
        },
        scales: {
          xAxes: [
            {
              maxBartThickness: 0,
              gridLines: {
                drawBorder: false,
                display: false,
              },
              ticks: {
                callback: function() {
                  return "";
                },
              },
            },
          ],
          yAxes: [
            {
              maxBartThickness: 0,
              gridLines: {
                drawBorder: false,
                display: false,
              },
              ticks: {
                beginAtZero: true,
                suggestedMax: 20,
                callback: function() {},
              },
            },
          ],
        },
      },
    };
  },
  props: { chartdata: Object, chartId: String },
  mounted() {
    this.createChart();
  },
  beforeCreate() {
    this.$root.$on("updateCharts", () => {
      console.log("updating");
      this.chart.data.datasets = this.chartdata.datasets;
      this.chart.update();
    });
  },
  methods: {
    createChart() {
      const ctx = document.getElementById("canvas_" + this.chartId);
      this.chart = new Chart(ctx, {
        type: "line",
        data: this.chartdata,
        options: this.options,
      });
    },
  },
};
</script>

<style scoped>
.chart-container {
  position: relative;
}
.chart-canvas {
  height: 120px;
  max-height: 120px;
}
</style>
