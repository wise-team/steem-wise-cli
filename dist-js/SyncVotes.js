"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ConfigLoader_1 = require("./ConfigLoader");
class SyncVotes {
    exec(program) {
        const config = ConfigLoader_1.default.loadConfig(program);
        console.log("sync-votes not yet supported");
        console.log(config);
    }
}
exports.default = SyncVotes;
//# sourceMappingURL=SyncVotes.js.map