#!/usr/bin/env python3

import argparse

"""
Handle arguments
"""
parser = argparse.ArgumentParser(description="""REST API CESNET 2016.\n\n
		Authors: Petr Stehlik <stehlik@cesnet.cz>""", add_help=False)

parser.add_argument('--config', '-c', default='./config.ini', dest='config',
		help='Load given configuration file')
parser.add_argument('--help', '-h', help="Print this help", action='store_true',
		dest='help')

try:
	args = vars(parser.parse_args())

	if args['help']:
		parser.print_help()
		exit(0)
except:
	print("Failed to parse arguments")
	exit(1)

from api.Router import Router
app = Router(__name__)

# Own classes and helpers
from api.auth import Auth
from api.config import Config
from api.dbConnector import dbConnector

# Flask libraries
from flask import escape, request, Response, abort
from flask.ext.cors import CORS
import ssl

# System tools
import sys
from subprocess import Popen, PIPE, check_output

# Date manipulations
from datetime import date, datetime, timedelta
from time import mktime

# MongoDB data manipulation
from bson import json_util
from bson.objectid import ObjectId

"""
Load user config specified by an argument or in default path.
"""
config = Config(args, base_path = __path__[0])

if config["ssl"].getboolean("enabled"):
    context = ssl.SSLContext(ssl.PROTOCOL_TLSv1_2)
    context.load_cert_chain(config['ssl']['certificate'], config['ssl']['key'])

db = dbConnector.from_object(config["database"])

from .session import SessionManager

session_manager = SessionManager()
auth = Auth(db, session_manager, config['api']['secret_key'])

# Configure Flask server from config object
app.config.from_object(config)

# Enable Cross-Origin
CORS(app)

@app.route('/')
def routes():
	"""
	Return all available endpoints in JSON format
	"""
	routes = []
	for rule in app.url_map.iter_rules():
		routes.append({
			"name": rule.rule,
			"method": rule.methods,
			"desc" : rule.endpoint
		})

	if config["api"]["debug"]:
		print(json_util.dumps(routes, indent=4))

	return (json_util.dumps(routes))

"""
Import all modules from module path
"""
import pkgutil
from api.module import Module

modules = pkgutil.iter_modules([config.module_path])

for importer, mod_name, _ in modules:
	if mod_name not in sys.modules:
		loaded_mod = __import__("api." +
				config['api']['modules'].split('/')[-1] + "." +  mod_name,
				fromlist=[mod_name])
		print("Imported module \"" + mod_name + "\"")

		for obj in vars(loaded_mod).values():
			if isinstance(obj, Module):
				app.register_blueprint(obj)
