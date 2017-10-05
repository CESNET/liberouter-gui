# -*- coding: utf-8 -*-

from backports import configparser
import argparse
from argparse import RawTextHelpFormatter
import sys
import os
import logging

log = logging.getLogger(__name__)

class Config(object):
    """
    @class Config
    @brief Handle configuration properties and set default values
    """

    PROPAGATE_EXCEPTIONS = True

    version = '1.0'
    modules = dict()

    def __init__(self):
        args = self.parse_arguments()

        """
        Load configuration
        """
        log.debug("Loading user configuration")
        self.config = configparser.ConfigParser()

        res = self.config.read(args['config'])

        # Check if config was loaded successfully, api section must be there
        if len(res) == 0:
            log.error("No configuration file was read! Using default values.")
            self.config.add_section("api")

        self.DEBUG = self.config["api"].getboolean("debug", False)
        self.HOST = self.config["api"].get("host", "localhost")
        self.PORT = self.config["api"].getint("port", 8000)
        self.THREADED = self.config["api"].getboolean("threaded", True)

        # If in debug mode we want all logging messages
        if self.DEBUG:
            logging.basicConfig(level=logging.DEBUG)

        self.version = self.config["api"].get("version", "1.0")

        # Create module path for module importing
        self.config.set("api", "module_path",
                os.path.dirname(__file__) + self.config["api"].get("modules", "/modules"))

        self.create_urls()

    def create_urls(self):
        """
        Create URIs for main parts of API
        * events Construct a base URI for events
        *
        """
        self.config.set("api", "events", '/' + self.version + '/events/')
        self.config.set("api", "users", '/' + self.version + '/users/')
        self.config.set("api", "db", '/' + self.version + '/db/')

    def load(self, path):
        """
        Load external configuration file and read it

        WARNING: If the same section and values in sections are present they are overwritten
        """
        res = self.config.read(path)

        if len(res) == 0:
            log.error("No configuration file was read.")

    def __getitem__(self, key):
        return self.config[key]

    def parse_arguments(self):
        """
        Handle arguments
        """
        parser = argparse.ArgumentParser(description="Liberouter GUI REST API\n"\
                "CESNET 2016 - 2017.\n\n"\
                "Authors: Petr Stehlik, Jakub Neruda, Petr Velan, Radek Krejci\n"
                "GitHub: https://github.com/CESNET/liberouter-gui"
                , formatter_class=RawTextHelpFormatter)

        parser.add_argument('-c', '--config',
                default=os.path.join(os.path.dirname(__file__), '../config.ini'),
                dest='config', help='Load given configuration file')
        #parser.add_argument('--help', '-h', help="Print this help", dest='help')

        try:
            args = vars(parser.parse_args())

        except Exception as e:
            print(e)
            print("Failed to parse arguments")
            exit(1)
        return args

