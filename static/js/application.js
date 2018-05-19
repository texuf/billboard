// Support TLS-specific URLs, when appropriate.
if (window.location.protocol == "https:") {
  var ws_scheme = "wss://";
} else {
  var ws_scheme = "ws://"
};


var inbox = new ReconnectingWebSocket(ws_scheme + location.host + "/receive");
var outbox = new ReconnectingWebSocket(ws_scheme + location.host + "/submit");

inbox.onmessage = function(message) {
  console.log(message)
  console.log(message.data)
  console.log(typeof(message.data))
  var data = JSON.parse(message.data);
  console.log(data)
  console.log(typeof(data))
  $("#chat-text").append("<div ><div >" + $('<span/>').text(data.handle).html() + "</div><div >" + $('<span/>').text(data.text).html() + "</div></div>");
  $("#chat-text").stop().animate({
    scrollTop: $('#chat-text')[0].scrollHeight
  }, 800);
};

inbox.onclose = function(){
    console.log('inbox reconnecting...');
};

outbox.onclose = function(){
    console.log('outbox reconnecting...');
};

$("#input-form-marker").on("submit", function(event) {
  event.preventDefault();
  var follower = $("#input-follower")[0].value;
  var marker   = $("#input-marker")[0].value;
  outbox.send(JSON.stringify({ channel: follower, type:"marker", marker: marker }));
  $("#input-marker")[0].value = "";
});
