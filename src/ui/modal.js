
document.getElementById("JSON").onchange = ImportJSON ;
document.getElementById("JSON").onclick = function() {
  this.value = null;
}

function ImportJSON() {
  var reader = new FileReader();
  reader.readAsText(this.files[0]);
  reader.onload = function() {
    localStorage.setItem("redditDataJSON", reader.result);
    chrome.tabs.create({url: 'src/ui/output.html'});
  }
}
