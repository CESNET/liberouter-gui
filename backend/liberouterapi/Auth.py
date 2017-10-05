import bcrypt
from functools import wraps
from flask import request
from datetime import datetime, timedelta

from .user import User
from .role import Role
from .session import SessionException
from .error import ApiException
from liberouterapi import config

class AuthException(ApiException):
    status_code = 404

class Auth(object):
    errors = {
        '0' : 'Username not found.',
        '1' : 'Username and password doesn\'t match.',
        '2' : 'Expired session.',
        '3' : 'Authorization header is missing.'
    }

    def __init__(self, db, session_manager):
        self.db = db
        self.session_manager = session_manager

        if config['api'].getboolean('pam', False):
            import pam
            self.pam = pam.pam()
        else:
            self.pam = None

    @classmethod
    def check_password(self, password, hash):
        return bcrypt.checkpw(password.encode('utf8'), hash)

    @classmethod
    def create_hash(self, password):
        return bcrypt.hashpw(password.encode('utf8'), bcrypt.gensalt())

    def auth_error(self, code):
        msg = {
            'code' : code,
            'description' : self.errors[str(code)]
        }
        res = json_util.dumps(msg)
        return msg

    def login(self, user):
        res = self.db.get("users", "username", user.username)

        print(self.pam, self.pam == None)

        if not res:
            # User is not found in the DB, try other AM
            if self.pam != None:
                # PAM is enabled, check PAM if user exists
                if self.pam.authenticate(user.username, user.password) == True:
                    # Success logging in, add user
                    from .modules.users import unprotected_add_user
                    user.role = Role.guest
                    user.provider = "pam"
                    user.password = None
                    print(user.password)
                    res = unprotected_add_user(user)
                    del res['password']
                    return res
                else:
                    raise AuthException("User and password mismatch")

            raise AuthException("User not found")

        if res['provider'] == 'db':
            if not self.check_password(user.password, res['password']):
                raise AuthException("Password mismatch")
        elif self.pam != None and res['provider'] == 'pam':
            if not self.pam.authenticate(res['username'], user.password):
                raise AuthException("Password mismatch")
        else:
            raise AuthException("User not found")

        # Remove password field from the user
        del res['password']

        return(res)

    def store_session(self, user):
        session_id = self.session_manager.create(user)
        return session_id

    def lookup(self, session_id):
        try:
            session = self.session_manager.lookup(session_id)
            return session
        except SessionException:
            print("Couldn't find given session")
            raise

    def delete(self, session_id):
        try:
            self.session_manager.delete(session_id)
        except SessionException:
            print("Couldn't find given session")
            raise

    def required(self, role=Role.undefined):
        """
        Decorator for required Authorization JWT token

        Usage: (auth is the initialized Auth object instance)
        @auth.required() -  Don't look for user's role.
                            Only check if they have valid session.

        @auth.required(Role.[admin|user|guest]) - check session validity and their role
        """
        def auth_decorator(f):
            @wraps(f)
            def verify(*args, **kwargs):
                session_id = request.headers.get('Authorization', None)
                if not session_id:
                    raise SessionException("Header field 'Authorization' not found.")

                try:
                    session = self.lookup(session_id)
                except SessionException:
                    raise SessionException("Session not found")

                if role != Role.undefined and role < session["user"].role:
                    raise SessionException("Insufficient privileges.")

                return f(*args, **kwargs)
            return verify
        return auth_decorator
