var data = localStorage.getItem("redditDataJSON");
var processed = JSON.parse(data);
var date = new Date();

document.write("<div id = \"post_links\">");
document.write("<br /><h3>Total links in post: " + processed.postLinks.length + "</h3>");

for (var i = 0; i < processed.postLinks.length; i++) {
    document.write("<br />Link: <a href=\"" + processed.postLinks[i].url + "\">" + processed.postLinks[i].url + "</a>");
    document.write("Occurrences: " + String(processed.postLinks[i].occurrences));
    document.write("Total subreddits: " + String(processed.postLinks[i].numSubreddits) + "<br /><br />");
}
document.write("</div>");
