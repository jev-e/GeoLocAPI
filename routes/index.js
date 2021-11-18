require('dotenv').config()
var express = require('express');
var router = express.Router();
var auth = require('../misc/auth');
cors = require('cors');


  //router.use(cors());

  //perform header check on all requests
  //router.use(function (req, res, next) {
  // if (!auth(req.header('token'))) {
  //   res.status(403).end('You are not authorized')
  // }
  // else {
  //   next()
  // }
  //})


  router.get('/', function(req, res, next) {
    res.send('Index Page');
  });
  




  module.exports = router;
