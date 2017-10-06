/**
 * @author Jay Gruber
 * @author Adam Gomes
 */
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'WorkOrder' });
});

router.get('/manifest.appcache', function(req, res, next) {
  res.setHeader("Content-Type", "text/cache-manifest");
  res.sendFile('manifest.appcache');
});

module.exports = router;
