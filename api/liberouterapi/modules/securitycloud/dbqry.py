#!/bin/python3

import os
import json
import subprocess
import shlex
from liberouterapi import config
from .dbqryProcessDb import DbqryProcessDb
from .profiles import Profiles

MPICH = config.modules['scgui']['mpich']
SINGLE_MACHINE = config.modules['scgui']['single_machine']
IPFIXCOL_DATA = config.modules['scgui']['ipfixcol_data']

class DbqryError(Exception):
    def __init__(self, message):
        super(DbqryError, self).__init__(message)

class Dbqry():
    def __init__(self):
        self.cmd = '/mpiexec -n 2 fdistdump '

    def runQuery(self, sessionID, instanceID, profilePath, args, filter, channels):
        """
        Before the query can be started, filter has to be sanitized and modified based on the type
        of the queried profile. Also arguments should be somehow sanitized to not cause troubles and
        not giving access to shell. After all this is done, query can be run and its process Popen
        object is saved into process database. After that, command that was executed is returned
        within JSON response object. Note that this version of the command is not sanitized, so the
        user does not know anything.
        """
        p = Profiles()
        profile = p.getProfile(profilePath)
        cwdpath = profile['path']
        parentPath = profilePath[:len(profilePath) - len(profile['name']) - 1]
        parentProfile = p.getProfile(parentPath)

        # Sanitize channel names
        channels = channels.replace(':', ' ')
        
        # Sanitize filter
        filter = shlex.quote(filter)
        # NOTE: Shadow profiles

        # Sanitize arguments

        # Create paths
        cwdpath = IPFIXCOL_DATA + profile['path'] + '/channels';
        progress = ' --progress-bar-type=json --progress-bar-dest=/tmp/' + sessionID + '.' + instanceID + '.json '

        # Create command
        cmd = MPICH + self.cmd + '-f ' + filter + ' ' + args + progress + channels
        cmdback = self.cmd + '-f ' + filter + ' ' + args + ' ' + channels

        # Run query and save it
        # universal_newlines will open streams in text mode instead of binary
        p = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True, cwd=cwdpath, universal_newlines=True)
        db = DbqryProcessDb()
        db.insert(sessionID, instanceID, p)

        # Return backup command
        return json.dumps({'command': cmdback});

    def killQuery(self, sessionID, instanceID):
        """
        Popen object is retrieved from the process database and then the process is killed.
        """
        db = DbqryProcessDb()
        p = db.read(sessionID, instanceID)
        p.kill()

    def getProgressJSONString(self, sessionID, instanceID):
        """
        This method reads the progress json file asociated with the database query. Based on this
        progress file, the frontend gui is updated on status of the query itself and when it should
        request output texts.
        """
        # On startup error, fdistdump does not generate progress file. Following lines fix that
        db = DbqryProcessDb()
        p = db.read(sessionID, instanceID)
        if p.poll() is not None:
            if p.returncode != 0:
                return json.dumps({'total': 100})

        path = '/tmp/' + sessionID + '.' + instanceID + '.json'
        try:
            with open(path, 'r') as fh:
                return fh.read()
        except Exception:
            return json.dumps({'total': 0});

    def getResultJSONString(self, sessionID, instanceID):
        """
        Retrieves Popen object from the process database, uses communicate to read its stdout and
        stderr, removes the progress file and returns stdout and stderr within JSON object.
        """
        db = DbqryProcessDb()
        p  = db.read(sessionID, instanceID)

        out, err = p.communicate()
        
        path = '/tmp/' + sessionID + '.' + instanceID + '.json'
        if os.path.isfile(path):
            os.remove(path)

        # TODO: Postprocess out
        return json.dumps({'out': str(out), 'err': str(err)})