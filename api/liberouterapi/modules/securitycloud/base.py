from liberouterapi import auth
from liberouterapi import role
from liberouterapi import config
from flask import request
import json

from .profiles import Profiles, ProfilesError
from .graphs import Graphs, GraphsError
from .queryFields import Fields, FieldsError
from .dbqry import Dbqry, DbqryError
from .stats import Stats as Statistics
from .error import SCGUIException

@auth.required()
def getStatistics():
    req = request.args.to_dict()

    try:
        stats = Statistics(req['profile'], req['bgn'], req['end'])
        return stats.getJSONString()
    except KeyError as e:
        raise SCGUIException('Key error: ' + str(e))
    except ProfilesError as e:
        raise SCGUIException(str(e))

@auth.required()
def getProfile():
    req = request.args.to_dict()
    profiles = Profiles()

    try:
        if req['profile'] == 'all':
            return profiles.getJSONString()
        else:
            profile = profiles.getProfile(req['profile'])
            return json.dumps(profile)
    except KeyError as e:
        raise SCGUIException('Key error: ' + str(e))
    except ProfilesError as e:
        raise SCGUIException('Profiles error: ' + str(e))

def fillChannel(channel, data):
    '''
    Auxiliary function for createProfile(). This method parses part of url parameters and breaks
    them into a dictionary object representing single profile channel.
    '''
    items = data.split(':')
    channel['name'] = items[0]
    channel['filter'] = items[1]
    channel['sources'] = []
    for i in range(2, len(items)):
        channel['sources'].append(items[i])

@auth.required(role.Role.user)
def createProfile():
    req = request.args.to_dict()
    profiles = Profiles()

    try:
        newp = {
            'name': req['pname'],
            'type': req['ptype'],
            'channels': [],
            'subprofiles': []
        }

        chnls = req['channels']
        items = chnls.split(';')
        i = 0
        for item in items:
            newp['channels'].append({})
            fillChannel(newp['channels'][i], item)
            i += 1

        if i == 0:
            raise KeyError('Missing channels in arguments')

        if not profiles.createSubprofile(req['profile'], newp):
            raise ProfilesError('Cannot create subprofile')
    except KeyError as e:
        raise SCGUIException('KeyError:' + str(e))
    except ProfilesError as e:
        raise SCGUIException(str(e))

@auth.required(role.Role.admin)
def deleteProfile():
    req = request.args.to_dict()
    profiles = Profiles()

    if 'profile' not in req:
        raise SCGUIException('Bad URL arguments')

    if profiles.delete(req['profile']):
        return json.dumps({'success': True})
    else:
        return json.dumps({'success': False})

def getQueryFields():
    try:
        f = Fields()
        return f.getJSONString()
    except FieldsError as e:
        raise SCGUIException(str(e))

@auth.required(role.Role.user)
def getQuery():
    req = request.args.to_dict()
    sessionID = request.headers.get('Authorization', None)

    try:
        q = Dbqry()
        return q.getResultJSONString(sessionID, req['instanceID'])
    except DbqryError as e:
        raise SCGUIException(str(e))
    except KeyError as e:
        raise SCGUIException('KeyError: ' + str(e))
    except Exception as e:
        raise SCGUIException('UnknownException: ' + str(e))

@auth.required(role.Role.user)
def startQuery():
    req = request.get_json()
    sessionID = request.headers.get('Authorization', None)
    
    try:
        q = Dbqry()
        return q.runQuery(sessionID, req['instanceID'], req['profile'], req['args'], req['filter'], req['channels'])
    except ProfilesError as e:
        raise SCGUIException(str(e))
    except DbqryError as e:
        raise SCGUIException(str(e))
    except KeyError as e:
        raise SCGUIException('KeyError: ' + str(e))
    except Exception as e:
        raise SCGUIException('UnknownException: ' + str(e))

@auth.required(role.Role.user)
def killQuery():
    req = request.args.to_dict()
    sessionID = request.headers.get('Authorization', None)
    
    try:
        q = Dbqry()
        q.killQuery(sessionID, req['instanceID'])
        return json.dumps({'success': True})
    except DbqryError as e:
        raise SCGUIException(str(e))
    except KeyError as e:
        raise SCGUIException('KeyError: ' + str(e))
    except Exception as e:
        raise SCGUIException('UnknownException: ' + str(e))

@auth.required(role.Role.user)
def getProgress():
    req = request.args.to_dict()
    sessionID = request.headers.get('Authorization', None)
    
    try:
        q = Dbqry()
        return q.getProgressJSONString(sessionID, req['instanceID'])
    except KeyError as e:
        raise SCGUIException('KeyError: ' + str(e))
    except Exception as e:
        raise SCGUIException('UnknownException: ' + str(e))

@auth.required()
def getGraph():
    req = request.args.to_dict()

    try:
        g = Graphs(req['profile'], req['bgn'], req['end'], req['var'], req['points'], req['mode'])
        return g.getJSONString()
    except KeyError as e:
        raise SCGUIException(str(e))
    except GraphsError as e:
        raise SCGUIException(str(e))
    except ProfilesError as e:
        raise SCGUIException(str(e))

@auth.required(role.Role.user)
def getConfForFrontend():
    result = {}
    result['historicData'] = config.modules['scgui']['historic_data']
    result['useLocalTime'] = config.modules['scgui']['use_local_time']
    return json.dumps(result)