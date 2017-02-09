import bcrypt
from flask import request
from bson import json_util, ObjectId
import pymongo

from api import auth, db
from api.module import Module
from api.user import User, UserException
from api.role import Role

users = Module('users', __name__, url_prefix='/users', no_version=True)

def count_users():
	return db.users.count()

def lookup_user(user):
	user_id = user.get("user_id", None)

	query = {"$or" : [
		{"_id" : None if user_id == None else ObjectId(user_id)},
		{"username" : user.get("username", None)},
		{"email" : user.get("email", None)}
		]}

	cursor = db.users.find(query)

	return list(cursor)

def user_exists(user):
	return False if db.users.find({"$or" : [
		{"username" : user.get("username", None)},
		{"email" : user.get("email", None)}
		]}).count() == 0 else True

@auth.required()
def get_users():
	res = list(db.users.find())

	# Remove password hash from the resulting query
	for user in res:
		user.pop("password", None)
		user["id"] = user.pop("_id", None)
	return(json_util.dumps(res))

@auth.required()
def get_user(user_id):
	user = dict(db.users.find_one({"_id" :ObjectId(user_id)}))
	user.pop('password', None)
	return(json_util.dumps(user))

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
	r = request.get_json()
	user = User.from_dict(r)

	if user_exists(user):
		raise UserException("User already exists", status_code = 400)

	user.user_id = str(unprotected_add_user(user.to_dict()))
	user.password = None

	return(json_util.dumps(user.to_dict()))

@auth.required(Role.admin)
def remove_user(user_id):
	"""
	Remove the user
	"""

	user_dict = dict(db.users.find_one({"_id" :ObjectId(user_id)}))

	if user_dict == {}:
		raise UserException("User not found", status_code = 404)

	user = User.from_dict(user_dict)
	res = db.users.delete_one({"_id" : ObjectId(user_id)})

	if res.deleted_count == 0:
		raise UserException("User not deleted", status_code = 404)

	user.password = None

	return(json_util.dumps(user.to_dict()))

@auth.required()
def edit_user(user_id):
	"""
	TODO: differentiate between PUT and PATCH -> PATCH partial update
	"""
	user = User.from_dict(request.get_json())
	user.user_id = user_id

	# Create basic query for user updating
	query = {
			"$set" : {}
			}

	# If the user updates their profile check for all fields to be updated
	if user.first_name and user.first_name != "":
		query["$set"]["first_name"] = user.first_name

	if user.last_name and user.last_name != "":
		query["$set"]["last_name"] = user.last_name

	if user.email and user.email != "":
		query["$set"]["email"] = user.email

	if user.role:
		query["$set"]["role"] = user.role

	if user.settings and user.settings != {}:
		query['$set']['settings'] = user.settings

	# In case of password change, verify that it is really him (revalidate their password)
	if user.password and user.password != "":
		auth_verify = User.from_object(auth.login(user))

		query["$set"]["password"] = auth.create_hash(user_data["password_new"])

	# Update the user and return updated document
	res = db.users.find_one_and_update(
			{'_id' : ObjectId(user.user_id)},
			query,
			return_document=pymongo.ReturnDocument.AFTER)

	# Remove password hash from the response
	del res['password']

	return(json_util.dumps(res))

users.add_url_rule('', view_func=get_users, methods=['GET'])
users.add_url_rule('', view_func=add_user, methods=['POST'])
users.add_url_rule('/<string:user_id>', view_func=get_user, methods=['GET'])
users.add_url_rule('/<string:user_id>', view_func=edit_user, methods=['PUT'])
users.add_url_rule('/<string:user_id>', view_func=remove_user, methods=['DELETE'])
