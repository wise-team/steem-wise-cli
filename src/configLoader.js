const fs = require('fs');

exports.loadConfig = function(program) {
    var config = require('../default.config.json');
    if(program.configFile) {
        if(fs.existsSync(program.configFile)) {
            Object.assign(config, require(program.configFile));
        }
        else {
            console.error("Config file "+program.configFile+" does not exist!");
            config = null;
        }
    }
    return config;
};