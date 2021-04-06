var mainTab = null;
let placeholder = {};

function parseJSON(data) {
    if (data != null)
    {
        process_raw(data, function(stage, processed) {
            if (stage === "ERROR") {
                // Uh oh
            }
            else if (stage === "initial") {
                // Initial post processing is complete, lets gooo
                //console.log("JSON:\n\n" + JSON.stringify(processed));
                localStorage.setItem("redditDataJSON", JSON.stringify(processed));
                chrome.tabs.create({url: 'src/ui/output.html'});
            }
        });
    }
    else if (mainTab != null)
    {
        chrome.tabs.sendMessage(mainTab.id, {action: "Popup"}, function(response) {
            // Nothing here needed
        });
    }
    mainTab = null;
}

function main(tab) {
    mainTab = tab;
    download_raw(tab.url, parseJSON);
}

chrome.browserAction.onClicked.addListener(main);
