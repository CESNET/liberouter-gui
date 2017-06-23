from .error import ApiException
from .role import Role

class UserException(ApiException):
    status_code = 401

class User(object):
    """
    User data model representation.

    Username is the default identifier and is required.
    """

    username = None
    user_id = None
    first_name = None
    last_name = None
    email = None
    password = None
    role = None
    settings = {}

    def __init__(self,
            username,
            user_id		= None,
            first_name	= None,
            last_name	= None,
            email		= None,
            password	= None,
            role		= None,
            settings	= None,
            ):
        self.username = username
        self.user_id = user_id
        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.password = password
        self.role = self.parseRole(role)
        self.settings = settings

    def get(self, key, default):
        if key == "username":
            return self.username
        elif key == "user_id":
            return self.user_id
        elif key == "first_name":
            return self.first_name
        elif key == "last_name":
            return self.last_name
        elif key == "email":
            return self.email
        elif key == "password":
            return self.password
        elif key == "role":
            return self.role
        elif key == "settings":
            return self.settings

        return default

    @classmethod
    def parseRole(self, role):
        # We have a number representation of the role
        if isinstance(role, int):
            if Role.has_role(role):
                return role
            else:
                return Role.guest
        elif isinstance(role, str):
            if role == "admin":
                return Role.admin
            elif role == "user":
                return Role.user
            elif role == "guest":
                return Role.guest
        else:
            return Role.guest
    def setRole(self, role):
        self.role = self.parseRole(role)

    def to_dict(self):
        """
        Return the internal data in dictionary
        """
        tmp = {
            'username' : self.username,
            'user_id' : self.user_id,
            'first_name' : self.first_name,
            'last_name' : self.last_name,
            'email' : self.email,
            'role' : int(self.role),
            'settings' : self.settings,
        }

        if self.password:
            tmp['password'] = self.password

        return tmp

    @classmethod
    def from_dict(self, user):
        """
        Create new user from dictionary
        """
        # First try MongoDB id field, otherwise use API defined field
        if str(user.get("_id", None)):
            user_id = str(user.get("_id", None))
        else:
            user_id = str(user.get("user_id", None))

        return(self(
            username	= user.get("username", None),
            user_id		= user_id,
            first_name	= user.get("first_name", None),
            last_name	= user.get("last_name", None),
            email		= user.get("email", None),
            password	= user.get("password", None),
            role		= User.parseRole(user.get("role", None)),
            settings	= user.get("settings", {})
            ))
