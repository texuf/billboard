#!/bin/bash

if [[ ! pipenv ]]; then
    echo "installing pipenv"
    sudo -H pip install --ignore-installed pipenv
fi

# setup venv
virtualenv -p python3 venv
# switch to venv
source venv/bin/activate
# install requirements
pip install -r requirements.txt 
# install redis dependency
if [[ ! redis ]]; then
    echo "installing redis"
    brew install redis
fi
# check for local env variables
python -c 'import scripts.env as env; env.setup()'
