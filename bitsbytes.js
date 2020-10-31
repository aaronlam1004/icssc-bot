const process = require('process');
const fs = require('fs');

var bitsbytes = require("./bitsbytes.json");
const args = process.argv.slice(2);

if (args.length != 2) {
  console.log("ERROR: Cannot update since TEAM_NAME or NUM_OF_POINTS not given.");
  console.log("   USAGE: node bitsbytes.js TEAM_NAME NUM_OF_POINTS");
}
else if (!Object.keys(bitsbytes).includes(args[0])){
  console.log("ERROR: Cannot find TEAM_NAME: " + args[0]);
  console.log("   USAGE: node bitsbytes.js TEAM_NAME NUM_OF_POINTS");
}
else if (isNaN(parseInt(args[1]))) {
  console.log("ERROR: Invalid NUM_OF_POINTS");
  console.log("   USAGE: node bitsbytes.js TEAM_NAME NUM_OF_POINTS");
}
else {
  bitsbytes[args[0]] += parseInt(args[1]);
  fs.writeFileSync("bitsbytes.json", JSON.stringify(bitsbytes, null, Object.keys(bitsbytes).length + 3));
}
