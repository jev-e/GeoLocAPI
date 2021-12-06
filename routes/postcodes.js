require('dotenv').config()
var express = require('express');
var router = express.Router();
var poolConnection = require('../PoolConnection');
var axios = require('axios');

// webserver URL for geocoding
const postcodesServerURL = "https://api.postcodes.io"

router.get('/', function (req, res, next) {
    res.send('Postcodes Page');
  });

router.get('/getNearestPostcodes', function (req, res, next) {

    // console.log(req.query)

    // get a list of the nearest postcodes (API request to postcodes.io)
    getNearestPostcodes(req.query.lat, req.query.long, req.query.limit)
        .then((postcodesResponse) => {

            // send the postcodes back to the app as a JSON object
            res.status(200).send(postcodesResponse.nearestPostcodes);

        })
        .catch(err => {
            res.status(400).send(err);
        })
});

const getNearestPostcodes = async (lat, long, limit) => {

    // embed the whole function body inside a Promise constructor, so should any error happen, it will be converted to a rejection
    return new Promise((resolve, reject) => {
        axios.get(postcodesServerURL + `/postcodes?lon=${long}&lat=${lat}&limit=${limit}`)
        .then((response) => {
            // check response status
            if (response.status == 200 | response.status == 304) {

                var nearestPostcodes = [];

                for(var i = 0; i < response.data.result.length; i++) {
                    var obj = response.data.result[i];
                
                    nearestPostcodes.push(obj.postcode);
                }
                resolve({
                    nearestPostcodes: nearestPostcodes,
                });
            } else {
                reject(new Error("Response status code " + response.status ));
            }
        })
        .catch(err => {
            console.log(err);
            if (err.response) {
                reject(new Error("Error " + err.response.status ));
            } else if (err.request) {
                // client never received a response, or request never left
                reject(new Error("Client never received a response, or request never left."));
            } else {
                // anything else
                reject(new Error());
            }
        })
    })
};

module.exports = router;