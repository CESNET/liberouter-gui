#!/bin/sh

# Frontend build procedure
cd $TRAVIS_BUILD_DIR/frontend
npm install
ng build --prod --bh="/" --aot=false

# Backend build procedure
cd $TRAVIS_BUILD_DIR/backend
virtualenv venv -p python3
source venv/bin/activate
pip3 install -r requirements.txt
cp config-sample.ini config.ini

cd $TRAVIS_BUILD_DIR
python3 backend
