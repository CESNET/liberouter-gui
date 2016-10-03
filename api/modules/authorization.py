from api.module import Module
from api import auth, db

au = Module('authorization', __name__, url_prefix='/auth')

@au.route('/', methods=['POST'])
def login():
	user = request.get_json()
	# Authorize user using their username and password
	# @return user's document from the DB including config
	auth_user = auth.login(user['username'], user['password'])

	if auth_user == 0 or auth_user == 1:
		return auth.errors[str(auth_user)], 401

	_id = auth.store_session(auth_user['username'], auth_user['_id'])
	print(auth_user)

	# Attach JWT for further authentication
	auth_user['jwt'] = auth.jwt_create({
		'username' : auth_user['username'],
		'name' : auth_user.get('name', ""),
		'surname' : auth_user.get('surname', ""),
		'email' : auth_user.get('email', ""),
		'_id' : str(_id),
		'created' : mktime(datetime.utcnow().timetuple())
		})
	return(json_util.dumps(auth_user))


@au.route('/', methods=['DELETE'])
@auth.required
def logout():
	jwt = request.headers.get('Authorization', None)
	decoded_jwt = auth.jwt_decode(jwt)
	res = auth.delete_session(decoded_jwt['_id'])
	return(str(res))
