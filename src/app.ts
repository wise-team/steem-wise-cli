#!/usr/bin/env node

import * as program from "commander";
import * as Promise from "bluebird";

import { Config, ConfigLoader } from "./config/Config";
import { SyncRulesAction } from "./actions/SyncRulesAction";
import { SendVoteorderAction } from "./actions/SendVoteorderAction";
import { DaemonAction } from "./actions/DaemonAction";
import { InitAction } from "./actions/InitAction";
import { Log } from "./log"; const log = Log.getLogger();

/**
 * Action hooks
 */
let commandCorrect = false;
const prepareAction = (program: program.Command): Promise<Config> => {
    Log.configureLoggers(program);
    return ConfigLoader.loadConfig(program);
};
const actionDone = (msg: String) => {
    commandCorrect = true;
    console.log(msg);
    console.log();
};
const actionError = (error: Error) => {
    commandCorrect = true;
    Log.exception(error);
    process.exit(1);
};


/*
 * CLI setup
 */
const version = require("../package.json").version;
program
    .name("wise")
    .version(version, "--version")
    .option("-v, --verbose", "Verbose mode (log level: INFO)")
    .option("--debug", "Debug verbosity mode (log level: DEBUG)")
    .option("-c, --config-file [path]", "Use specific config file");

program
    .command("send-voteorder [voteorder]")
    .description("Sends a voteorder. You can pass path to a JSON file or pass JSON directly")
    .action(function(voteorder) {
        prepareAction(program)
        .then((config: Config) => SendVoteorderAction.doAction(config, voteorder))
        .then(actionDone, actionError);
    });

program
    .command("sync-rules [rules]")
    .description("Synchronize rules from config file to blockchain. You can pass path to a JSON file or pass JSON directly")
    .action(function(rules) {
        prepareAction(program)
        .then((config: Config) => SyncRulesAction.doAction(config, rules))
        .then(actionDone, actionError);
    });

program
    .command("daemon [sinceBlockNum]")
    .description("Reads all blocks since last confirmation (or saved state) a loop and sends votes/confirmations to blockchain")
    .action(function(sinceBlockNum) {
        if (sinceBlockNum) sinceBlockNum = parseInt(sinceBlockNum);
        else sinceBlockNum = undefined;

        prepareAction(program)
        .then((config: Config) => DaemonAction.doAction(config, sinceBlockNum))
        .then(actionDone, actionError);
    });

program.parse(process.argv);

if (!commandCorrect) {
    program.outputHelp();
}