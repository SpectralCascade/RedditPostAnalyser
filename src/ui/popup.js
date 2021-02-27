function Popup() {
    var iFrame  = document.createElement ("iframe");
    iFrame.src  = chrome.extension.getURL ("src/ui/modal.html");

    document.body.insertBefore (iFrame, document.body.firstChild);
}

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    Popup();
    sendResponse(null);
});
