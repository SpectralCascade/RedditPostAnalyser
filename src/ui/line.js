import {Infographic} from './infographic.js';

class LineChart extends Infographic
{
    constructor() {
        super();
        
        // Our labels along the x-axis
        this.years = [1500,1600,1700,1750,1800,1850,1900,1950,1999,2050];
        // For drawing the lines
        this.africa = [86,114,106,106,107,111,133,221,783,2478];
        this.asia = [282,350,411,502,635,809,947,1402,3700,5267];
        this.europe = [168,170,178,190,203,276,408,547,675,734];
        this.latinAmerica = [40,20,10,16,24,38,74,167,508,784];
        this.northAmerica = [6,3,2,2,7,26,82,172,312,433];
        
        this.context = document.getElementById("line");
        this.chart = new Chart(this.context, {
          type: 'line',
          data: {
            labels: this.years,
            datasets: [
              {
                data: this.africa,
                label: "Africa",
                borderColor: "red",
                fill: false
              },
              {
                data: this.asia,
                label: "Asia",
                borderColor: "green",
                fill: false
              },
              {
                data: this.europe,
                label: "Europe",
                borderColor: "blue",
                fill: false
              },
              {
                data: this.latinAmerica,
                label: "Latin America",
                borderColor: "orange",
                fill: false
              },
              {
                data: this.northAmerica,
                label: "North America",
                borderColor: "#3e95cd",
                fill: false
              }
            ]
          }
        });
    }

}

var line = new LineChart();
