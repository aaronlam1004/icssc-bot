const fs = require('fs');
const process = require('process');

var bitsbytes = require("./bitsbytes.json");
var ERROR_STRING = "USAGE: Update or load backup of Bits-and-Bytes database.\n  node bitsbytes.js backup [_id]\n  node bitsbytes.js [TEAM_NAME][NUM_OF_POINTS]"

// Set up MongoDB 
require('dotenv').config();
const mongo = require('mongodb');
const url = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@bits-and-bytes.u1suo.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`;
const client = mongo.MongoClient(url, {useNewUrlParser: true, useUnifiedTopology: true});

const {getLeaderboard} = require("./bitsbytes.js");

const args = process.argv.slice(2);
if (args.length == 2) {
  if (args[0] == "backup") {
    client.connect().then(() => {
      var db = client.db("bits-and-bytes");
      var collection = db.collection("leaderboard");
      var objId = new mongo.ObjectID(args[1]);

      var baseValues = {};
      baseValues["teams"] = bitsbytes;

      var newValues = {};
      newValues["$set"] = baseValues; 
      
      console.log("Setting leadeboard to one found in bitsbytes.json");
      console.log(newValues);
      collection.updateOne({_id: objId}, newValues, (err) => {
        if (err) console.error(err);
        console.log("Successfully loaded backup!");
        client.close();
      });
    });
  }
  else {
    client.connect().then(() => {
      var db = client.db("bits-and-bytes");
      var collection = db.collection("leaderboard");
      collection.find().toArray((err, res) => {

        if (err) console.err(err);
        var result = res[0].teams;

        if (Object.keys(result).includes(args[0]) && !isNaN(parseInt(args[1]))) {
          var updateValues = {};
          var newValues = {};
          var newQuery = JSON.parse(JSON.stringify(result));
          newQuery[args[0]] += parseInt(args[1]);
          newValues["teams"] = newQuery;
          updateValues["$set"] = newValues;

          
          var oldValues = {};
          oldValues["teams"] = result;

          console.log("Previous values:");
          console.log(oldValues);
          console.log("New values:");
          console.log(newValues);

          collection.updateOne(oldValues, updateValues, (err) => {
            if (err) console.error(err);
            client.close();
            console.log("Successfully updated db!");
          });
        }
        else {
          client.close();
          console.log("TEAM_NAME does not exist or invalid NUM_OF_POINTS.");
          console.log(ERROR_STRING);
        }
      });
    });
  }
}
else if (args.length == 0) {
  client.connect().then(() => {
    var db = client.db("bits-and-bytes");
    var collection = db.collection("leaderboard");
    collection.find().toArray((err, result) => {
      if (err) console.err(err);
      console.log(result[0]);
      client.close();
    });
  });
}
else {
  console.log("Not a valid command.");
  console.log(ERROR_STRING);
}
