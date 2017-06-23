import unittest
from tests.profiles import ProfilesTestCase

if __name__ == '__main__':
	suite = unittest.TestSuite()
	suite.addTest(unittest.makeSuite(ProfilesTestCase))

	unittest.TextTestRunner(verbosity=2).run(suite)