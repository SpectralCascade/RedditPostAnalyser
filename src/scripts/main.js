
function parseJSON(data) {
  if (data != null)
  {
    data = process_raw(data);
    localStorage.setItem("redditDataJSON", data);
    chrome.tabs.create({url: 'src/ui/output.html'});
  }
  else
  {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "Popup"}, function(response) {
      });
    });
  }
}

function main(tab) {
    download_raw(tab.url, parseJSON);
}

chrome.browserAction.onClicked.addListener(main);
