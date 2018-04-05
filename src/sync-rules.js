const configLoader = require("./configLoader.js");

module.exports = function(program) {
    var config = configLoader.loadConfig(program);
    console.log("sync-rules not yet supported");
    console.log(config);
}