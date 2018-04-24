# billboard (in progress)
Billboards
Check it out: https://protected-island-17148.herokuapp.com

### TODO

* TODO
  * [follower] request qr_code_id from service
  * [follower] subscribe to any messages routed to qr_code_id
  * [follower] draw image representing qr_code_id on screen
  * [lead] recognize qr code in scene
  * [lead] tell follower with qr_code_id to display marker_id
  * [follower] display marker_id
  * [lead] detect marker in scene
  * [lead] finally learn matrix multiplication (https://www.3dgep.com/understanding-the-view-matrix/)
  * [lead] map coordinates to plane, preview that plane in scene
  * [lead] send a stupid amount of messages to followers about all kinds of things including which part of a particular image to display how and when and occasionally when to re calibrate 

* In Progress
  * Test - grab first measurement of the marker, then keep rendering the cube there, test resiliency 
    * this causes me to lose the 3d position of my marker. because we are never calculating the camera angle, only the location of the marker,  I don't think I'll be able to keep updating it in the scene unless I continually track the token
  * Test - wrap the code in leader so that I can create many instances of trackers that each track a different marker
    * in progress

* Screen
  * subscribe to backend
  * replace qr code with image 
  * position image on screen  

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
