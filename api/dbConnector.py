import pymongo
from api import app

class dbConnector(object):
	host = ""
	port = ""
	dbName = ""
	eventsCollection = ""
	usersCollection = ""
	sessionsCollection = ""
	collection = None
	users = None
	events = None
	sessions = None
	db = None
	socket = None

	@classmethod
	def from_object(self, config):
		return self(host = config.get("host", "localhost"),
				port = config.getint("port", 27017),
				db = config["database"],
				events = config["events"],
				users = config["users"],
				sessions = config["sessions"])

	def __init__(self, host = "localhost",
			port = 27017,
			db = "nemeadb",
			events = "events",
			users = "users",
			sessions = "sessions"):

		# Setup host and port for DB
		self.host = host
		self.port = port

		# Set up database name
		self.dbName = db

		# Set up events collection
		self.eventsCollection = events

		# Set up users collection
		self.usersCollection = users

		self.sessionsCollection = sessions

		# Connect to database and bind events and users collections
		try:
			self.socket = pymongo.MongoClient(self.host,
					self.port,
					serverSelectionTimeoutMS=100)

			# Try to print out server info
			# This raises ServerSelectionTimeoutError
			self.socket.server_info()

			self.db = self.socket[self.dbName]
			self.collection = self.events = self.db[self.eventsCollection]
			self.users = self.db[self.usersCollection]
			self.sessions = self.db[self.sessionsCollection]

		# Small trick to catch exception for unavailable database
		except pymongo.errors.ServerSelectionTimeoutError as err:
			app.logger.error("Failed to connect to database: " + str(err))
			print(err)
			exit(1)
#END db

