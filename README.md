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

## Developing new module

### Frontend minimal example

Creating new module is a pretty straightforward process. All you need is to create new folder
within www/src/app/modules, create its module.ts file, register this module in www/src/app/modules.ts
and finally generate component files for that module. So let's get to it. For the needs of this
guide, our example module will be called Example.

#### Creating module file

This is basically a copypaste of following code:
```
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule} from '@angular/router';
import { FormsModule } from '@angular/forms';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AuthGuard } from 'app/utils/auth.guard';
import { SafePipe, SafePipeModule } from 'app/utils/safe.pipe';

import { ExampleComponent } from './example.component';

const routes: Routes = [{
    path: 'example',
    component: ExampleComponent,
    canActivate: [AuthGuard],
    data: {
        role: 10,
        name: 'Example',
        description: 'dsc',
        icon: 'fa-internet-explorer', // Browse http://fontawesome.io/icons/ for icons
    },
    children: []
}]

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SafePipeModule,
        RouterModule.forChild(routes),
        NgbModule,
    ],
    declarations: [
        ExampleComponent
    ],
    providers: [
        SafePipe
    ]
})
```

Save this as www/src/app/modules/example/example.module.ts

All you need to do within this file is edit the routes variable. Path will specify url used to access
your module within gui, name and description speaks for itself, it is what you see on the main screen.
Icon is whatever image you want for your module, search Font Awesome for appropriate icon.

Last thing you need to do are all lines containing ExampleComponent. ExampleComponent is an entry
point of your module, it contains core html, core styles and scripts. We'll create it in a next step.
For now, if your module is called whatever else than example, change ExampleComponent to
WhateverYouWantComponent, just don't forget the camel case notation.

#### Creating core files

In your shell, navigate to www/src/app/modules. Enter following command:
```
$ ng g component example
```

If you want longer name for your module, separate each word with dash. Camel case mentioned earlier
still applies, though. Files will be named whatever-you-want.* and Typescript entities will be
WhateverYouWant*.

#### Registering component

The last thing is quite easy. Just edit www/src/app/modules.ts and add:
```
1. src/app/modules.ts
import { MyModule } from './modules/example/example.module';

export const modules: Array<Object> = [
    ...,
    MyModule
]
```

Now I recommend to restart whole ng serve process and wait until it finishes. Afterwards, if you
boot up the gui in the browser, you should see new card with name Example and new entry in the
sidebar that allows you to access your module.

If you want to create subcomponents within your module, just go to www/src/app/modules/examples and
enter command:
```
$ ng g component sub-example
```

This will automatically register everything that needs to be registered and you can start coding
right away.

### Creating backend module

So far we've created necessary files for face of our module. We also need a data provider to satisfy
model-view-controller design pattern. This will require us to register some url paths on the backend,
make them return some data and also some service on frontend side that will request and acquire this
data.

#### The real backend part

Luckily for us, backend already contains an example module created for us, so let's just break it
down to understand, what it does. First of all we'll look on \_\_init\_\_.py file:
```
from liberouterapi import app
from ..module import Module

module_bp = Module('module', __name__, url_prefix = '/module', no_version=True)

from .base import *

module_bp.add_url_rule('/', view_func = hello_world, methods=['GET'])
module_bp.add_url_rule('/protected', view_func = protected_hello, methods=['GET'])
```

Blueprint is an internal Flask stuff, all you have to do is to name it and give it some url prefix.
Afterwards, you import everything from base.py, in other words you'll import references to all methods
that will be used as responses to requests.

As a last step, you'll register all routes that should serve data to your requests. In our example, 
first route is simply module/ which will trigger hello_world() from base.py and return it's output
as result. Second route goes to module/protected and executes protected_hello() from base.py which,
as we'll see, is password protected. You can use any valid HTTP method for accessing any route, but
at most times it is good idea to have a separate function for each method you'll need.

Let's have a look at base.py:
```
from liberouterapi import auth

def hello_world():
    return("Hello from the module!")

@auth.required()
def protected_hello():
    return("Protected hello")
```

Only interesting thing here is auth decorator. It allows you to restrict access to some routes to
four levels: anyone (no decorator), logged users (even guests, decorator with empty arguments),
regular users and administrator. If you want the latter two, import role from liberouterapi and
pass role.Role.user or role.Role.admin as argument of required method.

Add following method at the end of the base.py:
```
import json

def example_method():
    return json.dumps({'data': 'yeey, some data! '})
```

And following method to \_\_init\_\_.py:
```
module_bp.add_url_rule('/example', view_func = example_method, methods=['GET'])
```

We've just created a new method, that returns some JSON data and registered a blueprint method that
will serve this data. So let's code a frontend service to get to it.

#### Frontend service

Once again, there will be some copypasting will little edits:
```
import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response, URLSearchParams  } from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ExampleService {
    constructor (private http: Http) {
    }

    ex() {
        return this.http.get('/module/example').map(
            (response: Response) => {
                return response.json();
            }).catch(this.handleError);
    }

    private handleError(err: Response | any) {
        return Promise.reject(err);
    }
}
```

Save this as example.service.ts within www/src/app/modules/example.

Now edit the example.component.ts so it looks like this:
```
import { Component, OnInit } from '@angular/core';

import { ExampleService } from './example.service';

@Component({
    selector: 'example',
    templateUrl: './example.component.html',
    styleUrls: ['./example.component.scss'],
    providers : [ExampleService]
})
export class ExampleComponent implements OnInit {
    data: string = null;
    error = null;
    
    constructor(private api: ExampleService) { }

    ngOnInit() {
        this.api.ex().subscribe(
            (data: Object) => this.processData(data),
            (error: Object) => this.processError(error)
        );
    }
    
    processData(data: any) {
        this.data = data['data'];
    }

    processError(error: any) {
        if (error['status'] >= 404) {
            this.error = error;
        }

        console.error('Error when retrieving data:');
        console.error(error);
    }
}
```

Do not forget to register the service as the provider of Component! As you can see, the service is
basically a method that sends HTTP request and based on the nature of the response, it uses callback
to data processing method or if there was an error, it uses callback to error processing method.

Finally, edit example.component.html so it can display our data:
```
<div>
    <div *ngIf="data != null">
        {{ data }}
    </div>
</div>
```

Restart backend and wait for frontend to recompile itself. Out example module should now say:
'yeey, some data!'.

This is all for this guide. Look at source codes of other modules if you're stuck.

## Testing the REST API

You can run tests as follows:
```
$ python testrunner.py
```

The testrunner assumes that API is running on port 5555 and there is an admin account with username `admin` and password `admin`.

Stay tuned!
