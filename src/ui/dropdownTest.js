var ctx = document.getElementById("myChart").getContext("2d");
 ctx.canvas.width = 600;
 ctx.canvas.height = 200;

 var dataMap = {
     'line': {
         method: 'Line',
         data: {
             labels: ["January", "February", "March", "April", "May", "June", "July"],
             datasets: [{
                 label: "My First dataset",
                 fillColor: "rgba(220,220,220,0.5)",
                 strokeColor: "rgba(220,220,220,0.8)",
                 highlightFill: "rgba(220,220,220,0.75)",
                 highlightStroke: "rgba(220,220,220,1)",
                 data: [65, 59, 80, 81, 56, 55, 40]
             }, {
                 label: "My Second dataset",
                 fillColor: "rgba(151,187,205,0.5)",
                 strokeColor: "rgba(151,187,205,0.8)",
                 highlightFill: "rgba(151,187,205,0.75)",
                 highlightStroke: "rgba(151,187,205,1)",
                 data: [28, 48, 40, 19, 86, 27, 90]
             }],
         }
     },
     'pie': {
         method: 'Pie',
         data: [{
             value: 300,
             color: "#F7464A",
             highlight: "#FF5A5E",
             label: "Red"
         }, {
             value: 50,
             color: "#46BFBD",
             highlight: "#5AD3D1",
             label: "Green"
         }, {
             value: 100,
             color: "#FDB45C",
             highlight: "#FFC870",
             label: "Yellow"
         }]
     }
 };

var currentChart;

 function updateChart() {
     if(currentChart){currentChart.destroy();}

     var determineChart = $("#chartType").val();

     var params = dataMap[determineChart]
     currentChart = new Chart(ctx)[params.method](params.data, {});
 }

 $('#chartType').on('change', updateChart)
 updateChart();
