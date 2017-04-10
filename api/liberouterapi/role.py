from enum import IntEnum

class Role(IntEnum):
	undefined = -1
	admin = 0
	user = 10
	guest = 255
