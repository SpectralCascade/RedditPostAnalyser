var data = localStorage.getItem("redditDataJSON");
var processed = JSON.parse(data);
var date = new Date();

// creates title and time of creation of data
document.getElementById("title_date").innerHTML = "<p style=\"font-size: 24pt;\">Analysis of <strong>" +
processed.title + "</strong></p>" +
"<h3>Generated on " + date + "</h3>";

//  puts information in info div
document.getElementById("info").innerHTML =
"<h3>Post Uploaded on " + processed.postDate + "</h3>" +
"<h3>Number of Comments: " + processed.numComments + "</h3>" +
"<h3>Total Awards: " + processed.totalAwards + "</h3>" +
"<h3>Number of CrossPosts:  " + processed.crossPosts + "</h3>" +
"<br /><h3>Upvotes: " + processed.upVotes + "</h3>" +
//var totalUps = obj[0].data.children[0].data.ups;
"<br /><h3>Downvotes (estimate): " + processed.downEst + "</h3>" +
"<br /><h3>Comments Controversiality: " + String(processed.contCount)+ "</h3>";
