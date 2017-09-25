from liberouterapi import app, config
import os
import json

class dbConnector(object):
    """
    Database connector singleton class

    :param provider = "mongodb",
    :param server = "localhost",
    :param port = 27017,
    :param db = "liberouter",
    :param users = "users",
    :param config = {}
    """
    class __dbConn:
        provider = ""
        server = ""
        port = ""
        dbName = ""
        db = None
        client = None
        config = None

        @classmethod
        def from_object(self, config):
            return self(
                    provider = config.get("provider", "mongodb"),
                    server = config.get("server", "localhost"),
                    port = config.getint("port", 27017),
                    db = config["database"],
                    config = config)

        def __init__(self,
                provider = "mongodb",
                server = "localhost",
                port = 27017,
                db = "liberouter",
                users = "users",
                config = {}):

            self.provider = provider

            # Setup host and port for DB
            self.server = server
            self.port = port
            # Set up database name
            self.dbName = db
            self.config = config

            if (provider == "mongodb"):
                self.mongodb();
            elif (provider == "sqlite"):
                self.sqlite()
            else:
                raise Exception("Unknown database provider")

        def __init__(self):
            self.config = config["database"]
            self.provider = self.config.get("provider", "mongodb")
            # Setup host and port for DB
            self.server = self.config.get("server", "localhost")
            self.port = self.config.getint("port", 27017)
            # Set up database name
            self.dbName = self.config["database"]

            if (self.provider == "mongodb"):
                self.mongodb();
            elif (self.provider == "sqlite"):
                self.sqlite()
            elif (self.provider == "mysql"):
                self.mysql()
            else:
                raise Exception("Unknown database provider")


        def mongodb(self):
            import pymongo
            # Connect to database and bind events and users collections
            try:
                self.client = pymongo.MongoClient(self.server,
                        self.port,
                        serverSelectionTimeoutMS=100)

                # This raises ConnectionFailure if it can't do the command
                self.client.admin.command('ismaster')

                self.db = self.client[self.dbName]

            # Small trick to catch exception for unavailable database
            except pymongo.errors.ConnectionFailure as e:
                app.logger.error("Failed to connect to database: %s", str(e))

        def sqlite(self):
            """
            SQLite database initialization

            Uses sqlite3 DB-API 2.0 package representing a database connection.
            SQLite is a single file database which is suited for devel and small deployments and
            is easily upgradeable to MySQL or PostgreSQL.
            """
            import sqlite3
            path = os.getcwd() + "/" + self.config['file']
            self.connection = sqlite3.connect(path)
            self.connection.row_factory = sqlite3.Row
            self.db = self.connection.cursor()
            self.init_tables()

        def init_tables(self):
            """
            Initialize users and configuration tables
            """
            if self.isNoSQL():
                # No need for initialization for Mongo
                return
            else:
                self.db.execute("CREATE TABLE IF NOT EXISTS users ("\
                        "id INTEGER PRIMARY KEY, "\
                        "username TEXT, "\
                        "first_name TEXT,"\
                        "last_name TEXT, "\
                        "email TEXT, "\
                        "password BLOB, "\
                        "role INT, "\
                        "settings TEXT)")
                self.db.execute("CREATE TABLE IF NOT EXISTS configuration (id INTEGER PRIMARY KEY, name TEXT, value TEXT)")

        def mysql(self):
            """
            MySQL database initialization

            TODO: drop sqlalchemy module
            """
            from flask_sqlalchemy import SQLAlchemy
            path = "mysql://"

            if self.config["user"]:
                path = path + self.config["user"]

            if self.config["password"]:
                path = path + ":" + self.config["password"]

            try:
                path = path + "@" + self.server + "/" + self.dbName
            except KeyError:
                raise Exception("Missing configuration properties for MySQL 'server' or 'database'")
            app.config['SQLALCHEMY_DATABASE_URI'] = path
            app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
            self.db = SQLAlchemy(app)

        def isSQL(self):
            """
            Check type of database connection whether the provider is SQL-based or not.

            :returns: bool
            """
            return False if self.provider == "mongodb" else True

        def isNoSQL(self):
            """
            Check type of database connection whether the provider is NoSQL-based or not.

            :returns: bool
            """
            return True if self.provider == "mongodb" else False

        def get(self, name, key, value):
            """
            Fetch single record using the key value as column/key name and its value
            """
            if self.isSQL():
                statement = "SELECT * FROM {0} WHERE {1} = ?".format(name, key)
                cursor = self.connection.cursor()
                cursor.execute(statement, (value,))
                res = cursor.fetchone()
                return res if res == None else dict(res)
            else:
                if key == "id":
                    from bson import ObjectId
                    value = ObjectId(value)
                    key = "_" + key
                return self.db[name].find_one({
                        key : value
                    })

        def getAll(self, name):
            """
            Fetch all records from given table/collection
            """
            if self.isSQL():
                res = self.db.execute("SELECT * FROM {0}".format(name))
                res = res.fetchall()
                result = list()
                for item in res:
                    result.append(dict(item))
                return result
            else:
                return self.db[name].find()

        def insert(self, name, data):
            """
            Insert a record to given table/collection

            :data dict: Dictionary to insert
            """
            if "id" in data.keys():
                del data["id"]
            if self.isSQL():
                keys = list(data.keys())

                insert = "INSERT INTO " + name + "("

                insert += ','.join(map(str, keys))
                insert += ") VALUES ("
                insert += "?," * (len(keys) - 1)
                insert += "?)"

                values = tuple()

                for key in keys:
                    if not isinstance(data[key], str):
                        try:
                            data[key] = json.dumps(data[key])
                        except Exception as e:
                            pass

                    values += (data[key], )

                res = self.db.execute(insert, values)
                self.connection.commit()
                return res
            else:
                return self.db[name].insert_one(data)

        def update(self, name, key, value, data):
            if self.isSQL():
                statement = "UPDATE " + name + " SET "

                for k in data:
                    statement += k + " = ?,"
                statement = statement[:-1] + " WHERE " + key + " = ?;"

                values = tuple()

                for k in data:
                    values += (data[k], )

                values += (value, )
                res = self.db.execute(statement, values)

                if self.db.rowcount == 0:
                    raise Exception("Update statement failed")


                return self.get(name, key, value)

            else:
                from pymongo import ReturnDocument
                res = self.db[name].find_one_and_update({
                    key : value
                    },
                    {
                        "$set" : data
                    },
                    return_document=ReturnDocument.AFTER)

        def delete(self, name, key, value):
            """
            Remove a row from a database specified by its key and value from a named database
            """
            if self.isSQL():
                statement = "DELETE FROM {0} WHERE {1} = ?".format(name, key)
                before = self.get(name, key, value)

                self.db.execute(statement, (value,))
                self.connection.commit()

                if self.db.rowcount == 0:
                    raise Exception("No record to delete")

                return before
            else:
                if key == "id":
                    from bson import ObjectId
                    key = "_id"
                    value = ObjectId(value)

                return self.db[name].delete_one({key : value})

        def count(self, name):
            """
            Count all records from given table/collection
            """
            if self.isSQL():
                self.db.execute("SELECT COUNT(*) FROM {}".format(name))
                res = self.db.fetchone()
                return res["COUNT(*)"]
            else:
                return self.db[name].find().count()

    __instance = None

    def __new__(cls):
        if dbConnector.__instance is None:
            dbConnector.__instance = dbConnector.__dbConn()
        return dbConnector.__instance
    def __init__(self):
        if not dbConnector.__instance:
            dbConnector.__instance = dbConnector.__dbConn()

    def __init__(self,
            provider = "mongodb",
            server = "localhost",
            port = 27017,
            db = "liberouter",
            users = "users",
            config = {}):
        if not dbConnector.__instance:
            dbConnector.__instance = dbConnector.__dbConn(provider = provider,
                    server = server,
                    port = port,
                    db = db,
                    users = users,
                    config = config)

