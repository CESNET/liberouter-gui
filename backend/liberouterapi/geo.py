import geoip2.database
import geoip2.errors
import sys

class GeoIP:
    reader = None
    response = dict()

    def __init__(self, dbPath):
        self.reader = geoip2.database.Reader(dbPath)

    def find(self, ip):
        try:
            self.response = self.reader.city(ip)
        except geoip2.errors.AddressNotFoundError:
            return ({'error': 'Record not found'})

        res = {
            "ip" : response.traits.ip_address,
            "country_code" : response.country.iso_code,
            "region_name" : response.country.name,
            "city" : response.city.name,
            "time_zone" : response.location.time_zone,
            "latitude" : response.location.latitude,
            "longitude" : response.location.longitude
        }

        return res
    def __del__(self):
        self.reader.close()
        

# reader = geoip2.database.Reader('/data/geoIP/GeoLite2-lib/GeoLite2-City.mmdb')

