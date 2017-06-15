from liberouterapi import auth, dbConnector
from .module import Module
from bson import json_util as json

connector = dbConnector()
conf_db = connector.db["configuration"]

conf = Module('configuration', __name__, url_prefix='/configuration', no_version = True)

@conf.route('', methods=['GET'])
@auth.required()
def get_conf():
	res = list(conf_db.find())
	return (json.dumps(res))

@conf.route('/:module', methods=['GET'])
def get_module_conf(module):
	res = list(conf_db.find())
	return (json.dumps(res))

@conf.route('/:module', methods=['PUT'])
def update_conf(module):
	pass

@conf.route('', methods=['POST'])
def insert_conf():
	pass

@conf.route('/:module', methods=['DELETE'])
def remove_conf(module):
 	pass
