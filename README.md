# billboard (in progress)
Billboards
Check it out: https://protected-island-17148.herokuapp.com

### Architecture 

* [follower] request `qr_code` from service
  * `qr_code` is composed of `site_url/follower_id`
  * `follower_id` can be obtained by `qr_code.split('/').last!`
* [follower] subscribe to any messages routed to `follower_id`
* [follower] draw image representing `qr_code` on screen
* [leader] recognize qr code in scene
* [leader] route message to `follower_id` requesting follower to display specific `marker_id`
* [follower] display marker associated with `marker_id`
* [leader] detect marker in scene
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
* [ ] Open multiple browser windows displaying follower qr_codes, scan the qr codes with leader url on phone, qr codes switch to ar codes
  * [X] have followers subscribe to their follower_ids
  * [X] allow leaders to send messages to follower_id
  * [X] create message types (backend is type agnostic, only required field is channel)
    * [X] type=marker index=[0-63]
    * [X] type=image url="..."
    * [X] type=position x=[0-1] y=[0-1] width=[0-1] height=[0-1]
* [ ] Run qr code reader and marker detector on the same scene?
* [ ] investigate multi markers, pretty sure that's close to what i want to do - https://github.com/jeromeetienne/AR.js/tree/master/three.js/examples/multi-markers
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


### Other approaches
* https://github.com/dlbeer/quirc
* https://github.com/kAworu/node-quirc
* https://davidshimjs.github.io/qrcodejs/
* https://github.com/schmich/instascan
* https://github.com/edi9999/jsqrcode
* https://github.com/LazarSoft/jsqrcode
