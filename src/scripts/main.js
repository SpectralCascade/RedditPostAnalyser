
function parseJSON(data) {
  if (data != null)
  {
    data = process_raw(data);
    localStorage.setItem("redditDataJSON", data);
    chrome.tabs.create({url: 'src/ui/output.html'});
  }
  else
  {
    chrome.tabs.create({url: 'src/ui/error.html'});
  }
}

function main(tab) {
    download_raw(tab.url, parseJSON);
}

chrome.browserAction.onClicked.addListener(main);
