var data = localStorage.getItem("redditDataJSON");

// Parse the JSON data
var processed = JSON.parse(data);

var label = ["Upvotes","Downvotes"]
var upvotes = processed.upVotes;
var downvotes = processed.downEst;
var data = [upvotes,downvotes];

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
