
// assert assumptions
console.assert(typeof inbox != 'undefined', "please import pubsub.js before continuing")


function startPubSubTest() {
    // send a hello world message
    sendChatMessage("pubsub-bot", "I'm awake!")


    // set an interval that puts some text on the screen every second
    setInterval(function() {
        sendChatMessage("pubsub-bot", "The time is " + (new Date()).toLocaleTimeString() )
    }, 4000);


    // test the follower functionality, create a follower
    var clientId = "f" + new Date().getTime() + Math.floor(Math.random() * 100)
    var client = new PubSubClient(function(message) {
        console.log("on direct message", message)
          $("#chat-text").append("<div >" + $('<span/>').text(clientId).html() + ": " + $('<span/>').text('got "' + message.type + '" message' ).html() + "</div>");
    });

    // create a unique id
    client.initialize(clientId)
    sendMarkerMessage(client.id, 2)
    sendImageMessage(client.id, "image", 10, 10)
    sendPositionMessage(client.id, 4, 5, 10)
}



$("#input-form-marker").on("submit", function(event) {
    event.preventDefault();
    var follower = $("#input-marker-follower")[0].value;
    var marker = $("#input-marker")[0].value;
    sendMarkerMessage(follower, marker);
});

$("#input-form-ping").on("submit", function(event) {
    event.preventDefault();
    var follower = $("#input-ping-follower")[0].value;
    var timeout = $("#input-ping")[0].value;
    sendPing(follower, timeout);
});

$("#input-form-image").on("submit", function(event) {
    event.preventDefault();
    var follower = $("#input-image-follower")[0].value;
    var imageURL = $("#input-image-url")[0].value;
    var imageWidth = $("#input-image-width")[0].value;
    var imageHeight = $("#input-image-height")[0].value;
    sendImageMessage(follower, imageURL, imageWidth, imageHeight);
});


$("#input-form-position").on("submit", function(event) {
    event.preventDefault();
    var follower = $("#input-position-follower")[0].value;
    var x = $("#input-position-x")[0].value;
    var y = $("#input-position-y")[0].value;
    var scale = $("#input-position-scale")[0].value;
    sendPositionMessage(follower, x, y, scale);
});


// add form listeners
$("#input-form-chat").on("submit", function(event) {
    event.preventDefault();
    var handle = $("#input-chat-handle")[0].value;
    var text = $("#input-chat-text")[0].value;
    sendChatMessage(handle, text)
    $("#input-text")[0].value = "";
});

