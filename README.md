# billboard
Billboards


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


### Troubleshooting 

I'm using [pipenv](http://docs.pipenv.org/) for my python dependencies.

    $ pip install pipenv 
    $ # is supposed to "work"
    $ # I had to run the following to get pipenv on my mac without warnings
    $ sudo -H pip install --ignore-installed pipenv
