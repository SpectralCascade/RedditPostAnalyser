function ModalOpen() {
  var modal = document.getElementById("Modal");
  window.onclick = function(event) {
    if (event.target == modal) {
      window.close();
  }
}

}


function ImportJSON() {
  var localdata = document.getElementById("JSON").value;
  localdata = process_raw(localdata);
  localStorage.setItem("redditDataJSON", localdata);
  chrome.tabs.create({url: 'src/ui/output.html'});
}
