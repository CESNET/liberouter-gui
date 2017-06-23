import unittest

from tests.req import ApiRequest, ApiAuth

class API(unittest.TestCase):
	def setUp(self):
		"""
		Create request instance for the API
		"""
		self.req = ApiRequest()

	def tearDown(self):
		"""
		We don't have to destroy anything. For now.
		"""
		pass

	def assertOK(self, response):
		"""
		Check if the response's status code is 200 OK
		"""
		self.assertTrue(200 == response.status_code)

class SecureAPI(API):
	"""
	These kind of test cases require logging in and out of the API
	"""
	def setUp(self):
		"""
		Set up the test case as usual and log in
		"""
		API.setUp(self)
		self.user = self.req.authorize('admin', 'admin')

	def tearDown(self):
		"""
		When the test case is done, log out
		"""
		r = self.req.DELETE('/authorization', auth = ApiAuth(self.user['session_id']))
		self.assertOK(r)

