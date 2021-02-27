function Popup() {
    var iFrame  = document.getElementById("_rpa_modal_popup_frame");
    if (iFrame == null) {
        iFrame = document.createElement ("iframe");
        iFrame.id = "_rpa_modal_popup_frame";
    }
    
    iFrame.src  = chrome.extension.getURL ("src/ui/modal.html");
    iFrame.width = 500;
    iFrame.height = 200;
    
    // Make sure the popup sits on top of the page in a fixed position
    iFrame.style.position = "fixed";
    iFrame.style.zIndex = 9999999;
    iFrame.style.display = "Block";
    iFrame.style.right = 0;
    iFrame.style.top = 0;
    iFrame.style.borderWidth = 0;

    document.body.insertBefore (iFrame, document.body.firstChild);
}

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    Popup();
    sendResponse(null);
});
