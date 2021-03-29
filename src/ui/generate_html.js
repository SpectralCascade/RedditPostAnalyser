var data = localStorage.getItem("redditDataJSON");
var processed = JSON.parse(data);
var date = new Date();
date = date.toString()

// creates title and time of creation of data
document.getElementById("title_date").innerHTML = "<p style=\"font-size: 24pt;\">Analysis of <strong>" +
processed.title + "</strong></p>" +"<h3>Generated on " + date + "</h3";

post_date = new Date((processed.postDate*1000));
post_date = post_date.toString();
//  puts information in info div
document.getElementById("info").innerHTML =
"<p> Post Uploaded on " + post_date + "</p>" +
"<p>Number of Comments: " + processed.numComments + "</p>" +
"<p>Total Awards: " + processed.totalAwards + "</p>" +
"<p>Number of CrossPosts:  " + processed.crossPosts + "</p>" +
"<br /><p>Upvotes: " + processed.upVotes + "</p>" +
//var totalUps = obj[0].data.children[0].data.ups;
"<p>Downvotes (estimate): " + processed.downEst + "</p>" +
"<br /><p>Comments Controversiality: " + String(processed.contCount)+ "</p>" ;
