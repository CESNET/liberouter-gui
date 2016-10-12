import bcrypt
from functools import wraps
import jwt
from flask import request, abort
from bson.objectid import ObjectId
from datetime import datetime, timedelta

from .user import User

class AuthException(Exception):
	status_code = 404

	def __init__(self, message, status_code=None, payload=None):
		Exception.__init__(self)
		self.message = message
		if status_code is not None:
			self.status_code=status_code
		self.payload = payload

	def to_dict(self):
		rv = dict(self.payload or ())
		rv['message'] = self.message
		return rv

class Auth(object):
	errors = {
		'0' : 'Username not found.',
		'1' : 'Username and password doesn\'t match.',
		'2' : 'Expired session.',
		'3' : 'Authorization header is missing.'
	}

	def __init__(self, db, session_manager, secret_key):
		self.db = db
		self.session_manager = session_manager
		self.secret_key = secret_key

	def check_password(self, password, hash):
		return bcrypt.checkpw(password.encode('utf8'), hash.encode('utf8'))

	def create_hash(self, password):
		return bcrypt.hashpw(password, bcrypt.gensalt())

	def auth_error(self, code):
		msg = {
			'code' : code,
			'description' : self.errors[str(code)]
		}
		res = json_util.dumps(msg)
		return msg

	def login(self, user):
		query = {
			'username' : user.username
		}

		res = self.db.users.find_one(query)

		if not res:
			raise AuthException("User not found")

		if not self.check_password(user.password, res['password']):
			raise AuthException("Password mismatch")

		# Remove password field from the user
		del res['password']

		return(res)

	def jwt_create(self, payload):
		encoded = jwt.encode(payload, self.secret_key, algorithm='HS256')
		return str(encoded.decode('utf-8'))

	def jwt_decode(self, token):
		decoded = jwt.decode(token, self.secret_key, algorithm=['HS256'])
		return decoded

	def store_session(self, username, user_id):
		user = User(username, user_id = user_id)
		session_id = self.session_manager.create(user)
		return session_id

	def lookup(self, session_id):
		try:
			session = self.session_manager.lookup(session_id)
			return session
		except SessionException:
			print("Couldn't find given session")
			return False

	def delete_session(self, _id):
		res = self.db.sessions.remove({"_id" : ObjectId(_id)})
		return res['ok']

    # Decorator for required Authorization JWT token
	def required(self, f):
		@wraps(f)
		def verify_jwt(*args, **kwargs):
			auth = request.headers.get('Authorization', None)
			if not auth:
				return abort(401)
			decoded_token = self.jwt_decode(auth)
            #print(decoded_token)
			session_token = self.get_session(decoded_token['_id'])
            #print(session_token)
			if not session_token:
				return abort(401)
			else:
				self.update_session(session_token['_id'])
			return f(*args, **kwargs)
		return verify_jwt
