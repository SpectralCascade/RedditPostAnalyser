import {Infographic} from './infographic.js';

class LineChart extends Infographic {

    constructor(chart_id, title, width, height, data) {
        super(chart_id, 'line', title, width, height, data);
    }

}


var processed = JSON.parse(localStorage.getItem("redditDataJSON"));

//Puts comments into array then sorts
var sortingArray = [];
for (var i = 1; i < processed.comments.length; i++){
  sortingArray.push([(processed.comments[i].timestamp * 1000), processed.comments[i].controversial]);
}
sortingArray.sort(function compare(a, b) {
  return a[0] - b[0];
});

//Puts sorted array into correct data format for displaying on chart
var controData = [];
var comments = [];
var controTotal = 0;
var sumTotal = 0;
for (var i = 1; i <sortingArray.length; i++){
  sumTotal++;
  if (sortingArray[i][1] === true){
    controTotal++;
  }
  controData.push({t: (new Date(sortingArray[i][0])), y: controTotal});
  comments.push({t: (new Date(sortingArray[i][0])), y: sumTotal});
}

var line = new LineChart(
    "line",
    "Line Chart",
    900,
    400,
    [
        {
            name: "Default",
            labels: [1500,1600,1700,1750,1800,1850,1900,1950,1999,2050],
            datasets: [
                {
                    data: [86,114,106,106,107,111,133,221,783,2478],
                    label: "Africa",
                    borderColor: "red",
                    fill: false
                },
                {
                    data: [282,350,411,502,635,809,947,1402,3700,5267],
                    label: "Asia",
                    borderColor: "green",
                    fill: false
                },
                {
                    data: [168,170,178,190,203,276,408,547,675,734],
                    label: "Europe",
                    borderColor: "blue",
                    fill: false
                },
                {
                    data: [40,20,10,16,24,38,74,167,508,784],
                    label: "Latin America",
                    borderColor: "orange",
                    fill: false
                },
                {
                    data: [6,3,2,2,7,26,82,172,312,433],
                    label: "North America",
                    borderColor: "#3e95cd",
                    fill: false
                }
            ]
        },
        {
            name: "Something Different",
            labels: [1, 2, 3, 4, 5, 6, 7, 8],
            datasets: [
                {
                    data: [92, 24, 256, 532, 222, 49, 1, 99, 993],
                    label: "Wowza",
                    borderColor: "red",
                    fill: false
                }
            ]
        },
        {
            name: "Comments",
            datasets:  [{
              label: 'Controversial Comments',
              borderColor: 'red',
              fill: false,
              data: controData
            },
            {
              label: 'Total Comments',
              borderColor: 'green',
              fill: false,
              data: comments
            }],
            options: {
              scales: {
                xAxes: [{
                  type: 'time',
                  distribution: 'linear',
                  scaleLabel: {
                    display: true,
                    labelString: 'Comment Post Time'
                  }
                }],
                yAxes: [{
                  scaleLabel: {
                    display: true,
                    labelString: 'Total Comments'
                  }
                }]
              }
            }
          },

    ]
);

/*options: {
  scales: {
    xAxis: [{
      type: 'time',
      time: {
        unit: 'hour',
        unitsize: '1',
        displayFormats: {
          'hour': 'MMM DD YYYY'
        }
      }
    }]
  }
}
*/
