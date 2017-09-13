from flask import Response
from bson import json_util

class ResponseHandler(Response):
	def __init__(self, content = None, *args, **kwargs):
		if isinstance(content, (dict, list)):
			content = json_util.dumps(content)
		super(Response, self).__init__(content, *args, **kwargs)

	@classmethod
	def force_type(cls, rv, environ=None):
		if isinstance(rv, (dict, list)):
			return cls(rv)

		return super(ResponseHandler, cls).force_type(rv, environ)
