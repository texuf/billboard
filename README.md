# billboard
Billboards
Check it out: https://protected-island-17148.herokuapp.com

### Prerequisits

- python 3 http://docs.python-guide.org/en/latest/starting/install3/osx/
- virtual environments http://docs.python-guide.org/en/latest/dev/virtualenvs/#virtualenvironments-ref
- brew https://brew.sh/
- heroku cli https://devcenter.heroku.com/articles/heroku-cli

### Setup 

    git clone git@github.com:texuf/billboard.git
    cd billboard
    ./setup.sh

### Run

    ./run.sh

### Maintenance

    ./freeze.sh

### Deploy to Heroku
    $ heroku create # one time only
    $ heroku addons:create heroku-redis # one time only
    $ git push heroku master # every change
    $ heroku open # launch your live creation in the broswer
    $ heroku logs --tail # so you can see the action!


### Troubleshooting 

- Use `http://localhost:5000/` instead of `0.0.0.0:5000` if you want the browser to have permissions to access the camera

- I'm using [pipenv](http://docs.pipenv.org/) for my python dependencies.

    $ pip install pipenv 
    $ # is supposed to "work"
    $ # I had to run the following to get pipenv on my mac without warnings
    $ sudo -H pip install --ignore-installed pipenv


### Links
Junkyard Jumbotron http://www.businessinsider.com/how-to-transform-multiple-screens-into-one-big-virtual-display-2011-3

### Documentation
https://redis.io/topics/pubsub
[redis pubsub demp](https://gist.github.com/pietern/348262)
https://github.com/heroku-examples/python-websockets-chat/blob/master/chat.py


### Examples//Links
http://www.metablocks.com/2012/07/qr-code-art-examples-2/
https://www.google.com/search?q=qr+code+examples&safe=off&rlz=1C5CHFA_enUS722US729&tbm=isch&tbo=u&source=univ&sa=X&ved=0ahUKEwj4q-zY_tvYAhUK0oMKHVfGBOQQsAQIKA&biw=1536&bih=1276#imgdii=z9TPzfg7wpU7tM:&imgrc=qYFbC-k8OyYhkM:


### Other approaches
https://github.com/dlbeer/quirc
https://github.com/kAworu/node-quirc

https://davidshimjs.github.io/qrcodejs/
https://github.com/schmich/instascan
https://github.com/edi9999/jsqrcode
https://github.com/LazarSoft/jsqrcode