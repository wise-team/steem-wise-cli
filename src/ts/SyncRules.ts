import * as program from "commander";

import ConfigLoader from "./ConfigLoader";

class SyncRules {
    public static syncRules(program: program.Command) {
        const config = ConfigLoader.loadConfig(program);
        console.log("sync-rules not yet supported");
        console.log(config);
    }
}

export default SyncRules;