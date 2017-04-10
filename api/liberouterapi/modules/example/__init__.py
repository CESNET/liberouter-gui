from liberouterapi import app
from ..module import Module

# Register a blueprint
module_bp = Module('module', __name__, url_prefix = '/module')

from .base import *

module_bp.add_url_rule('/', view_func = hello_world, methods=['GET'])
module_bp.add_url_rule('/protected', view_func = protected_hello, methods=['GET'])
