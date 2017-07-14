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
# TODO: updateProfile (PUT method)
scgui_bp.add_url_rule('/profiles', view_func = createProfile, methods = ['POST'])
scgui_bp.add_url_rule('/profiles', view_func = deleteProfile, methods = ['DELETE'])

# scgui/query/fields
scgui_bp.add_url_rule('/query/fields', view_func = getQueryFields, methods = ['GET'])

# scgui/query/instance
scgui_bp.add_url_rule('/query/instance', view_func = getQuery, methods = ['GET'])
scgui_bp.add_url_rule('/query/instance', view_func = startQuery, methods = ['POST'])
scgui_bp.add_url_rule('/query/instance', view_func = killQuery, methods = ['DELETE'])

# scgui/query/progress
scgui_bp.add_url_rule('/query/progress', view_func = getProgress, methods = ['GET'])

# scgui/graph/
scgui_bp.add_url_rule('/graph', view_func = getGraph, methods = ['GET'])

#scgui/conf/
scgui_bp.add_url_rule('/config', view_func = getConfForFrontend, methods = ['GET'])