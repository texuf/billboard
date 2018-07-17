from flask import Blueprint, render_template, abort
from jinja2 import TemplateNotFound


app_tests = Blueprint('app_tests', __name__, template_folder='templates')


# standalone qr code reader
@app_tests.route('/reader')
def reader():
    return render_template('test/reader.html')

# for testing follower
@app_tests.route('/follower/<follower_id>')
def follower_render_image(follower_id):
    if follower_id == '[follower_id]': follower_id = 'some-test-id'
    return render_template('follower.html', qr_code=follower_id, follower_id=follower_id)


# for testing markers
@app_tests.route('/follower/armarker/<marker_id>')
def follower_marker(marker_id):
    if marker_id == '[marker_id]': marker_id = 0
    return render_template('test/follower-armarker.html', marker_id=marker_id)


# test basic chat functionality
@app_tests.route('/pubsub')
def test_pubsub():
    return render_template('test/pubsub.html')

