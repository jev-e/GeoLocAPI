require('dotenv').config()
var express = require('express');
var router = express.Router();
var auth = require('../misc/auth');
const { MongoClient } = require('mongodb');
cors = require('cors');
const mongouri = "mongodb+srv://"
  + process.env.MONGOUSER +
  ":"
  + process.env.MONGOPASS +
  "@"
  + process.env.MONGOCLUSTER +
  ".vwedl.mongodb.net/"
  + process.env.MONGODB +
  "?retryWrites=true&w=majority";
const mongoclient = new MongoClient(mongouri);


router.use(cors());

//perform header check on all requests
router.use(function (req, res, next) {
  if (!auth(req.header('token'))) {
    res.status(403).end('You are not authorized')
  }
  else {
    next()
  }
})

router.post('/api/upload/', function (req, res) {
  mongoclient.connect();
  doc = {
    uid: req.body.uid,
    longitude: req.body.longitude,
    latitude: req.body.latitude
  }
  const insert = mongoclient.db("GeoLoc").collection("Coordinates").insertOne(doc);
  console.log(`New listing created with the following id: ${insert.insertedId}`);

  console.log(req.body);
  res.status(200).send({ message: "Document Inserted" });

})

module.exports = router;
