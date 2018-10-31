import json
from flask import request
import logging

from liberouterapi import auth, db, socketio
from liberouterapi.modules.module import Module
from liberouterapi.Auth import Auth, AuthException
from liberouterapi.user import User

log = logging.getLogger(__name__)

au = Module('authorization', __name__, url_prefix='/authorization', no_version=True)

sockets = {}


@socketio.on('connect')
def sio_register():
	if request.sid in sockets:
		raise SessionException("Already registered Socket ID " + request.sid + ".")

	sockets[request.sid] = {'auth' : False}
	log.info("SocketIO connected (%s)." % request.sid)


@socketio.on('disconnect')
def sio_unregister():
	if not request.sid in sockets:
		raise SessionException("Unknown SocketIO ID " + request.sid + ".")

	del sockets[request.sid]
	log.info("SocketIO disconnected (%s)." % request.sid)


@socketio.on('login')
def sio_login(session_id):
	if not request.sid in sockets:
		raise SessionException("Socket already connected.")
	if sockets[request.sid]['auth']:
		return

	if not session_id:
		raise SessionException("Session ID information not found.")

	try:
		session = auth.lookup(session_id)
	except SessionException:
		raise SessionException("Session not found")

	sockets[request.sid]['sid'] = session_id
	sockets[request.sid]['auth'] = True
	log.info("SocketIO authorized for session %s (%s)." % (session_id, request.sid))


@socketio.on('logout')
def sio_logout():
	if not request.sid in sockets:
		raise SessionException("Socket not connected.")
	if not sockets[request.sid]['auth']:
		return

	log.info("SocketIO logout from session %s (%s)." % (sockets[request.sid]['sid'], request.sid))
	sockets[request.sid]['auth'] = False
	del sockets[request.sid]['sid']


@au.route('', methods=['POST'])
def login():
	"""
	Authorize user using their username and password
	@return user's document from the DB including config
	"""
	user_data = request.get_json()

	if not user_data:
		raise AuthException("Missing user data")

	user = User(user_data['username'], password=user_data['password'])

	auth_user = auth.login(user)

	user = User.from_dict(auth_user)

	session_id = auth.store_session(user)

	return(json.dumps({"session_id" : session_id, "user" : auth_user}))


@au.route('', methods=['DELETE'])
@auth.required()
def logout():
	session_id = request.headers.get('lgui-Authorization', None)
	auth.delete(session_id)
	return(json.dumps({"success" : True}))


"""
Checks validity of session using only required() decorator
"""
@au.route('', methods=['GET'])
@auth.required()
def checkSession():
	return('')
