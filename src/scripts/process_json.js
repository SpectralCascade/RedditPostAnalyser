var asyncRequest = false;

if (typeof XMLHttpRequest === 'undefined') {
    var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    // Node standalone code requires response before continuing to next post URL
    asyncRequest = true;
}

var retries = {};
function retry_request(url, original_request, callback) {
    setTimeout(function() {
        if (retries[url] < 3) {
            retries[url]++;
            let xhttpr = new XMLHttpRequest();
            xhttpr.open("GET", url, asyncRequest);
            xhttp.setRequestHeader("Content-Type", "text/plain");
            xhttpr.onreadystatechange = function() { handle_http_response(url, xhttpr, callback); };
            console.log("HTTP response " + http_request.status);
            xhttpr.send();
        } else {
            console.log("ERROR: Reached maximum retry attempts for URL " + url);
            console.log("Response text: " + original_request.responseText);
            callback(null);
        }
    }, 500);
}

function handle_http_response(url, http_request, callback) {
    if (http_request.readyState == 4) {
        if (http_request.status == 200) {
            callback(http_request.responseText);
        } else if (http_request.status >= 301 && http_request.status <= 308) {
            // Redirect, make a new request
            let xhttpr = new XMLHttpRequest();
            xhttpr.open("GET", http_request.getResponseHeader("Location"), asyncRequest);
            xhttpr.setRequestHeader("Content-Type", "text/plain");
            xhttpr.onreadystatechange = function() { handle_http_response(http_request.getResponseHeader("Location"), xhttpr, callback); };
            console.log("REDIRECT - HTTP response " + http_request.status);
            xhttpr.send();
        } else {
            /*if (http_request.status == 0) {
                // Retry the request
                retry_request(url, http_request, callback);
            } else {*/
            console.log("ERROR: xhttp status = " + http_request.status);
            console.log("Response text: " + http_request.responseText);
            callback(null);
            //}
        }
    }
}

// Requests actively downloading.
download_requests = [];

