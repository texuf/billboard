

console.assert(typeof inbox != 'undefined', "please import pubsub.js before continuing")
console.assert(document.getElementById('chat-text'), "please create div with id 'chat-text' continuing")

inbox.onmessage = function(message) {
  var data = JSON.parse(message.data);
  console.log("onmessage", data)
  $("#chat-text").append("<div >" + $('<span/>').text(data.handle).html() + ": " + $('<span/>').text(data.text).html() + "</div>");
  $("#chat-text").stop().animate({
    scrollTop: $('#chat-text')[0].scrollHeight
  }, 800);
};