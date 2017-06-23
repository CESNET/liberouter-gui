#!/bin/python3

from liberouterapi.error import ApiException

class SCGUIException(ApiException):
    status_code = 500