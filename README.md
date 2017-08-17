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

### Note
You might want start each process (database, backend, frontend) in separate screens instead of
in-background so you can debug them more easily.

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
First off, sandbox your api with virtualenv. In api folder run:
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
src/app and touch any app.component.* file. Compilation should now success. This will happen each
time you'll run ng serve command.

### Viewing
Open your browser at http://your_ip_here:4200

First time you'll try to log in, system will detect missing admin user, and you will be prompted to
create one.

## Creating production release

I'll assume you've managed to run the development version of the gui. Making production release is
quite different. You still have to run database process, but frontend part will be compiled into
bunch of html, css and js files, that will be served by some web server (like Apache). Backend part
will be run by web server as daemon through wsgi.

This guide assumes that your gui will have it's root in /var/www/html/lgui. Also this guide is
written for CentOS7 which misses some features of more advanced distros.

### Compiling frontend

With clean clone of this repo, go to www and execute commands:
```
$ npm install
$ ng build --prod --bh="/lgui/" --aot=false -w
```

First round of compilation should once again fail on AppModule, but wait for a while, it should try
to recompile itself. After a successful compilation, stop the process. There should be now directory
www/dist. Copy all of its contents to /var/www/html/lgui. Please note that --bh parameter determines
path to root of the gui from root of web server. Apache has its root at /var/www/html and thus path
to root of gui is /lgui/. Do not omit the final slash!

Make sure that within lgui/assets there is a config.json. At this point your web browser should be
able to load and display login screen of gui at http://localhost/lgui/.

### Serving backend

You need to install mod_wsgi for you web server to be able to make rest of this guide work. Since
you need mod_wsgi to work with Python3.4 and CentOS7 has not such version available for apache, do
the following:
```
$ yum install httpd-devel gcc
$ mod_wsgi-express module-config >/etc/httpd/conf.modules.d/00-wsgi.conf
$ systemctl restart httpd
```

With the proper wsgi module installed, you need to configure http.conf within /etc/httpd/conf.
README in api folder contains configuration for secure connections, following configuration is for
local use only since it is unsafe:
```
ErrorLog '/tmp/log.txt'
LogLevel info

<VirtualHost *:80>
	DocumentRoot "/var/www/html/"
	WSGIDaemonProcess libapi threads=5
	WSGIScriptAlias "/libapi" "/path/to/api/wsgi.py"
	WSGIPassAuthorization on

	<directory "/path/to/api">
		WSGIProcessGroup libapi
		WSGIApplicationGroup %{GLOBAL}
		WSGIScriptReloading On

		Options All
		AllowOverride All
		Require all granted
	</directory>
</VirtualHost>
```

Don't forget to set up proper paths within that configuration. Also make sure that this path is open
for reading for the apache user. In case of any errors, check /tmp/log.txt file for more info on the
matter. At this point, whole gui should work.

## Testing the REST API
You can run tests as follows:
```
$ python testrunner.py
```

The testrunner assumes that API is running on port 5555 and there is an admin account with username `admin` and password `admin`.

Stay tuned!
