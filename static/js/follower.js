
console.assert(typeof PubSubClient != 'undefined', 'import pubsub-client.js before continuing')
console.assert(typeof setARMarkerImage != 'undefined', 'import follower-armarker.js before continuing')
console.assert(typeof showImage != 'undefined', 'import follower-image.js before continuing')

var baseURL = ''

function hideQRCode() {
    jQuery('#qrcodeCanvas').empty(); // empty removes children, remove removes the whole thing
}

var follower = new PubSubClient(function(message) {
    switch (message.type) {
        case "marker":
            console.log("got message to display marker ;)", message.marker)
            // remove image from dom
            hideImage()
            // remove qr code from dom
            hideQRCode()
            // add marker
            setARMarkerImage(baseURL + message.marker + ".png")
            break
        case "image":
            console.log("got message to display image", message.imageURL, message.imageWidth, message.imageHeight)
            hideQRCode()
            hideARCode()
            showImage(message.imageURL, message.imageWidth, message.imageHeight)
            break
        case "position":
            console.log("got message to display position", message.x, message.y, message.scale)
            positionImage(message.x, message.y, message.scale)
            break
        case "ping":
            console.log("got ping", message.timeout)
            break
        default:
            console.error("got unknown message type", message)
    }

    // if we preview, print it to the screen
    if (typeof pubsubPreview != 'undefined') {
        pubsubPreview(message.type, JSON.stringify(message))
    }
})

function startFollowing(followerId, baseURL) {
    self.baseURL = baseURL
    follower.initialize(followerId)
}