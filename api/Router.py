from flask import Flask

class Router(Flask):
	def add_route(self, rule, view_func, **options):
		"""
		Encapsulate add_url_rule(self, rule, endpoint=None, view_func=None, **options)
		and fill in the endpoint automatically.
		"""

		print("Registered endpoint \"" + rule + "\"")

		self.add_url_rule(self, rule, view_func.__name__, view_func, **options)

