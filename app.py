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

REDIS_URL = os.environ['REDIS_URL']
DEBUG = 'DEBUG' in os.environ
REDIS_CHAN = 'chat'


redis = redis.from_url(REDIS_URL)
app = Flask(__name__)
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
app.debug = DEBUG
sockets = Sockets(app)

#add logging
if not DEBUG:
    log_handler = logging.StreamHandler()
    log_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s '
        '[in %(pathname)s:%(lineno)d]'))
    app.logger.addHandler(log_handler)

app.logger.setLevel(logging.DEBUG)

class ChatBackend(object):
    """Interface for registering and updating WebSocket clients."""

    def __init__(self):
        self.clients = list()
        self.pubsub = redis.pubsub()
        self.pubsub.subscribe(REDIS_CHAN)

    def __iter_data(self):
        for message in self.pubsub.listen():
            # app.logger.info('message %s' % message)
            data = message.get('data')
            if message['type'] == 'message':
                # app.logger.info('Sending message: {}'.format(data))
                yield data

    def register(self, client):
        """Register a WebSocket connection for Redis updates."""
        self.clients.append(client)

    def send(self, client, data):
        """Send given data to the registered client.
        Automatically discards invalid connections."""
        try:
            client.send(data)
        except Exception:
            self.clients.remove(client)

    def run(self):
        """Listens for new messages in Redis, and sends them to clients."""
        for data in self.__iter_data():
            data = data.decode("utf-8")
            app.logger.info('Sending message: {} to {} clients'.format(data, len(self.clients)))
            for client in self.clients:
                gevent.spawn(self.send, client, data)

    def start(self):
        """Maintains Redis subscription in the background."""
        gevent.spawn(self.run)



chats = ChatBackend()
chats.start()


@app.route('/')
def hello():
    return render_template('index.html')

@app.route('/leader')
def leader():
    return render_template('leader.html')


@app.route('/follower')
def follower():
    return render_template('follower.html', follower_id=request.cookies.get('followerID'))

@app.route('/followerID')
def follower_id():
    follower_id = shortuuid.uuid()
    resp = render_template('followerID.html', follower_id=follower_id)
    resp.set_cookie('followerID', follower_id)
    return resp

@app.route('/reader')
def reader():
    return render_template('reader.html')


@sockets.route('/submit')
def inbox(ws):
    """Receives incoming chat messages, inserts them into Redis."""
    while not ws.closed:
        # Sleep to prevent *constant* context-switches.
        gevent.sleep(0.1)
        message = ws.receive()

        if message:
            # app.logger.info('Inserting message: {}'.format(message))
            redis.publish(REDIS_CHAN, message)

@sockets.route('/receive')
def outbox(ws):
    """Sends outgoing chat messages, via `ChatBackend`."""
    chats.register(ws)

    while not ws.closed:
        # Context switch while `ChatBackend.start` is running in the background.
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
