![Liberouter Logo](http://dmon100.liberouter.org/img/lr_logo_2.png "Liberouter logo")
# Liberouter GUI

Unified GUI for our toolsets.

## Running development version

### Prerequisities
- python 3.4+
- python module virtualenv
- mongod
- npm 5.3+
- nodejs 8.1+
- angular-cli 1.3+

### Preparations
First off, start mongo database server daemon. Then in api rename config_sample.ini to config.ini.
Go to api/liberouterapi/modules/securitycloud and rename config-sample.ini to config.ini. Then go
to www/src/assets and rename config_sample.json to config.json. As a last thing edit www/proxy.json
and change:
```
"/libapi": {
    "target": "https://localhost/",
    "secure": false
},
```

to

```
"/libapi": {
    "target": "http://localhost:5555/",
    "secure": false,
    "pathRewrite": {"/libapi": ""}
},
```

### Running backend
First off, sandbox your api with virtualenv. In root of repo, run:
```
$ virtualenv venv
$ source venv/bin/activate
```

Now you can install python requirements:
```
$ cd api
$ pip3 install -r requirements.txt
```

At this point, just run following command from repo root:
```
$ python3 api
```

### Running frontend
Go to www. Run:
```
$ ng serve --host <your_ip_here> --proxy proxy.json
```

After compiling, it will fail with message regarding AppModule and NgModule. Keep it running. Go to
src/app and touch any app.component.* file. Compilation should now success.

### Viewing
Open your browser at http://your_ip_here:4200

First time you'll try to log in, system will detect missing admin user, and you will be prompted to
create one.

## Testing the REST API
You can run tests as follows:
```
$ python testrunner.py
```

The testrunner assumes that API is running on port 5555 and there is an admin account with username `admin` and password `admin`.

Stay tuned!
