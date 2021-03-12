import {Infographic} from './infographic.js';

class Pie extends Infographic {
  
    constructor(chart_id, title, width, height, data) {
        super(chart_id, title, width, height, data);
        var data = localStorage.getItem("redditDataJSON");
        var processed = JSON.parse(data);

        var label = ["Upvotes","Downvotes"];
        var upvotes = processed.upVotes;
        var downvotes = processed.downEst;
        this.data = [upvotes,downvotes];

        this.context = document.getElementById("pie");
        this.chart = new Chart(this.context, {
            type: 'pie',
            data: {
                labels: label,
                datasets: [{
                    data: this.data,
                    backgroundColor: [
                        'rgb(54, 162, 235)',
                        'rgb(255, 99, 132)'
                    ]
                }]
            }
        });
        
        this.populate = function (index) {
            console.log("virtual method called!");
        };
        
    }

}

var pie = new Pie(
    "pie",
    "Pie Chart",
    900,
    400,
    []
);
