
$("#input-form-marker").on("submit", function(event) {
  event.preventDefault();
  var follower = $("#input-follower")[0].value;
  var marker   = $("#input-marker")[0].value;
  outbox.send(JSON.stringify({ channel: follower, type:"marker", marker: marker }));
  // $("#input-marker")[0].value = "";
});


$("#input-form-image").on("submit", function(event) {
  event.preventDefault();
  var follower = $("#input-follower")[0].value;
  var image   = $("#input-image")[0].value;
  outbox.send(JSON.stringify({ channel: follower, type:"image", image: image }));
});


$("#input-form-position").on("submit", function(event) {
  event.preventDefault();
  var follower = $("#input-follower")[0].value;
  var x   = $("#input-x")[0].value;
  var y   = $("#input-y")[0].value;
  var width   = $("#input-width")[0].value;
  var height   = $("#input-height")[0].value;
  outbox.send(JSON.stringify({ channel: follower, type:"position", x: x, y: y, width: width, height: height }));
});


$("#input-form-chat").on("submit", function(event) {
  event.preventDefault();
  var handle = $("#input-handle")[0].value;
  var text   = $("#input-text")[0].value;
  outbox.send(JSON.stringify({ handle: handle, text: text }));
  $("#input-text")[0].value = "";
});