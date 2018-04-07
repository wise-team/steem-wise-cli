"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
class ConfigLoader {
    static loadConfig(program) {
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
exports.default = ConfigLoader;
//# sourceMappingURL=ConfigLoader.js.map