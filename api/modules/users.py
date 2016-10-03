from api import auth, db
from api.module import Module

users = Module('users', __name__, url_prefix='/users')

@auth.required
def get_users():
	res = list(db.users.find())

	# Remove password hash from the resulting query
	for user in res:
		user.pop("password", None)
	return(json_util.dumps(res))

@auth.required
def add_user():
	"""
	Create a user and add it to database

	Fields:
		* password
		* email

	TODO: insert only needed fields
	"""
	user_data = request.get_json()
	hash = auth.create_hash(user_data["password"])
	user_data["password"] = hash

	res = db.users.insert(user_data)
	return(json_util.dumps(res))

@auth.required
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

@auth.required
def edit_user():
	"""
	TODO: differentiate between PUT and PATCH -> PATCH partial update
	"""
	user = request.get_json()
	token = auth.jwt_decode(request.headers.get('Authorization', None))
	user_info = auth.get_session(token['_id'])

	# Create basic query for user updating
	query = {
			"$set" : {
				'settings' : user['settings']
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
		verify = auth.login(user["username"], user["password"])
		
		# This is really stupid, I have to change it
		# TODO: better password verification returning values
		if verify != 0 and verify != 1:
			hash = auth.create_hash(user["password_new"])
			query["$set"]["password"] = hash
		else:
			return (json_util.dumps( {'error' : auth.errors[str(verify)]}), 403)

	# The query is built up, lets update the user and return updated document
	res_raw = db.users.find_one_and_update(
			{'_id' : ObjectId(user_info['user_id'])},
			query,
			return_document=pymongo.ReturnDocument.AFTER)

	# Remove password hash from the response
	res = res_raw.pop("password", None)

	jwt_res = auth.jwt_create({
		'username' : res_raw['username'],
		'name' : res_raw.get('name', ""),
		'surname' : res_raw.get('surname', ""),
		'email' : res_raw.get('email', ""),
		'_id' : str(token['_id']),           # Keep the same session ID!
		'created' : mktime(datetime.utcnow().timetuple())
	})

	return(json_util.dumps({"jwt" : jwt_res}))

users.add_url_rule('/', view_func=get_users, methods=['GET'])
users.add_url_rule('/', view_func=edit_user, methods=['PUT'])
users.add_url_rule('/', view_func=add_user, methods=['POST'])
users.add_url_rule('/', view_func=remove_user, methods=['DELETE'])
