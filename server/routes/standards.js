const express = require('express');

const router = express.Router();

const pa11y = require('pa11y');

router.get('/', (req, res) => {
  res.send(pa11y.allowedStandards);
});

module.exports = router;
