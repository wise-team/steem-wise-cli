#!/usr/bin/env node

import { Command } from "commander";

import { App } from "./app";
import { Log } from "./log";
import * as eastereggs from "./eastereggs";

Log.log().initialize(false, false);

const commander: Command = new Command();
const app: App = new App(commander, process.argv);

(async () => {
    try {
        const result = await app.run();
        console.log(result);
        console.log();
    }
    catch (error) {
        if (error.incorrect_command) {
            console.log("Incorrect command.");
            app.outputHelp();
        }
        else {
            Log.log().exception(Log.level.error, error);
            console.log();
            console.log(">  We apologize for this error. Maybe this wise sentence will improve your mood: " + eastereggs.wisdomQuote());
            process.exit(1);
        }
    }
})();

/**
 * Prayer:
 *  Gloria Patri, et Filio, et Spiritui Sancto, sicut erat in principio et nunc et semper et in saecula
 *  saeculorum. Amen. In te, Domine, speravi: non confundar in aeternum.
 */
