
console.assert(typeof PubSubClient != 'undefined', 'import pubsub-client.js before continuing')
console.assert(typeof setARMarkerImage != 'undefined', 'import follower-armarker.js before continuing')

var baseURL = ''

var follower = new PubSubClient(function(message) {
    switch (message.type) {
        case "marker":
            console.log("got message to display marker", message.marker)
            // remove qr code from dom
            // add marker
            jQuery('#qrcodeCanvas').empty(); // empty removes children, remove removes the whole thing
            setARMarkerImage(baseURL + message.marker + ".png")
            break
        case "image":
            console.log("got message to display image", message.image)
            break
        case "position":
            console.log("got message to display position", message.x, message.y, message.width, message.height)
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