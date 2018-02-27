#!/bin/bash
echo "info: freezing..."
# switch to venv
source venv/bin/activate
# feeze env
python -c 'import scripts.env as env; env.freeze()'
# freeze requirements
pip freeze > requirements.txt