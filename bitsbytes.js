const process = require('process');

// Set up MongoDB 
require('dotenv').config();
const mongo = require('mongodb');
const url = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@bits-and-bytes.u1suo.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`;
const client = mongo.MongoClient(url, {useNewUrlParser: true, useUnifiedTopology: true});

const getLeaderboard = async function(callback) {
    client.connect().then(() => {
        var db = client.db("bits-and-bytes");
        var collection = db.collection("leaderboard");
        collection.find().toArray((err, result) => {
            if (err) console.err(err);
            return callback(result[0].teams);
        });
    });
};


module.exports = {getLeaderboard};
