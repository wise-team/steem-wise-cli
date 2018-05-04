#!/usr/bin/env node

import * as program from "commander";
import { SyncRules } from "./SyncRules";
import SyncVotes from "./SyncVotes";
import { Config, ConfigLoader } from "./Config";

/*
 * CLI setup
 */
let commandCorrect = false;

const version = require("../package.json").version;
program
    .name("smartvotes")
    .version(version, "-v, --version")
    .option("-c, --config-file [path]", "Use specific config file");

program
    .command("sync-rules [rules]")
    .description("Synchronize rules from config file to blockchain. You can pass path to a JSON file or pass JSON directly")
    .action(function(rules) {
        commandCorrect = true;

        ConfigLoader.loadConfig(program)
        .then(function(config: Config) { return SyncRules.doAction(config, rules); })
        .then(() => console.log(""))
        .catch(error => { console.error(error); process.exit(1); });
    });

program
    .command("sync-votes")
    .description("Send issued votes to blockchain")
    .action(function() {
        commandCorrect = true;
        console.log("Sync-all is not yet supported");
    });

program
    .command("sync-all")
    .description("sync-rules + sync-votes")
    .action(function() {
        commandCorrect = true;
        console.log("Sync-all is not yet supported");
    });

program
    .command("daemon")
    .description("sync-all in a loop")
    .action(function() {
        commandCorrect = true;
        console.log("daemon not yet supported");
    });

program.parse(process.argv);
if (!commandCorrect) {
    program.outputHelp();
}