#!/bin/bash
if ! [ -x "$(command -v heroku)" ]; then
    echo "heroku cli required, check prerequisits section of readme.md"
    exit
fi
# switch to venv
source venv/bin/activate
# check for local env variables
python -c 'import scripts.env as env; env.check()'
# start redis
redis-server /usr/local/etc/redis.conf &
# open err up (after the server starts)
sleep 1 && python -mwebbrowser http://localhost:5000 &
# start app via heroku cli
heroku local -f ProcfileDevelopment

