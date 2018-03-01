#!/bin/bash
echo: "info: Setting up..."
# install redis dependency
if ! [ -x "$(command -v python3)" ]; then
    echo "python3 required, check readme.md"
    exit
fi
# install redis dependency
if ! [ -x "$(command -v redis)" ]; then
    echo "installing redis"
    brew install redis
fi
# checking pipenv
if ! [ -x "$(command -v pipenv)" ]; then
    echo "installing pipenv"
    sudo -H pip install --ignore-installed pipenv
fi

# setup venv
virtualenv -p python3 venv
# switch to venv
source venv/bin/activate
# install requirements
pip install -r requirements.txt 
echo "updating env"
# check for local env variables
python -c 'import scripts.env as env; env.setup()'
