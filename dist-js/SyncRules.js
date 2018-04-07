"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ConfigLoader_1 = require("./ConfigLoader");
class SyncRules {
    exec(program) {
        const config = ConfigLoader_1.default.loadConfig(program);
        console.log("sync-rules not yet supported");
        console.log(config);
    }
}
exports.default = SyncRules;
//# sourceMappingURL=SyncRules.js.map