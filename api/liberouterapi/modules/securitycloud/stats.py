#!/bin/python3

from liberouterapi import config
import json
import rrdtool
import sys
import logging
from .profiles import Profiles, ProfilesError

# from config
SINGLE_MACHINE = True if config.modules['scgui']['single_machine'] == "true" else False
SLAVE_HOSTNAMES = config.modules['scgui']['single_machine'].split(";")
IPFIXCOL_DATA = config.modules['scgui']['ipfixcol_data']

logging.basicConfig() # NOTE: This line not needed in lgui api
log = logging.getLogger(__name__)

class Stats():
	def __initStats(self):
		"""
		Intializes self.sums and self.rates as a 2D arrays with self.RRDVARS
		columns and self.channels + 1 rows. The extra row is for total count
		"""
		# Allocate 1D arrays
		size = len(self.channels) + 1
		self.sums = [0] * size
		self.rates = [0] * size
		# Allocate 2D arrays
		for i in range(0, size):
			self.sums[i] = [0] * self.RRDVARS;
			self.rates[i] = [0] * self.RRDVARS;

	def __init__(self, profile, bgn, end):
		"""
		Appart from obvious setting up of variables this
		also retrieves all channel names of a current profile.
		Then it executes logic for retrieving and computing statistics.
		"""
		# Constants
		self.RRDVARS = 15
		self.FETCH_MODE = 'AVERAGE'
		self.FETCH_MIN_STEP = 300
		self.EMPTY_RESULT = [(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)]

		# Variables
		self.profile = profile
		self.bgn = bgn
		self.end = end
		self.intervals = 1 # At least one interval to prevent division by zero
		self.interval = 1

		# Get channels from profile
		pmgr = Profiles()
		curr = pmgr.getProfile(profile)
		if curr is None:
			raise ProfilesError("Profile %s not found" % profile)

		self.channels = []
		for channel in curr["channels"]:
			self.channels.append(channel)

		self.__initStats()
		self.__work()

	def __work(self):
		"""
		Loads input rrds based on value of SINGLE_MACHINE boolean. After this,
		total counts are computed and then sums and rates are worked out. Sums 
		are multiplied by size of an interval and rates are divided by total
		number of intervals.
		"""
		if SINGLE_MACHINE:
			self.__processChannels('')
		else:
			for slave in SLAVE_HOSTNAMES:
				self.__processChannels('/' + slave)

		# Compute total counts (this also marks a row with total counts)
		t = len(self.channels)
		# for every channel
		for c in range (0, t):
			for v in range (0, self.RRDVARS):
				self.sums[t][v] += self.sums[c][v]
				self.rates[t][v] += self.rates[c][v]

		# Compute sums and rates (also include total field)
		for c in range(0, t + 1):
			for v in range(0, self.RRDVARS):
				self.sums[c][v] *= self.interval;
				self.rates[c][v] /= self.intervals;

	def __processChannels(self, slavename):
		"""
		Computes path to channels folder and processes all channels in there.
		Also tries to work out correct number of intervals (will be correct if
		files exist, unchanged if files do not exist).
		Both self.sums and self.rates should only add to their respective fields.
		At later point, self.sums will be multiplied with size of a interval and
		self.rates will be divided by number of intervals.
		"""
		for c in range(0, len(self.channels)):
			path = IPFIXCOL_DATA + slavename + self.profile + '/rrd/channels/' + self.channels[c]["name"] + ".rrd"
			stat = self.__getStat(path)

			# for every t timestamp
			for t in range(0, len(stat)):
				# for every v rrdvar
				for v in range(0, self.RRDVARS):
					if stat[t][v] is not None:
						self.sums[c][v] += stat[t][v]
						self.rates[c][v] += stat[t][v]

			if (self.intervals < len(stat)):
				self.intervals = len(stat)

	def __getStat(self, path):
		"""
		Tries to fetch statistics from a file at path with self.bgn/end as
		time window. If file is not found, EMPTY_RESULT is returned. Only raw
		data are returned by this method. Size of a interval or
		"""
		result = ()
		try:
			aux = rrdtool.fetch(path,
				self.FETCH_MODE,
				'-r', str(self.FETCH_MIN_STEP),
				'--start', str(self.bgn),
				'--end', str(self.end))
			self.interval = aux[0][2]
			result = aux[2]
		except rrdtool.ProgrammingError: # This should *not* happen
			log.error('This should never happen')
			sys.exit(1)
		except rrdtool.OperationalError: # File not found
			log.debug('File not found')
			result = self.EMPTY_RESULT
		finally:
			return result

	def getJSON(self):
		return json.dumps({"Sum": self.sums, "Rate": self.rates})

if __name__ == '__main__':
	# from url
	profile = '/live'
	bgn = 1486428900
	end = 1486432500

	stats = Stats(profile, bgn, end)
	print(stats.getJSON())