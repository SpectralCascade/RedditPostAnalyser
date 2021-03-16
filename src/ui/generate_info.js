var data = localStorage.getItem("redditDataJSON");
var processed = JSON.parse(data);
var date = new Date();

document.write("<div id = \"info\">");
document.write("<h3>Post Uploaded on " + processed.postDate + "</h3>");
document.write("<h3>Number of Comments: " + processed.numComments + "</h3>");
document.write("<h3>Total Awards: " + processed.totalAwards + "</h3>");
document.write("<h3>Number of CrossPosts:  " + processed.crossPosts + "</h3>");
document.write("<br /><h3>Upvotes: " + processed.upVotes + "</h3>");
//var totalUps = obj[0].data.children[0].data.ups;
document.write("<br /><h3>Downvotes (estimate): " + processed.downEst + "</h3>");
document.write("<br /><h3>Comments Controversiality: " + String(processed.contCount)+ "</h3>");
document.write("</div>");
