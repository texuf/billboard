
// assert assumptions
console.assert(typeof inbox != 'undefined', "please import pubsub.js before continuing")

// send a hello world message
sendMessage("pubsub-bot", "I'm awake!")

// set an interval that puts some text on the screen every second
setInterval(function() {
    sendMessage("pubsub-bot", "The time is " + (new Date()).toLocaleTimeString() )
}, 4000);


// add form listeners
$("#input-form-chat").on("submit", function(event) {
    event.preventDefault();
    var handle = $("#input-handle")[0].value;
    var text = $("#input-text")[0].value;
    sendMessage(handle, text)
    $("#input-text")[0].value = "";
});


$("#input-form-marker").on("submit", function(event) {
    event.preventDefault();
    var follower = $("#input-follower")[0].value;
    var marker = $("#input-marker")[0].value;
    sendMarkerMessage(follower, marker);
    // $("#input-marker")[0].value = "";
});


$("#input-form-image").on("submit", function(event) {
    event.preventDefault();
    var follower = $("#input-follower")[0].value;
    var image = $("#input-image")[0].value;
    sendImageMessage(follower, image);
});


$("#input-form-position").on("submit", function(event) {
    event.preventDefault();
    var follower = $("#input-follower")[0].value;
    var x = $("#input-x")[0].value;
    var y = $("#input-y")[0].value;
    var width = $("#input-width")[0].value;
    var height = $("#input-height")[0].value;
    sendPositionMessage(follower, x, y, width, height);
});

