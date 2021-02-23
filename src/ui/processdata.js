var data = localStorage.getItem("redditDataJSON");

// Parse the JSON data
var processed = JSON.parse(data);
var date = new Date();
//document.write("<h1>Subreddit: " + obj[0].data.children[0].data.subreddit + "</h1>");
document.write("<p style=\"font-size: 24pt;\">Analysis of <strong>" + processed.title + "</strong></p>");
document.write("<h3>Generated on " + date + "</h3>");
document.write("<h3>Post Uploaded on " + processed.postDate + "</h3>");
document.write("<h3>Number of Comments: " + processed.numComments + "</h3>");
document.write("<h3>Total Awards: " + processed.totalAwards + "</h3>");
document.write("<h3>Number of CrossPosts:  " + processed.crossPosts + "</h3>");
document.write("<br /><h1>Upvotes: " + processed.upVotes + "</h1>");
//var totalUps = obj[0].data.children[0].data.ups;
document.write("<br /><h1>Downvotes (estimate): " + processed.downEst +
    "</h1>"
);



//document.write("<p style=\"text-align: left;\">" + data + "</p>");