// Asynchronous data download.
function download_raw(url, parseDataCallback) {
    url = encodeURI(url);
    var domain = new URL(url).hostname;
    // TODO: edge case handling
    if (String(domain).includes("reddit.com") && (url.includes("/comments/") || url.includes("/duplicates/") || url.includes("/user/") || url.includes("/u/")))
    {
        let mainurl = url + '.json';
        var xhttp = new XMLHttpRequest();
        download_requests.push(xhttp);
        
        xhttp.open("GET", mainurl, asyncRequest);
        
        xhttp.setRequestHeader("Content-Type", "text/plain");

        xhttp.onreadystatechange = function() { handle_http_response(mainurl, xhttp, parseDataCallback); };
        console.log("Sending HTTP request to " + mainurl);
        xhttp.send();
        
        return xhttp;
    }
    // Webpage isn't a reddit post
    console.log("ERROR: Webpage is not a Reddit JSON source.");
    parseDataCallback(null);
    return null;
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

        let xhttp = new XMLHttpRequest();

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

var totalCommentsProcessed = 0;
var complete = 0;
var stepCount = 1;
var recursiveSteps = 0;
var commentThreadIds = {};
var progression = 0;
var seenComments = new Set();

function recurseComments(processed, children, moreComments, onComplete) {
    recursiveSteps++;
    
    if (moreComments == null) {
        moreComments = [];
    }
    
    for (var i = 0; i < children.length && !(children[i] instanceof String); i++) {
        if (children[i].kind === "more") {
            for (var j = 0; j < children[i].data.children.length; j++) {
                if (!seenComments.has(children[i].data.children[j])) {
                    moreComments.push(children[i].data.children[j]);
                    seenComments.add(children[i].data.children[j]);
                }
            }
        } else {
            // Process replies
            if (children[i].data.replies != null && children[i].data.replies != "" && children[i].data.replies.data != null && children[i].data.replies.data.children != "") {
                recurseComments(processed, children[i].data.replies.data.children, moreComments, onComplete);
            }
            
            // Process individual comment data
            if (children[i].data.controversiality > 0) {
                processed.contCount++;
            }
            
            processed.comments.push({
                "timestamp" : children[i].data.created_utc,
                "controversial" : children[i].data.controversiality > 0
            });
            //console.log("timestamp = " + children[i].data.created_utc + ", date = " + new Date(children[i].data.created_utc));

            totalCommentsProcessed += 1;
        }
    }
    console.log("Processed " + totalCommentsProcessed + "/~" + processed.numComments + " comments.");
    
    // Download and process further comments
    for (i = 0; i < moreComments.length; i++) {
        // Make sure duplicates don't get processed.
        let id = moreComments[i];
        if (commentThreadIds[id] != 1) {
            stepCount++;
            commentThreadIds[id] = 1;
            progression++;
            console.log("Requesting comment " + id + " progression = " + progression);
            // Unfortunately Reddit requests are rate limited, hence delay.
            //setTimeout(function() {
                download_raw(processed.url + id, function(raw) {
                    progression--;
                    if (raw != null) {
                        // Add to the current JSON
                        recurseComments(processed, (JSON.parse(raw))[1], null, onComplete);
                    } else {
                        console.log("Failed to download comment thread " + id + "/");
                    }
                    console.log("Downloaded " + complete + "/" + stepCount + " comment threads. Processed " + totalCommentsProcessed + "/" + processed.numComments + " comments.");
                    complete++;
                });
            //}, stepCount);
        }
    }
    
    recursiveSteps--;
    if (recursiveSteps == 0 && progression == 0) {
        onComplete();
        stepCount = 1;
    }
}


function process_meta(data, processed) {
    // Basic post data
    totalCommentsProcessed = 0;
    processed["contCount"]=0; // num controversial comments
    processed.date = new Date(); // date now
    processed.subreddit = data[0].data.children[0].data.subreddit; // subreddit
    processed.url = "https://reddit.com" + data[0].data.children[0].data.permalink; // original post url
    processed.postDate = data[0].data.children[0].data.created_utc; // date post created
    processed.title = data[0].data.children[0].data.title; // title
    processed.upVotes =  data[0].data.children[0].data.ups; // net upvotes
    processed.downEst = Math.round(((processed.upVotes / (data[0].data.children[0].data.upvote_ratio * 100)) * 100) - processed.upVotes); // estimated downvotes
    processed.numComments = data[0].data.children[0].data.num_comments; // num comments
    processed.totalAwards = data[0].data.children[0].data.total_awards_received; // num awards
    processed.crossPosts = data[0].data.children[0].data.num_crossposts; // num crossposts
    processed.comments = [];
}

function process_duplicate_links(data, processed){
    let duplicate_url = processed.url.replace("/comments/", "/duplicates/");
    
    download_raw(duplicate_url, function(raw_json){
        if (raw_json == null){
            return;
        }
        data = JSON.parse(raw_json);
        processed.duplicates = {};
        processed.duplicates.url = [];
        processed.duplicates.data = [];
        c = 0;
        
        for (var i = 0; i < data[1].data.children.length; i++){
            if (processed.duplicates.url[i] == data[1].data.children[i].data.permalink){
                // Nothing needs to go here
            } else {
                processed.duplicates.url.push(data[1].data.children[i].data.permalink);
                c++;
            }
        }
    });
    
    for (var i = 0; i < processed.duplicates.url.length; i++){
        var repost_url = ("https://www.reddit.com" + processed.duplicates.url[i]);
        download_raw(repost_url, function(duplicate_json){
            processed.duplicates.data.push(JSON.parse(process_raw(duplicate_json, false)));
        });
    }
}

function process_raw(raw_json, onStageComplete, process_duplicates = true) {
    var data = JSON.parse(raw_json);
    var processed = {};

    if (data.length > 0) {

        // Main post data
        process_meta(data, processed);
        onStageComplete("meta", processed);
        
        // Comments
        recurseComments(
            processed,
            data[1].data.children,
            null, 
            function() {
                onStageComplete("comments", processed);
                // TODO: execute next processing step
                onStageComplete("FINISHED", processed);
            }
        );
        //console.log("total comments = " + processed.comments.length + " | total processed = " + totalCommentsProcessed);

    } else {
        onStageComplete("ERROR", null);
    }
}

/*function beginNextStage() {
    onStageComplete("comments", processed);

    // Links
    /*process_links(data, processed);
    onStageComplete("links", processed);
    
    // Reposts
    if (process_duplicates) {
        process_duplicate_links(data, processed);
    }
    onStageComplete("reposts", processed);
    onStageComplete("FINISHED", processed);
}*/

repost_json = [];
if (typeof module !== 'undefined') {
    module.exports = { download_raw, process_raw };
}
