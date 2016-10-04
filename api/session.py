from uuid import uuid1 as uuid
from datetime import datetime, timedelta

class SessionException(Exception):
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

class SessionManager(object):
	def __init__(self, timeout = 900, max_user_sessions = 10):
		self.timeout = timedelta(seconds=timeout)
		self.max_user_sessions = max_user_sessions

	def lookup(self, session_id):
		try:
			session = self.sessions[session_id]

			if datetime.utcnow() > session["expire_time"]:
				__delete(session_id)
				raise SessionException("Session expired", payload=session)

			self.__update_expire_time(session)
			return session

		except KeyValueError:
			raise SessionException("Missing session", payload=session_id)

	def create(self, user):
		"""
		Create user session with given user information

		The exception should never be raised since we use UUID as session ID
		"""
		session_id = str(uuid())

		if session_id in self.sessions:
			raise SessionException("Session \"" + session_id +
					"\" already exists")

		self.sessions[session_id] = {
			"user" : user,
			"expire_time" : datetime.utcnow() + self.timeout
		}

		return(session_id)

	def __delete(self, session_id):
		del self.sessions[session_id]

	def __update_expire_time(self, session):
		session['expire_time'] = session['expire_time'] + self.timeout

