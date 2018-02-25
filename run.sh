#!/bin/bash

# switch to venv
source venv/bin/activate
# check for local env variables
python -c 'import scripts.env as env; env.check()'
# start redis
redis-server /usr/local/etc/redis.conf &
# open err up
python -mwebbrowser http://localhost:5000
# start app via heroku cli
heroku local

