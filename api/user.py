from .error import ApiException
from .role import Role

class UserException(ApiException):
	status_code = 401

class User(object):
	role = Role.undefined
	settings = {}

	def __init__(self,
			username,
			user_id=None,
			settings=None,
			role=None,
			password="",
			email=""):
		self.username = username
		self.user_id = user_id

		if settings is not None:
			self.settings = settings

		if role is not None:
			self.role = role

		self.password = password
		self.email = email

	def setRole(self, role):
		if role == "admin" or role == Role.admin:
			self.role = Role.admin
		elif role == "user" or role == Role.user:
			self.role = Role.user
		elif role == "guest" or role == Role.guest:
			self.role = Role.guest

	def to_dict(self):
		"""
		Return the internal data in dictionary
		"""
		return({
			"username" : self.username,
			"user_id" : self.user_id,
			"settings" : self.settings,
			"role" : int(self.role),
			"password" : self.password,
			"email" : self.email,
		})

	@classmethod
	def from_dict(self, user):
		"""
		Create new user from dictionary
		"""
		return(self(user.get("username", "undefined"),
			role = user.get("role", Role.undefined),
			settings = user.get("settings", {}),
			user_id = str(user["_id"]),
			password = user.get("password", ""),
			email = user.get("email", "")))
