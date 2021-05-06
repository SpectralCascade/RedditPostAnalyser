import {Infographic} from './infographic.js';

class LineChart extends Infographic {

    constructor(chart_id, title, width, height, data) {
        super(chart_id, 'line', title, width, height, data);
    }

}

/** @namespace ChromeExtension */

/**
* Returns the JSON data for all of the time chart options
* @param {object} processed - The processed post data.
* @memberof ChromeExtension
*/
function generateTimeCharts(processed) {
    //Puts comments into array then sorts
    var sortingArray = [];
    for (var i = 1; i < processed.comments.length; i++){
        sortingArray.push([(processed.comments[i].timestamp * 1000), processed.comments[i].controversial]);
    }
    sortingArray.sort(function compare(a, b) {
        return a[0] - b[0];
    });

    //set up variables for calculating axis data
    //comments chart var
    var controData = [];
    var comments = [];
    var controTotal = 0;
    var sumTotal = 0;
    //incident var
    var incidentSum = 0;
    var incidentContro = 0;
    var incidentData = [];
    var incidentControData = [];
    //get first point time in ms, 5 mins = 300000ms
    var step = (((sortingArray[(sortingArray.length-1)][0]) - (sortingArray[0][0]))/((sortingArray.length)/2));

    var incidentStepCounter = sortingArray[0][0] + step;
    //var step = 300000;

    //Puts sorted array into correct data format for displaying on chart
    for (var i = 0; i <sortingArray.length; i++){
      sumTotal++;
      // 't' is x-axis but also t for time, y for y-axis
      if (i === 0){
        controData.push({t: (new Date(sortingArray[i][0])), y: controTotal});
      } else if (sortingArray[i][1] === true){
        controTotal++;
        controData.push({t: (new Date(sortingArray[i][0])), y: controTotal});
      } else if (i === (sortingArray.length - 1)){
        controData.push({t: (new Date(sortingArray[i][0])), y: controTotal});
      };
      comments.push({t: (new Date(sortingArray[i][0])), y: sumTotal});

      //start of incident data calculation, sum every step amount of time that passes
      if (sortingArray[i][0] < incidentStepCounter){
        incidentSum++;
      };
      if (sortingArray[i][1] === true){
        incidentContro++;
      };
      if (sortingArray[i][0] >= incidentStepCounter){
        incidentData.push({t: (new Date((incidentStepCounter - (step/2)))), y: incidentSum});
        incidentControData.push({t: (new Date((incidentStepCounter - (step/2)))), y: incidentContro});
        incidentSum = 0;
        incidentContro = 0;
        while (sortingArray[i][0] > (incidentStepCounter) ){
          incidentStepCounter = incidentStepCounter + step;
        };
      };
    }

    //duplicates var
    var duplicatesSum = 0;
    var duplicatesContro = 0;
    var duplicatesData = [];
    var sortingArray2 = [];
    var pointLabels = [];

    if (processed.duplicates.url == []){
      duplicatesData.push({t:(new Date(processed.postDate * 1000)), y :0});
    } else {
      for (var i=0; i < processed.duplicates.url.length; i++){
        sortingArray2.push([(processed.duplicates.data[i].postDate * 1000), processed.duplicates.data[i].title]);
      }
      sortingArray2.sort(function compare(a, b) {
          return a[0] - b[0];
      });

      for (var i=0; i < sortingArray2.length; i++){
        duplicatesSum++;
        duplicatesData.push({t:(new Date(sortingArray2[i][0])), y: duplicatesSum});
        pointLabels.push(sortingArray2[i][1]);
      }
    };

    var displayStep = Math.round(step/60000);
    return [
            {
              name: "Comments",
              datasets:  [{
                label: 'Controversial Comments',
                borderColor: '#ff6314',
                fill: false,
                data: controData
              },
              {
                label: 'Total Comments',
                borderColor: '#5296dd',
                fill: false,
                data: comments
              }],
              options: {
                title: {
                  display: true,
                  text: 'Comments over Time',
                  fontSize: 20,
              },
                scales: {
                  xAxes: [{
                    type: 'time',
                    time: {
                      unit: 'minute',
                      unitStepSize: 30,
                    },
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
            {
                name: "Incident Comments",
                datasets:  [{
                  label: 'Controversial Comments',
                  borderColor: '#ff6314',
                  fill: false,
                  data: incidentControData
                },
                {
                  label: 'Total Comments',
                  borderColor: '#5296dd',
                  fill: false,
                  data: incidentData
                }],
                options: {
                  title: {
                    display: true,
                    text: 'Incident Comments over Time',
                    fontSize: 20,
                },
                  scales: {
                    xAxes: [{
                      type: 'time',
                      time: {
                        unit: 'minute',
                        unitStepSize: 30,
                      },
                      distribution: 'linear',
                      scaleLabel: {
                        display: true,
                        labelString: 'Rolling ' + displayStep + ' min(s) Comment Post Time'
                      }
                    }],
                    yAxes: [{
                      scaleLabel: {
                        display: true,
                        labelString: 'Total Comments per ' + displayStep + ' min(s)'
                      }
                    }]
                  },
                  elements: {
                    point:{
                      radius: 0
                    }
                  }
                }
              },
              {
                name: "Reposts over Time",
                datasets:  [{
                  label: 'Reposts',
                  borderColor: '#ff6314',
                  fill: false,
                  data: duplicatesData
                }],
                options: {
                  title: {
                    display: true,
                    text: 'Reposts over Time',
                    fontSize: 20,
                },
                  scales: {
                    xAxes: [{
                      type: 'time',
                      time: {
                        unit: 'minute',
                        unitStepSize: 30,
                      },
                      distribution: 'linear',
                      scaleLabel: {
                        display: true,
                        labelString: 'Repost Post Time'
                      }
                    }],
                    yAxes: [{
                      scaleLabel: {
                        display: true,
                        labelString: 'Total Reposts'
                      }
                    }]
                  }
                }
              }
            ]
}

// The line chart reference
var line = null;

// Loads the chart data
function loadChartsData() {
    var processed = JSON.parse(localStorage.getItem("redditDataJSON"));

    if (line == null) {
        line = new LineChart(
            "line",
            "",
            900,
            400,
            generateTimeCharts(processed)
        );
    } else {
        // Regenerate from the updated data
        line.update(generateTimeCharts(processed));
    }
}

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if ("action" in request && request.action == "ReloadData") {
        loadChartsData();
    }
    sendResponse(null);
});

// First time initialisation
loadChartsData();
