# Liberouter GUI web interface

Web interface for Liberouter GUI. Built using webpack.

## Development server
Run `ng serve --proxy-config proxy.json` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive/pipe/service/class/module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
Before running the tests make sure you are serving the app via `ng serve`.

## Building production Liberouter GUI
Because of some weird bug in Angular CLI or TypeScript one has to build the production version of Liberouter GUI like this:

1. run `ng build --prod --bh="/liberouter-gui/www/dist/" --aot=false -w` This will give you an error `ERROR in AppModule is not an NgModule`
2. Trigger the watch routine of Angular CLI (i.e. open and save some file inside the src folder).
3. Build finishes sucessfully.
