import os
import json
import logging

log = logging.getLogger(__name__)

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

        def __init__(self, **kwargs):
            """
            Initialize database connection

            Base kwargs are:
                * config            Configuration object containing database-specifig config
                * provider          Database provider
                * users             Users' table/collection name
                * configuration     Configuration's table/collection name

            Possible providers:
                * SQLite
                    The SQLite is a lightweight database using a single-file storage. Works like
                    any other large SQL-based database and can be easily deployed

                    Configuration object:
                    {
                        "file",  Path to database file
                    }

                * MongoDB
                    NoSQL database used for storing incostinent data. pymongo is used as a connector

                    Configuration object:
                    {
                        "server",   Server address
                        "port",     Server port
                        "database"  Database name
                    }
            """
            if len(kwargs.keys()) == 7:
                self.config = kwargs["config"]
                self.provider = kwargs["provider"]
                self.users = kwargs["users"]
                self.configuration = kwargs["configuration"]

            else:
                # No kwargs were provided, try to load everything from a config object of libapi
                from liberouterapi import config
                self.provider = config["database"].get("provider", "mongodb")
                self.users = config["database"].get("users", "users")
                self.configuration = config["database"].get("configuration", "configuration")
                self.config = config[self.provider]

            if (self.provider == "mongodb"):
                log.info("Initializing MongoDB connector")
                self.mongodb();
            elif (self.provider == "sqlite"):
                log.info("Initializing SQLite connector")
                self.sqlite()
            else:
                raise Exception("Unknown database provider")

        def mongodb(self):
            import pymongo
            server = self.config.get("server", "localhost")
            port = int(self.config.get("port", 27017))
            dbName = self.config.get("database", "liberouter")
            user = self.config.get("user", None)
            password = self.config.get("password", None)

            # Connect to database and ensure the connection is alive
            try:
                if user is None:
                    self.client = pymongo.MongoClient(server,
                            port,
                            serverSelectionTimeoutMS = 100)
                else:
                    self.client = pymongo.MongoClient(server,
                            port,
                            user = user,
                            password = password,
                            serverSelectionTimeoutMS = 100)

                # This raises ConnectionFailure if it can't do the command
                self.client.admin.command('ismaster')

                self.db = self.client[dbName]

            # Small trick to catch exception for unavailable database
            except pymongo.errors.ConnectionFailure as e:
                log.error("Failed to connect to database: %s", str(e))

            log.info("Successfully connected to MongoDB")

        def mongodb_normalize(self, record):
            """
            Normalize record from mongodb

            Take out Object ID from the dictionary stored in _id.$oid and put it in "id"
            """

            record["id"] = str(record["_id"])
            del record["_id"]

            return record

        def sqlite(self):
            """
            SQLite database initialization

            Uses sqlite3 DB-API 2.0 package representing a database connection.
            SQLite is a single file database which is suited for devel and small deployments and
            is easily upgradeable to MySQL or PostgreSQL.
            """
            import sqlite3
            path = os.getcwd() + "/" + self.config.get('file', 'database.sq3')
            self.connection = sqlite3.connect(path, check_same_thread=False)
            self.connection.row_factory = sqlite3.Row
            self.db = self.connection.cursor()
            log.info("Successfully connected to SQLite")
            self.init_tables()
            log.info("Successfully initialized SQLite tables")

        def init_tables(self):
            """
            Initialize users and configuration tables
            """
            if self.isSQL():
                cursor = self.connection.cursor()
                # No need for initialization for Mongo
                cursor.execute("CREATE TABLE IF NOT EXISTS {} ("\
                        "id INTEGER PRIMARY KEY, "\
                        "username TEXT, "\
                        "first_name TEXT,"\
                        "last_name TEXT, "\
                        "email TEXT, "\
                        "password BLOB, "\
                        "role INT, "\
                        "settings TEXT, "\
                        "provider TEXT)".format(self.users))
                cursor.execute("CREATE TABLE IF NOT EXISTS {} ("\
                        "id INTEGER PRIMARY KEY, "\
                        "name TEXT, "\
                        "value TEXT)".format(self.configuration))

                self.connection.commit()
                cursor.close()

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
                cres = cursor.fetchall()

                if len(cres) == 0:
                    cursor.close()
                    return None

                cres = dict(cres[0])

                for key in cres.keys():
                    if isinstance(cres[key], str):
                        # Might be JSON, try to parse it
                        try:
                            cres[key] = json.loads(cres[key])
                        except Exception as e:
                            log.error("%s : %s " + str(e), key, cres[key])
                            pass

                self.connection.commit()
                cursor.close()
                return cres
            else:
                if key == "id":
                    from bson import ObjectId
                    value = ObjectId(value)
                    key = "_" + key
                record = self.db[name].find_one({
                        key : value
                    })

                if record is None:
                    return record

                record = self.mongodb_normalize(record)

                return(record)

        def getAll(self, name):
            """
            Fetch all records from given table/collection
            """
            if self.isSQL():
                cursor = self.connection.cursor()
                res = cursor.execute("SELECT * FROM {0}".format(name))
                res = res.fetchall()
                result = list()
                for item in res:
                    for key in item.keys():
                        if isinstance(item[key], str):
                            # Might be JSON, try to parse it
                            try:
                                item[key] = json.loads(item[key])
                            except Exception as e:
                                pass
                    result.append(dict(item))

                cursor.close()

                return result
            else:
                result = list(self.db[name].find())

                if len(result) == 0:
                    return result

                for item in result:
                    item = self.mongodb_normalize(item)

                return result

        def insert(self, name, data):
            """
            Insert a record to given table/collection

            :data dict: Dictionary to insert
            """
            if "id" in data.keys():
                del data["id"]
            if self.isSQL():
                cursor = self.connection.cursor()

                keys = list(data.keys())

                insert = "INSERT INTO " + name + "("
                insert += ','.join(map(str, keys))
                insert += ") VALUES ("
                insert += "?," * (len(keys) - 1)
                insert += "?)"

                values = tuple()

                for key in keys:
                    if not isinstance(data[key], bytes) and not isinstance(data[key], str):
                        try:
                            data[key] = json.dumps(data[key])
                        except Exception as e:
                            pass

                    values += (data[key], )

                res = cursor.execute(insert, values)
                self.connection.commit()
                cursor.close()
                return self.get(name, "id", cursor.lastrowid)
            else:
                result = self.db[name].insert_one(data)

                return self.get(name, "id", str(result.inserted_id))

        def update(self, name, key, value, data):
            if self.isSQL():
                cursor = self.connection.cursor()
                statement = "UPDATE " + name + " SET "

                for k in data:
                    statement += k + " = ?,"
                statement = statement[:-1] + " WHERE " + key + " = ?;"

                values = tuple()

                for k in data:
                    safe_data = None
                    if not isinstance(data[k], bytes) and not isinstance(data[k], str):
                        try:
                            safe_data = json.dumps(data[k])
                        except Exception as e:
                            pass
                    else:
                        safe_data = data[k]
                    values += (safe_data, )

                values += (value, )

                res = cursor.execute(statement, values)

                self.connection.commit()

                if cursor.rowcount == 0:
                    raise Exception("Update statement failed")

                cursor.close()

                return self.get(name, key, value)

            else:
                from pymongo import ReturnDocument
                if key == "id":
                    from bson import ObjectId
                    value = ObjectId(value)
                    key = "_" + key
                res = self.db[name].find_one_and_update({
                    key : value
                    },
                    {
                        "$set" : data
                    },
                    return_document=ReturnDocument.AFTER)

                if res == None:
                    raise Exception("No record found")
                return res

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

                before = self.get(name, key, value)

                res = self.db[name].delete_one({key : value})

                if res.deleted_count == 0:
                    raise Exception("No record to delete")
                return before

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

    # Singleton instantiation
    # It provides a default instance
    __instance = None
    __instance_named = dict()

    def __new__(self, *args, **kwargs):
        if len(args) > 0:
            log.debug("Initializing named instance")
            if args[0] in dbConnector.__instance_named and \
                dbConnector.__instance_named[args[0]] is not None:
                return dbConnector.__instance_named[args[0]]
            else:
                log.debug("New named instance '%s'" % args[0])
                dbConnector.__instance_named[args[0]] = dbConnector.__dbConn(
                        provider = kwargs.get("provider", "mongodb"),
                        server = kwargs.get("server", "localhost"),
                        port = kwargs.get("port", 27017),
                        db = kwargs.get("db", "liberouter"),
                        users = kwargs.get("users", "users"),
                        configuration = kwargs.get("configuration", "configuration"),
                        config = kwargs.get("config", dict())
                        )
            return dbConnector.__instance_named[args[0]]

        elif dbConnector.__instance is None:
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

