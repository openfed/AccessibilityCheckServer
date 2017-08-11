var express = require('express');
var router = express.Router();

var pa11y = require('pa11y');

/* GET users listing. */
router.get('/', function(req, res) {
  console.log(req);
  res.send(pa11y.defaults.allowedStandards);
});

router.post('/', function(req, res) {
  console.log(req);
  res.send(req.body.url);
});

module.exports = router;
