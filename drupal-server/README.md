Drupal API
==========

API that translates the WebSocket API (located at ../server) into a REST-like API.

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
- Run the Node.js app: `node 
Het API contract http://134.209.204.80:8000/docs/ (user: admin, pw: admin) zou het redelijk moeten illustreren. Voor de duidelijkheid, het is een Node.js API waar de Drupal installatie mee praat.

Het zet een WebSocket connectie op en vertaalt de output van de WebSocket API naar iets wat voor het HTML rapport en voor de angular import gebruikt kan worden en rapporteert de huidige status van de crawl. Sommige code uit de Angular client kom hergebruikt worden in de Drupal API. Verder doet het ook iets aan rate-limiting (max 5 simultaneous WebSocket connecties, en in de toekomst max 5 per WebSocket API?)

We hadden een goed werkende en "battle-tested" interface met de voormalige WebSocket API dus hergebruiken een nieuwe instantie van deze voor de nieuwe set up.

Direct via een websocket verbinden naar de WebSocket API vanuit de Drupal installatie is moeilijk (of wellicht onmogelijk).