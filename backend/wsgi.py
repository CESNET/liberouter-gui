import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

activate_this = os.path.join(os.path.dirname(__file__), 'venv/bin/activate_this.py')
with open(activate_this) as file_:
    exec(file_.read(), dict(__file__=activate_this))

import sys
print(sys.version)

from liberouterapi import app as application
