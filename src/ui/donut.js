import {Infographic} from './infographic.js';

class DonutChart extends Infographic {
    
	constructor() {
        super();
        
        var data = localStorage.getItem("redditDataJSON");

        // Parse the JSON data
        var processed = JSON.parse(data);
        var label = [];
        var data = [];

        for (let i = 0; i < processed.postLinks.length; i++) {
            var keys = Object.keys(processed.postLinks[i].subreddits);
            for (let a = 0; a < keys.length; a++) {
                label.push(processed.postLinks[i].subreddits[keys[a]].name);
                data.push(processed.postLinks[i].subreddits[keys[a]].locations.length);
            }   
        }
        
        this.context = document.getElementById("donut");
        this.chart = new Chart(this.context, {
            type: 'doughnut',
            data: {
            labels: label,
            datasets: [{
                data: data,
                backgroundColor: [
                'rgb(54, 162, 235)',
                'rgb(255, 99, 132)'
                ]}
            ]}
        });


	}

}
var donut = new DonutChart();
