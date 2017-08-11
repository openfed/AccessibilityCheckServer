# BOSA Accessiblity Check Server

Tested with Node.js 6. Built using angular CLI v1.2.1.

To install dependencies, run `npm install` in the root directory, then run `npm install` in the `server` directory as well.

## Directory structure

- See `server/` for the Node.js-based server files.
- See `src/` for the Angular-based front-end.

## Relevant technologies used

- Express.js for the back-end server.
- Socket.io for real-time communication.
- Angular 4.x as a front-end framework.
- [Angular Material](https://material.angular.io/) for Material Design components.
- [Pa11y](https://github.com/pa11y/pa11y) (which uses HTML_CodeSniffer and PhantomJS) for the accessibility sniffs.
- [Node-simplecrawler](https://github.com/cgiffard/node-simplecrawler) for crawling.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
Before running the tests make sure you are serving the app via `ng serve`.

## Running a server on a remote machine

- Update `server/config.js` to contain the URL of the HTMLCS library (used by the frontend for translating message codes received by the backend to the relevant human-readable message).
- Update `src/app/config.ts` to contain the URL of the backend server.
- Run `ng serve --public HOSTNAME --host PUBLICIP` to serve up the front-end.
- Navigate to the server directory and run `node bin/www` to start the back-end server.

