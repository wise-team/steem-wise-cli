const configLoader = require("./configLoader.js");

module.exports = function(program) {
    var config = configLoader.loadConfig(program);
    console.log("sync-votes not yet supported");
    console.log(config);
}