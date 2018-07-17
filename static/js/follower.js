
console.assert(typeof PubSubClient != 'undefined', 'import pubsub-client.js before continuing')
console.assert(typeof setARMarkerImage != 'undefined', 'import follower-armarker.js before continuing')

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
        default:
            console.error("got unknown message type", message)
    }
})

function startFollowing(followerId, baseURL) {
    setARMarkerBaseURL(baseURL)
    follower.initialize(followerId)
}