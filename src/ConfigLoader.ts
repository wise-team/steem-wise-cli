import * as fs from "fs";
import * as program from "commander";

class ConfigLoader {
    static loadConfig(program: program.Command) {
        let config = require("../default.config.json");
        if (program.configFile) {
            if (fs.existsSync(program.configFile)) {
                Object.assign(config, require(program.configFile));
            }
            else {
                console.error("Config file " + program.configFile + " does not exist!");
                config = undefined;
            }
        }
        return config;
    }
}

export default ConfigLoader;