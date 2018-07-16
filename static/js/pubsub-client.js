
class PubSubClient {
    constructor(onMessage) {
        console.assert(onMessage, "onMessage callback should not be null")
        this.inboxes = []
        this.onMessage = onMessage
    }

    initialize(followerId) {
        console.log("subscribing to", followerId)
        console.assert(followerId && followerId.length > 0, "failed to provide followerId")
        console.assert(this.inboxes.length == 0, "PubSubClient has already been initialized")
        console.assert(typeof ws_scheme != 'undefined', 'please import pubsub.js before continuing')
        var inbox = new ReconnectingWebSocket(ws_scheme + location.host + "/receive/" + followerId);

        var self = this

        inbox.onmessage = function(message) {
            var data = JSON.parse(message.data);
            self.onMessage(data)
        };

        inbox.onclose = function() {
            console.log('inbox reconnecting...', followerId);
        };

        this.inboxes.push(inbox)
    }
}
