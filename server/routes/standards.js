var express = require('express');
var router = express.Router();

var pa11y = require('pa11y');

router.get('/', function (req, res) {
  res.send(pa11y.defaults.allowedStandards);
});

module.exports = router;
