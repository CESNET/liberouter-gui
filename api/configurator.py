# -*- coding: utf-8 -*-

import configparser
import argparse
import sys
import os
from api import app

import unittest
class Config(object):
	"""
	@class Config
	@brief Handle configuration properties and set default values
	"""

	PROPAGATE_EXCEPTIONS = True

	version = '1.0'
	modules = dict()

	def __init__(self):
		args = self.parse_arguments()

		"""
		Load configuration
		"""
		app.logger.debug("Loading user configuration")
		self.config = configparser.ConfigParser()

		self.config.read(args['config'])

		self.DEBUG = self.config["api"].getboolean("debug", True)
		self.HOST = self.config["api"].get("host", "localhost")
		self.PORT = self.config["api"].getint("port", 8000)
		self.THREADED = self.config["api"].getboolean("threaded", True)
		self.SECRET_KEY = self.config["api"].get("secret_key", "")

		self.version = self.config["api"].get("version", "v1")

		self.config.set("api", "module_path", os.path.dirname(__file__) + self.config["api"].get("modules", "/modules"))

		self.create_urls()

	def create_urls(self):
		"""
		Create URIs for main parts of API
		* events Construct a base URI for events
		*
		"""
		self.config.set("api", "events", '/' + self.version + '/events/')
		self.config.set("api", "users", '/' + self.version + '/users/')
		self.config.set("api", "db", '/' + self.version + '/db/')

	def load(self, path='../../config.ini'):
		"""
		Load external configuration file and parse it
		"""
		tmp_config = configparser.ConfigParser()
		tmp_config.read(path)
		self.modules[tmp_config.sections()[0]] = tmp_config[tmp_config.sections()[0]]

	def __getitem__(self, key):
		return self.config[key]

	def parse_arguments(self):
		"""
		Handle arguments
		"""
		parser = argparse.ArgumentParser(description="""REST API CESNET 2016.\n\n
				Authors: Petr Stehlik <stehlik@cesnet.cz>""", add_help=False)

		parser.add_argument('--config', '-c',
				default=os.path.join(os.path.dirname(__file__), '../config.ini'),
				dest='config', help='Load given configuration file')
		parser.add_argument('--help', '-h', help="Print this help", dest='help')

		try:
			args = vars(parser.parse_args())

			if args['help']:
				parser.print_help()
				exit(0)

		except Exception as e:
			print(e)
			print("Failed to parse arguments")
			exit(1)
		return args

