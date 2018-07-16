# app.py

import os
import logging
import redis
import gevent
from flask import Flask, render_template, request
from flask_sockets import Sockets
from flask_sslify import SSLify
from time import strftime
import json
import shortuuid
from app_tests import app_tests

REDIS_URL = os.environ['REDIS_URL']
DEBUG = 'DEBUG' in os.environ
GLOBAL_CHANNEL = 'chat'


# setup redis
redis = redis.from_url(REDIS_URL)

# setup app
app = Flask(__name__)
app.debug = DEBUG

# register test pages
app.register_blueprint(app_tests, url_prefix='/test')

# ssl yes!
sslify = SSLify(app)

# switch up our jinja options so that they don't conflict with view
jinja_options = app.jinja_options.copy()
jinja_options.update(dict(
    block_start_string='$%', # was {%
    block_end_string='%$', # was %}
    variable_start_string='${', # was {{
    variable_end_string='}$', # was }}
    comment_start_string='$#', # was {#
    comment_end_string='#$', # was #}
))
app.jinja_options = jinja_options

# setup sockets
sockets = Sockets(app)

#add logging
if not DEBUG:
    log_handler = logging.StreamHandler()
    log_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s '
        '[in %(pathname)s:%(lineno)d]'))
    app.logger.addHandler(log_handler)
app.logger.setLevel(logging.DEBUG)


class PubSubBackend(object):
    """Interface for registering and updating WebSocket clients."""

    def __init__(self):
        self.clients = {}
        self.pubsub = redis.pubsub()
        self.pubsub.subscribe(GLOBAL_CHANNEL) # if we don't add a subscription here, no additional subscription will fire aellis 5/19/2018

    def __iter_data(self):
        for message in self.pubsub.listen():
            app.logger.info('message %s' % message)
            data = message.get('data')
            channel = message.get('channel')
            if message['type'] == 'message':
                app.logger.info('Sending message: {}'.format(data))
                yield (channel, data)

    def register(self, channel, client):
        """Register a WebSocket connection for Redis updates."""
        if channel not in self.clients:
            app.logger.info('Subscribing to channel: {}'.format(channel))
            self.pubsub.subscribe(channel)
            self.clients[channel] = [client]
        else:
            self.clients[channel].append(client)

    def send(self, client, channel, data):
        """Send given data to the registered client.
        Automatically discards invalid connections."""
        try:
            client.send(data)
        except Exception:
            self.clients[channel].remove(client)

    def run(self):
        """Listens for new messages in Redis, and sends them to clients."""
        app.logger.info("run")
        for (channel, data) in self.__iter_data():
            data = data.decode("utf-8")
            channel = channel.decode("utf-8")
            clients = self.clients.get(channel, [])
            app.logger.info('Sending message: {} on channel: {} to {} clients'.format(data, channel, len(clients)))
            for client in clients:
                gevent.spawn(self.send, client, channel, data)
        app.logger.info("run-exit")

    def start(self):
        """Maintains Redis subscription in the background."""
        gevent.spawn(self.run)



pubsub = PubSubBackend()
pubsub.start()


@app.route('/')
def hello():
    return render_template('index.html')

@app.route('/leader')
def leader():
    return render_template('leader.html')

@app.route('/follower')
def follower():
    follower_id = make_follower_id()
    return render_template('follower.html', qr_code=follower_id, follower_id=follower_id)


@sockets.route('/submit')
def inbox(ws):
    """Receives incoming chat messages, inserts them into Redis."""
    while not ws.closed:
        # Sleep to prevent *constant* context-switches.
        gevent.sleep(0.1)
        message = ws.receive()
        channel = get_channel(message)
        if message:
            app.logger.info('Inserting message: {} on channel {}'.format(message, channel))
            redis.publish(channel, message)

@sockets.route('/receive')
def outbox(ws):
    """Sends outgoing chat messages, via `PubSubBackend`."""

    channel = GLOBAL_CHANNEL
    app.logger.info('Receive on channel: {}'.format(channel))
    pubsub.register(channel, ws)

    while not ws.closed:
        # Context switch while `PubSubBackend.start` is running in the background.
        gevent.sleep(0.1)

@sockets.route('/receive/<channel>')
def outbox(ws, channel):
    """Sends outgoing chat messages, via `PubSubBackend`."""

    app.logger.info('Receive on channel: {}'.format(channel))
    pubsub.register(channel, ws)

    while not ws.closed:
        # Context switch while `PubSubBackend.start` is running in the background.
        gevent.sleep(0.1)



@app.after_request
def after_request(response):
    # This IF avoids the duplication of registry in the log,
    # since that 500 is already logged via @app.errorhandler.
    if response.status_code != 500:
        ts = strftime('[%Y-%b-%d %H:%M]')
        app.logger.info('%s %s %s %s %s %s',
                      ts,
                      request.remote_addr,
                      request.method,
                      request.scheme,
                      request.full_path,
                      response.status)
    return response

def get_channel(message):
    try:
        return json.loads(message).get('channel', GLOBAL_CHANNEL)
    except:
        return GLOBAL_CHANNEL

def make_follower_id():
    return shortuuid.uuid()[:7] # use first 7 digits of shortuuid, should be enough :)

