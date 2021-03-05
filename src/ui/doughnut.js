var data = localStorage.getItem("redditDataJSON");

// Parse the JSON data
var processed = JSON.parse(data);
var label = []
var data = [];

for (let i = 0; i < processed.postLinks.length; i++) {
  var keys = Object.keys(processed.postLinks[i].subreddits);
  for (let a = 0; a < keys.length; a++) {
  label.push(processed.postLinks[i].subreddits[keys[a]].name);
  data.push(processed.postLinks[i].subreddits[keys[a]].locations.length);
  }
  
}


var ctx = document.getElementById("doughnut");
var myDoughnutChart = new Chart(ctx, {
  type: 'doughnut',
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
