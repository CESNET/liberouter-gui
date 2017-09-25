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
from liberouterapi.role import Role
from .module import Module
#from liberouterapi.ConfigurationDatabase import ConfigurationDatabase as ConfDB
from bson import json_util as json
from pymongo import ReturnDocument

class ConfError(ApiException):
    status_code = 400

# Initialize connector to the configuration collection
db = dbConnector()

conf = Module('configuration', __name__, url_prefix='/configuration', no_version = True)

@conf.route('', methods=['GET'])
@auth.required()
def get_conf():
    res = list(db.getAll("configuration"))

    parsed = list()

    for item in res:
        parsed_item = json.loads(item['value'])
        parsed_item['name'] = item['name']
        parsed.append(parsed_item)
    return (json.dumps(parsed))

def unprotected_get_module_conf(module):
    """
    Get module's configuration specified by the module's name

    Prevent from storing module liberoutergui (reserved for future use).

    Each module name is converted to lowercase
    """
    if module == 'liberoutergui':
        raise ConfError("'liberoutergui' module name is reserved", status_code=409)

    res = db.get("configuration", "name", module.lower())

    parsed = res['value']
    parsed['name'] = res['name']

    if not res:
        raise ConfError("Module '%s' not found" % module, status_code=404)

    return(parsed)


@conf.route('/<string:module>', methods=['GET'])
@auth.required()
def get_module_conf(module):
    """
    Get module by its name using the unprotected function
    """
    return (json.dumps(unprotected_get_module_conf(module)))

@conf.route('/<string:module>', methods=['PUT'])
@auth.required(Role.admin)
def update_conf(module):
    """
    Update a module's configuration specified by its name

    'name' mustn't be specified in data and data must be non-empty
    """

    data = request.get_json()

    if not data:
        raise ConfError("Nothing to update")

    if "name" in data:
        del data["name"]

    if "_id" in data:
        del data["_id"]

    res = db.update("configuration", "name", str(module).lower(), {'value' : data})

    if not res:
        raise ConfError("Can't update module '%s'" % str(module).lower())

    parsed = res['value']
    parsed['name'] = res['name']

    return(json.dumps(parsed))

@conf.route('', methods=['POST'])
@auth.required(Role.admin)
def insert_conf():
    """
    Insert module's configuration, the configuration name mustn't be present in
    the collection

    'name' is a mandatory key
    """

    conf_raw = request.get_json()
    config = dict()
    res = {}

    if 'name' not in conf_raw:
        raise ConfError("'name' must be specified in configuration")

    # First check if such configuration already exists
    try:
        unprotected_get_module_conf(conf_raw['name'])
    except ConfError as e:
        pass
    else:
        raise ConfError("Configuration with name '%s' already exists" % conf_raw['name'])

    # Name must be lowercase
    config['name'] = conf_raw['name'].lower()
    del conf_raw['name']
    config['value'] = conf_raw

    res = db.insert("configuration", config)

    parsed = json.loads(res['value'])
    parsed['name'] = res['name']

    return(json.dumps(parsed))

@conf.route('/<string:module>', methods=['DELETE'])
@auth.required(Role.admin)
def remove_conf(module):
    """
    Remove specified module from db

    Module is identified by its name in lowercase
    """

    # Get the original document

    res = db.delete("configuration", 'name', str(module).lower())

    if res == None:
        raise ConfError("Module '%s' wasn't deleted" % module, status_code=404)

    return(json.dumps(orig_config))

