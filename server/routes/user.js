var express = require('express');
var router = express.Router();
var Crawler = require("simplecrawler");


/* GET users listing. */
router.get('/', function(req, res) {
  console.log(req);
  res.io.emit("socketToMe", "users");
  res.send('respond with a resource');
});

router.post('/', function(req, res) {
  console.log(req);
  res.send(req.body.url);
});

module.exports = router;
