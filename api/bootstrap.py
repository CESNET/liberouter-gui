import sys
import pkgutil
from bson import json_util
from getpass import getpass

from api import app, config
from api.module import Module
from api.error import ApiException
from api.role import Role

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

	app.logger.debug(json_util.dumps(routes))

	return(json_util.dumps(routes))

def import_modules():
	"""
	Import all modules' Blueprints to register them as Routes
	"""
	modules = pkgutil.iter_modules([config['api']['module_path']])

	for importer, mod_name, _ in modules:
		if mod_name not in sys.modules:
			loaded_mod = __import__("api." +
					config['api']['modules'].split('/')[-1] + "." +  mod_name,
					fromlist=[mod_name])
			print("   > Imported module \"" + mod_name + "\"")

			for obj in vars(loaded_mod).values():
				if isinstance(obj, Module):
					app.register_blueprint(obj)

def ask_for_username():
	print("Admin username [admin]: ", end="")
	name = input()

	if name == "":
		name = "admin"

	return(name)

def ask_for_password():
	password = getpass('Password:')

	while password == "":
		password = getpass('Password:')

	password2 = getpass('Repeat password:')

	if password != password2:
		print("Password mismatch")
		exit(1)

	return(password)

def admin_setup(db):
	"""
	Count users in the database.
	If there is no user run initial admin user insertion
	"""
	if db.users.count() == 0:
		print("No users found!")

		user_data = {
				"username" : ask_for_username(),
				"password" : ask_for_password(),
				"role" : Role.admin
			}

		# Insert user to database via user module
		from .modules.users import unprotected_add_user
		res = unprotected_add_user(user_data)
		return(res)

@app.errorhandler(ApiException)
def handle_invalid_usage(error):
	"""
	Handle ApiException as HTTP errors and react to its specification inside
	"""
	print("Caught error!")
	print(error.to_dict())
	response = json_util.dumps(error.to_dict())
	return response, error.status_code
