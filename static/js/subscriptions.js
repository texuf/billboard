

class Subscriptions {

    constructor() {
        this.inboxes = []
        this.callbacks = []
    }

    add(followerID, onMessage){
        console.log("subscribeTo", followerID)
        // Support TLS-specific URLs, when appropriate.
        if (window.location.protocol == "https:") {
          var ws_scheme = "wss://";
        } else {
          var ws_scheme = "ws://"
        };

        var inbox = new ReconnectingWebSocket(ws_scheme + location.host + "/receive/" + followerID);

        inbox.onmessage = function(message) {
          var data = JSON.parse(message.data);
          console.log(data)
          //$("#chat-text").append("<div class='panel panel-default'><div class='panel-heading'>" + $('<span/>').text(data.handle).html() + "</div><div class='panel-body'>" + $('<span/>').text(data.text).html() + "</div></div>");
          //$("#chat-text").stop().animate({
          //  scrollTop: $('#chat-text')[0].scrollHeight
          //}, 800);
          onMessage(data)
        };

        inbox.onclose = function(){
            console.log('inbox reconnecting...', followerID);
        };

        this.inboxes.push(inbox)
    }
}

var subscriptions = new Subscriptions()
