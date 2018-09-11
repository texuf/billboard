#!/bin/bash

git_hash=GIT_HASH
hash=$(git rev-parse --short HEAD)
echo Setting $git_hash to $hash
heroku config:set $git_hash=$hash 

echo "info: Pushing master to heroku..."
git push -f heroku master


while true; do
    read -p "Would you like to tail the logs? y/n " yn
    case $yn in
        [Yy]* ) heroku logs --tail; break;;
        [Nn]* ) exit;;
        * ) echo "Please answer yes or no.";;
    esac
done

