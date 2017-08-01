#!/bin/python3

import os
import json
import subprocess
import shlex
from liberouterapi import config
from .dbqryProcessDb import DbqryProcessDb
from .profiles import Profiles

MPICH_CMD = config.modules['scgui']['mpich_cmd']
MPICH_ARGS = config.modules['scgui']['mpich_args']
FDISTDUMP_CMD = config.modules['scgui']['fdistdump_cmd']
FDISTDUMP_HA_CMD = config.modules['scgui']['fdistdump_ha_cmd']
SINGLE_MACHINE = True if config.modules['scgui']['single_machine'] == 'true' else False
IPFIXCOL_DATA = config.modules['scgui']['ipfixcol_data']

class DbqryError(Exception):
    def __init__(self, message):
        super(DbqryError, self).__init__(message)

class Dbqry():
    def __init__(self):
        pass

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
        chnls = channels.split(':')
        channels = channels.replace(':', ' ')

        # Sanitize filter
        filter = shlex.quote(filter)
        # NOTE: Shadow profiles

        # Sanitize arguments

        # Create paths
        cwdpath = IPFIXCOL_DATA + profile['path'] + '/channels';
        progress = ' --progress-bar-type=json --progress-bar-dest=/tmp/' + sessionID + '.' + instanceID + '.json '

        cmdback = ''
        cmd = ''
        if SINGLE_MACHINE:
            for i in range(0, len(chnls)):
                chnls[i] = IPFIXCOL_DATA + profile['path'] + '/channels/' + chnls[i]
            channels = ' '.join(chnls)

            # Create command
            cmd = MPICH_CMD + ' ' + MPICH_ARGS + ' -env OMP_NUM_THREADS 4 ' + FDISTDUMP_CMD + ' '
            cmdback = cmd + filter + ' ' + args + ' ' + channels
            repl = '--output-format=csv --output-addr-conv=str --output-tcpflags-conv=str '
            repl += '--output-proto-conv=str --output-duration-conv=str --output-volume-conv=metric-prefix'
            args = args.replace('--output-format=pretty', repl)
            args = args.replace('--output-format=long', repl)

            cmd += filter + ' ' + args + ' --progress-bar-type=json --progress-bar-dest='
            cmd += '/tmp/' + sessionID + '.' + instanceID + '.json '
            cmd += channels
        else:
            cmdback = ''
            cmd = ''

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
                progress = json.loads(fh.read())
                # Fdistdump is on 100% when it reads all the files
                if progress['total'] == 100:
                    # But fdistdump probably still processes data
                    if p.poll() is None:
                        # So stall the gui for a while
                        return json.dumps({'total': 99})
                return json.dumps({'total': progress['total']})
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