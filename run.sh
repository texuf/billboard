#!/bin/bash

# switch to venv
source venv/bin/activate
# check for local env variables
python -c 'import scripts.env as env; env.check()'
# start redis
redis-server /usr/local/etc/redis.conf &
# start app via heroku cli
heroku local