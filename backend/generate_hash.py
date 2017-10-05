import bcrypt
import base64
from bson import Binary
import sys

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Missing required argument <password>", file=sys.stderr)
        sys.exit(1)

    hash_pw = bcrypt.hashpw(sys.argv[1].encode('utf8'), bcrypt.gensalt())

    b64 = base64.b64encode(hash_pw)
    bi = Binary(b64)

    print(bi.decode('utf8'), end='')

