require('log-timestamp');

const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const server = require('http').Server(app);
const WebSocket = require('ws');
const standards = require('./routes/standards');

function heartbeat(ws) {
  ws.isAlive = true;
}

const wss = new WebSocket.Server({ server });
const crawlUrl = require('./crawlUrl');

const env = process.env.NODE_ENV || 'development';
app.locals.ENV = env;
app.locals.ENV_DEVELOPMENT = env === 'development';

app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(express.static(path.join(__dirname, 'public')));

if (app.locals.ENV === 'test') {
  app.use(express.static('routes/test/public'));
}

app.use('/standards', standards);

// / catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// / error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.send({
      message: err.message,
      error: err,
      title: 'error'
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    message: err.message,
    error: {},
    title: 'error'
  });
});

wss.on('connection', ws => {
  console.log('User connected.');
  ws.isAlive = true;

  ws.on('message', async message => {
    const decoded = JSON.parse(message);
    if (decoded.type === 'pong') {
      heartbeat(ws);
    } else if (decoded.type === 'crawl-url') {
      await crawlUrl(decoded.payload, ws);
    }
  });

  ws.on('close', ev => {
    console.log('User disconnected.', ev);
  });

  ws.on('error', ev => {
    console.log('WebSocket Errored', ev);
  });
});

setInterval(() => {
  wss.clients.forEach(ws => {
    if (ws.isAlive === false) {
      console.log('Terminating WebSocket...');
      return ws.terminate();
    }

    ws.isAlive = false;
    ws.send(
      JSON.stringify({
        type: 'ping',
        payload: {}
      })
    );
  });
}, 25000);

module.exports = {
  app,
  server,
  wss
};
