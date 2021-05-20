Drupal API
==========

API that translates the WebSocket API (located at ../server) into a REST-like API.
Provides rate-limiting at 5 simultaneous WebSocket connections.

Clients should periodically post any pending scans, and retry periodically in 5-60 minutes (however long a scan of a full page takes). If a scan is accepted, a 201 response with a scan token for every URL will be provided.

Once that's done, clients should store the scan tokens and periodically check on thte status.

Once the status is "Completed", a report can be retrieved (until the configured timeout period)

1. Architecture:

Drupal Client ---> Drupal API ---> WebSocket API

2. Provided endpoints

Provides endpoints for:
- Starting new scans, providing a set of URLs and scan settings
- Checking on the status of a scan using a given scan token
- Once a scan is completed, retrieve a json report that can be imported into the Accessibility Check Server Angular app
- Once a scan is completed, retrieve a json file that can be used to generate HTML reports

A Swagger installation documenting these endpoints is available at localhost:8000/docs by running `npm run dev`

3. Running instructions

- Run the WebSocket API at ../server (which runs on port 3000 of localhost by default)
- Ensure config.ts contains the correct config values
- Build the TypeScript files: `npm run build`
- Run the Node.js app: `node build/index.js`