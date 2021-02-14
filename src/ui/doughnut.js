var data = localStorage.getItem("redditDataJSON");

// Parse the JSON data
var obj = JSON.parse(data);
//var date = new Date();

var label = ["Upvotes","Downvotes"]
var upvotes = obj[0].data.children[0].data.ups;
var downvotes = Math.round(((totalUps / (obj[0].data.children[0].data.upvote_ratio * 100)) * 100) - totalUps);
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
