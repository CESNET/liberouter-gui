import json
from flask import request
import logging

from liberouterapi import auth, db
from liberouterapi.dbConnector import dbConnector
from liberouterapi.modules.module import Module
from liberouterapi.user import User, UserException
from liberouterapi.role import Role

log = logging.getLogger(__name__)

user_db = dbConnector()

users = Module('users', __name__, url_prefix='/users', no_version=True)

def user_exists(user):
    if db.get("users", "username", user.username):
        return True
    elif db.get("users", "email", user.email):
        return True
    return False

@auth.required()
def get_users():
    res = list(db.getAll("users"))

    # Remove password hash from the resulting query
    for user in res:
        del user["password"]
    return(json.dumps(res))


@auth.required()
def get_user(user_id):
    user = db.get("users", "id", user_id)
    user.pop('password', None)
    return(json.dumps(user))


def unprotected_add_user(user):
    """
    Create a user and add it to database

    Fields:
        * password
        * email
        * username

    TODO: insert only needed fields
    """
    log.debug("Adding user %s" % user.username)
    if user.provider == "db":
        user.password = auth.create_hash(user.password)

    res = user_db.insert("users", user.to_dict())
    return(res)


@auth.required(Role.admin)
def add_user():
    r = request.get_json()

    user = User.from_dict(r)

    if user_exists(user):
        raise UserException("User '" + user.username + "' already exists", status_code = 400)

    user.user_id = str(unprotected_add_user(user))
    user.password = None

    return(json.dumps(user.to_dict()))


@auth.required(Role.admin)
def remove_user(user_id):
    """
    Remove the user

    TODO: remove all sessions from the deleted user
    """
    res = None
    try:
        res = user_db.delete("users", "id", user_id)
    except Exception as e:
        raise UserException("User not found", status_code = 404)

    if res == None:
        raise UserException("User not deleted", status_code = 404)

    user = User.from_dict(res)

    user.password = None

    return(json.dumps(user.to_dict()))


@auth.required()
def edit_user(user_id):
    """
    TODO: differentiate between PUT and PATCH -> PATCH partial update
    """
    user = User.from_dict(request.get_json())
    user.id = user_id

    session_id = request.headers.get('lgui-Authorization', None)
    session = auth.lookup(session_id)

    if session["user"].role != Role.admin:
        # We must check if the user is editing themselves
        if user_id != session["user"].id:
            raise UserException("Insufficient privileges. Non-admin users can edit only themselves",
                    status_code=401)

    # Create basic query for user updating
    query = dict()

    # If the user updates their profile check for all fields to be updated
    if user.first_name and user.first_name != "":
        query["first_name"] = user.first_name

    if user.last_name and user.last_name != "":
        query["last_name"] = user.last_name

    if user.email and user.email != "":
        query["email"] = user.email

    if user.role != None and user.role >= 0:
        query["role"] = user.role

    if user.settings and user.settings != {}:
        query['settings'] = user.settings

    # In case of password change, verify that it is really him (revalidate their password)
    if user.password and user.password != "":
        query["password"] = auth.create_hash(user.password)

    if len(query.keys()) == 0:
        raise UserException("Nothing to update", status_code=400)

    # Update the user and return updated document
    res = db.update("users", "id", user.id, query)
    # Remove password hash from the response
    del res['password']

    return(json.dumps(res))


users.add_url_rule('', view_func=get_users, methods=['GET'])
users.add_url_rule('', view_func=add_user, methods=['POST'])
users.add_url_rule('/<string:user_id>', view_func=get_user, methods=['GET'])
users.add_url_rule('/<string:user_id>', view_func=edit_user, methods=['PUT'])
users.add_url_rule('/<string:user_id>', view_func=remove_user, methods=['DELETE'])
