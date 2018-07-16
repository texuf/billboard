//////////////////////////////////////////////////////////////////////////////
//                build canvas 
//////////////////////////////////////////////////////////////////////////////
console.log('screen size', document.getElementById('qrcodeCanvasWrapper').offsetWidth, document.getElementById('qrcodeCanvasWrapper').offsetHeight)
var qrcodeSize = Math.min(document.getElementById('qrcodeCanvasWrapper').offsetWidth, document.getElementById('qrcodeCanvasWrapper').offsetHeight) - 120
var canvas = document.createElement('canvas');
canvas.width = qrcodeSize * 2;
canvas.height = qrcodeSize * 2;
canvas.style.width = (qrcodeSize) + 'px';
canvas.style.height = (qrcodeSize) + 'px';

var hiroImage = new Image;
var baseURL = ''

hiroImage.onload = function() {
    console.log('hiro image loaded')
    updateARCode()
}


function updateARCode() {
    document.querySelector('#arcode-container').appendChild(canvas)

    var context = canvas.getContext('2d')

    context.drawImage(hiroImage, 0, 0, canvas.width, canvas.height);
}


function setHeroImage(url) {
    hiroImage.src = url
}


var follower = new PubSubClient(function(message) {
    switch (message.type) {
        case "marker":
            console.log("got message to display marker", message.marker)
            // remove qr code from dom
            // add marker
            jQuery('#qrcodeCanvas').empty(); // empty removes children, remove removes the whole thing
            setHeroImage(baseURL + message.marker + ".png")
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
})

function startFollowing(followerId, baseURL) {
    self.baseURL = baseURL
    follower.initialize(followerId)
    //follower.initialize("yrkZuJX", "${url_for('static', filename='images/3x3/')}$")
}