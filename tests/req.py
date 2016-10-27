"""
Handle API requests with our own classes in order to manager the URI of API
and Content-Type. Also it ensures maintainability.
"""

import requests
from requests.auth import AuthBase
from requests import Request, Session

class ApiAuth(AuthBase):
	"""
	Attaches Authorization header to the request with given session ID
	"""
	def __init__(self, session_id):
		"""Store the session ID"""
		self.session_id = session_id

	def __call__(self, r):
		"""Attach the session ID to Authorization header"""
		r.headers['Authorization'] = self.session_id
		return r

class ApiRequest:
	"""
	Handle all requests via this class in order to ensure correct behaviour
	"""
	def __init__(self, host = '127.0.0.1', port = 5555, ssl = False):
		"""
		Assemble the URI for API
		"""
		if ssl:
			self.uri = 'https://' + host + ':' + str(port)
		else:
			self.uri = 'http://' + host + ':' + str(port)

	def authorize(self, username, password):
		"""
		Helper method to quickly authorize against API
		"""
		r = self.POST('/authorization', json =
			{
				'username' : username,
				'password' : password
			})

		if r.status_code != 200:
			raise Exception('Authorization failed. Status code: ', r.status_code)

		return r.json()

	def GET(self, uri, params=None, **kwargs):
		"""
		GET method handler

		@param uri must start with '/'
		"""
		s = Session()

		req = Request('GET', self.uri + uri, params, **kwargs)
		prep = req.prepare()

		return s.send(prep)

	def POST(self, uri, data=None, json=None, **kwargs):
		"""
		POST method handler

		@param uri must start with '/'
		@param data accepts only string
		@param json accepts dictionary which is then serialized as JSON
		"""
		s = Session()

		req = Request('POST', self.uri + uri, data=data, json=json, **kwargs)
		prep = req.prepare()

		prep.headers['Content-Type'] = 'application/json'

		return s.send(prep)

	def PUT(self, uri, data=None, **kwargs):
		"""
		PUT method handler

		@param uri must start with '/'
		@param data accepts only string
		"""
		s = Session()

		req = Request('PUT', self.uri + uri, data=data, **kwargs)
		prep = req.prepare()

		prep.headers['Content-Type'] = 'application/json'

		return s.send(prep)

	def PATCH(self, uri, data=None, **kwargs):
		"""
		PUT method handler

		@param uri must start with '/'
		@param data accepts only string
		"""
		s = Session()

		req = Request('PATCH', self.uri + uri, data=data, **kwargs)
		prep = req.prepare()

		prep.headers['Content-Type'] = 'application/json'

		return s.send(prep)

	def DELETE(self, uri, **kwargs):
		s = Session()

		req = Request('DELETE', self.uri + uri, **kwargs)
		prep = req.prepare()

		return s.send(prep)

if __name__ == '__main__':
	req = ApiRequest()

	user = req.authorize('admin', 'admin')
	r = req.GET('/users', auth=ApiAuth(user['session_id']))
	print(r.text)

