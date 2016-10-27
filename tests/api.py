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

class BasicTestCase(API):

	def test0_api_up(self):
		"""
		Basic test to get all available routes.
		Check the HTTP status and response length.
		"""
		r = self.req.GET('/')
		self.assertOK(r)
		self.assertTrue(len(r.text) > 0)

	def test1_login_logout(self):
		"""
		Try to log into the API with given credentials and then logout

		@note: For now we have user admin/admin so let's work with this one.
		"""

		r = self.req.POST('/authorization', json =
			{
				'username' : 'admin',
				'password' : 'admin'
			})

		self.assertOK(r)

		# Store the Session ID in order to do proper logout
		body = r.json()

		self.assertTrue('session_id' in body)

		"""
		When we have the session_id from login we can test logout
		"""
		r = self.req.DELETE('/authorization', auth = ApiAuth(body['session_id']))
		self.assertOK(r)



