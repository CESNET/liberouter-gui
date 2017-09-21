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
echo "[api]
debug = false
secret_key = super-secret
;host =
port = 5555
threaded = true
version = 1.0
modules = /modules
ssl = false

[database]
; possible values: sqlite, mysql, mongodb
;	sqlite:	file must be specified, the server and port are ignored
;	mysql:	server, port and database must be specified, user and password
;			are for authentication to the db
;	mongodb: server, port and database must be set
provider = sqlite
file = db.sq3
database = liberouter
users = users
" > config.ini

cd $TRAVIS_BUILD_DIR
python3 backend
