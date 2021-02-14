var data = localStorage.getItem("redditDataJSON");

// Parse the JSON data
var obj = JSON.parse(data);
var date = new Date();
//document.write("<h1>Subreddit: " + obj[0].data.children[0].data.subreddit + "</h1>");
document.write("<p style=\"font-size: 24pt;\">Analysis of <strong>" + obj[0].data.children[0].data.title + "</strong></p>");
document.write("<h3>Generated on " + date + "</h3>");
document.write("<br /><h1>Upvotes: " + obj[0].data.children[0].data.ups + "</h1>");
var totalUps = obj[0].data.children[0].data.ups;
document.write("<br /><h1>Downvotes (estimate): " +
    Math.round(((totalUps / (obj[0].data.children[0].data.upvote_ratio * 100)) * 100) - totalUps) +
    "</h1>"
);



//document.write("<p style=\"text-align: left;\">" + data + "</p>");
