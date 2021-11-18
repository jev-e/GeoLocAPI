require('dotenv').config()
const { MongoClient } = require("mongodb");

const mongoUri = "mongodb+srv://"
    + process.env.MONGOUSER +
    ":"
    + process.env.MONGOPASS +
    "@"
    + process.env.MONGOCLUSTER +
    ".vwedl.mongodb.net/"
    + process.env.MONGODB +
    "?retryWrites=true&w=majority";

let _db;

module.exports = {
    dbCon: () => {
        const client = new MongoClient(mongoUri)
        client.connect(err => {
            if (err) throw err;

            _db = client.db(process.env.MONGODB);
            console.log("Connected to " + process.env.MONGODB)

        })

    },
    getDb: () =>
        _db

}






