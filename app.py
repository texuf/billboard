# app.py

import os
import logging
import gevent
from flask import Flask, render_template, request, url_for, jsonify
from flask_sockets import Sockets
from flask_sslify import SSLify
from time import strftime
import json
import shortuuid
from app_pubsub import pubsub, GLOBAL_CHANNEL
from app_tests import app_tests

DEBUG = 'DEBUG' in os.environ



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

# all tests
@app.route('/tests')
@app.route('/test')
def list_routes():
    import urllib
    output = []
    for rule in app.url_map.iter_rules():
        options = {arg: "[{0}]".format(arg) for arg in rule.arguments}
        url = urllib.parse.unquote( url_for(rule.endpoint, **options) )
        if '/test/' in url:
            output.append(url)
    
    return render_template('test/tests.html', tests=sorted(output))


@sockets.route('/submit')
def inbox(ws):
    """Receives incoming chat messages, inserts them into Redis."""
    while not ws.closed:
        # Sleep to prevent *constant* context-switches.
        gevent.sleep(0.1)
        message = ws.receive()
        if message:
            channel = get_channel(message)
            app.logger.info('Inserting message: {} on channel {}'.format(message, channel))
            pubsub.publish(channel, message)

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

