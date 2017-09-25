from .dbConnector import dbConnector
from .user import User, UserSQL

class UsersDatabase:
    """
    Provide unified access to users database not dependent on the backend provider
    """

    def __init__(self, users = "users"):
        self.db = dbConnector()
        self.users = users

        if self.db.isSQL():
            self.client = self.db.db
        else:
            from bson import ObjectId
            self.client = self.db.db[self.users]

    def count(self):
        """
        Count number of users in database

        :returns: int
        """
        if self.db.isSQL():
            if not self.client.engine.has_table(self.users):
                # Initiliaze table for users
                self.db.db.create_all()

            return len(UserSQL.query.all())
        else:
            return self.client.count()

    def get(self, user_id = None, username = None, email = None):
        """
        Retrieve a user from database using ID, username or email
        """
        if user_id == None and username == None and email == None:
            raise Exception("User ID, username of email must be specified")

        if self.db.isSQL():
            if user_id:
                return UserSQL.query.get_or_404(user_id).to_dict()
            elif username:
                return UserSQL.query.filter_by(username=username).first_or_404().to_dict()
            elif email:
                return UserSQL.query.filter_by(email=email).first_or_404().to_dict()
        else:
            return self.client.find_one({"$or" : [
                { "_id" : ObjectId(user_id) },
                { "username" : username },
                { "email" : email }
            ]})

    def getAll(self):
        if self.db.isSQL():
            return UserSQL.query.all()
        else:
            return self.client.find()


    def insert(self, user):
        if self.db.isSQL():
            print(user)
            self.db.db.session.add(user)
            self.db.db.session.commit()
                #self.db.db.session.rollback()
                #raise e
        else:
            self.client.insert(user.to_dict())

    def update(self):
        pass

    def delete(self):
        pass
