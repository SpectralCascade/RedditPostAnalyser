var mainTab = null;

function parseJSON(data) {
    if (data != null)
    {
        data = process_raw(data);
        localStorage.setItem("redditDataJSON", data);
        chrome.tabs.create({url: 'src/ui/output.html'});
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
