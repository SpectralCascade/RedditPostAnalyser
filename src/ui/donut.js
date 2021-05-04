import {Infographic} from './infographic.js';

class DonutChart extends Infographic {

	constructor(chart_id, title, width, height, data) {
        super(chart_id, 'doughnut', title, width, height, data);
	}

}

function generateDonutChart(processed) {
    var labels = ["No data available"];
    var totals = [1];

    var hasData = false;
    var hasLoaded = "links" in processed.stages && processed.stages.links >= 1;
    var output = [];
    if (hasLoaded) {
        for (let i = 0; i < processed.postLinks.length; i++) {
            var keys = Object.keys(processed.postLinks[i].subreddits);
            if (!hasData && keys.length > 0) {
                hasData = true;
                labels = [];
                totals = [];
            }
            for (let a = 0; a < keys.length; a++) {
                labels.push(processed.postLinks[i].subreddits[keys[a]].name);
                totals.push(processed.postLinks[i].subreddits[keys[a]].locations.length);
            }
        }
        output = [
            {
                name: "Link Occurrences",
                labels: labels,
                datasets: [
                    {
                        data: totals,
                        backgroundColor: [
                            'rgb(82,150,221)',
                            'rgb(255,99,20)'
                        ]
                    }
                ]
            }
        ];
    } else {
        output = [
            {
                name: "Loading..."
            }
        ];
    }
    
    return output;
}

// The line chart reference
var donut = null;

// Loads the chart data
function loadChartsData() {
    var processed = JSON.parse(localStorage.getItem("redditDataJSON"));

    if (donut == null) {
        donut = new DonutChart(
            "donut",
            "Donut Chart",
            400,
            400,
            generateDonutChart(processed)
        );
    } else {
        // Regenerate from the updated data
        donut.update(generateDonutChart(processed));
    }
}

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if ("action" in request && request.action == "ReloadData") {
        loadChartsData();
    }
    sendResponse(null);
});

// First time initialisation
loadChartsData();
