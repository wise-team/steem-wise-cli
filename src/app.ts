#!/usr/bin/env node

import * as program from "commander";
import SyncRules from "./SyncRules";
import SyncVotes from "./SyncVotes";

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
    .command("sync-rules")
    .description("Synchronize rules from config file to blockchain")
    .action(function() {
        commandCorrect = true;
        new SyncRules().exec(program);
    });

program
    .command("sync-votes")
    .description("Send issued votes to blockchain")
    .action(function() {
        commandCorrect = true;
        new SyncVotes().exec(program);
    });

program
    .command("sync-all")
    .description("sync-rules + sync-votes")
    .action(function() {
        commandCorrect = true;
        new SyncRules().exec(program);
        new SyncVotes().exec(program);
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