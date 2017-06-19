from liberouterapi import app, config
import sys

class dbConnector(object):
	class __dbConn:
		provider = ""
		server = ""
		port = ""
		dbName = ""
		usersCollection = ""
		users = None
		db = None
		socket = None
		config = None

		@classmethod
		def from_object(self, config):
			return self(
					provider = config.get("provider", "mongodb"),
					server = config.get("server", "localhost"),
					port = config.getint("port", 27017),
					db = config["database"],
					users = config["users"],
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
			self.users = users
			self.config = config

			if (provider == "mongodb"):
				self.mongodb();
			elif (provider == "sqlite"):
				self.sqlite()
			elif (provider == "mysql"):
				self.mysql()
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
			self.users = self.config.get("users", "users")

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
			# Set up users collection
			self.usersCollection = self.users

			# Connect to database and bind events and users collections
			try:
				self.socket = pymongo.MongoClient(self.server,
						self.port,
						serverSelectionTimeoutMS=100)

				# Try to print out server info
				# This raises ServerSelectionTimeoutError
				self.socket.server_info()

				self.db = self.socket[self.dbName]
				self.users = self.db[self.usersCollection]

			# Small trick to catch exception for unavailable database
			except pymongo.errors.ServerSelectionTimeoutError as err:
				app.logger.error("Failed to connect to database: " + str(err))

		def sqlite(self):
			from flask_sqlalchemy import SQLAlchemy
			path = "sqlite:////" + sys.path[0] + "/" + self.config['file']
			app.config['SQLALCHEMY_DATABASE_URI'] = path
			app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
			self.db = SQLAlchemy(app)

		def mysql(self):
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

#END db

