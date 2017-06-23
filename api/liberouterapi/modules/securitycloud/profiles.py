#!/bin/python3

from liberouterapi import config
import json
from bs4 import BeautifulSoup
from bs4 import element
import os
import re

IPFIXCOL_DATA = config.modules['scgui']['ipfixcol_data']
IPFIXCOL_CONF = config.modules['scgui']['ipfixcol_conf']
#IPFIXCOL_DATA = "/data"
#IPFIXCOL_CONF = "/data/live"

class ProfilesError(Exception):
    def __init__(self, message):
        super(ProfilesError, self).__init__(message)

class Profiles(object):
    class __Prof:
        def __init__(self, path = None):
            self.path = ""
            self.tree = ""
            self.data = ""

            self.setConfiguration(path)


        def __fillChannel(self, channel):
            """
            Takes a channel tag and fill its contents to out dictionary. This includes
            parsing and filling sources array

            Returns dictionary of channel's data
            """
            assert(isinstance(channel, element.Tag))
            assert(channel.name == "channel")

            out = dict()

            # User might forgot these
            out['name'] = channel.attrs['name']
            out['filter'] = channel.find('filter').get_text().strip()
            out['sources'] = list()

            sourceList = channel.find('sourcelist')
            try:
                for source in sourceList.children:
                    if isinstance(source, element.Tag):
                        if source.name == "source":
                            out['sources'].append(source.get_text().strip())
                        else:
                            raise ProfilesError("Unexpected tag in sourcelist (%s)" % source.name)
            except TypeError:
                raise ProfilesError("No sourcelist specified")

            return out

        def __fillProfile(self, profile, path, outProfile):
            """
            Takes a profile tag and fills its contents to output dictionary.

            This function is called recursively so all subprofiles are loaded
            properly to json tree structure. Since BeautifulSoup loops literaly
            over everything (including comments and extra newlines, couple of extra
            tests had to be included to prevent type errors.
            """
            assert(isinstance(profile, element.Tag)),"Invalid object send to fillProfile."
            assert(profile.name == "profile"), "Invalid tag send to fillProfile."

            out = {}

            # Fill basic meta
            out['name'] = profile.attrs['name']
            out['type'] = profile.find('type').get_text().strip()
            out['path'] = path + out['name']

            # Fill channels
            out['channels'] = []

            channelList = profile.find('channellist')
            try:
                for channel in channelList.children:
                    if isinstance(channel, element.Tag):
                        if channel.name != 'channel':
                            # User put there wrong tag
                            raise ProfilesError("Invalid tag in channellist")

                        out['channels'].append(self.__fillChannel(channel))
            except TypeError:
                # User forgot channelList
                raise ProfilesError("No channels found")

            if not out['channels']:
                raise ProfilesError("No channels found")

            # Fill subprofiles
            out['subprofiles'] = {}

            subprofileList = profile.find('subprofilelist')
            if subprofileList is not None:
                for subprofile in subprofileList.children:
                    if isinstance(subprofile, element.Tag):
                        if subprofile.name != 'profile':
                            raise ProfilesError("Invalid tag in subprofile list")

                        self.__fillProfile(subprofile, out['path'] + '/', out['subprofiles'])
            outProfile[out["name"]] = out;

        def __parseTree(self, tree):
            """
            Takes a tree root, creates empty list and parses xml data to it in json.dumps
            compatible format. Output list is then returned.
            """
            # NOTE: In case ipfixcol implements support for multiple root
            # profiles, this method has to be edited to support loading such
            # xml files.
            profile = tree.find('profile')
            out = {}
            self.__fillProfile(profile, '/', out)
            return out

        def __exportXMLChannel(self, data):
            """
            Auxiliary routing for exporting XML data of a single channel
            """
            output = '<channel name="%s">' % data["name"]
            output += "<sourceList>"
            for source in data["sources"]:
                output += "<source>%s</source>" % source
            output += "</sourceList>"
            output += "<filter>%s</filter>" % data["filter"]
            output += "</channel>"
            return output

        def __exportXMLProfile(self, data):
            """
            Auxiliary routine for exporting XML data of a single profile
            """
            output = '<profile name="%s">' % data["name"]
            output += "<type>%s</type>" % data["type"]
            output += "<directory>%s</directory>" % (IPFIXCOL_DATA + data["path"])
            output += "<channelList>"
            for channel in data["channels"]:
                output += self.__exportXMLChannel(channel)
            output += "</channelList>"

            if data["subprofiles"]:
                output += "<subprofileList>"
                for key in data["subprofiles"]:
                    output += self.__exportXMLProfile(data["subprofiles"][key])
                output += "</subprofileList>"
            output += "</profile>"
            return output

        def getJSON(self):
            return json.dumps(self.data)

        def exportXML(self, altPath = None):
            """
            XML generated from internal json data will be exported to a file.
            Either this will be file used for loading data in __init__ or if specified,
            altPath will be used.
            """
            path = self.path

            if altPath is not None:
                path = altPath

            text = '<?xml version="1.0"?>'
            for key in self.data:
                text += self.__exportXMLProfile(self.data[key])
            with open(path, 'w') as fh:
                """
                Current version of ipfixcol cannot handle xml files with bs4
                formatting, thus the export formatting is turned off for now.
                """
                #soup = BeautifulSoup(text, "lxml")
                #fh.write(soup.prettify())
                fh.write(text)

        def createSubprofile(self, profilePath, data):
            """
            Profile with specified profilePath will have its list of subprofiles
            expanded with data. Data is a dictionary with profile data defined in
            the same way as is json produced by getJSON. There is no need for 
            defining path since it will be overwritten by this function. True is
            returned on success, False otherwise.
            """
            toAppend = self.getProfile(profilePath)
            if toAppend is None:
                return False
            data['path'] = os.path.join(toAppend['path'], data['name'])
            toAppend['subprofiles'][data["name"]] = data;
            return True

        def update(self, profile):
            """
            At this point, ipfixcol does not support profile updating. Not only
            profile updating has to be supported but also profile ID has to be
            generated for each profile instead of identifying it with name.
            """
            pass

        def __deleteInternal(self, profileRoot, profilePath):
            name = profilePath.split('/', 1)
            # This profile is direct parent of to-be-deleted one
            if len(name) == 1:
                profileRoot["subprofiles"].pop(name[0])
            else:
                self.__deleteInternal(profileRoot["subprofiles"][name[0]], name[1])

        def delete(self, profilePath):
            """
            Profile specified by profile path will be deleted and all of its
            subprofiles will be removed too. This method have to implement it's own
            profile search since for /live only subprofiles can be deleted and for
            any other profile not only its contents but record about profile itself
            has to be deleted from its parent hierarchy. TRUE is returned if profile
            was found.
            """
            # All paths start with /
            name = profilePath[1:].split('/', 1)

            # Highest level profile cannot be deleted, instead wipe its children
            try:
                if len(name) == 1:
                    self.data[name[0]]["subprofiles"].clear()
                else:
                    self.__deleteInternal(self.data[name[0]], name[1])
                return True
            except KeyError:
                return False

        def __getProfileInternal(self, profileRoot, profilePath):
            """
            Auxiliary internal recursive function for searching profile specified
            with profilePath. On success, profile is returned, on failure, None is
            returned.
            """
            name = profilePath.split('/', 1)
            # If current profile is direct parent of searched one
            if len(name) == 1:
                return profileRoot["subprofiles"][name[0]]
            # Else
            return self.__getProfileInternal(profileRoot["subprofiles"][name[0]], name[1])

        def getProfile(self, profilePath):
            """
            Returns only a subset of loaded profile data with profile at
            profilePath being a root of that subset. Returns None on failure.
            """
            # All paths start with /
            name = profilePath[1:].split('/', 1)

            try:
                # If we're looking for a highest level profile
                if len(name) == 1:
                    return self.data[name[0]]
                # Else
                return self.__getProfileInternal(self.data[name[0]], name[1])
            except KeyError:
                return None

        def setConfiguration(self, path = None):
            """
            Auxiliary method for acceptance testing. This method allows to overwrite
            internal data tree and paths. This method is also used by __init__
            """
            self.path = IPFIXCOL_CONF

            if path is not None:
                self.path = path

            with open(self.path) as handle:
                self.tree = BeautifulSoup(handle, 'lxml')
            self.data = self.__parseTree(self.tree)


    __instance = None
    def __new__(cls, path = None):
        if Profiles.__instance is None:
            Profiles.__instance = Profiles.__Prof(path)
        return Profiles.__instance

    def __init__(self, path = None):
        if not Profiles.__instance:
            Profiles.__instance = Profiles.__Prof(path)