from flask import request
from bson import json_util

from liberouterapi import auth, db
from liberouterapi.modules.module import Module
from liberouterapi.Auth import AuthException
from liberouterapi.user import User

au = Module('authorization', __name__, url_prefix='/authorization', no_version=True)

@au.route('', methods=['POST'])
def login():
	"""
	Authorize user using their username and password
	@return user's document from the DB including config
	"""
	user_data = request.get_json()

	if not user_data:
		raise AuthException("Missing user data")

	user = User(user_data['username'], password=user_data['password'])

	auth_user = auth.login(user)

	user = User.from_dict(auth_user)

	session_id = auth.store_session(user)

	return(json_util.dumps({"session_id" : session_id, "user" : auth_user}))

@au.route('', methods=['DELETE'])
@auth.required()
def logout():
	session_id = request.headers.get('Authorization', None)
	auth.delete(session_id)
	return(json_util.dumps({"success" : True}))


"""
Checks validity of session using only required() decorator
"""
@au.route('', methods=['GET'])
@auth.required()
def checkSession():
	return('')
