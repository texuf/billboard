

console.assert(typeof ReconnectingWebSocket != 'undefined', "please import reconnecting-websocket.js continuing")

// Support TLS-specific URLs, when appropriate.
if (window.location.protocol == "https:") {
    var ws_scheme = "wss://";
} else {
    var ws_scheme = "ws://"
};

var inbox = new ReconnectingWebSocket(ws_scheme + location.host + "/receive");
var outbox = new ReconnectingWebSocket(ws_scheme + location.host + "/submit");


inbox.onclose = function() {
    console.log('inbox reconnecting...');
};

outbox.onclose = function() {
    console.log('outbox reconnecting...');
};




function sendMarkerMessage(followerId, markerId) {
    if (outbox.readyState == 0) {
        console.log("delaying pubsub because outboox isn't ready")
        setTimeout(function() { sendMarkerMessage(followerId, markerId); }, 100)
    } else {
      outbox.send(JSON.stringify({
          channel: followerId,
          type: "marker",
          marker: markerId
      }));
    }
}

function sendPing(followerId, timeout) {
    if (!timeout) {
        timeout = 10
    }
    if (outbox.readyState == 0) {
        console.log("delaying pubsub because outboox isn't ready")
        setTimeout(function() { ping(followerId, timeout); }, 100)
    } else {
      outbox.send(JSON.stringify({
          channel: followerId,
          type: "ping",
          timeout: timeout
      }));
    }
}

function sendImageMessage(followerId, imageURL, imageWidth, imageHeight) {
    if (outbox.readyState == 0) {
        console.log("delaying pubsub because outboox isn't ready")
        setTimeout(function() { sendImageMessage(followerId, imageURL, imageWidth, imageHeight); }, 100)
    } else {
      outbox.send(JSON.stringify({
          channel: followerId,
          type: "image",
          imageURL: imageURL,
          imageWidth: imageWidth,
          imageHeight: imageHeight
      }));
    }
}

function sendPositionMessage(followerId, x, y, scale) {
  if (outbox.readyState == 0) {
        console.log("delaying pubsub because outboox isn't ready")
        setTimeout(function() { sendPositionMessage(followerId, x, y, scale); }, 100)
    } else {
      outbox.send(JSON.stringify({
          channel: followerId,
          type: "position",
          x: x,
          y: y,
          scale: scale
      }));
    }
}

function sendChatMessage(handle, text) {
    if (outbox.readyState == 0) {
        console.log("delaying pubsub because outboox isn't ready")
        setTimeout(function() { sendChatMessage(handle, text); }, 100)
    } else {
        outbox.send(JSON.stringify({
            handle: handle,
            text: text
        }));
    }
}
