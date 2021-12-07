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

    axios.get(postCodesIo + "/postcodes/" + userPostCode + "/nearest")
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


module.exports = router;
