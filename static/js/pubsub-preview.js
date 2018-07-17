

console.assert(typeof inbox != 'undefined', "please import pubsub.js before continuing")
console.assert(document.getElementById('chat-text'), "please create div with id 'chat-text' continuing")

// prepend chat messages to chat-text div
function pubsubPreview(handle, text) {
    $("#chat-text").prepend("<div >" + $('<span/>').text(handle).html() + ": " + $('<span/>').text(text).html() + "</div>");
}

// listen to chat messages
inbox.onmessage = function(message) {
    var data = JSON.parse(message.data);
    pubsubPreview(data.handle, data.text)
};