#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const program = require("commander");
const SyncRules_1 = require("./SyncRules");
const SyncVotes_1 = require("./SyncVotes");
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
    .action(function () {
    commandCorrect = true;
    new SyncRules_1.default().exec(program);
});
program
    .command("sync-votes")
    .description("Send issued votes to blockchain")
    .action(function () {
    commandCorrect = true;
    new SyncVotes_1.default().exec(program);
});
program
    .command("sync-all")
    .description("sync-rules + sync-votes")
    .action(function () {
    commandCorrect = true;
    new SyncRules_1.default().exec(program);
    new SyncVotes_1.default().exec(program);
});
program
    .command("daemon")
    .description("sync-all in a loop")
    .action(function () {
    commandCorrect = true;
    console.log("daemon not yet supported");
});
program.parse(process.argv);
if (!commandCorrect) {
    program.outputHelp();
}
//# sourceMappingURL=app.js.map