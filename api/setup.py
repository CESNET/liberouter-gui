from setuptools import setup, find_packages

setup(
		name = 'liberouter_gui_api',
		version = '0.2.1-alpha',
		long_description = __doc__,
		packages = find_packages(),
		include_package_data = True,
		zip_safe = False,
		install_requires = [
			'Flask',
			'pymongo',
			'bcrypt'
			])
