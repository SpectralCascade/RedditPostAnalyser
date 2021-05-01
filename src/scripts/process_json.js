var asyncRequest = true;

/** Defines the logging level; 0 = verbose, 1 = warnings, 2 = errors, 3 = none */
var logging = 0;

if (typeof XMLHttpRequest === 'undefined') {
    var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
}

var retries = {};

/** @namespace Processing */

/**
 * Set the console logging level.
 *@param {int} level - What log level to use.
 * 0 = verbose, 1 = warnings, 2 = errors, 3 = none
 *@memberof Processing
 */
function setLogLevel(level) {
    logging = level;
}

/**
 * Custom console logging.
 */
var log = function(level = 0){
    if (level >= logging) {
        console.log.apply(console, arguments);
    }
}

function wait(ms, onFinish) {
    if(asyncRequest){
        setTimeout(onFinish, ms);
    }else{
        date = new Date();
        while((new Date()) - date <= ms){
            /** wait here */
        }
        onFinish();
    }
}

/**
 * The retry_request function takes the url and tries to make an HTTP request up to three times with a 500ms delay.
 *@param {string} url - The url of the page.
 *@param {string} original_request - The original request.
 *@param {function} callback - A callback function called when the request is finished.
 *@memberof Processing
 */
function retry_request(url, original_request, callback, waitTime) {
    onWait = function() {
        if (retries[url] < 3) {
            retries[url]++;
            let xhttpr = new XMLHttpRequest();
            xhttpr.open("GET", url, asyncRequest);
            xhttp.setRequestHeader("Content-Type", "text/plain");
            xhttpr.onreadystatechange = function() { handle_http_response(url, xhttpr, callback); };
            log("HTTP response " + original_request.status);
            xhttpr.send();
        } else {
            log(2, "ERROR: Reached maximum retry attempts for URL " + url);
            log(2, "Response text: " + original_request.responseText);
            callback(null, original_request.status);
        }
    };
    wait(waitTime, onWait);


}

/**
 * The handle_http_response function checks the ready state of the request and responds appropriately.
 *@param {string} url - The url of the page.
 *@param {object} http_request - The http request.
 *@param {function} callback - A callback function called when the request is finished.
 *@memberof Processing
 */

function handle_http_response(url, http_request, callback) {
    if (http_request.readyState == 4) {
        if (http_request.status == 200) {
            callback(http_request.responseText, http_request.status);
        } else if (http_request.status >= 301 && http_request.status <= 308) {
            // Redirect, make a new request
            let xhttpr = new XMLHttpRequest();
            let mainurl = http_request.getResponseHeader("Location");
            xhttpr.open("GET", mainurl, asyncRequest);
            xhttpr.setRequestHeader("Content-Type", "text/plain");
            xhttpr.onreadystatechange = function() { handle_http_response(mainurl, xhttpr, callback); };
            log("REDIRECT - HTTP response " + http_request.status + " - NEW URL: " + mainurl);
            xhttpr.send();
        } else if (http_request.status == 429) {
            retry_request(url, http_request, callback, 5000);

        }
        else {
            /*if (http_request.status == 0) {
                // Retry the request
                retry_request(url, http_request, callback);
            } else {*/
            log(2, "ERROR: xhttp status = " + http_request.status);
            log(2, "Response text: " + http_request.responseText);
            callback(null, http_request.status);
            //}
        }
    }
}

// Requests actively downloading.
//download_requests = [];


// Asynchronous data download.

/**
* This function downloads data from the URL input as JSON
* @param {string} url - The url of the reddit post.
* @param {function} parseDataCallback - A callback which parses the downloaded data. If data is null, an error has occurred.
 *@memberof Processing
*/

