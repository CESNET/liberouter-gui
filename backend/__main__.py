#!/usr/bin/env python3

from liberouterapi import socketio, app, config

if __name__ == '__main__':
	socketio.run(app, debug = True, log_output = True,
			port = app.config["PORT"],
			host = app.config["HOST"])
