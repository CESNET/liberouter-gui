#!/bin/python3

from liberouterapi import config
import json
import shlex
import subprocess
from .profiles import Profiles, ProfilesError

SINGLE_MACHINE = True if config.modules['scgui']['single_machine'] == "true" else False
SLAVE_HOSTNAMES = config.modules['scgui']['single_machine'].split(";")
IPFIXCOL_DATA = config.modules['scgui']['ipfixcol_data']
RRDTOOL = config.modules['scgui']['rrdtool']

def grayscale(color):
    """
    Returns hexadecimal string with grayscale color definition. color argument
    defines overall intensity of output color and has to be somewhere between 0
    and 255.
    """
    return "#" + hex(color)[2:] + hex(color)[2:] + hex(color)[2:]

class GraphsError(Exception):
    def __init__(self, message):
        super(GraphError, self).__init__(message)

class Graphs():
    def __init__(self, profile, bgn, end, var, pixelwidth):
        self.data = None
        self.var = var
        self.bgn = bgn
        self.end = end
        self.pxw = pixelwidth

        pmgr = Profiles()

        self.profile = pmgr.getProfile(profile)
        if self.profile is None:
            raise ProfilesError("Profile %s not found" % profile)

        self.channels = []
        for channel in self.profile["channels"]:
            self.channels.append(channel)
        self.__loadData();

    def __buildCdefs(self):
        """
        Returns a string containing rrdtool definitions necessary for loading
        all channels in properly. These rules also take care of data conversions
        since bytes (vars with traffic prefix) have to be converted to bits per second.
        """
        defs = ""
        fooname = "foo"
        if self.var.startswith("traffic"):
            fooname = "bar"

        size = len(self.channels)
        for i in range(0, size):
            defs += "DEF:" + fooname + str(i + 1) + "=" + self.channels[i]["name"] + ".rrd:" + self.var + ":MAX "

        if fooname is "bar":
            for i in range(0, size):
                defs += "CDEF:foo" + str(i + 1) + "=bar" + str(i + 1) + ",8,* "

        return defs

    def __buildRenderRules(self):
        """
        Returns a string containing rrdtool render rules. Those rules will draw
        data sources as stacked grayscale areas. These rules are virtually useless
        right now, but they can be used as a fallback in case any of new gui
        designs will blow.
        """
        # base color black
        color = 0
        # no brighter than rgb(192, 192, 192)
        colorStep = int(192 / len(self.channels))

        rules = "AREA:foo1" + grayscale(color) + ':"' + self.channels[0]["name"] + '" '
        for i in range(1, len(self.channels)):
            color += colorStep
            rules += "AREA:foo" + str(i + 1) + grayscale(color) + ':"' + self.channels[i]["name"] + '":STACK '
        return rules

    def __getRrdtoolData(self, args, path):
        """
        Execute command specified by args in path folder and return stdout
        output of executed command. Raises exception if command did not finished
        successfully.
        """
        p = subprocess.Popen(args, stdout=subprocess.PIPE, cwd=path)

        p.wait()
        if p.returncode is not 0:
            raise GraphsError("Failed to retrieve rrdtool data")
        return p.stdout.read().decode(encoding="utf-8")

    def __loadData(self):
        """
        Command breakdown: RRDTOOL is path to rrdtool executable, 'graph' is
        mode for program to work in. Dash means we don't want to generate output
        file. -a JSONTIME will return string with JSON data with timestamp for each
        column. -Z will ignore missing files, filling zeroes to their channels.
        --start marks timestamp of left border f graph, --end marks the other border.
        Then cdefs and render rules are inserted. Width specifies pixel size of
        the graph. Hopefully this will force rrdtool to make data aggregation
        for me when requesting 
        """
        cmd = RRDTOOL + " graph - -a JSONTIME -Z --width " + str(self.pxw) + " --start " + str(self.bgn) + " --end " + str(self.end) + " " + self.__buildCdefs() + " " + self.__buildRenderRules()
        args = shlex.split(cmd)

        if SINGLE_MACHINE:
            cwdpath = IPFIXCOL_DATA + self.profile["path"] + "/rrd/channels/"
            self.data = self.__getRrdtoolData(args, cwdpath)
        else:
            # Auxiliary dictionary for merging source files
            aux = None
            for slave in SLAVE_HOSTNAMES:
                cwdpath = IPFIXCOL_DATA + slave + self.profile["path"] + "/rrd/channels/"
                # parse output to dict
                js = json.loads(self.__getRrdtoolData(args, cwdpath));

                # if aux is not initialized
                if aux is None:
                    # initialize it with loaded data
                    aux = js
                else:
                    # otherwise only add new data to it
                    for r in range(0, len(js["data"])):
                        for c in range(1, len(js["data"][r])):
                            aux["data"][r][c] += js["data"][r][c]
            # store merged data back to self.data as json string
            self.data = json.dumps(aux)

    def getJSONString(self):
        return self.data

if __name__ == "__main__":
    g = Graph("/live", 1486428900, 1486432500, "flows", 0)
    print(g.getJSONString())