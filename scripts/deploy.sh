#!/bin/bash

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

