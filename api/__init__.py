"""
Liberouter GUI 2016
File: __init__.py
Author: Petr Stehlik <stehlik@cesnet.cz>

The basic initialization of the REST API happens within this file.
The basic steps:
	* app init and its configuration
	* configuration init
	* SSL init (if enabled)
	* base database connection to MongoDB (for users mainly)
	* Session manager
	* Authorization manager
	* Check if there are any users, if not set up a new admin
	* Enable CORS if requested
	* import all modules and its Blueprints
"""

from .Router import Router
print("# Setting up the application")
app = Router(__name__)

from .configurator import Config
"""
Load user config specified by an argument or in default path.
"""
config = Config(base_path = __path__[0])

from .dbConnector import dbConnector
from .session import SessionManager
from .bootstrap import routes, import_modules, admin_setup
from .auth import Auth
from .role import Role

# System tools
import ssl
from bson import json_util

if config["ssl"].getboolean("enabled"):
    context = ssl.SSLContext(ssl.PROTOCOL_TLSv1_2)
    context.load_cert_chain(config['ssl']['certificate'], config['ssl']['key'])

print("# Connecting to MongoDB")
db = dbConnector.from_object(config["database"])

print("# Session manager setting up")
session_manager = SessionManager.from_object(config)

print("# Authorization module setting up")
auth = Auth(db, session_manager, config['api']['secret_key'])

admin = admin_setup(db)

print("# Configuring server app")
app.config.from_object(config)

if config['api'].getboolean('cors', False):
	print("# CORS enabled")
	try:
		from flask.ext.cors import CORS
		CORS(app)
	except:
		print("# ERROR: failed to initialize CORS. Is it installed?")
		exit(1)

"""
Import all modules from module path
"""
print("# Begin importing modules")
import_modules()

for importer, mod_name, _ in modules:
	if mod_name not in sys.modules:
		loaded_mod = __import__("api." +
				config['api']['modules'].split('/')[-1] + "." +  mod_name,
				fromlist=[mod_name])
		print("   > Imported module \"" + mod_name + "\"")

		for obj in vars(loaded_mod).values():
			if isinstance(obj, Module):
				app.register_blueprint(obj)
