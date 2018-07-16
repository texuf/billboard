

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



function sendMessage(handle, text) {
    if (outbox.readyState == 0) {
        console.log("delaying pubsub because outboox isn't ready")
        setTimeout(function() { sendMessage(handle, text); }, 100)
    } else {
        outbox.send(JSON.stringify({
            handle: handle,
            text: text
        }));
    }
}

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

function sendImageMessage(followerId, image) {
  if (outbox.readyState == 0) {
        console.log("delaying pubsub because outboox isn't ready")
        setTimeout(function() { sendImageMessage(followerId, image); }, 100)
    } else {
      outbox.send(JSON.stringify({
          channel: followerId,
          type: "image",
          image: image
      }));
    }
}

function sendPositionMessage(followerId, x, y, width, height) {
  if (outbox.readyState == 0) {
        console.log("delaying pubsub because outboox isn't ready")
        setTimeout(function() { sendPositionMessage(followerId, x, y, width, height); }, 100)
    } else {
      outbox.send(JSON.stringify({
          channel: followerId,
          type: "position",
          x: x,
          y: y,
          width: width,
          height: height
      }));
    }
}
