var asyncRequest = true;

if (typeof XMLHttpRequest === 'undefined') {
    var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    // Node standalone code requires response before continuing to next post URL
    asyncRequest = false;
}

// TODO: refactor this, reuse download_raw() instead!
function download_raw_duplicates(url, parseDataCallback){
  var domain = new URL(url).hostname;
  // TODO: edge case handling
  if (String(domain).includes("reddit.com") && url.includes("/comments/"))
  {
      url = url.replace("/comments/", "/duplicates/");
      let duplicate_url = url + '.json';

      var xhttp = new XMLHttpRequest();

      xhttp.open("GET", duplicate_url, true);
      xhttp.setRequestHeader("Content-Type", "*/*");

      xhttp.onreadystatechange = function() {
        if (xhttp.readyState == 4) {
          if (xhttp.status == 200) {
            data = xhttp.responseText;
            localStorage.setItem("raw_duplicate", data);
          }

        }
      };
      xhttp.send();
      }

  }


function download_raw(url, parseDataCallback) {
    var domain = new URL(url).hostname;
    // TODO: edge case handling
    if (String(domain).includes("reddit.com") && (url.includes("/comments/") || url.includes("/duplicates/")))
    {
        let mainurl = url + '.json';

        var xhttp = new XMLHttpRequest();

        xhttp.open("GET", mainurl, asyncRequest);
        xhttp.setRequestHeader("Content-Type", "text/plain");

        xhttp.onreadystatechange = function() {
            if (xhttp.readyState == 4) {
                if (xhttp.status == 200) {
                    parseDataCallback(xhttp.responseText);
                } else {
                    parseDataCallback(null);
                }
            }
        };
        xhttp.send();
    } else {
        // Webpage isn't a reddit post
        parseDataCallback(null);
    }
}

function extract_urls(raw_text) {
    urls = [];



    return urls;
}

