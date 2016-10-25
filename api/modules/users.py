import bcrypt
from flask import request
from bson import json_util

from api import auth, db
from api.module import Module
from api.user import User
from api.role import Role

users = Module('users', __name__, url_prefix='/users')

def count_users():
	return db.users.count()

@auth.required()
def get_users():
	res = list(db.users.find())

	# Remove password hash from the resulting query
	for user in res:
		user.pop("password", None)
		user["id"] = user.pop("_id", None)
	return(json_util.dumps(res))

def unprotected_add_user(user_data):
	"""
	Create a user and add it to database

	Fields:
		* password
		* email
		* username

	TODO: insert only needed fields
	"""
	user = User(user_data['username'], password=user_data['password'])

	if 'email' in user_data:
		user.email = user_data['email']

	if 'config' in user_data:
		user.config = user_data['config']

	# Default role is guest
	if 'role' in user_data:
		user.setRole(user_data['role'])

	user.password = auth.create_hash(user.password)

	res = db.users.insert(user.to_dict())
	return(res)


@auth.required(Role.admin)
def add_user():
	return(json_util.dumps(unprotected_add_user(request.get_json())))

@auth.required(Role.admin)
def remove_user():
	"""
	Remove the user

	TODO: specify UserID by URI, not by body
	TODO: return the deleted user not just int
	"""
	req = request.args
	req = req.to_dict()
	res = db.users.delete_one({"_id" : ObjectId(req["userId"])})
	return(json_util.dumps(res.deleted_count))

@auth.required()
def edit_user():
	"""
	TODO: differentiate between PUT and PATCH -> PATCH partial update
	"""
	user_data = request.get_json()
	user = User.from_dict(user_data)

	# Create basic query for user updating
	query = {
			"$set" : {
				'settings' : user.settings
				}
			}

	# If the user updates their profile check for all fields to be updated
	if "name" in user:
		query["$set"]["name"] = user["name"]

	if "surname" in user:
		query["$set"]["surname"] = user["surname"]

	if "email" in user:
		query["$set"]["email"] = user["email"]

	# In case of password change, verify that it is really him (revalidate their password)
	if "password" in user:
		auth_verify = User.from_object(auth.login(user))

		query["$set"]["password"] = auth.create_hash(user_data["password_new"])

	# The query is built up, lets update the user and return updated document
	res = db.users.find_one_and_update(
			{'_id' : ObjectId(user.user_id)},
			query,
			return_document=pymongo.ReturnDocument.AFTER)

	# Remove password hash from the response
	del res['password']

	return(json_util.dumps(res))

users.add_url_rule('', view_func=get_users, methods=['GET'])
users.add_url_rule('', view_func=edit_user, methods=['PUT'])
users.add_url_rule('', view_func=add_user, methods=['POST'])
users.add_url_rule('', view_func=remove_user, methods=['DELETE'])
