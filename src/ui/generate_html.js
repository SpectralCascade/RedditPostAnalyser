var titleDate = document.getElementById("title_date");
var info = document.getElementById("info");

function loadMeta() {
    var data = localStorage.getItem("redditDataJSON");
    var processed = JSON.parse(data);
    var date = new Date();
    date = date.toString();

    // creates title and time of creation of data
    titleDate.innerHTML = "<p style=\"font-size: 24pt;\">Analysis of <strong>" +
    processed.title + "</strong></p>" +"<h3>Generated on " + date + "</h3";

    post_date = new Date((processed.postDate*1000));
    post_date = post_date.toString();
    //  puts information in info div
    info.innerHTML =
    "<h2> Post Uploaded on " + post_date + "</h2>" +
    "<br /><h2>Upvotes: " + processed.upVotes + "</h2>" +
    "<h2>Downvotes (estimate): " + processed.downEst + "</h2>" +
    "<h2>Number of Comments: " + processed.numComments + "</h2>" +
    "<br /><h3>Total Awards: " + processed.totalAwards + "</h3>" +
    "<h3>Number of CrossPosts:  " + processed.crossPosts + "</h3>" +
    "<h3>Comments Controversiality: " + String(processed.contCount)+ "</h3>" ;
}

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if ("action" in request && request.action == "ReloadData") {
        loadMeta();
    }
    sendResponse(null);
});

loadMeta();
