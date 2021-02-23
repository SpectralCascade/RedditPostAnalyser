var asyncRequest = true;

if (typeof XMLHttpRequest === 'undefined') {
    var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    // Node standalone code requires response before continuing to next post URL
    asyncRequest = false;
}

function download_raw(url, parseDataCallback) {
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
}

function process_links(data, processed) {
    var postLinks = [];

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

    // Now convert links to searchable URI strings and search with pushshift
    var occurrenceCount = 0;
    for (var i = 0, counti = postLinks.length; i < counti; i++) {
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
                        occurrenceCount++;
                    }
                }
            }
        };
        xhttp.send();

    }
    
}

function process_meta(data, processed) {
    processed.title = obj[0].data.children[0].data.title;
}

function process_raw(raw_json) {
    var data = JSON.parse(raw_json);
    var processed = {};

    if (data.length > 0) {
        
        process_meta(data, processed);
        
        process_links(data, processed);

    }
    
    processed = data; // TODO: format processed data instead and remove me
    
    return JSON.stringify(processed);
}

if (typeof module !== 'undefined') {
    module.exports = { download_raw, process_raw };
}
