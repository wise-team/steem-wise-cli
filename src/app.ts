#!/usr/bin/env node

import * as program from "commander";
import * as Promise from "bluebird";

import { Config, ConfigLoader } from "./config/Config";
import { StaticConfig } from "./config/StaticConfig";
import { SyncRulesAction } from "./actions/SyncRulesAction";
import { SendVoteorderAction } from "./actions/SendVoteorderAction";
import { DaemonAction } from "./actions/DaemonAction";
import { InitAction } from "./actions/InitAction";
import { Log } from "./log"; const log = Log.getLogger();

/**
 * Action hooks
 */
let commandCorrect = false;
const prepareAction = (program: program.Command, loadConfig: boolean = true): Promise<Config> => {
    commandCorrect = true;
    Log.configureLoggers(program);
    if (loadConfig) return ConfigLoader.loadConfig(program);
    else return Promise.resolve(StaticConfig.DEFAULT_CONFIG);
};
const actionDone = (msg: String) => {
    console.log(msg);
    console.log();
};
const actionError = (error: Error) => {
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
    .action(voteorder => {
        prepareAction(program)
        .then((config: Config) => SendVoteorderAction.doAction(config, voteorder))
        .then(actionDone, actionError);
    });

program
    .command("sync-rules [rules]")
    .description("Synchronize rules from config file to blockchain. You can pass path to a JSON file or pass JSON directly")
    .action(rules => {
        prepareAction(program)
        .then((config: Config) => SyncRulesAction.doAction(config, rules))
        .then(actionDone, actionError);
    });

program
    .command("daemon [sinceBlockNum]")
    .description("Reads all blocks since last confirmation (or saved state) a loop and sends votes/confirmations to blockchain")
    .action(sinceBlockNum => {
        if (sinceBlockNum) sinceBlockNum = parseInt(sinceBlockNum);
        else sinceBlockNum = undefined;

        prepareAction(program)
        .then((config: Config) => DaemonAction.doAction(config, sinceBlockNum))
        .then(actionDone, actionError);
    });

program
    .command("init [path]")
    .description("Creates default rules.yml, config.yml, synced-block-num.txt in specified location")
    .option("-g, --global", "Puts config and rules in home directory (~/.wise/)")
    .option("-n, --config [path]", "Specify path for config.yml [default:config.yml]")
    .option("-r, --rules [path]", "Specify path for rules.yml [defualt:rules.yml]")
    .option("-u, --username [account]", "Account name")
    .option("-k, --save-posting-key", "Saves private post key in config file")
    .option("-d, --dont-save-posting-key", "Do not save posting key in config file")
    .option("-b, --since-block [block-num]", "Number of block, from which synchronisation starts [default: head]")
    .option("-s, --synced-block-num-path [path]", "Path to file, which stores number of last synced block [default: synced-block-num.txt]")
    .action((path, options) => {
        prepareAction(program, false)
        .then((config: Config) => InitAction.doAction(options, path))
        .then(actionDone, actionError);
    });

program.parse(process.argv);

if (!commandCorrect) {
    program.outputHelp();
}