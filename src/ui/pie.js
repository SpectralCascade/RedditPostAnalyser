import {Infographic} from './infographic.js';

class Pie extends Infographic {
  constructor(){
    super();
    var data = localStorage.getItem("redditDataJSON");
    var processed = JSON.parse(data);
    label = ["Upvotes","Downvotes"];
    var upvotes = processed.upVotes;
    var downvotes = processed.downEst;
    this.data = [upvotes,downvotes];
    this.context = document.getElementById("pie");
    this.myPieChart = new Chart(this.context, {
      type: 'pie',
      data: {
        labels: label,
        datasets: [
          {
            data: this.data,
            backgroundColor: [
                'rgb(54, 162, 235)',
                'rgb(255, 99, 132)'
              ],
          }
        ]
      }
    });
  }


}

var pie = new Pie();
