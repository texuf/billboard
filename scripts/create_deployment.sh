#!/bin/bash
echo "info: Creating site on heroku..."
heroku create # one time only
heroku addons:create heroku-redis # one time only
git push heroku master # every change
heroku open # launch your live creation in the broswer
heroku logs --tail # so you can see the action!