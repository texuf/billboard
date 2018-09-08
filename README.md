# billboard (in progress)
Billboards
Check it out: https://protected-island-17148.herokuapp.com

### Architecture 

* [follower] initialized with `follower_id` and `qr_code` 
  * `qr_code` is just `{site_url}/follower_id`
* [follower] subscribe to any messages routed to `follower_id`
* [follower] draw image representing `qr_code` on screen
* [leader] recognize `qr_code` in scene, parse out `follower_id` by slicing on `{site_url}`
* [leader] route message to `follower_id` requesting follower to display specific `marker_id`
* [follower] display marker associated with `marker_id`
* [leader] detect `marker_id` in scene
* [leader] rinse wash repeat (continue to detect qr codes)
* [leader] press button to capture all positions of markers
* [leader] finally learn matrix multiplication (https://www.3dgep.com/understanding-the-view-matrix/)
* [leader] map coordinates to plane, preview that plane in scene
* [leader] send a stupid amount of messages to followers about all kinds of things including which part of a particular image to display how and when and occasionally when to re-calibrate 

### TODO / In Progress
* [X] Test - grab first measurement of the marker, then keep rendering the cube there, test resiliency 
  * this causes me to lose the 3d position of my marker. because we are never calculating the camera angle, only the location of the marker,  I don't think I'll be able to keep updating it in the scene unless I continually track the token
* [X] Switch to barcodes, try out the 3x3 markers downloaded from https://github.com/artoolkit/artoolkit5/tree/master/doc/patterns
  * works great!
* [X] Test - wrap the code in leader so that I can create many instances of trackers that each track a different marker
  * works great!
* [X] Test - will two MarkerDetector instances render images at the same time
  * from laptop - load controller screen with two hard coded detectors, 0 and 1
  * open follower/0 from phone 1
  * open follower/1 from phone 2
  * test if the controller will read both controllers at the same time
  * IT WORKS ! I can register up to 64 different codes. I expect that if the codes are stable it won't be an issue to recognize at least a subset of them. 
* [X] Open multiple browser windows displaying follower qr_codes, scan the qr codes with leader url on phone, 
* [X] after detecting qr code, send message from leader to follower to swidth qr codes to ar codes
  * [X] have followers subscribe to their follower_ids
  * [X] allow leaders to send messages to follower_id
  * [X] create message types (backend is type agnostic, only required field is channel)
    * [X] type=marker index=[0-63]
    * [X] type=image url="..."
    * [X] type=position x=[0-1] y=[0-1] width=[0-1] height=[0-1]
* [X] Run qr code reader and marker detector on the same scene?
* [X] use `var markerHelper = new THREEx.ArMarkerHelper(markerControls)` instead of torus
* [X] investigate multi markers, pretty sure that's close to what i want to do - https://github.com/jeromeetienne/AR.js/tree/master/three
* [X] write system to draw divs on the screen in screen coords based on object3d information. Because I'm dealing with planes I think i can combine position and rotation, I should also be able to make a pure threejs file that does it

* [x] leader - add button to transition to image view
* [x] leader - wire up button to
  * [x] V1 same image on every screen
  * [ ] V2 send proper position info
  * [ ] gather data on visible markers
  * [x] transition to view rendering the image
  * [x] send setImage and positionImage messages to each client
  * [x] allow dragging and zooming on an said image
* [ ] follower - after N seconds of no activity, switch ar code back to qr code
* [ ] Give license a name
* [ ] possibly combine image an position messages


### Prerequisits

- python 3 http://docs.python-guide.org/en/latest/starting/install3/osx/
- virtual environments http://docs.python-guide.org/en/latest/dev/virtualenvs/#virtualenvironments-ref
- brew https://brew.sh/
- heroku cli https://devcenter.heroku.com/articles/heroku-cli

### Setup 
1) Fork the repo
2) Clone your fork
3) Run the following:
```
    $ cd billboard
    $ ./scripts/setup.sh # installs all dependencies including redis
```
### Run Locally
```
    $ ./scripts/run.sh # uses heroku local command to launch the site with the ProcfileDevelopment settings, requires cli
```
### Run Tests
```
    $ ./scripts/run_tests.sh
```
### Create Instance on Heroku (requires authenticated heroku account with credit card)
```
    $./scripts/create_deployment.sh # only needs to get run once, requires heroku cli
```

### Deploy
```
    $ ./scripts/deploy.sh # pushes to origin and heroku
```

### Maintenance
```
    $ ./scripts/freeze.sh # records any changes to configuration. Todo: Git hook that checks dependencies, prompts user to make dependency change independently in seperate diff, to be landed before any changes are committed to master.
```

