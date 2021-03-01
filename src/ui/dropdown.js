var data = localStorage.getItem("redditDataJSON");
var processed = JSON.parse(data);
var myChart = null;

function line(){
  if (myChart != null){
    myChart.destroy();
  }
  // Our labels along the x-axis
  var years = [1500,1600,1700,1750,1800,1850,1900,1950,1999,2050];
  // For drawing the lines
  var africa = [86,114,106,106,107,111,133,221,783,2478];
  var asia = [282,350,411,502,635,809,947,1402,3700,5267];
  var europe = [168,170,178,190,203,276,408,547,675,734];
  var latinAmerica = [40,20,10,16,24,38,74,167,508,784];
  var northAmerica = [6,3,2,2,7,26,82,172,312,433];

  var ctx = document.getElementById("test");
  myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: years,
      datasets: [
        {
          data: africa,
          label: "Africa",
          borderColor: "red",
          fill: false
        },
        {
          data: asia,
          label: "Asia",
          borderColor: "green",
          fill: false
        },
        {
          data: europe,
          label: "Europe",
          borderColor: "blue",
          fill: false
        },
        {
          data: latinAmerica,
          label: "Latin America",
          borderColor: "orange",
          fill: false
        },
        {
          data: northAmerica,
          label: "North America",
          borderColor: "#3e95cd",
          fill: false
        }
      ]
    }
  });

}

function pie(){
  if (myChart != null){
    myChart.destroy();
  }
  var label = ["Upvotes","Downvotes"]
  var upvotes = processed.upVotes;
  var downvotes = processed.downEst;
  var data = [upvotes,downvotes];

  var ctx = document.getElementById("test");
  myChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: label,
      datasets: [
        {
          data: data,
          backgroundColor: [
              'rgb(54, 162, 235)',
              'rgb(255, 99, 132)'
            ],
        }
      ]
    }
  });
}

const selectElement = document.querySelector('.charts');
selectElement.addEventListener('change', (event) => {
  const result = document.querySelector('.result');
  var selected = event.target.value;
  String(selected);
  if (selected === 'line'){
    line();
  } else if (selected === 'pie'){
    pie();
  }
});
