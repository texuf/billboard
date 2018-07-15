from flask import Blueprint, render_template, abort
from jinja2 import TemplateNotFound


app_tests = Blueprint('app_tests', __name__, template_folder='templates')


# for testing markers
@app_tests.route('/followerMarker/<marker_id>')
def followerMarker(marker_id):
    return render_template('tests/followerMarker.html', marker_id=marker_id)

# standalone qr code reader
@app_tests.route('/reader')
def reader():
    return render_template('tests/reader.html')


# standalone qr code reader
@app_tests.route('/follower_render_image')
def follower_render_image():
    follower_id = 'test_follower_render_image'
    return render_template('follower.html', qr_code=follower_id, follower_id=follower_id)

# test basic chat functionality
@app_tests.route('/pubsub')
def test_pubsub():
    return render_template('tests/pubsub.html')

