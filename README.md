# BOSA Accessibility Check Server

To install dependencies, run `npm install` in the root directory, then run `npm install` in the `server` directory as well.

The pa11y HTMLCS test runner has been patched (using patch-package) to use the HTMLCS.js located in `src/assets/HTMLCS.js` instead.

## Directory structure

- See `drupal-server/` (1) for the Node.js-based Drupal server files.
- See `server/` (2) for the Node.js-based Accessibility Check WebSocket server files.
- See `src/` (3) for the Angular-based front-end.

The WebSocket server at `server/` can be consumed either from the Angular front-end at `src/` or from the Drupal server at `drupal-server/`, depending on your use case (so either 1+2, or 2+3).

## Technologies

- Express.js for the back-end servers.
- WebSockets for real-time communication.
- Angular as a front-end framework.
- [Angular Material](https://material.angular.io/) for Material Design components.
- [Pa11y](https://github.com/pa11y/pa11y) (which uses HTML_CodeSniffer and PhantomJS) for the accessibility sniffs.
- [Node-simplecrawler](https://github.com/cgiffard/node-simplecrawler) for crawling.

## Development server

- Navigate to the server directory and run `node bin/www` to start the back-end server.
- Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build

Run `npm run build-prod` to build the project. The build artifacts will be stored in the `dist/` directory. 
Run `npm run build-readonlyprod` to build a read-only build (without the crawler).

## Running unit tests

- Make sure the back-end server is running prior to running the tests (see instructions under "Development server")
- Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).
- Run `npm test` in `server/` to execute the server unit tests.

## Running end-to-end tests

Run `ng e2e --serve=false` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
Before running the tests make sure you are serving the app via `ng serve`.

## Running a server on a remote machine

- Update `src/app/config.ts` to contain the URL of the backend server.
- Run `ng serve --public HOSTNAME --host PUBLICIP` to serve up the front-end.
- Navigate to the server directory and run `node bin/www` to start the back-end server.
