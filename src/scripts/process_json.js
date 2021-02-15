/*try {
    process.argv.forEach((val, index) => {
        console.log(`${index}: ${val}`);
    });
}
catch (err) {
    //console.log("Error: " + err.message)
    alert("Error: " + err.message);
}*/

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
    data = raw_json;
    return data;
}

if (typeof module !== 'undefined') {
    module.exports = { download_raw, process_raw };
}
