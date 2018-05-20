

class Follower {

    constructor() {
        this.inboxes = []
    }

    subscribe(followerID){
        console.log("subscribeTo", followerID)
        // Support TLS-specific URLs, when appropriate.
        if (window.location.protocol == "https:") {
          var ws_scheme = "wss://";
        } else {
          var ws_scheme = "ws://"
        };

        var inbox = new ReconnectingWebSocket(ws_scheme + location.host + "/receive/" + followerID);

        var self = this

        inbox.onmessage = function(message) {
          var data = JSON.parse(message.data);
          self.onMessage(data)
        };

        inbox.onclose = function(){
            console.log('inbox reconnecting...', followerID);
        };

        this.inboxes.push(inbox)
    }

    onMessage(message) {
        switch (message.type) {
            case "marker":
                console.log("got message to display marker", message.marker)
                // remove qr code from dom
                // add marker
                break
            case "image":
                console.log("got message to display image", message.image)
                break
            case "position":
                console.log("got message to display position", message.x, message.y, message.width, message.height)
                break
            default:
                console.error("got unknown message type", message)
        }
    }
}

var follower = new Follower()
