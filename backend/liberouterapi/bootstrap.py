from __future__ import print_function

import sys
import json
import pkgutil
from getpass import getpass
from flask import request
import logging
import os

from liberouterapi import app, config
from liberouterapi.modules.module import Module
from .error import ApiException
from .dbConnector import dbConnector
from .Auth import Auth

log = logging.getLogger(__name__)

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

    return(routes)

def import_modules():
    """
    Import all modules' Blueprints to register them as Routes
    """
    modules = pkgutil.iter_modules([
        config['api']['module_path'],
        os.path.join(os.path.dirname(__file__), 'modules')]
        )

    # Append module folders to syspath so it can be imported easily
    sys.path.append(os.path.join(
        os.getcwd(), config['api']['module_path']))
    sys.path.append(os.path.join(os.path.dirname(__file__), 'modules'))

    for importer, mod_name, _ in modules:
        if mod_name not in sys.modules:
            loaded_mod = __import__(mod_name, fromlist=[str(mod_name)])
            log.info("Imported module '%s'" % mod_name)

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

def check_users():
    """
    Count users in the database.
    If there is no user set API to setup state
    """
    db = dbConnector()
    if db.count("users") == 0:
        log.warn("\033[1m" + "* No users found *" + "\033[0m")
        app.add_url_rule('/setup', view_func = setup, methods=['POST'])
        config.setup = True

    else:
        config.setup = False

@app.errorhandler(ApiException)
def handle_invalid_usage(error):
    """
    Handle ApiException as HTTP errors and react to its specification inside
    """
    log.warn("Caught ApiException. Reason: {}".format(str(error)))
    response = error.to_dict()
    return response, error.status_code

@app.after_request
def setup_mode(response):
    if config.setup:
        response.headers['Warning'] = 'setup-required'
        response.status_code = 442
    return response

def setup():
    """
    Setup the API
    Currently we only need tp create the administrator account
    """
    if config.setup == False:
        raise ApiException("API is already setup")
    settings = request.get_json()

    db = dbConnector()

    if len(settings['username']) == 0:
        raise ApiException("Missing username", status_code = 400)

    if len(settings['password']) == 0 or len(settings['password2']) == 0:
        raise ApiException("Missing password", status_code = 400)

    if settings['password'] != settings['password2']:
        raise ApiException("Mismatching password fields")

    try:
        # Insert user to database via user module
        from .modules.users import unprotected_add_user
        from .user import User
        from .role import Role

        user = User(settings['username'], password=settings['password'], role = Role.admin)
        res = unprotected_add_user(user)
        del res['password']

        config.setup = False
        return(json.dumps({ "user_id" : res}))
    except Exception as e:
        raise ApiException({"error" : str(e)})
