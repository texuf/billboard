
//////////////////////////////////////////////////////////////////////////////
//                build canvas 
//////////////////////////////////////////////////////////////////////////////
console.log('screen size', document.getElementById('qrcodeCanvasWrapper').offsetWidth, document.getElementById('qrcodeCanvasWrapper').offsetHeight)
var qrcodeSize = Math.min(document.getElementById('qrcodeCanvasWrapper').offsetWidth, document.getElementById('qrcodeCanvasWrapper').offsetHeight) - 40
var canvas = document.createElement('canvas');
canvas.width  = qrcodeSize * 2;
canvas.height = qrcodeSize * 2;
canvas.style.width  = (qrcodeSize) + 'px';
canvas.style.height = (qrcodeSize) + 'px';

var hiroImage = new Image;

hiroImage.onload = function() {
        console.log('hiro image loaded')
        updateARCode()
}


function updateARCode(){
        document.querySelector('#arcode-container').appendChild(canvas)

        var context = canvas.getContext('2d')
        
        context.drawImage(hiroImage, 0, 0, canvas.width, canvas.height);
}


function setHeroImage(url) {
    hiroImage.src = url
}



class Follower {

    constructor() {
        this.inboxes = []
    }

    initialize(followerID, baseURL){
        console.log("subscribeTo", followerID, baseURL)
        this.baseURL = baseURL
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
                jQuery('#qrcodeCanvas').empty(); // empty removes children, remove removes the whole thing
                setHeroImage(this.baseURL + message.marker + ".png")
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
