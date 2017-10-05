from .dbConnector import dbConnector
from .user import User, UserSQL

class ConfigurationDatabase:
    """
    Provide unified access to users database not dependent on the backend provider
    """

    def __init__(self, conf = "configuration"):
        self.db = dbConnector()
        self.users = conf

        if self.db.isSQL():
            self.client = self.db.db
        else:
            self.client = self.db.db[self.conf]

    def get(self):
        pass

    def getAll(self):
        pass

    def insert(self):
        pass

    def update(self):
        pass

    def delete(self):
        pass
