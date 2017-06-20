from liberouterapi import auth
from flask import request

from .profiles import Profiles, ProfilesError
from .graphs import Graphs, GraphsError
from .queryFields import Fields, FieldsError
from .stats import Stats as Statistics
from .error import SCGUIException

@auth.required()
def getStatistics():
	req = request.args.to_dict()

	try:
		stats = Statistics(req['profile'], req['bgn'], req['end'])
		return stats.getJSON()
	except KeyError as e:
		raise SCGUIException("Key error: " + str(e))
	except ProfilesError as e:
		raise SCGUIException(str(e))

@auth.required()
def getProfile():
	req = request.args.to_dict()
	profiles = Profiles()

	try:
		profile = profiles.getProfile(req['profile'])
		return json.dumps(profile)
	except KeyError as e:
		raise SCGUIException(str(e))
	except ProfilesError as e:
		raise SCGUIException(str(e))

def fillChannel(channel, data):
	items = data.split(':')
	channel["name"] = items[0]
	channel["filter"] = items[1]
	channel["sources"] = []
	for i in range(2, len(items)):
		channel["sources"].append(items[i])

@auth.required('user')
def createProfile():
	req = request.args.to_dict()
	profiles = Profiles()

	try:
		newp = {
			"name": req["pname"],
			"type": req["ptype"],
			"channels": [],
			"subprofiles": []
		}

		chnls = req["channels"]
		items = chnls.split(';')
		i = 0
		for item in items:
			newp["channels"].append({})
			fillChannel(newp["channels"][i], item)
			i += 1

		if i == 0:
			raise KeyError("Missing channels in arguments")

		if not profiles.createSubprofile(req["profile"], newp):
			raise ProfilesError("Cannot create subprofile")
	except KeyError as e:
		raise SCGUIException(str(e))
	except ProfilesError as e:
		raise SCGUIException(str(e))

@auth.required('admin')
def deleteProfile():
	req = request.args.to_dict()
	profiles = Profiles()

	if "profile" not in req:
		raise SCGUIException("Bad URL arguments")

	if profiles.delete(req["profile"]):
		return '{"status": "success"}'
	else:
		return '{"status": "failed"}'

def getQueryFields():
	try:
		f = Fields()
		return f.getJSON()
	except FieldsError as e:
		raise SCGUIException(str(e))

@auth.required()
def getGraph():
	req = request.args.to_dict()

	try:
		g = Graph(req["profile"], req["bgn"], req["end"], req["var"], req["points"])
		return g.getJSON()
	except KeyError as e:
		raise SCGUIException(str(e))
	except GraphError as e:
		raise SCGUIException(str(e))
	except ProfilesError as e:
		raise SCGUIException(str(e))