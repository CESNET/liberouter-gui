#!/bin/python3

import unittest
import json
import os

from profiles import Profiles, ProfilesError

class ProfilesTestCase(unittest.TestCase):
	def setUp(self):
		pass

	def tearDown(self):
		pass

	def test_01_valid_xml(self):
		"""Try to parse valid Profiles file"""
		profiles = Profiles('tests/files/test_valid.xml')
		self.assertTrue(profiles.getJSONString() != '[{}]')

	def test_02_invalid_xml(self):
		"""TEST02 - Loading invalid XML 1/3"""

		profiles = Profiles()
		with self.assertRaises(KeyError) as ctx:
			profiles.setConfiguration("tests/files/test_invalid.xml")

		self.assertTrue('name' in str(ctx.exception))

	def test_03_invalid_xml(self):
		"""TEST03 - Loading invalid XML 2/3"""

		profiles = Profiles()
		with self.assertRaises(ProfilesError) as ctx:
			profiles.setConfiguration('tests/files/test_invalid2.xml')

		self.assertTrue('Unexpected tag in sourcelist' in str(ctx.exception))

	def test_04_invalid_xml(self):
		"""TEST04 - Loading invalid XML 3/3"""

		profiles = Profiles(())
		with self.assertRaises(AttributeError) as ctx:
			profiles.setConfiguration('tests/files/test_invalid3.xml')

		self.assertTrue('get_text' in str(ctx.exception))

	def test_05_search_profile(self):
		profiles = Profiles()
		profiles.setConfiguration("tests/files/test_valid.xml")
		profile = profiles.getProfile('/live/test')

		self.assertFalse(profile == None)
		self.assertEqual(profile['name'], 'test')

	def test_06_import_export_import(self):
		profiles = Profiles()
		profiles.setConfiguration('tests/files/test_valid.xml')
		profiles.exportXML('/tmp/exportTest.xml')
		old_json = json.loads(profiles.getJSONString())
		
		profiles.setConfiguration("/tmp/exportTest.xml")
		new_json = json.loads(profiles.getJSONString())

		self.assertEqual(json.dumps(old_json, sort_keys = True),
				json.dumps(new_json, sort_keys = True))

		os.remove('/tmp/exportTest.xml')

	def test_07_create_subprofile(self):
		profiles = Profiles()
		profiles.setConfiguration("tests/files/test_valid.xml")

		dummy = {
			"name": "test_changed",
			"path": "/live/test",
			"type": "normal",
			"channels": [
				{
					"name": "source1",
					"filter": "*",
					"sources": [ "ch1" ]
				}
			],
			"subprofiles": []
		}

		profiles.createSubprofile("/live", dummy)
		prf_json = json.loads(profiles.getJSONString())

		self.assertEqual(prf_json["live"]['subprofiles']["test_changed"]['name'], 'test_changed')

	def test_08_delete_subprofile(self):
		profiles = Profiles()
		profiles.setConfiguration('tests/files/test_valid.xml')

		profiles.delete('/live/pokus/New_Profile')

		self.assertEqual(profiles.getProfile('/live/pokus/New_Profile'), None)

	def test_09_delete_core(self):
		profiles = Profiles()
		profiles.setConfiguration('tests/files/test_valid.xml')

		profiles.delete('/live')

		self.assertEqual(profiles.getProfile('/live')['subprofiles'], {})

if __name__ == '__main__':
	unittest.main()
