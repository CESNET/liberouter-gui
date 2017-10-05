from flask import Blueprint
from liberouterapi import config

class Module(Blueprint):
	def __init__(self, name, import_name, url_prefix=None, no_version=False):
		if not no_version:
			self.url_prefix = '/' + config['api']['version'] + url_prefix
		else:
			self.url_prefix = url_prefix
		super(Module, self).__init__(name, import_name, url_prefix = self.url_prefix)

	def prefix(p):
		self.prefix = p

	def name(n):
		self.name = n
