require('dotenv').config()
var express = require('express');
var router = express.Router();
var poolConnection = require('../PoolConnection');
import axios, {AxiosError} from 'axios';

// webserver URL for geocoding
export const postcodesServerURL = "https://api.postcodes.io"

router.post('/getNearestPostcodes', function (req, res, next) {

    // get a list of the nearest postcodes (API request to postcodes.io)
    getNearestPostcodes(req.body.lat, req.body.long)
        .then((postcodesResponse) => {

            // send the postcodes back to the app as a JSON object
            res.status(200).send(postcodesResponse.nearestPostcodes);

        })
        .catch(err => {
            res.status(400).send("Error!");
        })
});

const getNearestPostcodes = async (lat, long) => {

    // embed the whole function body inside a Promise constructor, so should any error happen, it will be converted to a rejection
    return new Promise((resolve, reject) => {
        axios.get(postcodesServerURL + "/postcodes", {
            params: {
                lat: lat,
                lon: long,
            }
          }).then((response) => {
            // check response status
            if (response.status == 200) {

                var nearestPostcodes = [];

                for (var item in response.result) {

                    if (item.hasOwnProperty(postcode)) {
                        nearestPostcodes.push(item.postcode)
                    }
                }

                resolve({
                    nearestPostcodes: nearestPostcodes,
                });
            } else {
                reject(new Error("Response status code " + response.status ));
            }
        })
        .catch(err => {
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