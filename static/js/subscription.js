


class Subscription {
    
    constructor(qrCode){
        console.log("subscribeTo", qrCode)
        // Support TLS-specific URLs, when appropriate.
        if (window.location.protocol == "https:") {
          var ws_scheme = "wss://";
        } else {
          var ws_scheme = "ws://"
        };

        this.inbox = new ReconnectingWebSocket(ws_scheme + location.host + "/receive/" + qrCode);

        this.inbox.onmessage = function(message) {
            console.log(this.inbox)
          console.log(message)
          console.log(message.data)
          console.log(typeof(message.data))
          var data = JSON.parse(message.data);
          console.log(data)
          console.log(typeof(data))
          //$("#chat-text").append("<div class='panel panel-default'><div class='panel-heading'>" + $('<span/>').text(data.handle).html() + "</div><div class='panel-body'>" + $('<span/>').text(data.text).html() + "</div></div>");
          //$("#chat-text").stop().animate({
          //  scrollTop: $('#chat-text')[0].scrollHeight
          //}, 800);
        };

        this.inbox.onclose = function(){
            console.log('inbox closed');
            console.log(this.inbox)
            this.inbox = new WebSocket(inbox.url);
        };
    }
}