function process_links(data, processed) {
    var postLinks = [];
    processed.postLinks = [];

    // First, analyse the post itself
    // TODO: analyse comments for links too
    for (var i = 0, counti = data[0].data.children.length; i < counti; i++) {
        post = data[0].data.children[i].data.selftext;

        var foundIndex = 0;
        do {
            foundIndex = post.indexOf("://", foundIndex);
            if (foundIndex >= 0) {
                // First make sure link is http or https
                var isSecure = foundIndex > 4 && post.slice(foundIndex - 5, foundIndex) === "https";
                if (foundIndex >= 4 && post.slice(foundIndex - 4, foundIndex) === "http" || isSecure) {

                    // TODO: make sure foundindex - 5 or - 6 is valid
                    var hasOpenBracket = post[foundIndex - (isSecure ? 6 : 5)] == '(';
                    var numOpenBrackets = hasOpenBracket ? 1 : 0;

                    // TODO: search both http and https occurrences
                    // TODO: handle case where a link is followed by link markup e.g. https%3A%2F%2Fwww.reddit.com%2Fr%2Faww%2Fnew.json%5D(https%3A%2F%2Fwww.reddit.com%2Fr%2Faww%2Fnew.json%5D)
                    var url = isSecure ? "https" : "http";
                    var allowedCharacters = "!#$&'()*+,/:;=?@[]abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_.~%";
                    for (var c = foundIndex; c < post.length; c++) {

                        var cc = post[c].charCodeAt(0);
                        var isValid = (cc === 33 || (cc >= 35 && cc <= 59) ||
                        cc === 61 || (cc >= 63 && cc <= 91) ||
                        cc === 93 || cc === 95 ||
                        (cc >= 97 && cc <= 122) || cc === 126);

                        if (cc == 40) {
                            numOpenBrackets++;
                        }
                        if (cc == 41)
                        {
                            numOpenBrackets--;
                            if (numOpenBrackets <= 0 && hasOpenBracket)
                            {
                                isValid = false;
                            }
                        }

                        if (!isValid) {
                            break;
                        }

                        url = url + String(post[c]);
                    }

                    postLinks.push(url);
                }
                foundIndex += 1;
            }
        } while (foundIndex >= 0 && foundIndex < post.length);
    }

    console.log("Found links:\n" + String(postLinks));

    var query = "http://api.pushshift.io/reddit/submission/search/?q="

    rawPostLinks = [];
    // Now convert links to searchable URI strings and search with pushshift
    for (var i = 0, counti = postLinks.length; i < counti; i++) {
        rawPostLinks.push(postLinks[i]);
        postLinks[i] = encodeURIComponent(postLinks[i]);
        console.log("\nSearching Reddit for occurrence of link:\n" + postLinks[i]);

        var xhttp = new XMLHttpRequest();

        // TODO: try and make async queries to pushshift?
        xhttp.open("GET", query + postLinks[i], false);
        xhttp.setRequestHeader("Content-Type", "text/plain");

        xhttp.onreadystatechange = function() {
            if (xhttp.readyState == 4) {
                if (xhttp.status == 200) {
                    if (xhttp.responseText != null) {
                        results = JSON.parse(xhttp.responseText);
                        //console.log(results.data[0].full_link);

                        // Metadata for each processed link
                        processed.postLinks.push({
                            "url" : rawPostLinks[i],
                            "subreddits" : {},
                            "occurrences" : 0,
                            "numSubreddits" : 0
                        });

                        // Using the query results, determine occurrences and which subreddits the links appear in.
                        for (var j = 0, countj = results.data.length; j < countj; j++) {
                            processed.postLinks[i].occurrences++;
                            if (!(results.data[j].subreddit_id in processed.postLinks[i])) {
                                processed.postLinks[i].subreddits[results.data[j].subreddit_id] = {};
                                processed.postLinks[i].numSubreddits++;
                            }
                            processed.postLinks[i].subreddits[results.data[j].subreddit_id]["name"] = results.data[j].subreddit;
                            if (!("locations" in processed.postLinks[i].subreddits[results.data[j].subreddit_id])) {
                                processed.postLinks[i].subreddits[results.data[j].subreddit_id]["locations"] = [];
                            }
                            processed.postLinks[i].subreddits[results.data[j].subreddit_id].locations.push(
                                results.data[j].url
                            );
                        }
                    }
                }
            }
        };
        xhttp.send();

    }

}

function recursiveChild (processed, children) {

    for( var i=0; i <children.length; i++){
        if(Array.isArray(children[i].data.replies)) {
            recursiveChild(processed, children[i].data.replies.data.children);
        }
         //processing
        if (children[i].data.controversiality > 0){
            processed.contCount++;
        }

    }

}


function process_meta(data, processed) {
    //post
    processed["contCount"]=0;
    processed.date = new Date();
    processed.postDate = data[0].data.children[0].data.created_utc;
    processed.title = data[0].data.children[0].data.title;
    processed.upVotes =  data[0].data.children[0].data.ups;
    processed.downEst = Math.round(((processed.upVotes / (data[0].data.children[0].data.upvote_ratio * 100)) * 100) - processed.upVotes);
    processed.numComments = data[0].data.children[0].data.num_comments;
    processed.totalAwards = data[0].data.children[0].data.total_awards_received;
    processed.crossPosts = data[0].data.children[0].data.num_crossposts;
    //processed.count = recursiveChild(data[1].data.controversiality);
    //comments - in progress :)
    //processed.controversiality = data[1].data.children[0].data.controversiality;
    //processed.subreddit = data[1].data.children[0].data.subreddit;
    recursiveChild(processed, data[1].data.children);
}

function process_raw(raw_json) {
    var data = JSON.parse(raw_json);
    var processed = {};

    if (data.length > 0) {

        process_meta(data, processed);

        process_links(data, processed);

    }


    return JSON.stringify(processed);
}

if (typeof module !== 'undefined') {
    module.exports = { download_raw, process_raw };
}
