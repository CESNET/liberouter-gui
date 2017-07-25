#!/bin/python3

class DbqryProcessDb(object):
    """
    This class defines a singleton dictionary of dictionaries. Primary key is sessionID identifying
    the user and instanceID, identifying browser tab. This database contains references to Popen
    objects that run fdistdump query.
    """
    class __DbqryProcessDbInternal:
        def __init__(self):
            self.data = {}

        def insert(self, keyPrimary, keySecondary, value):
            if keyPrimary not in self.data:
                self.data[keyPrimary] = {}

            self.data[keyPrimary][keySecondary] = value

        def read(self, keyPrimary, keySecondary):
            return self.data[keyPrimary][keySecondary]

        def delete(self, keyPrimary, keySecondary):
            self.data[keyPrimary].pop(keySecondary, None)

    __instance = None
    def __new__(cls):
        if DbqryProcessDb.__instance is None:
            DbqryProcessDb.__instance = DbqryProcessDb.__DbqryProcessDbInternal()
        return DbqryProcessDb.__instance

    def __init__(self):
        if DbqryProcessDb.__instance is None:
            DbqryProcessDb.__instance = DbqryProcessDb.__DbqryProcessDbInternal()