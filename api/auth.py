import bcrypt 
from functools import wraps
import jwt
from flask import request, abort
from bson.objectid import ObjectId
from datetime import datetime, timedelta

class Auth(object):
    errors = {
        '0' : 'Username not found.',
        '1' : 'Username and password doesn\'t match.',
        '2' : 'Expired session.',
        '3' : 'Authorization header is missing.'
    }
    db = None
    secret_key = ""

    def __init__(self, db, secret_key):
        self.db = db
        self.secret_key = secret_key
    
    def check_password(self, password, hash):
        return bcrypt.checkpw(password, hash)

    def create_hash(self, password):
        return bcrypt.hashpw(password, bcrypt.gensalt())
    
    def auth_error(self, code):
        msg = {
            'code' : code,
            'description' : self.errors[str(code)]
        }
        res = json_util.dumps(msg)
        return msg

    def login(self, username, password):
        query = {
            'username' : username
        }
        res = self.db.users.find_one(query)

        if not res:
            return(0)

        if not self.check_password(password, res['password']):
            return(1)
        
        return(res)

    def jwt_create(self, payload):
        encoded = jwt.encode(payload, self.secret_key, algorithm='HS256')
        return str(encoded.decode('utf-8'))

    def jwt_decode(self, token):
        decoded = jwt.decode(token, self.secret_key, algorithm=['HS256'])
        return decoded

    def store_session(self, username, user_id):
        _id = self.db.sessions.insert({
            "username" : username,
            "expire" : datetime.utcnow(),
            "user_id" : ObjectId(user_id)
        })

        return _id
        
    def get_session(self, _id):
        #print(_id)
        res = self.db.sessions.find_one({"_id" : ObjectId(_id)})
        if res:
            #print('We got it in session')
            delta = datetime.utcnow() - res['expire']
            if delta < timedelta(days=31):
                return res
        return False

    # Shift expiry date
    def update_session(self, _id):
        self.db.sessions.update({
            '_id' : ObjectId(_id)
        },
        {
            "$set" : {
                "expire" : datetime.utcnow()
            }
        })
    def delete_session(self, _id):
        res = self.db.sessions.remove({"_id" : ObjectId(_id)})
        return res['ok']

    # Decorator for required Authorization JWT token
    def required(self, f):
        @wraps(f)
        def verify_jwt(*args, **kwargs):
            auth = request.headers.get('Authorization', None)
            if not auth:
                return abort(401)
            decoded_token = self.jwt_decode(auth)
            #print(decoded_token)
            session_token = self.get_session(decoded_token['_id'])
            #print(session_token)
            if not session_token:
                return abort(401)
            else:
                self.update_session(session_token['_id'])
            return f(*args, **kwargs)
        return verify_jwt


