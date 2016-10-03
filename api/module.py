from flask import Blueprint
from api import config

class Module(Blueprint):
	def __init__(self, name, import_name, url_prefix=None):
		self.url_prefix = '/' + config['api']['version'] + url_prefix
		super().__init__(name, import_name, url_prefix = self.url_prefix)

	def prefix(p):
		self.prefix = p

	def name(n):
		self.name = n
