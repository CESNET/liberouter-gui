#!/bin/python3

from liberouterapi import config
import os
import signal

SINGLE_MACHINE = True if config.modules['scgui']['single_machine'] == 'true' else False
IPFIXCOL_PIDFILE = config.modules['scgui']['ipfixcol_pidfile']
IPFIXCOL_NOTIFY_FILE = config.modules['scgui']['ipfixcol_notify_file']

class NotifierError(Exception):
    def __init__(self, message):
        super(NotifierError, self).__init__(message)

class Notifier():
    def __init__(self):
        self.pid = None
        with open(IPFIXCOL_PIDFILE, 'r') as fh:
            self.pid = fh.read()

    def notifyIpfixcol(self):
        """
        If SINGLE_MACHINE is enabled, send SIGUSR1 signal to ipfixcol process. Otherwise open/close
        ipfixcol update file.
        """
        if SINGLE_MACHINE:
            if self.pid is not None:
                os.kill(self.pid, signal.SIGUSR1)
            else:
                raise NotifierError('Could not find ipfixcol pidfile')
        else:
            # Simply open/close file
            with open(IPFIXCOL_NOTIFY_FILE, 'w') as fh:
                fh.close();