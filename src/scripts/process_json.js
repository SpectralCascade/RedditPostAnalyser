
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

function download_raw(url, parseDataCallback) {
    let mainurl = url + '.json';

    var xhttp = new XMLHttpRequest();

    xhttp.open("GET", mainurl, false);
    xhttp.setRequestHeader("Content-Type", "*/*");

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

function process_raw(raw_json) {
    var data = JSON.parse(raw_json);
    
    var postLinks = [];
    
    if (data.length > 0) {
        // First, analyse the post itself        
        for (var i = 0, counti = data[0].data.children.length; i < counti; i++) {
            post = data[0].data.children[i].data.selftext;
            
            var foundIndex = 0;
            do {
                foundIndex = post.indexOf("://", foundIndex);
                if (foundIndex >= 0) {
                    // First make sure link is http or https
                    if (foundIndex >= 4 && post.slice(foundIndex - 4, foundIndex) === "http" ||
                        foundIndex > 4 && post.slice(foundIndex - 5, foundIndex) === "https") {
                        
                        var url = "http";
                        var allowedCharacters = "!#$&'()*+,/:;=?@[]abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_.~%";
                        for (var c = foundIndex; c < post.length; c++) {
                            
                            var cc = post[c].charCodeAt(0);
                            var isValid = (cc === 33 || (cc >= 35 && cc <= 59) ||
                            cc === 61 || (cc >= 63 && cc <= 91) ||
                            cc === 93 || cc === 95 || 
                            (cc >= 97 && cc <= 122) || cc === 126);
                                                        
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
        
        console.log("Found links:\n\n" + String(postLinks));
        
    }
    
    
    return data;
}

if (typeof module !== 'undefined') {
    module.exports = { download_raw, process_raw };
}
