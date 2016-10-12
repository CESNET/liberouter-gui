from flask import request
from bson import json_util

from api import auth, db
from api.module import Module
from api.auth import AuthException
from api.user import User

au = Module('authorization', __name__, url_prefix='/authorization', no_version=True)

@au.route('', methods=['POST'])
def login():
	"""
	Authorize user using their username and password
	@return user's document from the DB including config
	"""

	user_data = request.get_json()
	print(user_data)
	user = User(user_data['username'], password=user_data['password'])

	try:
		auth_user = auth.login(user)
	except AuthException as e:
		print(e)
		return json_util.dumps({"error" : str(e)}), 401

	session_id = auth.store_session(auth_user['username'], auth_user['_id'])

	# Attach JWT for further authentication
	"""auth_user['jwt'] = auth.jwt_create({
		'username' : auth_user['username'],
		'name' : auth_user.get('name', ""),
		'surname' : auth_user.get('surname', ""),
		'email' : auth_user.get('email', ""),
		'_id' : str(_id),
		'created' : mktime(datetime.utcnow().timetuple())
		})"""
	return(json_util.dumps({"session_id" : session_id, "user" : auth_user}))


@au.route('', methods=['DELETE'])
@auth.required
def logout():
	jwt = request.headers.get('Authorization', None)
	decoded_jwt = auth.jwt_decode(jwt)
	res = auth.delete_session(decoded_jwt['_id'])
	return(str(res))
