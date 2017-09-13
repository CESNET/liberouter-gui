"""
Test Case for users endpoints

/users [GET] - get all users
/users [POST] - add new user
/users/:user_id [PUT] - update the user specified by user_id
/users/:user_id [DELETE] - delete the user specified by user_id
"""

from tests.api import SecureAPI
from tests.req import ApiAuth
from bson import json_util

class UsersTestCase(SecureAPI):
    def test_users_0_get_users(self):
        r = self.req.GET('/users', auth = ApiAuth(self.user['session_id']))

        self.assertOK(r)
        self.assertTrue(len(r.json()) > 0)

    def test_users_1_add_delete_user(self):
        """
        Create and delete a temporary guest user
        """
        r = self.req.POST('/users', auth = ApiAuth(self.user['session_id']),
                json = {
                    'username'	: 'tempuser',
                    'password'	: 'tempuserpassword',
                    'email'		: 'example@user.test',
                    'role'		: 'guest'
                    })

        self.assertOK(r)
        self.assertTrue('user_id' in r.json())
        user = r.json()

        self.assertTrue(user['role'] == 255)
        self.assertTrue(user['email'] == 'example@user.test')
        self.assertTrue(user['username'] == 'tempuser')
        self.assertTrue('password' not in user)

        r = self.req.GET('/users', auth = ApiAuth(self.user['session_id']))
        self.assertTrue(len(r.json()) > 1)

        """
        Delete should return the deleted user
        """
        r = self.req.DELETE('/users/' + user['user_id'], auth=ApiAuth(self.user['session_id']))
        self.assertOK(r)

        user = r.json()

        self.assertTrue(user['role'] == 255)
        self.assertTrue(user['email'] == 'example@user.test')
        self.assertTrue(user['username'] == 'tempuser')

    def test_users_2_add_existing_user(self):
        """
        Try to add the same user twice.
        This should return HTTP 400.
        """
        r = self.req.POST('/users', auth = ApiAuth(self.user['session_id']),
                json = {
                    'username'	: 'tempuser',
                    'password'	: 'tempuserpassword',
                    'email'		: 'example@user.test',
                    'role'		: 'guest'
                    })

        self.assertOK(r)
        user = r.json()

        r = self.req.POST('/users', auth = ApiAuth(self.user['session_id']),
                json = {
                    'username'	: 'tempuser',
                    'password'	: 'tempuserpassword',
                    'email'		: 'example2@user.test',
                    'role'		: 'guest'
                    })

        self.assertTrue(r.status_code == 400)

        """
        Delete the temp user
        """
        r = self.req.DELETE('/users/' + user['user_id'], auth=ApiAuth(self.user['session_id']))
        self.assertOK(r)

    def test_users_3_update_partial_user(self):
        """
        Do only partial update of the user
        """
        r = self.req.POST('/users', auth = ApiAuth(self.user['session_id']),
                json = {
                    'username'	: 'tempuser',
                    'password'	: 'tempuserpassword',
                    'email'		: 'example@user.test',
                    'role'		: 'guest'
                    })

        self.assertOK(r)
        user_id = (r.json())['user_id']

        data = {
                "email" : "edited@user.test",
                "first_name" : "John"
                }

        r = self.req.PUT('/users/' + user_id, auth = ApiAuth(self.user['session_id']), data = json_util.dumps(data))

        self.assertOK(r)
        new_user = r.json()

        self.assertTrue(new_user['email'] == 'edited@user.test')
        self.assertTrue(new_user['first_name'] == 'John')

        r = self.req.DELETE('/users/' + user_id, auth=ApiAuth(self.user['session_id']))
        self.assertOK(r)
        self.assertTrue(len(r.text) > 1)

    def test_users_4_role_edit_user(self):
        """
        Create a user with 'user' privileges and try to add another user.
        This should fail since users are not authorized to add another users.
        """

        # First we need to create temp user guest and user with 'user' role
        r = self.req.POST('/users', auth = ApiAuth(self.user['session_id']),
                json = {
                    'username'	: 'user',
                    'password'	: 'user',
                    'email'		: 'example@user.test',
                    'role'		: 'user'
                    })

        self.assertOK(r)
        user_id = (r.json())['user_id']

        # Authorize as user
        user_role = self.req.POST('/authorization', json =
            {
                'username' : "user",
                'password' : "user"
            })

        r = self.req.POST('/users', auth = ApiAuth(user_role.json()['session_id']),
                json = {
                    'username'	: 'tempuser',
                    'password'	: 'tempuserpassword',
                    'email'		: 'example@user.test',
                    'role'		: 'guest'
                    })
        self.assertTrue(r.status_code == 401)

        r = self.req.DELETE('/users/' + user_id, auth=ApiAuth(self.user['session_id']))
        self.assertOK(r)

    def test_users_5_low_role_edit_user(self):
        """
        Create a user with 'user' privileges and try to edit another user.
        This should fail since users are not authorized to edit another users.
        """

        # First we need to create temp user guest and user with 'user; role
        r = self.req.POST('/users', auth = ApiAuth(self.user['session_id']),
                json = {
                    'username'	: 'tempuser',
                    'password'	: 'tempuserpassword',
                    'email'		: 'temp@user.test',
                    'role'		: 'guest'
                    })

        self.assertOK(r)
        guest_id = (r.json())['user_id']

        r = self.req.POST('/users', auth = ApiAuth(self.user['session_id']),
                json = {
                    'username'	: 'user',
                    'password'	: 'user',
                    'email'		: 'user_role@user.test',
                    'role'		: 'user'
                    })

        self.assertOK(r)
        user_id = (r.json())['user_id']

        # Authorize as user
        user_role = self.req.POST('/authorization', json =
                {
                    'username' : "user",
                    'password' : "user"
                    })

        data = {
                "email" : "edited@user.test",
                "first_name" : "John"
                }

        r = self.req.PUT('/users/' + guest_id, auth = ApiAuth(user_role.json()['session_id']), data = json_util.dumps(data))

        self.assertTrue(r.status_code == 401)

        r = self.req.DELETE('/users/' + user_id, auth=ApiAuth(self.user['session_id']))
        self.assertOK(r)

        r = self.req.DELETE('/users/' + guest_id, auth=ApiAuth(self.user['session_id']))
        self.assertOK(r)
