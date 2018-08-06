import * as program from "commander";
import * as winston from "winston";

import { Log as SteemWiseCoreLog } from "steem-wise-core";

export class ConfigureLogger {
    public static configureLogger(program: program.Command) {

        if (program.debug) {
            console.log("Setting steem-wise-core log level to \"debug\"");
            SteemWiseCoreLog.setLevel("debug");
        }
        else if (program.verbose) {
            console.log("Setting steem-wise-core log level to \"info\"");
            SteemWiseCoreLog.setLevel("info");
        }

        // const logger: winston.Logger = SteemWiseCoreLog.getLogger();
    }
}