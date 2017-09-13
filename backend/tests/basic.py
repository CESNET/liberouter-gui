"""
Basic Test Case

Verify that API is running and try to log in and out.
This verifies that connection to database is okay.
"""

from tests.api import API
from tests.req import ApiAuth

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
