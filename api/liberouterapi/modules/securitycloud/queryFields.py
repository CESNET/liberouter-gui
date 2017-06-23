#!/bin/python3

import json
import subprocess

class FieldsError(Exception):
    def __init__(self, message):
        super(FieldsError, self).__init__(message)

class Fields():
    def __init__(self):
        cmd = "libnf-info | tail -n +4 | sed -r 's/(\s\s)+/\t/g' | cut -f3,4 | tr '\t' ';' | tr '\n' ':'"
        p = subprocess.Popen(cmd, stdout=subprocess.PIPE, shell=True)
        p.wait()
        if p.returncode is not 0:
            raise FieldsError("Failed to retrieve libnf-info")

        buffer = p.stdout.read().decode("utf-8")
        self.data = []

        subbuf = buffer.split(':')
        for row in subbuf:
            if row:
                s = row.split(';')
                self.data.append({"name": s[0], "hint": s[1]})

    def getJSONString(self):
        return json.dumps(self.data)
