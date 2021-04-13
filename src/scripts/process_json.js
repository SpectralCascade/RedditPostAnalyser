var asyncRequest = true;

if (typeof XMLHttpRequest === 'undefined') {
    var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
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
            let mainurl = http_request.getResponseHeader("Location");
            xhttpr.open("GET", mainurl, asyncRequest);
            xhttpr.setRequestHeader("Content-Type", "text/plain");
            xhttpr.onreadystatechange = function() { handle_http_response(mainurl, xhttpr, callback); };
            console.log("REDIRECT - HTTP response " + http_request.status + " - NEW URL: " + mainurl);
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
//download_requests = [];

function test_downloads() {
    download_raw(
        "https://www.reddit.com/r/HomeServer/comments/mpwaxx/newbie_question_why_wiring_all_port_of_two/",
        function (raw_data) {
            if (raw_data != null) {
                // test passes
            } else {
                // test fails
            }
        }
    );
}

// Asynchronous data download.
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
        console.log("Sending HTTP request to " + mainurl);
        xhttp.send();

        return xhttp;
    }
    // Webpage isn't on Reddit or Pushshift
    console.log("ERROR: Webpage is not a valid data source.");
    parseDataCallback(null);
    return null;
}

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

function process_links(data, processed, onComplete) {
    var postLinks = [];
    processed.postLinks = [];

    // First, analyse the post itself
    for (var i = 0, counti = data[0].data.children.length; i < counti; i++) {
        post = data[0].data.children[i].data.selftext;

        postLinks = extract_urls(post);
    }

    console.log("Found links:\n" + String(postLinks));

    var query = "http://api.pushshift.io/reddit/submission/search/?q="

    rawPostLinks = [];
    if (postLinks.length == 0) {
        onComplete();
    }
    // Now convert links to searchable URI strings and search with pushshift
    for (let i = 0, counti = postLinks.length; i < counti; i++) {
        rawPostLinks.push(postLinks[i]);
        postLinks[i] = encodeURIComponent(postLinks[i]);
        console.log("\nSearching Reddit for occurrence of link:\n" + postLinks[i]);

        download_raw(query + postLinks[i], function(raw) {
            total_links--;
            if (raw == null) {
                console.log("WARNING: Failed link query.");
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
                console.log("Received link query results for URL: " + rawPostLinks[i]);
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
                        console.log(allSubreddits);

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

            //console.log("timestamp = " + children[i].data.created_utc + ", date = " + new Date(children[i].data.created_utc));

            totalCommentsProcessed++;
        }
    }
    console.log("Processed " + totalCommentsProcessed + "/~" + processed.numComments + " comments.");

    // Download and process further comments
    for (i = 0; i < moreComments.length; i++) {
        // Make sure duplicates don't get processed.
        let id = moreComments[i];
        if (!(id in commentThreadIds)) {
            stepCount++;
            commentThreadIds[id] = 1;
            progression++;
            //console.log("Requesting comment " + id + " progression = " + progression);
            download_raw(processed.url + id, function(raw) {
                progression--;
                if (raw != null) {
                    complete++;
                    console.log("Received " + id + ". Downloaded " + complete + "/" + stepCount + " comment threads.");
                    recurseComments(processed, (JSON.parse(raw))[1].data.children, null, onComplete);
                } else {
                    console.log("WARNING: Failed to download comment thread " + id + "/");
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

function process_reposts(data, processed, onComplete){
    let duplicate_url = processed.url.replace("/comments/", "/duplicates/");

    console.log("Processing reposts...");
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
                        console.log("Repost " + repost_data.url + " stage completed: " + stage);
                        repost_data.stages[stage] = 1;
                        // TODO: wtf is this condition for? surely reposts stage onComplete can happen out of order?
                        if (
                            "meta" in repost_data.stages &&
                            "comments" in repost_data.stages &&
                            "links" in repost_data.stages
                        ) {
                            total_reposts--;
                            processed.duplicates.data.push(repost_data);
                            console.log("Repost " + repost_data.url + " processing finished, " + total_reposts + " repost(s) remaining.");
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
        console.log("Processed primary comments.");

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
    module.exports = { download_raw, process_raw, run_unit_tests };
}













let tests_passed = 0;
let tests_run = 0;

function run_test(test) {
    tests_run++;
    try {
        if (test()) {
            tests_passed++;
            console.log("Test " + tests_run + " passed!");
        } else {
            console.log("Test " + tests_run + " failed!");
        }
    } catch (err) {
        console.log("Test " + tests_run + " failed (exception occurred)!");
    }
}

// Execute all unit tests
function run_unit_tests() {
    asyncRequest = false;
    
    run_test(function() {
        data_input = [{"kind": "Listing", "data": {"modhash": "sfv7vorf3la8eae41bea1584111e8048aad9e6be732b56f378", "dist": 1, "children": [{"kind": "t3", "data": {"approved_at_utc": null, "subreddit": "HomeServer", "selftext": "", "user_reports": [], "saved": false, "mod_reason_title": null, "gilded": 0, "clicked": false, "title": "Newbie question: why wiring all port of two switchs together like this? I thought each port should come out to one device.", "link_flair_richtext": [], "subreddit_name_prefixed": "r/HomeServer", "hidden": false, "pwls": 6, "link_flair_css_class": null, "downs": 0, "thumbnail_height": 140, "top_awarded_type": null, "parent_whitelist_status": "all_ads", "hide_score": false, "name": "t3_mpwaxx", "quarantine": false, "link_flair_text_color": "dark", "upvote_ratio": 0.88, "author_flair_background_color": null, "subreddit_type": "public", "ups": 67, "total_awards_received": 0, "media_embed": {}, "thumbnail_width": 140, "author_flair_template_id": null, "is_original_content": false, "author_fullname": "t2_dmq72", "secure_media": null, "is_reddit_media_domain": true, "is_meta": false, "category": null, "secure_media_embed": {}, "link_flair_text": null, "can_mod_post": false, "score": 67, "approved_by": null, "author_premium": false, "thumbnail": "https://b.thumbs.redditmedia.com/YSBRSZ3aQ1NmzMcUTUAqDpeM8rAC0_gc3iwZJusHp2c.jpg", "edited": false, "author_flair_css_class": null, "author_flair_richtext": [], "gildings": {}, "post_hint": "image", "content_categories": null, "is_self": false, "mod_note": null, "created": 1618322438.0, "link_flair_type": "text", "wls": 6, "removed_by_category": null, "banned_by": null, "author_flair_type": "text", "domain": "i.redd.it", "allow_live_comments": false, "selftext_html": null, "likes": null, "suggested_sort": null, "banned_at_utc": null, "url_overridden_by_dest": "https://i.redd.it/56opeypbsvs61.jpg", "view_count": null, "archived": false, "no_follow": false, "is_crosspostable": true, "pinned": false, "over_18": false, "preview": {"images": [{"source": {"url": "https://preview.redd.it/56opeypbsvs61.jpg?auto=webp&amp;s=2c634294aa8b3736d6dca1258315dc1862155aa7", "width": 1530, "height": 2048}, "resolutions": [{"url": "https://preview.redd.it/56opeypbsvs61.jpg?width=108&amp;crop=smart&amp;auto=webp&amp;s=08f580b244a69e247cdc971cc6e5d866facb6d3e", "width": 108, "height": 144}, {"url": "https://preview.redd.it/56opeypbsvs61.jpg?width=216&amp;crop=smart&amp;auto=webp&amp;s=2eb4e37e06734fd848715f57d792a653b7ff51dd", "width": 216, "height": 289}, {"url": "https://preview.redd.it/56opeypbsvs61.jpg?width=320&amp;crop=smart&amp;auto=webp&amp;s=e858bf3ae61231ea5988325f3e61c0f9c4cc716a", "width": 320, "height": 428}, {"url": "https://preview.redd.it/56opeypbsvs61.jpg?width=640&amp;crop=smart&amp;auto=webp&amp;s=cade531a7b83719883a9b365d268569a37f0aa98", "width": 640, "height": 856}, {"url": "https://preview.redd.it/56opeypbsvs61.jpg?width=960&amp;crop=smart&amp;auto=webp&amp;s=3c9bda04ca3ff337813b3b3f9541d9216607083b", "width": 960, "height": 1285}, {"url": "https://preview.redd.it/56opeypbsvs61.jpg?width=1080&amp;crop=smart&amp;auto=webp&amp;s=313d6dec7d5f163f8845e8248c25eb25659a3338", "width": 1080, "height": 1445}], "variants": {}, "id": "BcJCNqPQVaR3xyr1mOHDK1QgmCv41RqRHeyUSwre764"}], "enabled": true}, "all_awardings": [], "awarders": [], "media_only": false, "can_gild": true, "spoiler": false, "locked": false, "author_flair_text": null, "treatment_tags": [], "visited": false, "removed_by": null, "num_reports": null, "distinguished": null, "subreddit_id": "t5_2sxqm", "mod_reason_by": null, "removal_reason": null, "link_flair_background_color": "", "id": "mpwaxx", "is_robot_indexable": true, "num_duplicates": 0, "report_reasons": null, "author": "klgt", "discussion_type": null, "num_comments": 11, "send_replies": true, "media": null, "contest_mode": false, "author_patreon_flair": false, "author_flair_text_color": null, "permalink": "/r/HomeServer/comments/mpwaxx/newbie_question_why_wiring_all_port_of_two/", "whitelist_status": "all_ads", "stickied": false, "url": "https://i.redd.it/56opeypbsvs61.jpg", "subreddit_subscribers": 74084, "created_utc": 1618293638.0, "num_crossposts": 0, "mod_reports": [], "is_video": false}}], "after": null, "before": null}}, {"kind": "Listing", "data": {"modhash": "sfv7vorf3la8eae41bea1584111e8048aad9e6be732b56f378", "dist": null, "children": [{"kind": "t1", "data": {"total_awards_received": 0, "approved_at_utc": null, "comment_type": null, "awarders": [], "mod_reason_by": null, "banned_by": null, "ups": 72, "author_flair_type": "text", "removal_reason": null, "link_id": "t3_mpwaxx", "author_flair_template_id": null, "likes": null, "replies": {"kind": "Listing", "data": {"modhash": "sfv7vorf3la8eae41bea1584111e8048aad9e6be732b56f378", "dist": null, "children": [{"kind": "t1", "data": {"total_awards_received": 0, "approved_at_utc": null, "comment_type": null, "awarders": [], "mod_reason_by": null, "banned_by": null, "ups": 19, "author_flair_type": "text", "removal_reason": null, "link_id": "t3_mpwaxx", "author_flair_template_id": null, "likes": null, "replies": {"kind": "Listing", "data": {"modhash": "sfv7vorf3la8eae41bea1584111e8048aad9e6be732b56f378", "dist": null, "children": [{"kind": "t1", "data": {"total_awards_received": 0, "approved_at_utc": null, "comment_type": null, "awarders": [], "mod_reason_by": null, "banned_by": null, "ups": 13, "author_flair_type": "text", "removal_reason": null, "link_id": "t3_mpwaxx", "author_flair_template_id": null, "likes": null, "replies": {"kind": "Listing", "data": {"modhash": "sfv7vorf3la8eae41bea1584111e8048aad9e6be732b56f378", "dist": null, "children": [{"kind": "t1", "data": {"total_awards_received": 0, "approved_at_utc": null, "comment_type": null, "awarders": [], "mod_reason_by": null, "banned_by": null, "ups": 2, "author_flair_type": "text", "removal_reason": null, "link_id": "t3_mpwaxx", "author_flair_template_id": null, "likes": null, "replies": "", "user_reports": [], "saved": false, "id": "gudfb4v", "banned_at_utc": null, "mod_reason_title": null, "gilded": 0, "archived": false, "no_follow": true, "author": "Strykker2", "can_mod_post": false, "send_replies": true, "parent_id": "t1_gucwu84", "score": 2, "author_fullname": "t2_50sg3", "report_reasons": null, "approved_by": null, "all_awardings": [], "subreddit_id": "t5_2sxqm", "body": "having labels on the patch panel describing where each of its ports connect to is usually quite useful though. (I don't see any numbers on the patch panels label flags)", "edited": false, "downs": 0, "author_flair_css_class": null, "is_submitter": false, "collapsed": false, "author_flair_richtext": [], "author_patreon_flair": false, "body_html": "&lt;div class=\"md\"&gt;&lt;p&gt;having labels on the patch panel describing where each of its ports connect to is usually quite useful though. (I don&amp;#39;t see any numbers on the patch panels label flags)&lt;/p&gt;\n&lt;/div&gt;", "gildings": {}, "collapsed_reason": null, "associated_award": null, "stickied": false, "author_premium": false, "subreddit_type": "public", "can_gild": true, "top_awarded_type": null, "author_flair_text_color": null, "score_hidden": false, "permalink": "/r/HomeServer/comments/mpwaxx/newbie_question_why_wiring_all_port_of_two/gudfb4v/", "num_reports": null, "locked": false, "name": "t1_gudfb4v", "created": 1618352044.0, "subreddit": "HomeServer", "author_flair_text": null, "treatment_tags": [], "created_utc": 1618323244.0, "subreddit_name_prefixed": "r/HomeServer", "controversiality": 0, "depth": 3, "author_flair_background_color": null, "collapsed_because_crowd_control": null, "mod_reports": [], "mod_note": null, "distinguished": null}}], "after": null, "before": null}}, "user_reports": [], "saved": false, "id": "gucwu84", "banned_at_utc": null, "mod_reason_title": null, "gilded": 0, "archived": false, "no_follow": false, "author": "reizuki", "can_mod_post": false, "created_utc": 1618312427.0, "send_replies": true, "parent_id": "t1_gucvyxd", "score": 13, "author_fullname": "t2_hmcm0", "report_reasons": null, "approved_by": null, "all_awardings": [], "subreddit_id": "t5_2sxqm", "body": "&gt;and not a single port is labeled. :(\n\nSome of us use virtual labeling, i.e. describing in e.g. Netbox which port number does what. As long as it's properly done, I found it way better than trying to fit a meaningful description in a tiny space - the ports are already numbered. Cable flags are of course a separate matter, no reason not to do that.", "edited": false, "author_flair_css_class": null, "is_submitter": false, "downs": 0, "author_flair_richtext": [], "author_patreon_flair": false, "body_html": "&lt;div class=\"md\"&gt;&lt;blockquote&gt;\n&lt;p&gt;and not a single port is labeled. :(&lt;/p&gt;\n&lt;/blockquote&gt;\n\n&lt;p&gt;Some of us use virtual labeling, i.e. describing in e.g. Netbox which port number does what. As long as it&amp;#39;s properly done, I found it way better than trying to fit a meaningful description in a tiny space - the ports are already numbered. Cable flags are of course a separate matter, no reason not to do that.&lt;/p&gt;\n&lt;/div&gt;", "gildings": {}, "collapsed_reason": null, "associated_award": null, "stickied": false, "author_premium": false, "subreddit_type": "public", "can_gild": true, "top_awarded_type": null, "author_flair_text_color": null, "score_hidden": false, "permalink": "/r/HomeServer/comments/mpwaxx/newbie_question_why_wiring_all_port_of_two/gucwu84/", "num_reports": null, "locked": false, "name": "t1_gucwu84", "created": 1618341227.0, "subreddit": "HomeServer", "author_flair_text": null, "treatment_tags": [], "collapsed": false, "subreddit_name_prefixed": "r/HomeServer", "controversiality": 0, "depth": 2, "author_flair_background_color": null, "collapsed_because_crowd_control": null, "mod_reports": [], "mod_note": null, "distinguished": null}}], "after": null, "before": null}}, "user_reports": [], "saved": false, "id": "gucvyxd", "banned_at_utc": null, "mod_reason_title": null, "gilded": 0, "archived": false, "no_follow": false, "author": "hometoast", "can_mod_post": false, "send_replies": true, "parent_id": "t1_gucdm6j", "score": 19, "author_fullname": "t2_ckbz2", "report_reasons": null, "approved_by": null, "all_awardings": [], "subreddit_id": "t5_2sxqm", "collapsed": false, "body": "&gt; This makes it easier to organize the cabling on this end.\n\nand not a single port is labeled. :(", "edited": false, "author_flair_css_class": null, "is_submitter": false, "downs": 0, "author_flair_richtext": [], "author_patreon_flair": false, "body_html": "&lt;div class=\"md\"&gt;&lt;blockquote&gt;\n&lt;p&gt;This makes it easier to organize the cabling on this end.&lt;/p&gt;\n&lt;/blockquote&gt;\n\n&lt;p&gt;and not a single port is labeled. :(&lt;/p&gt;\n&lt;/div&gt;", "gildings": {}, "collapsed_reason": null, "associated_award": null, "stickied": false, "author_premium": false, "subreddit_type": "public", "can_gild": true, "top_awarded_type": null, "author_flair_text_color": null, "score_hidden": false, "permalink": "/r/HomeServer/comments/mpwaxx/newbie_question_why_wiring_all_port_of_two/gucvyxd/", "num_reports": null, "locked": false, "name": "t1_gucvyxd", "created": 1618340534.0, "subreddit": "HomeServer", "author_flair_text": null, "treatment_tags": [], "created_utc": 1618311734.0, "subreddit_name_prefixed": "r/HomeServer", "controversiality": 0, "depth": 1, "author_flair_background_color": null, "collapsed_because_crowd_control": null, "mod_reports": [], "mod_note": null, "distinguished": null}}, {"kind": "t1", "data": {"total_awards_received": 0, "approved_at_utc": null, "comment_type": null, "awarders": [], "mod_reason_by": null, "banned_by": null, "ups": 13, "author_flair_type": "text", "removal_reason": null, "link_id": "t3_mpwaxx", "author_flair_template_id": null, "likes": null, "replies": "", "user_reports": [], "saved": false, "id": "gucmjku", "banned_at_utc": null, "mod_reason_title": null, "gilded": 0, "archived": false, "no_follow": false, "author": "klgt", "can_mod_post": false, "send_replies": true, "parent_id": "t1_gucdm6j", "score": 13, "author_fullname": "t2_dmq72", "report_reasons": null, "approved_by": null, "all_awardings": [], "subreddit_id": "t5_2sxqm", "collapsed": false, "body": "Thank you, I'm not familiar with networking stuffs but really love these machines. I am planning to build one at my home.", "edited": 1618315298.0, "author_flair_css_class": null, "is_submitter": true, "downs": 0, "author_flair_richtext": [], "author_patreon_flair": false, "body_html": "&lt;div class=\"md\"&gt;&lt;p&gt;Thank you, I&amp;#39;m not familiar with networking stuffs but really love these machines. I am planning to build one at my home.&lt;/p&gt;\n&lt;/div&gt;", "gildings": {}, "collapsed_reason": null, "associated_award": null, "stickied": false, "author_premium": false, "subreddit_type": "public", "can_gild": true, "top_awarded_type": null, "author_flair_text_color": null, "score_hidden": false, "permalink": "/r/HomeServer/comments/mpwaxx/newbie_question_why_wiring_all_port_of_two/gucmjku/", "num_reports": null, "locked": false, "name": "t1_gucmjku", "created": 1618331326.0, "subreddit": "HomeServer", "author_flair_text": null, "treatment_tags": [], "created_utc": 1618302526.0, "subreddit_name_prefixed": "r/HomeServer", "controversiality": 0, "depth": 1, "author_flair_background_color": null, "collapsed_because_crowd_control": null, "mod_reports": [], "mod_note": null, "distinguished": null}}], "after": null, "before": null}}, "user_reports": [], "saved": false, "id": "gucdm6j", "banned_at_utc": null, "mod_reason_title": null, "gilded": 0, "archived": false, "no_follow": false, "author": "ruisan", "can_mod_post": false, "send_replies": true, "parent_id": "t3_mpwaxx", "score": 72, "author_fullname": "t2_fcofu", "report_reasons": null, "approved_by": null, "all_awardings": [], "subreddit_id": "t5_2sxqm", "body": "The top unit is not a switch, but a patch panel. There are cables wired into connectors on the back, and those cables will typically go to a wall jack in another room/location, or directly to a device on the network. This makes it easier to organize the cabling on this end.", "edited": false, "downs": 0, "author_flair_css_class": null, "is_submitter": false, "collapsed": false, "author_flair_richtext": [], "author_patreon_flair": false, "body_html": "&lt;div class=\"md\"&gt;&lt;p&gt;The top unit is not a switch, but a patch panel. There are cables wired into connectors on the back, and those cables will typically go to a wall jack in another room/location, or directly to a device on the network. This makes it easier to organize the cabling on this end.&lt;/p&gt;\n&lt;/div&gt;", "gildings": {}, "collapsed_reason": null, "associated_award": null, "stickied": false, "author_premium": false, "subreddit_type": "public", "can_gild": true, "top_awarded_type": null, "author_flair_text_color": null, "score_hidden": false, "permalink": "/r/HomeServer/comments/mpwaxx/newbie_question_why_wiring_all_port_of_two/gucdm6j/", "num_reports": null, "locked": false, "name": "t1_gucdm6j", "created": 1618322942.0, "subreddit": "HomeServer", "author_flair_text": null, "treatment_tags": [], "created_utc": 1618294142.0, "subreddit_name_prefixed": "r/HomeServer", "controversiality": 0, "depth": 0, "author_flair_background_color": null, "collapsed_because_crowd_control": null, "mod_reports": [], "mod_note": null, "distinguished": null}}, {"kind": "t1", "data": {"total_awards_received": 0, "approved_at_utc": null, "comment_type": null, "awarders": [], "mod_reason_by": null, "banned_by": null, "ups": 23, "author_flair_type": "text", "removal_reason": null, "link_id": "t3_mpwaxx", "author_flair_template_id": null, "likes": null, "replies": "", "user_reports": [], "saved": false, "id": "gucdoky", "banned_at_utc": null, "mod_reason_title": null, "gilded": 0, "archived": false, "no_follow": false, "author": "destiny2pewpew", "can_mod_post": false, "send_replies": true, "parent_id": "t3_mpwaxx", "score": 23, "author_fullname": "t2_5aeraoa3", "report_reasons": null, "approved_by": null, "all_awardings": [], "subreddit_id": "t5_2sxqm", "body": "The top one of the \"switches\" isn't a switch.\nIt's a patch panel that connects the switched ports to cables running through your building. \nThe C5e on the right says that the jacks are conform to the Cat5e standard.", "edited": false, "downs": 0, "author_flair_css_class": null, "is_submitter": false, "collapsed": false, "author_flair_richtext": [], "author_patreon_flair": false, "body_html": "&lt;div class=\"md\"&gt;&lt;p&gt;The top one of the &amp;quot;switches&amp;quot; isn&amp;#39;t a switch.\nIt&amp;#39;s a patch panel that connects the switched ports to cables running through your building. \nThe C5e on the right says that the jacks are conform to the Cat5e standard.&lt;/p&gt;\n&lt;/div&gt;", "gildings": {}, "collapsed_reason": null, "associated_award": null, "stickied": false, "author_premium": false, "subreddit_type": "public", "can_gild": true, "top_awarded_type": null, "author_flair_text_color": null, "score_hidden": false, "permalink": "/r/HomeServer/comments/mpwaxx/newbie_question_why_wiring_all_port_of_two/gucdoky/", "num_reports": null, "locked": false, "name": "t1_gucdoky", "created": 1618323001.0, "subreddit": "HomeServer", "author_flair_text": null, "treatment_tags": [], "created_utc": 1618294201.0, "subreddit_name_prefixed": "r/HomeServer", "controversiality": 0, "depth": 0, "author_flair_background_color": null, "collapsed_because_crowd_control": null, "mod_reports": [], "mod_note": null, "distinguished": null}}, {"kind": "t1", "data": {"total_awards_received": 0, "approved_at_utc": null, "comment_type": null, "awarders": [], "mod_reason_by": null, "banned_by": null, "ups": 4, "author_flair_type": "text", "removal_reason": null, "link_id": "t3_mpwaxx", "author_flair_template_id": null, "likes": null, "replies": "", "user_reports": [], "saved": false, "id": "gud9tk3", "banned_at_utc": null, "mod_reason_title": null, "gilded": 0, "archived": false, "no_follow": false, "author": "Rostrow416", "can_mod_post": false, "send_replies": true, "parent_id": "t3_mpwaxx", "score": 4, "author_fullname": "t2_l43v3", "report_reasons": null, "approved_by": null, "all_awardings": [], "subreddit_id": "t5_2sxqm", "body": "The top is a patch panel.  It makes it easier to organize your wires and will lessen the wear on the switch ports because you use the patch panel (much cheaper) instead when you move wires around.", "edited": false, "downs": 0, "author_flair_css_class": null, "is_submitter": false, "collapsed": false, "author_flair_richtext": [], "author_patreon_flair": false, "body_html": "&lt;div class=\"md\"&gt;&lt;p&gt;The top is a patch panel.  It makes it easier to organize your wires and will lessen the wear on the switch ports because you use the patch panel (much cheaper) instead when you move wires around.&lt;/p&gt;\n&lt;/div&gt;", "gildings": {}, "collapsed_reason": null, "associated_award": null, "stickied": false, "author_premium": false, "subreddit_type": "public", "can_gild": true, "top_awarded_type": null, "author_flair_text_color": null, "score_hidden": false, "permalink": "/r/HomeServer/comments/mpwaxx/newbie_question_why_wiring_all_port_of_two/gud9tk3/", "num_reports": null, "locked": false, "name": "t1_gud9tk3", "created": 1618349359.0, "subreddit": "HomeServer", "author_flair_text": null, "treatment_tags": [], "created_utc": 1618320559.0, "subreddit_name_prefixed": "r/HomeServer", "controversiality": 0, "depth": 0, "author_flair_background_color": null, "collapsed_because_crowd_control": null, "mod_reports": [], "mod_note": null, "distinguished": null}}, {"kind": "t1", "data": {"total_awards_received": 0, "approved_at_utc": null, "comment_type": null, "awarders": [], "mod_reason_by": null, "banned_by": null, "ups": -106, "author_flair_type": "text", "removal_reason": null, "link_id": "t3_mpwaxx", "author_flair_template_id": null, "likes": null, "replies": {"kind": "Listing", "data": {"modhash": "sfv7vorf3la8eae41bea1584111e8048aad9e6be732b56f378", "dist": null, "children": [{"kind": "t1", "data": {"total_awards_received": 0, "approved_at_utc": null, "comment_type": null, "awarders": [], "mod_reason_by": null, "banned_by": null, "ups": 50, "author_flair_type": "text", "removal_reason": null, "link_id": "t3_mpwaxx", "author_flair_template_id": null, "likes": null, "replies": {"kind": "Listing", "data": {"modhash": "sfv7vorf3la8eae41bea1584111e8048aad9e6be732b56f378", "dist": null, "children": [{"kind": "t1", "data": {"total_awards_received": 0, "approved_at_utc": null, "comment_type": null, "awarders": [], "mod_reason_by": null, "banned_by": null, "ups": -64, "author_flair_type": "text", "removal_reason": null, "link_id": "t3_mpwaxx", "author_flair_template_id": null, "likes": null, "replies": {"kind": "Listing", "data": {"modhash": "sfv7vorf3la8eae41bea1584111e8048aad9e6be732b56f378", "dist": null, "children": [{"kind": "t1", "data": {"total_awards_received": 0, "approved_at_utc": null, "comment_type": null, "awarders": [], "mod_reason_by": null, "banned_by": null, "ups": 49, "author_flair_type": "text", "removal_reason": null, "link_id": "t3_mpwaxx", "author_flair_template_id": null, "likes": null, "replies": "", "user_reports": [], "saved": false, "id": "gucysiq", "banned_at_utc": null, "mod_reason_title": null, "gilded": 0, "archived": false, "no_follow": false, "author": "JohannVonPerfect", "can_mod_post": false, "send_replies": true, "parent_id": "t1_gucx9zc", "score": 49, "author_fullname": "t2_20x6ftk", "report_reasons": null, "approved_by": null, "all_awardings": [], "subreddit_id": "t5_2sxqm", "body": "Not sure if serious. ROFL.", "edited": false, "downs": 0, "author_flair_css_class": null, "is_submitter": false, "collapsed": false, "author_flair_richtext": [], "author_patreon_flair": false, "body_html": "&lt;div class=\"md\"&gt;&lt;p&gt;Not sure if serious. ROFL.&lt;/p&gt;\n&lt;/div&gt;", "gildings": {}, "collapsed_reason": null, "associated_award": null, "stickied": false, "author_premium": false, "subreddit_type": "public", "can_gild": true, "top_awarded_type": null, "author_flair_text_color": null, "score_hidden": false, "permalink": "/r/HomeServer/comments/mpwaxx/newbie_question_why_wiring_all_port_of_two/gucysiq/", "num_reports": null, "locked": false, "name": "t1_gucysiq", "created": 1618342699.0, "subreddit": "HomeServer", "author_flair_text": null, "treatment_tags": [], "created_utc": 1618313899.0, "subreddit_name_prefixed": "r/HomeServer", "controversiality": 0, "depth": 3, "author_flair_background_color": null, "collapsed_because_crowd_control": null, "mod_reports": [], "mod_note": null, "distinguished": null}}], "after": null, "before": null}}, "user_reports": [], "saved": false, "id": "gucx9zc", "banned_at_utc": null, "mod_reason_title": null, "gilded": 0, "archived": false, "no_follow": true, "author": "HootleTootle", "can_mod_post": false, "created_utc": 1618312770.0, "send_replies": true, "parent_id": "t1_guctd51", "score": -64, "author_fullname": "t2_tkmwo", "report_reasons": null, "approved_by": null, "all_awardings": [], "subreddit_id": "t5_2sxqm", "body": "A brad is a thing for poking holes in wood.  A chad is a little paper disc left over when punching holes in paper.  I'm not sure what you're getting at?", "edited": false, "author_flair_css_class": null, "is_submitter": false, "downs": 0, "author_flair_richtext": [], "author_patreon_flair": false, "body_html": "&lt;div class=\"md\"&gt;&lt;p&gt;A brad is a thing for poking holes in wood.  A chad is a little paper disc left over when punching holes in paper.  I&amp;#39;m not sure what you&amp;#39;re getting at?&lt;/p&gt;\n&lt;/div&gt;", "gildings": {}, "collapsed_reason": "comment score below threshold", "associated_award": null, "stickied": false, "author_premium": false, "subreddit_type": "public", "can_gild": true, "top_awarded_type": null, "author_flair_text_color": null, "score_hidden": false, "permalink": "/r/HomeServer/comments/mpwaxx/newbie_question_why_wiring_all_port_of_two/gucx9zc/", "num_reports": null, "locked": false, "name": "t1_gucx9zc", "created": 1618341570.0, "subreddit": "HomeServer", "author_flair_text": null, "treatment_tags": [], "collapsed": true, "subreddit_name_prefixed": "r/HomeServer", "controversiality": 0, "depth": 2, "author_flair_background_color": null, "collapsed_because_crowd_control": null, "mod_reports": [], "mod_note": null, "distinguished": null}}], "after": null, "before": null}}, "user_reports": [], "saved": false, "id": "guctd51", "banned_at_utc": null, "mod_reason_title": null, "gilded": 0, "archived": false, "no_follow": false, "author": "Inconspicuous_The_II", "can_mod_post": false, "send_replies": true, "parent_id": "t1_gucrro0", "score": 50, "author_fullname": "t2_8k5ofkma", "report_reasons": null, "approved_by": null, "all_awardings": [], "subreddit_id": "t5_2sxqm", "collapsed": false, "body": "Making fun of ignorance is such a Brad thing to do. Be a Chad, enlighten those looking for knowledge", "edited": false, "author_flair_css_class": null, "is_submitter": false, "downs": 0, "author_flair_richtext": [], "author_patreon_flair": false, "body_html": "&lt;div class=\"md\"&gt;&lt;p&gt;Making fun of ignorance is such a Brad thing to do. Be a Chad, enlighten those looking for knowledge&lt;/p&gt;\n&lt;/div&gt;", "gildings": {}, "collapsed_reason": null, "associated_award": null, "stickied": false, "author_premium": false, "subreddit_type": "public", "can_gild": true, "top_awarded_type": null, "author_flair_text_color": null, "score_hidden": false, "permalink": "/r/HomeServer/comments/mpwaxx/newbie_question_why_wiring_all_port_of_two/guctd51/", "num_reports": null, "locked": false, "name": "t1_guctd51", "created": 1618338252.0, "subreddit": "HomeServer", "author_flair_text": null, "treatment_tags": [], "created_utc": 1618309452.0, "subreddit_name_prefixed": "r/HomeServer", "controversiality": 0, "depth": 1, "author_flair_background_color": null, "collapsed_because_crowd_control": null, "mod_reports": [], "mod_note": null, "distinguished": null}}], "after": null, "before": null}}, "user_reports": [], "saved": false, "id": "gucrro0", "banned_at_utc": null, "mod_reason_title": null, "gilded": 0, "archived": false, "no_follow": true, "author": "HootleTootle", "can_mod_post": false, "send_replies": true, "parent_id": "t3_mpwaxx", "score": -106, "author_fullname": "t2_tkmwo", "report_reasons": null, "approved_by": null, "all_awardings": [], "subreddit_id": "t5_2sxqm", "body": "Not sure if serious. ROFL.", "edited": false, "downs": 0, "author_flair_css_class": null, "is_submitter": false, "collapsed": true, "author_flair_richtext": [], "author_patreon_flair": false, "body_html": "&lt;div class=\"md\"&gt;&lt;p&gt;Not sure if serious. ROFL.&lt;/p&gt;\n&lt;/div&gt;", "gildings": {}, "collapsed_reason": "comment score below threshold", "associated_award": null, "stickied": false, "author_premium": false, "subreddit_type": "public", "can_gild": true, "top_awarded_type": null, "author_flair_text_color": null, "score_hidden": false, "permalink": "/r/HomeServer/comments/mpwaxx/newbie_question_why_wiring_all_port_of_two/gucrro0/", "num_reports": null, "locked": false, "name": "t1_gucrro0", "created": 1618336718.0, "subreddit": "HomeServer", "author_flair_text": null, "treatment_tags": [], "created_utc": 1618307918.0, "subreddit_name_prefixed": "r/HomeServer", "controversiality": 0, "depth": 0, "author_flair_background_color": null, "collapsed_because_crowd_control": null, "mod_reports": [], "mod_note": null, "distinguished": null}}], "after": null, "before": null}}];
        processed = {};
        process_meta(data_input, processed);
        
        var success = true;
        
        //success = processed.downEst == 9;
        success = processed.downEst == 9 && processed.numComments==11 && processed.subreddit=="HomeServer" && processed.totalAwards==0 && processed.crossPosts==0;
        console.log("number of comments  = " + processed.numComments);
        console.log("downest = " + processed.downEst);
        console.log("subreddit = " + processed.subreddit);
        console.log("totalAwards = " + processed.totalAwards);
        console.log("crossPosts = " + processed.crossPosts);

        return success;
    });
    
    run_test(function() {
        url = "https://www.reddit.com/r/HomeServer/comments/mpwaxx/newbie_question_why_wiring_all_port_of_two";
        
        var success = true;
        download_raw(url, function(data) {
            if (data == null) {
                success = false;
            }
        });
        return success;
    });
    
    // Test url extraction from a post body
    run_test(function() {
        
        data = "Hey folks, I've been interested in taking on a home server project for a while and have finally found the time to start delving into it properly. I just wanted the community to weigh in on my plans and let me know if I'm on the right track with things. So without further ado, here we go.\n\n**Requirements - Key**\n\n* Network storage for my home desktop and laptop\n* Secure storage of backups of certain files and folders on my desktop and laptop (daily backups of some files, weekly backups of others)\n* Replace Dropbox (accessible from my Android phone)\n* Room to add more drives and more RAM if future requirements change\n\n**Requirements - Desirable**\n\n* Stream media for 1 - 3 users simultaneously\n\n**Proposed Part List**\n\nhttps://au.pcpartpicker.com/list/CHk4mk\n\n* The case allows plenty of room for expansion (8 HDD bays)\n* I believe the CPU should allow for software video transcoding if required (?)\n* Extendable memory\n\n**Proposed Software**\n\n* OS: UnRAID\n* Plugin: NextCloud\n* Plugin: Plex\n\n\nI'm not super invested in having the media server as I can already stream Netflix to my Chromecast and don't really watch shows too often anyway. It's something I'd like the option to be able to do if this setup would allow me to without changing anything.\n\nPlease let me know your thoughts or feelings about my build, as well as any words of wisdom anyone might have for a beginner.\n\nCheers!\n\nEDIT: Changed OS, updated parts list"

        
        var result = extract_urls(data);
       

        return result == "https://au.pcpartpicker.com/list/CHk4mk" ;
    });

    run_test(function() {
        
        
        data_2 ="&amp;#x200B;\n\nhttps://preview.redd.it/rkwi8ibv7es61.jpg?width=3024&amp;format=pjpg&amp;auto=webp&amp;s=9be6561828262dc6b980c6e4803978f47f4b5bac\n\nSo some of you might remember the [modded build](https://www.reddit.com/r/HomeServer/comments/f4kc7a/8_hotswap_bay_on_the_cheap_in_modded_case/) I did last year. Well recently I was looking for a clean way to add multiple SATA SSD's for cache pools without having them just lay at the bottom of my case, so I got this [5.25in to 6 x 2.5in drives hot-swap bay](https://www.amazon.ca/gp/product/B01M0BIPYC/ref=ppx_yo_dt_b_asin_title_o01_s01?ie=UTF8&amp;psc=1) from IcyDock. I was also looking to clean up the inside since my first mod left loads of sharp metal edges and the mounting solution for the bottom HDD bay was really janky.\n\n&amp;#x200B;\n\n&amp;#x200B;\n\n[\\^\\^\\^\\^ old mod                                                new mod \\^\\^\\^\\^](https://preview.redd.it/o68zl7r0bes61.jpg?width=5996&amp;format=pjpg&amp;auto=webp&amp;s=8ff9d06a758a41d354c563eb33a8e81d00520dc9)\n\nSo first off, after taking some measurements, I cut an additional space at the bottom to accommodate a 7th 5,25in slot. I also removed all the excess metal that I had previously bent out of the way.\n\n&amp;#x200B;\n\n&amp;#x200B;\n\nhttps://preview.redd.it/6z2tm5bnees61.jpg?width=2056&amp;format=pjpg&amp;auto=webp&amp;s=6ac3d323779194d2571946a416e301fd6397de6b\n\nThen, I got into Fusion 360 and designed these custom parts to support the hot-swap cages in a more elegant fashion and printed them with my resin printer that I got for other projects. These took me some time to design since the screw holes needed to be exact by no more than a 10th of a millimeter for everything to fit well.\n\n&amp;#x200B;\n\n&amp;#x200B;\n\nhttps://preview.redd.it/343ha9pcfes61.jpg?width=4032&amp;format=pjpg&amp;auto=webp&amp;s=b4dbeeb29417cfe633743d59ae057573d77c2e57\n\nhttps://preview.redd.it/lilau4pcfes61.jpg?width=3024&amp;format=pjpg&amp;auto=webp&amp;s=35abae1804dc33a940f84ee264707b488a13492d\n\n&amp;#x200B;\n\nFinally, it was assembly time! With the custom brackets and new hot-swap bay, I did my best to make things look as nice as possible given how cramped it is in this case.\n\n&amp;#x200B;\n\n&amp;#x200B;\n\nhttps://preview.redd.it/4h1xhx77hes61.jpg?width=4032&amp;format=pjpg&amp;auto=webp&amp;s=1f3121d719f03ca885edcdb2a0c167d4d8f5c76a\n\nAnd there we have it! 8 HDD plus 6 SSD all hot-swappable in a dirt cheap ATX case for space limited people! Hope this can help or inspire some who might be looking for custom solutions.\n\n&amp;#x200B;\n\nFor those who might be curious about the rest of my hardware, here's the list:\n\n* Intel i7 3770K\n* 16GB DDR3 ram\n* Asus P8Z77-V LX mobo\n* EVGA 500W PSU\n* LSI 9223-8i\n* 2x Rosewill hot-swap cages\n* Antec NSK4100 Case\n* Running Unraid\n\nStorage:\n\n* 4x 3\u00a0TB WD red drives\n* 1x 2\u00a0TB Seagate black drive\n* 2x 500\u00a0GB WD blue drives\n* 1x 240\u00a0GB SanDisk SSD\\* (waiting for my first 2x 1\u00a0TB WD blue SSD's to replace theses)\n* 1x 120\u00a0GB KINGSTON SSD\\*"

        
        var result_2 = extract_urls(data_2);
        //console.log(result_2);

        return  result_2 == 
            'https://preview.redd.it/rkwi8ibv7es61.jpg?width=3024&amp;format=pjpg&amp;auto=webp&amp;s=9be6561828262dc6b980c6e4803978f47f4b5bac',
            'https://www.reddit.com/r/HomeServer/comments/f4kc7a/8_hotswap_bay_on_the_cheap_in_modded_case/',
            'https://www.amazon.ca/gp/product/B01M0BIPYC/ref=ppx_yo_dt_b_asin_title_o01_s01?ie=UTF8&amp;psc=1',
            'https://preview.redd.it/o68zl7r0bes61.jpg?width=5996&amp;format=pjpg&amp;auto=webp&amp;s=8ff9d06a758a41d354c563eb33a8e81d00520dc9',
            'https://preview.redd.it/6z2tm5bnees61.jpg?width=2056&amp;format=pjpg&amp;auto=webp&amp;s=6ac3d323779194d2571946a416e301fd6397de6b',
            'https://preview.redd.it/343ha9pcfes61.jpg?width=4032&amp;format=pjpg&amp;auto=webp&amp;s=b4dbeeb29417cfe633743d59ae057573d77c2e57',
            'https://preview.redd.it/lilau4pcfes61.jpg?width=3024&amp;format=pjpg&amp;auto=webp&amp;s=35abae1804dc33a940f84ee264707b488a13492d',
            'https://preview.redd.it/4h1xhx77hes61.jpg?width=4032&amp;format=pjpg&amp;auto=webp&amp;s=1f3121d719f03ca885edcdb2a0c167d4d8f5c76a';
           
        
    });

    run_test(function() {
        
        
        data_3 ="Good Morning Everyone!"

        
        var result_3 = extract_urls(data_3);
        console.log(result_3);

        return  result_3 == '';
            
          
        
    });
    
    console.log(tests_passed + "/" + tests_run + " tests passed successfully.");
}














