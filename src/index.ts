#!/usr/bin/env node

const program = require("commander");
const syncRules = require("./sync-rules.js");
const syncVotes = require("./sync-votes.js");

/*
 * CLI setup
 */
let commandCorrect = false;
//console.log(program);

var version = require("../package.json").version;
program
    .name("smartvotes")
    .version(version, "-v, --version")
    .option("-c, --config-file [path]", "Use specific config file");

program
    .command("sync-rules")
    .description("Synchronize rules from config file to blockchain")
    .action(function(){
        commandCorrect = true;
        syncRules(program);
    });

program
    .command("sync-votes")
    .description("Send issued votes to blockchain")
    .action(function(){
        commandCorrect = true;
        syncVotes(program);
    });

program
    .command("sync-all")
    .description("sync-rules + sync-votes")
    .action(function(){
        commandCorrect = true;
        syncRules(program);
        syncVotes(program);
    });

program
    .command("daemon")
    .description("sync-all in a loop")
    .action(function(){
        commandCorrect = true;
        console.log("daemon not yet supported");
    });

program.parse(process.argv);
if(!commandCorrect) {
    program.outputHelp();
}