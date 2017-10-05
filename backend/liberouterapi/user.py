from .error import ApiException
from .role import Role
from .dbConnector import dbConnector

db = dbConnector()

class UserException(ApiException):
    status_code = 401

class User(object):
    """
    User data model representation.

    Username is the default identifier and is required.
    """

    username = None
    id = None
    first_name = None
    last_name = None
    email = None
    password = None
    role = None
    settings = {}
    provider = "db"

    def __init__(self,
            username,
            id		    = None,
            first_name	= None,
            last_name	= None,
            email		= None,
            password	= None,
            role		= None,
            settings	= None,
            provider    = "db"
            ):
        self.username = username
        self.id = id
        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.password = password
        self.role = self.parseRole(role)
        self.settings = settings
        self.provider = provider

    def get(self, key, default):
        if key == "username":
            return self.username
        elif key == "id":
            return self.id
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
        try:
            # We try number representation of role
            r = int(role)
            if Role.has_role(r):
                return r
            else:
                return Role.guest
        except Exception:
            # Otherwise we'll try str representation
            if role == 'admin':
                return Role.admin
            elif role == 'user':
                return Role.user
            elif role == 'guest':
                return Role.guest
        # And when everything else fails...
        return None

    def setRole(self, role):
        self.role = self.parseRole(role)

    def to_dict(self):
        """
        Return the internal data in dictionary
        """
        tmp = {
                'username' : self.username,
                'id' : self.id,
                'first_name' : self.first_name,
                'last_name' : self.last_name,
                'email' : self.email,
                'role' : int(self.role),
                'settings' : self.settings,
                'provider' : self.provider
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
            id = str(user.get("_id", None))
        else:
            id = str(user.get("id", None))

        return(self(
            username	= user.get("username", None),
            id		    = id,
            first_name	= user.get("first_name", None),
            last_name	= user.get("last_name", None),
            email		= user.get("email", None),
            password	= user.get("password", None),
            role		= User.parseRole(user.get("role", None)),
            settings	= user.get("settings", {}),
            provider    = user.get("provider", "db")
            ))

        #class UserSQL(UserBase, db.db.Model):
        #    __tablename__ = "users"
        #    user_id = db.db.Column(db.db.Integer, primary_key=True)
        #    username = db.db.Column(db.db.String(80), unique=True)
        #    email = db.db.Column(db.db.String(120), unique=True)
        #    first_name = db.db.Column(db.db.String(120), unique=False)
        #    last_name = db.db.Column(db.db.String(120), unique=False)
        #    password = db.db.Column(db.db.String(120), unique=False)
        #    role = db.db.Column(db.db.Integer, unique=False)
        #    settings = db.db.Column(db.db.String(10000), unique=False)
        #
        #    def __init__(self,  username,
        #            user_id		= None,
        #            first_name	= None,
        #            last_name	= None,
        #            email		= None,
        #            password	= None,
        #            role		= None,
        #            settings	= None):
        #        print("calling init")
        #        super(UserSQL, self).__init__(username,
        #                user_id		= user_id,
        #                first_name	= first_name,
        #                last_name	= last_name,
        #                email		= email,
        #                password	= password,
        #                role		= role,
        #                settings	= settings)
        #
        #class User(object):
        #    def __new__(self,
        #            username,
        #            user_id		= None,
        #            first_name	= None,
        #            last_name	= None,
        #            email		= None,
        #            password	= None,
        #            role		= None,
        #            settings	= None):
        #        if db.isSQL():
        #            print("Creating SQL user")
        #            return UserSQL(username,
        #                user_id		= user_id,
        #                first_name	= first_name,
        #                last_name	= last_name,
        #                email		= email,
        #                password	= password,
        #                role		= role,
        #                settings	= settings)
        #        else:
        #            return UserBase(username,
        #                user_id		= user_id,
        #                first_name	= first_name,
        #                last_name	= last_name,
        #                email		= email,
        #                password	= password,
        #                role		= role,
        #                settings	= settings)
        #
        #    @classmethod
        #    def from_dict(self, user):
        #        """
        #        Create new user from dictionary
        #        """
        #        # First try MongoDB id field, otherwise use API defined field
        #        if str(user.get("_id", None)):
        #            user_id = str(user.get("_id", None))
        #        else:
        #            user_id = str(user.get("user_id", None))
        #
        #
        #        if db.isSQL():
        #            return UserSQL(
        #                username	= user.get("username", None),
        #                user_id		= user_id,
        #                first_name	= user.get("first_name", None),
        #                last_name	= user.get("last_name", None),
        #                email		= user.get("email", None),
        #                password	= user.get("password", None),
        #                role		= User.parseRole(user.get("role", None)),
        #                settings	= user.get("settings", {})
        #                )
        #        else:
        #            return UserBase(
        #                username	= user.get("username", None),
        #                user_id		= user_id,
        #                first_name	= user.get("first_name", None),
        #                last_name	= user.get("last_name", None),
        #                email		= user.get("email", None),
        #                password	= user.get("password", None),
        #                role		= User.parseRole(user.get("role", None)),
        #                settings	= user.get("settings", {})
        #                )
