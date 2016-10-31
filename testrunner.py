import unittest
from tests.basic import BasicTestCase
from tests.users import UsersTestCase

if __name__ == '__main__':
	suite = unittest.TestSuite()
	suite.addTest(unittest.makeSuite(BasicTestCase))
	suite.addTest(unittest.makeSuite(UsersTestCase))

	unittest.TextTestRunner(verbosity=2).run(suite)
