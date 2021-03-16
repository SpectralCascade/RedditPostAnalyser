var data = localStorage.getItem("redditDataJSON");
var processed = JSON.parse(data);
var date = new Date();

//for (i =0; i < processed.duplicates.url.length; i++){
//  document.write("<p>" + processed.duplicates.url[i] + "</p>");    //For displaying JSON
//  document.write("<p>" + processed.duplicates.data[i].url + "</p>");    //For displaying JSON
//}

document.write("<div id = \"title_date\">");
document.write("<p style=\"font-size: 24pt;\">Analysis of <strong>" + processed.title + "</strong></p>");
document.write("<h3>Generated on " + date + "</h3>");
document.write("</div>");
