var data = localStorage.getItem("redditDataJSON");
var processed = JSON.parse(data);
var label = ["Upvotes","Downvotes"]
var upvotes = processed.upVotes;
var downvotes = processed.downEst;
var data = [upvotes,downvotes];

var ctx = document.getElementById("pie");
var myPieChart = new Chart(ctx, {
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