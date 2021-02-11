function main(tab) {    
  let mainurl = tab.url + '.json';

  var xhttp = new XMLHttpRequest();

  xhttp.open("GET", mainurl, true);
  xhttp.setRequestHeader("Content-Type", "*/*");

  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4) {
      if (xhttp.status == 200) {
        parseJSON(xhttp.responseText);
      } else {
        parseJSON(null);
      }
    }
  };
  xhttp.send();
}

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

chrome.browserAction.onClicked.addListener(main);
