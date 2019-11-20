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

// Increase ping timeout to prevent premature disconnects:
// https://github.com/socketio/socket.io/issues/2769#issuecomment-490858780
var options = {
  pingTimeout: 30000,
  pingInterval: 25000,
};

var io = require('socket.io')(server, options);

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

app.use(function (req, res, next) {
  res.io = io;
  next();
});

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

io.on('connection', (socket) => {
  console.log('user connected');

  socket.on('disconnect', function () {
    console.log('user disconnected');
  });

  socket.on('crawl-url', function (data) {
    crawlUrl(data, socket, io);
  });
});

module.exports = {
  app: app,
  server: server,
};