### Troubleshooting
* Use `http://localhost:5000/` instead of `0.0.0.0:5000` if you want the browser to have permissions to access the camera
```
    $ pip install pipenv
    $ # is supposed to "work"
    $ # I had to run the following to get pipenv on my mac without warnings
    $ sudo -H pip install --ignore-installed pipenv
```

* I'm using [pipenv](http://docs.pipenv.org/) for my python dependencies.


### Links
* http://riveramural.org/fullmural
* https://github.com/mitmedialab/Junkyard-Jumbotron
* Junkyard Jumbotron http://www.businessinsider.com/how-to-transform-multiple-screens-into-one-big-virtual-display-2011-3


### Documentation
* https://redis.io/topics/pubsub
* [redis pubsub demp](https://gist.github.com/pietern/348262)
* https://github.com/heroku-examples/python-websockets-chat/blob/master/chat.py

### Extra special thanks
* https://github.com/jeromeetienne

### Examples//Links
* http://www.metablocks.com/2012/07/qr-code-art-examples-2/
* https://www.google.com/search?q=qr+code+examples&safe=off&rlz=1C5CHFA_enUS722US729&tbm=isch&tbo=u&source=univ&sa=X&ved=0ahUKEwj4q-zY_tvYAhUK0oMKHVfGBOQQsAQIKA&biw=1536&bih=1276#imgdii=z9TPzfg7wpU7tM:&imgrc=qYFbC-k8OyYhkM:
* intersection of 3d and plane in threejs https://jsfiddle.net/8uxw667m/77/


### Other approaches
* https://github.com/dlbeer/quirc
* https://github.com/kAworu/node-quirc
* https://davidshimjs.github.io/qrcodejs/
* https://github.com/schmich/instascan
* https://github.com/edi9999/jsqrcode
* https://github.com/LazarSoft/jsqrcode


### Links
* https://github.com/mitmedialab/Junkyard-Jumbotron
* https://github.com/mitmedialab/Junkyard-Jumbotron/blob/master/python/calibrate.py
* https://github.com/mitmedialab/Junkyard-Jumbotron/blob/7e32ecc8a01ea5a578fea6ea54f1f44c7f8f546e/python/ARToolKitPlus_2.1.1/src/core/arGetTransMat.cxx
* https://jeromeetienne.github.io/AR.js/
* https://jeromeetienne.github.io/AR.js/three.js/examples/arcode.html
* https://github.com/jeromeetienne/AR.js/tree/master/aframe
* https://github.com/jeromeetienne/AR.js/tree/master/three.js/vendor
* https://github.com/jeromeetienne/AR.js/blob/2783df606361006f0cac725de5b6708b7a2070a8/three.js/examples/multi-markers/examples/learner.html
* https://github.com/jeromeetienne/AR.js/blob/master/three.js/examples/multi-markers/examples/player.html
* https://github.com/jeromeetienne/AR.js/blob/5394ec015b987754552fce891820f41f1b982fac/three.js/examples/multi-markers/threex-armultimarkerutils.js
* 
* https://github.com/artoolkit/artoolkit5/tree/master/doc/patterns
* https://github.com/jeromeetienne/jquery-qrcode
* http://jeromeetienne.github.io/jquery-qrcode/examples/basic.html
* https://marmelab.com/blog/2017/06/19/augmented-reality-html5.html
* https://github.com/marmelab/sketch-by-phone
* https://sketch-by-phone.now.sh/
* http://blog.jetienne.com/blog/2011/04/07/jquery-qrcode/

* https://jsfiddle.net/prisoner849/8uxw667m/
* https://jsfiddle.net/8uxw667m/84/

* https://webqr.com/create.html
* https://github.com/LazarSoft/jsqrcode

* https://en.wikipedia.org/wiki/Vector_projection
* https://www.3dgep.com/understanding-the-view-matrix/
* https://en.wikipedia.org/wiki/3D_projection
* https://threejs.org/examples/#canvas_geometry_cube
* http://barkofthebyte.azurewebsites.net/post/2014/05/05/three-js-projecting-mouse-clicks-to-a-3d-scene-how-to-do-it-and-how-it-works
* http://zachberry.com/blog/tracking-3d-objects-in-2d-with-three-js/

* http://bruceeckel.github.io/2015/03/10/websockets-in-flask-on-heroku/
* https://news.ycombinator.com/item?id=6628109
* https://devcenter.heroku.com/articles/go-websockets#front-end
* https://devcenter.heroku.com/articles/python-websockets
* https://devcenter.heroku.com/articles/websockets

* https://flask-socketio.readthedocs.io/en/latest/#gunicorn-web-server
* https://coderwall.com/p/q2mrbw/gevent-with-debug-support-for-flask

* https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Streams.html
* https://forums.aws.amazon.com/message.jspa?messageID=504595

* https://learnxinyminutes.com/docs/lua/
