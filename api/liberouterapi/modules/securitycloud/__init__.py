from liberouterapi import app, config
from ..module import Module

config.load(path = __path__[0] + '/config.ini')

# Register a blueprint
scgui_bp = Module('SecurityCloudGUI', __name__, url_prefix = '/scgui', no_version=True)

from .base import *

# scgui/stats
scgui_bp.add_url_rule('/stats', view_func = getStatistics, methods = ['GET'])

# scgui/profiles
scgui_bp.add_url_rule('/profiles', view_func = getProfile, methods = ['GET'])
# module_bp.add_url_rule('/profiles', view_func = getStatistics, methods = ['PUT'])
scgui_bp.add_url_rule('/profiles', view_func = createProfile, methods = ['POST'])
scgui_bp.add_url_rule('/profiles', view_func = deleteProfile, methods = ['DELETE'])

# scgui/query/fields
scgui_bp.add_url_rule('/query/fields', view_func = getQueryFields, methods = ['GET'])

# scgui/query/instance


# scgui/graph/
scgui_bp.add_url_rule('/query/fields', view_func = getGraph, methods = ['GET'])