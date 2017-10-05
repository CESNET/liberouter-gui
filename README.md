[![Build Status](https://travis-ci.org/CESNET/liberouter-gui.svg?branch=master)](https://travis-ci.org/CESNET/liberouter-gui)
![Liberouter Logo](http://dmon100.liberouter.org/img/lr_logo_2.png "Liberouter logo")
# Liberouter GUI

Wrapper for our applications. Currently preparing for Nemea Dashboard and SecurityCloud GUI.

The wrapper encapsulates all modules visually and logically. On the backend it takes care of user and session management and authorization.

# Running the wrapper
In order to run the REST API you need working MongoDB database, python3 and dependencies in requirements.txt installed.

# Testing the REST API
You can run tests as follows:
```
$ python testrunner.py
```

The testrunner assumes that API is running on port 5555 and there is an admin account with username `admin` and password `admin`.

Stay tuned!
