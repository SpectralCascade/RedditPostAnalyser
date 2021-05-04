import {Infographic} from './infographic.js';

class DonutChart extends Infographic {

	constructor(chart_id, title, width, height, data) {
        super(chart_id, 'doughnut', title, width, height, data);
	}

}

function generateDonutChart(processed) {
    var labels = {"links": [], "user_subreddits": []};
    var data = {"links": [], "user_subreddits": []};
    
    // Only allow a certain number of data points to be shown
    var dataLimit = 10;
    
    // Chart colours
    var colours = [
        'rgb(82,150,221)',
        'rgb(255,99,20)'
    ];

    // Check what stages are complete
    var hasLinksData = false;
    var hasCommentsData = false;
    var linksLoaded = "links" in processed.stages && processed.stages.links >= 1;
    var commentsLoaded = "comments" in processed.stages && processed.stages.comments >= 1;
    
    // Links data
    if (linksLoaded) {
        for (let i = 0; i < processed.postLinks.length; i++) {
            var keys = Object.keys(processed.postLinks[i].subreddits);
            if (!hasLinksData && keys.length > 0) {
                hasLinksData = true;
            }
            for (let a = 0; a < keys.length; a++) {
                if (labels.links.length < dataLimit) {
                    labels.links.push(processed.postLinks[i].subreddits[keys[a]].name);
                    data.links.push(processed.postLinks[i].subreddits[keys[a]].locations.length);
                } else if (labels.links.length == dataLimit) {
                    labels.links.push("Other links (" + (keys.length - a) + ")");
                    data.links.push(processed.postLinks[i].subreddits[keys[a]].locations.length);
                } else {
                    // Add to "Other links" section
                    data.links[dataLimit] += processed.postLinks[i].subreddits[keys[a]].locations.length;
                }
            }
        }
        
        if (!hasLinksData) {
            data.links = [-1];
            labels.links = ["No data available"];
        }
    }
    
    // User subreddits data
    if (commentsLoaded) {
        if (!hasCommentsData) {
            keys = Object.keys(processed.commenters.subreddits);
            
            var counti = keys.length;
            for (let i = 0; i < counti; i++) {
                if (labels.user_subreddits.length < dataLimit) {
                    labels.user_subreddits.push(keys[i]);
                    data.user_subreddits.push(processed.commenters.subreddits[keys[i]])
                } else if (labels.user_subreddits.length == dataLimit) {
                    labels.user_subreddits.push("Other subreddits (" + (keys.length - i) + ")");
                    data.user_subreddits.push(processed.commenters.subreddits[keys[i]]);
                } else {
                    // Add to "Other" section
                    data.user_subreddits[dataLimit] += processed.commenters.subreddits[keys[i]];
                }
            }
            
            if (counti > 0) {
                hasCommentsData = true;
            }
        }
        
        if (!hasCommentsData) {
            data.user_subreddits = [-1];
            labels.user_subreddits = ["No data available"];
        }
    }
    
    return [
        {
            name: "Link Occurrences",
            labels: labels.links,
            datasets: [
                {
                    data: data.links,
                    backgroundColor: colours
                }
            ]
        },
        {
            name: "Commenter Subreddits",
            labels: labels.user_subreddits,
            datasets: [
                {
                    data: data.user_subreddits,
                    backgroundColor: colours
                }
            ]
        }
    ];
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
