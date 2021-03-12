var data = localStorage.getItem("redditDataJSON");
//var duplicate = localStorage.getItem("raw_duplicate");
//var holder = localStorage.getItem("test1");
//var holder2 = localStorage.getItem("test2");
//holder = JSON.parse(holder);
// Parse the JSON data
var processed = JSON.parse(data);
//var duplicate_processed = JSON.parse(duplicate);
var date = new Date();
//document.write("<p>" + holder2.url + "</p>");    //For displaying raw JSON for counting brackets

//for (i =0; i < processed.duplicates.url.length; i++){
//  document.write("<p>" + processed.duplicates.url[i] + "</p>");    //For displaying JSON
//  document.write("<p>" + processed.duplicates.data[i].url + "</p>");    //For displaying JSON
//}

//document.write("<h1>Subreddit: " + obj[0].data.children[0].data.subreddit + "</h1>");
document.write("<p style=\"font-size: 24pt;\">Analysis of <strong>" + processed.title + "</strong></p>");
document.write("<h3>Generated on " + date + "</h3>");
document.write("<h3>Post Uploaded on " + processed.postDate + "</h3>");
document.write("<h3>Number of Comments: " + processed.numComments + "</h3>");
document.write("<h3>Total Awards: " + processed.totalAwards + "</h3>");
document.write("<h3>Number of CrossPosts:  " + processed.crossPosts + "</h3>");
document.write("<br /><h1>Upvotes: " + processed.upVotes + "</h1>");
//var totalUps = obj[0].data.children[0].data.ups;
document.write("<br /><h1>Downvotes (estimate): " + processed.downEst + "</h1>");
document.write("<br /><h1>Comments Controversiality: " + String(processed.contCount)+ "</h1>");

document.write("<br /><h3>Total links in post: " + processed.postLinks.length + "</h3>");

for (var i = 0; i < processed.postLinks.length; i++) {
    document.write("<br />Link: <a href=\"" + processed.postLinks[i].url + "\">" + processed.postLinks[i].url + "</a>");
    document.write("Occurrences: " + String(processed.postLinks[i].occurrences));
    document.write("Total subreddits: " + String(processed.postLinks[i].numSubreddits) + "<br /><br />");
}

//document.write("<p style=\"text-align: left;\">" + data + "</p>");