function download_raw(url, parseDataCallback, extension = ".json") {
    url = encodeURI(url);
    var domain = new URL(url).hostname;
    // TODO: edge case handling
    if (String(domain).includes("pushshift.io") || (String(domain).includes("reddit.com") && (url.includes("/comments/") || url.includes("/duplicates/") || url.includes("/user/") || url.includes("/u/"))))
    {
        let mainurl = url + extension;
        var xhttp = new XMLHttpRequest();
        //download_requests.push(xhttp);

        xhttp.open("GET", mainurl, asyncRequest);

        xhttp.setRequestHeader("Content-Type", "text/plain");

        xhttp.onreadystatechange = function() { handle_http_response(mainurl, xhttp, parseDataCallback); };
        log("Sending HTTP request to " + mainurl);
        xhttp.send();

        return xhttp;
    }
    // Webpage isn't on Reddit or Pushshift
    log(2, "ERROR: Webpage is not a valid data source.");
    parseDataCallback(null);
    return null;
}


 /**
  * The extract_urls function looks up text and extracts urls into a list.
  *@param {array} post - The list of urls.
  *@memberof Processing
  */

function extract_urls(post) {
    var postLinks = [];

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
                total_links++;
            }
            foundIndex += 1;
        }
    } while (foundIndex >= 0 && foundIndex < post.length);

    return postLinks;
}



var total_links = 0;


 /**
  * The proccess_links function analyses the links within a post and queries to pushshift to extract data and determine occurences of these links across reddit.
  *@param {string} data - The raw json data.
  *@param {string} proccessed - The processed json data.
  *@param {function} onComplete - The callback function executed when processing of links is finished.
  *@memberof Processing
  */

function process_links(data, processed, onComplete) {
    var postLinks = [];
    processed.postLinks = [];

    // First, analyse the post itself
    for (var i = 0, counti = data[0].data.children.length; i < counti; i++) {
        post = data[0].data.children[i].data.selftext;

        postLinks = extract_urls(post);
    }

    log("Found links:");
    for (plink in postLinks) {
        log(String(plink) + ": " + String(postLinks[plink]));
    }

    var query = "http://api.pushshift.io/reddit/submission/search/?q="

    rawPostLinks = [];
    if (postLinks.length == 0) {
        onComplete();
    }
    // Now convert links to searchable URI strings and search with pushshift
    for (let i = 0, counti = postLinks.length; i < counti; i++) {
        rawPostLinks.push(postLinks[i]);
        postLinks[i] = encodeURIComponent(postLinks[i]);
        log("\nSearching Reddit for occurrence of link:\n" + postLinks[i]);

        download_raw(query + postLinks[i], function(raw, httpCode) {
            total_links--;
            if (raw == null) {
                log(1, "WARNING: Failed link query.");
            } else {
                results = JSON.parse(raw);

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
                log("Received link query results for URL: " + rawPostLinks[i]);
            }
            // Once there are no more links to process, complete this stage.
            if (total_links <= 0) {
                onComplete();
            }

        }, "");

    }

}

var totalCommentsProcessed = 0;
var complete = 0;
var stepCount = 0;
var recursiveSteps = 0;
var commentThreadIds = {};
var progression = 0;
var other_downloads = 0;
var allSubreddits = {};
var allCommenterNames = {};

/**
 * Processes all commenters in a post and finds the data of each commenters previous comments on different subreddits
 * @param {object} processed - The processed JSON data.
 * @param {object} children - The JSON data.
 * @param {array} moreComments - Additional comment thread ids.
 * @param {function} onComplete - The callback function to be executed when all comments have been processed.
 *@memberof Processing
 */

