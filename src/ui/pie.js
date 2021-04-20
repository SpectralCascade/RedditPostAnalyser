import {Infographic} from './infographic.js';

class Pie extends Infographic {

    constructor(chart_id, title, width, height, data) {
        super(chart_id, 'pie', title, width, height, data);
    }

}

var processed = JSON.parse(localStorage.getItem("redditDataJSON"));

var pie = new Pie(
    "pie",
    "Upvotes/ Downvotes",
    400,
    400,
    [
        {
            name: "Upvotes/Downvotes",
            labels: ["Upvotes","Downvotes"],
            datasets: [{
                data: [processed.upVotes, processed.downEst],
                backgroundColor: [
                    'rgb(82,150,221)',
                    'rgb(255,99,20)'
                ]
            }]
        }
    ]
);
