#!/usr/bin/env node

import * as program from "commander";

import { Config, ConfigLoader } from "./Config";
import { SyncRulesAction } from "./SyncRulesAction";
import { SendVoteorderAction } from "./SendVoteorder";
import { DaemonAction } from "./DaemonAction";

/*
 * CLI setup
 */
let commandCorrect = false;

const version = require("../package.json").version;
program
    .name("wise")
    .version(version, "-v, --version")
    .option("-c, --config-file [path]", "Use specific config file");

program
    .command("send-voteorder [voteorder]")
    .description("Sends a voteorder. You can pass path to a JSON file or pass JSON directly")
    .action(function(voteorder) {
        commandCorrect = true;

        ConfigLoader.loadConfig(program)
        .then(function(config: Config) { return SendVoteorderAction.doAction(config, voteorder); })
        .then(() => console.log(""))
        .catch(error => { console.error(error); process.exit(1); });
    });

program
    .command("sync-rules [rules]")
    .description("Synchronize rules from config file to blockchain. You can pass path to a JSON file or pass JSON directly")
    .action(function(rules) {
        commandCorrect = true;

        ConfigLoader.loadConfig(program)
        .then(function(config: Config) { return SyncRulesAction.doAction(config, rules); })
        .then(() => console.log(""))
        .catch(error => { console.error(error); process.exit(1); });
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