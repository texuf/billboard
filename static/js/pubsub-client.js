
class PubSubClient {
    constructor(onMessage) {
        console.assert(onMessage, "onMessage callback should not be null")
        this.inbox = null
        this.onMessage = onMessage
        this.id = null
    }

    initialize(clientId) {
        console.log("subscribing to", clientId)
        console.assert(clientId && clientId.length > 0, "failed to provide clientId")
        console.assert(this.inbox == null, "PubSubClient has already been initialized")
        console.assert(typeof ws_scheme != 'undefined', 'please import pubsub.js before continuing')
        this.id = clientId
        this.inbox = new ReconnectingWebSocket(ws_scheme + location.host + "/receive/" + clientId);

        var self = this

        this.inbox.onmessage = function(message) {
            var data = JSON.parse(message.data);
            self.onMessage(data)
        };

        this.inbox.onclose = function() {
            console.log('inbox reconnecting...', clientId);
        };

    }
}