function recurseComments(processed, children, moreComments, onComplete) {
    recursiveSteps++;

    if (moreComments == null) {
        moreComments = [];
    }

    allSubreddits = {};

    for (var i = 0; i < children.length && !(children[i] instanceof String); i++) {
        if (children[i].kind === "more") {
            for (var j = 0; j < children[i].data.children.length; j++) {
                //if (!seenComments.has(children[i].data.children[j])) {
                    moreComments.push(children[i].data.children[j]);
                //    seenComments.add(children[i].data.children[j]);
                //}
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

            // User subreddit analysis
            var commenter_name = children[i].data.author;

            if (!(commenter_name in allCommenterNames)) {
              other_downloads++;
              allCommenterNames[commenter_name] = 1;
                download_raw("https://www.reddit.com/user/" + commenter_name, function(raw) {
                    other_downloads--;
                    if (raw == null) {
                        // Error
                    } else {
                        var eg  = JSON.parse(raw);
                        var list = [];
                        for(var i =0 ; i < eg.data.children.length; i++) {
                            if (list.indexOf(eg.data.children[i].data.subreddit) !== -1) {
                                // Do nothing
                            } else {
                                list.push(eg.data.children[i].data.subreddit);
                            }
                        }

                        for (var i = 0; i < list.length; i++) {
                            if (allSubreddits.hasOwnProperty(list[i])) {
                                allSubreddits[list[i]]++;
                            } else{
                                allSubreddits[list[i]] = 1;
                            }
                        }
                        //log(allSubreddits);

                        Object.size = function(obj) {
                            var size = 0;
                            for (var key in obj) {
                                if (obj.hasOwnProperty(key)) {
                                    size++;
                                }
                            }
                            return size;
                        };
                        var size = Object.size(allSubreddits);
                    }

                    // Async stage completion
                    if (recursiveSteps == 0 && progression == 0 && other_downloads == 0) {
                        onComplete();
                        stepCount = 0;
                    }
                } );}

            processed.comments.push({
                "timestamp" : children[i].data.created_utc,
                "controversial" : children[i].data.controversiality > 0
            });

            //log("timestamp = " + children[i].data.created_utc + ", date = " + new Date(children[i].data.created_utc));

            totalCommentsProcessed++;
        }
    }
    log("Processed " + totalCommentsProcessed + "/~" + processed.numComments + " comments.");

    // Download and process further comments
    for (i = 0; i < moreComments.length; i++) {
        // Make sure duplicates don't get processed.
        let id = moreComments[i];
        if (!(id in commentThreadIds)) {
            stepCount++;
            commentThreadIds[id] = 1;
            progression++;
            //log("Requesting comment " + id + " progression = " + progression);
            download_raw(processed.url + id, function(raw) {
                progression--;
                if (raw != null) {
                    complete++;
                    log("Received " + id + ". Downloaded " + complete + "/" + stepCount + " comment threads.");
                    recurseComments(processed, (JSON.parse(raw))[1].data.children, null, onComplete);
                } else {
                    log(1, "WARNING: Failed to download comment thread " + id + "/");
                    stepCount--;
                }
            });
        }
    }

    recursiveSteps--;
    if (recursiveSteps == 0 && progression == 0 && other_downloads == 0) {
        onComplete();
        stepCount = 0;
    }
}

/**
 * The proccess_meta function updates the processed json data in order for it to be displayed on the html page.
 *@param {object} data - The original post data.
 *@param {object} proccessed - The processed json data.
 *@memberof Processing
 */
function process_meta(data, processed) {
    // Basic post data
    totalCommentsProcessed = 0;
    processed["contCount"]=0; // num controversial comments
    processed.date = new Date(); // date now
    processed.subreddit = data[0].data.children[0].data.subreddit; // subreddit
    processed.url = "https://www.reddit.com" + data[0].data.children[0].data.permalink; // original post url
    processed.postDate = data[0].data.children[0].data.created_utc; // date post created
    processed.title = data[0].data.children[0].data.title; // title
    processed.upVotes =  data[0].data.children[0].data.ups; // net upvotes
    processed.downEst = Math.round(((processed.upVotes / (data[0].data.children[0].data.upvote_ratio * 100)) * 100) - processed.upVotes); // estimated downvotes
    processed.numComments = data[0].data.children[0].data.num_comments; // num comments
    processed.totalAwards = data[0].data.children[0].data.total_awards_received; // num awards
    processed.crossPosts = data[0].data.children[0].data.num_crossposts; // num crossposts
    // Processed comments
    processed.comments = [];
    // Which processing stages are complete
    processed.stages = {};
}

/**
 * The proccess_reposts function proccesses all commenters in a post and finds the data of each commenters previous comments on different subreddits.
 *@param {object} data - The original post data.
 *@param {object} proccesed - The processed json data.
 *@param {function} onComplete - The callback function that is executed when reposts have been processed.
 *@memberof Processing
 */

function process_reposts(data, processed, onComplete){
    let duplicate_url = processed.url.replace("/comments/", "/duplicates/");

    log("Processing reposts...");
    download_raw(duplicate_url, function(raw_json) {
        if (raw_json == null) {
            return;
        }
        data = JSON.parse(raw_json);
        processed.duplicates = {};
        processed.duplicates.url = [];
        processed.duplicates.data = [];

        for (var i = 0; i < data[1].data.children.length; i++) {
            if (processed.duplicates.url[i] == data[1].data.children[i].data.permalink) {
                // Nothing needs to go here
            } else {
                processed.duplicates.url.push(data[1].data.children[i].data.permalink);
            }
        }

        let total_reposts = processed.duplicates.url.length;
        if (total_reposts == 0) {
            onComplete();
        }
        for (var i = 0; i < processed.duplicates.url.length; i++) {
            var repost_url = ("https://www.reddit.com" + processed.duplicates.url[i]);
            download_raw(repost_url, function(duplicate_json) {
                if (duplicate_json == null) {
                    // uh oh
                    return;
                }
                process_raw(
                    duplicate_json,
                    function(stage, repost_data) {
                        log("Repost " + repost_data.url + " stage completed: " + stage);
                        repost_data.stages[stage] = 1;
                        // TODO: wtf is this condition for? surely reposts stage onComplete can happen out of order?
                        if (
                            "meta" in repost_data.stages &&
                            "comments" in repost_data.stages &&
                            "links" in repost_data.stages
                        ) {
                            total_reposts--;
                            processed.duplicates.data.push(repost_data);
                            log("Repost " + repost_data.url + " processing finished, " + total_reposts + " repost(s) remaining.");
                            if (total_reposts <= 0) {
                                onComplete();
                            }
                        }
                    },
                    false
                );

            });
        }
    });

}

/**
 * Takes the raw json data and processes it to a form ready for further data manipulation.
 *@param {string} raw_json - The original post data.
 *@param {function} onStageComplete - Callback function that is called when each stage is completed.
 *@param {boolean} process_duplicates - Makes sure reposts aren't infinitely processed.
 *@memberof Processing
 */

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
            }
        );
        log("Processed primary comments.");

        // Extract URLs in post and query pushshift
        // TODO: do the same for links in comments
        process_links(data, processed, function() { onStageComplete("links", processed); });

        // Now process reposts
        if (process_duplicates) {
            process_reposts(data, processed, function() { onStageComplete("reposts", processed); });
        }

        // There may be further downloads and processing pending, but initial processing is complete.
        onStageComplete("initial", processed);

    } else {
        onStageComplete("ERROR", null);
    }
}
/**
 * This function toggles the download between synchronous to asynchronous.
 *@param {boolean} async - Makes downloads synchronous or asynchronous.
 *@memberof Processing
 */
function setAsync(async){
    asyncRequest = async;
}

/*function beginNextStage() {
    onStageComplete("comments", processed);

    // Links
    /*process_links(data, processed);
    onStageComplete("links", processed);

    // Reposts
    if (process_duplicates) {
        process_reposts(data, processed);
    }
    onStageComplete("reposts", processed);
    onStageComplete("FINISHED", processed);
}*/

repost_json = [];
if (typeof module !== 'undefined') {
    module.exports = { download_raw, process_raw, process_meta, extract_urls, process_links, process_reposts, recurseComments, setAsync, setLogLevel };
}
