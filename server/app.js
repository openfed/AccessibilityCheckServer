require('log-timestamp');

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var exphbs  = require('express-handlebars');
var cors = require('cors');

var standards = require('./routes/standards');

var app = express();
var server = require('http').Server(app);
var WebSocket = require('ws');

function noop() {}

function heartbeat() {
  this.isAlive = true;
}

var wss = new WebSocket.Server({ server: server });
var crawlUrl = require('./crawlUrl');

var env = process.env.NODE_ENV || 'development';
app.locals.ENV = env;
app.locals.ENV_DEVELOPMENT = env == 'development';

app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true,
}));
app.use(express.static(path.join(__dirname, 'public')));

if (app.locals.ENV == 'test') {
  app.use(express.static('routes/test/public'));
}

app.use('/standards', standards);

/// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.send({
      message: err.message,
      error: err,
      title: 'error',
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.send({
    message: err.message,
    error: {},
    title: 'error',
  });
});

wss.on('connection', (ws) => {
  console.log('user connected');
  ws.isAlive = true;
  ws.on('pong', heartbeat);

  ws.on('message', (message) => {
    const decoded = JSON.parse(message);
    if (decoded.type === 'crawl-url') {
      crawlUrl(decoded.payload, ws);
    }
  });

  ws.on('close', ev => {
    console.log('user disconnected', ev);
  });

  ws.on('error', ev => {
    console.log('WS Errored', ev);
  });
});

const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) return ws.terminate();

    ws.isAlive = false;
  });
}, 20000);

module.exports = {
  app: app,
  server: server,
};
