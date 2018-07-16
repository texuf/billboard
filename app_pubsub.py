# app_pubsub.py

import os
import redis
import gevent


REDIS_URL = os.environ['REDIS_URL']
GLOBAL_CHANNEL = 'chat'

# setup redis
redis = redis.from_url(REDIS_URL)


class PubSubBackend(object):
    """Interface for registering and updating WebSocket clients."""

    def __init__(self):
        self.clients = {}
        self.pubsub = redis.pubsub()
        self.pubsub.subscribe(GLOBAL_CHANNEL) # if we don't add a subscription here, no additional subscription will fire aellis 5/19/2018

    def start(self):
        """Maintains Redis subscription in the background."""
        gevent.spawn(self._run)

    def register(self, channel, client):
        """Register a WebSocket connection for Redis updates."""
        if channel not in self.clients:
            self.pubsub.subscribe(channel)
            self.clients[channel] = [client]
        else:
            self.clients[channel].append(client)

    def publish(self, channel, message):
        redis.publish(channel, message)

    def __iter_data(self):
        for message in self.pubsub.listen():
            data = message.get('data')
            channel = message.get('channel')
            if message['type'] == 'message':
                yield (channel, data)

    def _send(self, client, channel, data):
        """Send given data to the registered client.
        Automatically discards invalid connections."""
        try:
            client.send(data)
        except Exception:
            self.clients[channel].remove(client)

    def _run(self):
        """Listens for new messages in Redis, and sends them to clients."""
        for (channel, data) in self.__iter_data():
            data = data.decode("utf-8")
            channel = channel.decode("utf-8")
            clients = self.clients.get(channel, [])
            for client in clients:
                gevent.spawn(self._send, client, channel, data)




pubsub = PubSubBackend()
pubsub.start()


