"""
Configuration REST API

Configuration is separated into documents where each document is identified by
name of the module, where 'liberoutergui' module is reserved for future use
in case we need something globally configurable in the Liberouter GUI.

When inserting a configuration 'name' must be unique.
"""

from flask import request

from liberouterapi import auth, dbConnector
from liberouterapi.error import ApiException
from .module import Module
from bson import json_util as json
from pymongo import ReturnDocument

class ConfError(ApiException):
	status_code = 400

# Initialize connector to the configuration collection
connector = dbConnector()
conf_db = connector.db["configuration"]

conf = Module('configuration', __name__, url_prefix='/configuration', no_version = True)

@conf.route('', methods=['GET'])
#@auth.required()
def get_conf():
	res = list(conf_db.find())
	return (json.dumps(res))

def unprotected_get_module_conf(module):
	"""
	Get module's configuration specified by the module's name

	Prevent from storing module liberoutergui (reserved for future use).

	Each module name is converted to lowercase
	"""
	if module == 'liberoutergui':
		raise ConfError("'liberoutergui' module name is reserved", status_code=409)

	res = conf_db.find_one({
		'name' : module.lower()
		})

	if not res:
		raise ConfError("Module '%s' not found" % module, status_code=404)

	return(res)


@conf.route('/<string:module>', methods=['GET'])
def get_module_conf(module):
	"""
	Get module by its name using the unprotected function
	"""
	return (json.dumps(unprotected_get_module_conf(module)))

@conf.route('/<string:module>', methods=['PUT'])
def update_conf(module):
	"""
	Update a module's configuration specified by its name

	'name' mustn't be specified in data and data must be non-empty
	"""

	data = request.get_json()

	if not data:
		raise ConfError("Nothing to update")

	if "name" in data:
		raise ConfError("Changing name is not allowed", status_code=403)

	res = conf_db.find_one_and_update({
		"name" : str(module).lower()
		},
		{
			"$set" : data
		},
		return_document=ReturnDocument.AFTER)

	if not res:
		raise ConfError("Can't update module '%s'" % str(module).lower())

	return(json.dumps(res))

@conf.route('', methods=['POST'])
def insert_conf():
	"""
	Insert module's configuration, the configuration name mustn't be present in
	the collection

	'name' is a mandatory key
	"""

	conf = request.get_json()
	res = {}

	if 'name' not in conf:
		raise ConfError("'name' must be specified in configuration")

	try:
		# We expect it to raise ConfError (config not found)
		res = unprotected_get_module_conf(conf['name'])
	except ConfError:
		# Name must be lowercase
		conf['name'] = conf['name'].lower()

		res = conf_db.insert_one(conf)

		try:
			res = conf_db.find_one({
				"_id" : res.inserted_id
				})
		except Exception as e:
			raise ConfError(str(e))
	else:
		raise ConfError("Configuration with name '%s' already exists" % conf['name'])

	return(json.dumps(res))

@conf.route('/<string:module>', methods=['DELETE'])
def remove_conf(module):
	"""
	Remove specified module from db

	Module is identified by its name in lowercase
	"""

	# Get the original document
	orig_config = unprotected_get_module_conf(module)

	res = conf_db.delete_one({
		'name' : str(module).lower()
		})

	if res.deleted_count != 1:
		raise ConfError("Module '%s' wasn't deleted" % module, status_code=404)

	return(json.dumps(orig_config))

