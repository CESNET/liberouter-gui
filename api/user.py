from .role import Role

class UserException(Exception):
	status_code = 401

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

class User(object):
	role = Role.guest
	config = {}

	def __init__(self, email, user_id=None, config=None, role=None):
		self.email = email
		self.user_id = user_id

		if config is not None:
			self.config = config

		if role is not None:
			self.role = role

