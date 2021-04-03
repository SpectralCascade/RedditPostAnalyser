import {Infographic} from './infographic.js';

class DonutChart extends Infographic {

	constructor(chart_id, title, width, height, data) {
        super(chart_id, 'doughnut', title, width, height, data);
	}

}

// Parse the JSON data
var processed = JSON.parse(localStorage.getItem("redditDataJSON"));
var labels = [];
var totals = [];

for (let i = 0; i < processed.postLinks.length; i++) {
    var keys = Object.keys(processed.postLinks[i].subreddits);
    for (let a = 0; a < keys.length; a++) {
        labels.push(processed.postLinks[i].subreddits[keys[a]].name);
        totals.push(processed.postLinks[i].subreddits[keys[a]].locations.length);
    }
}

// Create the chart
var donut = new DonutChart(
    "donut",
    "Donut Chart",
    400,
    400,
    [
        {
            name: "Link Occurrences",
            labels: labels,
            datasets: [
                {
                    data: totals,
                    backgroundColor: [
                        'rgb(54, 162, 235)',
                        'rgb(255, 99, 132)'
                    ]
                }
            ]
        },
        {
            name: "Loading animation"
        }
    ]
);
