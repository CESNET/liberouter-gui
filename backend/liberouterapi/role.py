from enum import IntEnum

class Role(IntEnum):
    undefined = -1
    admin = 0
    user = 10
    guest = 255

    @classmethod
    def has_role(self, role):
        if isinstance(role, int):
            return (any(role == item.value for item in self))
        elif isinstance(role, str):
            return (any(role == item.name for item in self))
