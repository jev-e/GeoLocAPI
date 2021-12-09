require('dotenv').config()
var express = require('express');
var router = express.Router();
var auth = require('../misc/auth');
cors = require('cors');
var poolConnection = require('../PoolConnection');
var axios = require('axios');


const postCodesIo = "https://postcodes.io"





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

router.post('/saveLocation', function (req, res) {
    var db = poolConnection.getDb();
    doc = {
        userEmail: req.body.userEmail,
        longitude: req.body.longitude,
        latitude: req.body.latitude,
        creationDate: new Date()
    }

    db
        .collection(process.env.USERLOCATIONCOLLECTION)
        .insertOne(doc, (err, result) => {
            if (err) {
                res.status(400).send("Error Uploading Coordinates");
            } else {
                res.status(200).send("Coordinates Uploaded");
            }
        });

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

router.get("/mapview/:postCode", function (req, res) {
    var db = poolConnection.getDb();
    var toSend = [];

    userPostCode = req.params.postCode;
    areaCode = userPostCode.replace(/[0-9].*/, '').toUpperCase();

    axios.get(postCodesIo + "/postcodes/" + userPostCode + "/nearest?limit=20&radius=2000")
        .then(axiosRes => {
            let postCodesArr = axiosRes.data.result.map(code => code.postcode)
            let toFind = {
                'areaCode': {
                    $in: postCodesArr

                }
            }
            db.collection(areaCode)
                .find(toFind).toArray()
                .then(docs => {
                    toSend = docs.map(index => ({
                        "areaCode": index.areaCode,
                        "average": index.average,
                        "longitude": index.longitude,
                        "latitude": index.latitude,
                        "data": index.data
                    }))
                    console.log(toSend)
                    res.status(200).send(toSend);
                }

                )
                .catch(err => {
                    res.status(500).send(err)

                })

        }
        )
        .catch(err => {
            res.status(404).send("No Postcodes Found")
        })

})

router.get("/mapview/outcode/:outCode", function (req, res) {
    var db = poolConnection.getDb();
    userOutcode = req.params.outCode;
    areaCode = userOutcode.replace(/[0-9].*/, '').toUpperCase();


    axios.get(postCodesIo + "/outcodes/" + userOutcode + "/nearest")
        .then(axiosRes => {
            let outCodesArr = axiosRes.data.result.map(code => code.outcode)
            let toFind = {
                'areaCode': {
                    $in: outCodesArr

                }
            }
            db.collection(areaCode)
                .find(toFind).toArray()
                .then(docs => {
                    toSend = docs.map(index => ({
                        "areaCode": index.areaCode,
                        "average": index.average,
                        "longitude": index.longitude,
                        "latitude": index.latitude
                    }))
                    console.log(toSend)
                    res.status(200).send(toSend);
                }

                )
                .catch(err => {
                    res.status(500).send(err)

                })

        }
        )
        .catch(err => {
            res.status(404).send("No Postcodes Found")
        })


})

router.get("/mapview/unit/:postCode", function (req, res) {
    var db = poolConnection.getDb();
    userPostCode = req.params.postCode;
    areaCode = userPostCode.replace(/[0-9].*/, '').toUpperCase();
    toFind = {
        "level": "unit"
    }

    db.collection(areaCode)
        .find(toFind).toArray()
        .then(docs => {
            toSend = docs.map(index => ({
                "areaCode": index.areaCode,
                "average": index.average,
                "longitude": index.longitude,
                "latitude": index.latitude,
            }))
            console.log(toSend)
            res.status(200).send(toSend);
        }

        )
        .catch(err => {
            res.status(500).send(err)

        })



        .catch(err => {
            res.status(404).send("No Postcodes Found")
        })

})

router.get("/mapview/unit/district/:postCode", function (req, res) {
    var db = poolConnection.getDb();
    userPostCode = req.params.postCode;
    areaCode = userPostCode.replace(/[0-9].*/, '').toUpperCase();
    let expression = "^" + userPostCode.replace(/[" "].*/, "").toUpperCase() + " ";
    console.log(expression)
    toFind = {
        "areaCode": { $regex: expression, $options: "i" },
        "level": "unit"
    }

    db.collection(areaCode)
        .find(toFind).toArray()
        .then(docs => {

            toSend = docs.map(index => ({
                "areaCode": index.areaCode,
                "average": index.average,
                "longitude": index.longitude,
                "latitude": index.latitude,
            }))
            console.log(toSend)
            res.status(200).send(toSend);
        }

        )
        .catch(err => {
            res.status(500).send(err)

        })



        .catch(err => {
            res.status(404).send("No Postcodes Found")
        })

})

module.exports = router;
