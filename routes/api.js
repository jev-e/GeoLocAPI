require('dotenv').config()
var express = require('express');
var router = express.Router();
var auth = require('../misc/auth');
cors = require('cors');
var poolConnection = require('../PoolConnection');


router.use(cors());

//perform header check on all requests
//router.use(function (req, res, next) {
//  if (!auth(req.header('token'))) {
//    res.status(403).end('You are not authorized')//
//  }
//  else {
//      next()
//   }
//})

router.get('/', function (req, res) {
    res.send("Api Page")
})

router.post('/upload', function (req, res) {
    var db = poolConnection.getDb();
    doc = {
        uid: req.body.uid,
        longitude: req.body.longitude,
        latitude: req.body.latitude
    }

    db
        .collection(process.env.MONGOCOLLECTION)
        .insertOne(doc, (err, result) => {
            if (err) {
                res.status(400).send("Error Uploading Coordinates");

            } else {
                res.status(200).send("Coordinates Uploaded");
            }
        });

})


module.exports = router;
