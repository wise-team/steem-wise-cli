#!/usr/bin/env node

import * as program from "commander";
import * as Promise from "bluebird";

import { ConfigLoadedFromFile, ConfigLoader } from "./config/Config";
import { StaticConfig } from "./config/StaticConfig";
import { UploadRulesAction } from "./actions/UploadRulesAction";
import { DownloadRulesAction } from "./actions/DownloadRulesAction";
import { SendVoteorderAction } from "./actions/SendVoteorderAction";
import { DaemonAction } from "./actions/DaemonAction";
import { InitAction } from "./actions/InitAction";
import { Log } from "./log"; const log = Log.getLogger();
import * as eastereggs from "./eastereggs";

/**
 * Action hooks
 */
let commandCorrect = false;
const prepareAction = (program: program.Command, loadConfig: boolean = true): Promise<ConfigLoadedFromFile> => {
    commandCorrect = true;
    Log.configureLoggers(program);
    if (loadConfig) return ConfigLoader.loadConfig(program);
    else return Promise.resolve({ ...StaticConfig.DEFAULT_CONFIG, configFilePath: process.cwd() });
};
const actionDone = (msg: String) => {
    console.log(msg);
    console.log();
};
const actionError = (error: Error) => {
    Log.exception(error);
    console.log();
    console.log(">  We apologize for this error. Maybe this wise sentence will improve your mood: " + eastereggs.wisdomQuote());
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
        .then((config: ConfigLoadedFromFile) => SendVoteorderAction.doAction(config, voteorder))
        .then(actionDone, actionError);
    });

program
    .command("upload-rules [rules]")
    .description("Uploads rules to blockchain. You can pass path to a JSON file or pass JSON directly")
    .action(rules => {
        prepareAction(program)
        .then((config: ConfigLoadedFromFile) => UploadRulesAction.doAction(config, rules))
        .then(actionDone, actionError);
    });

program
    .command("download-rules [file]")
    .description("Downloads rules from blockchain to the file. Type 'wise download-rules --help' to list options.")
    .option("-f, --format <format>", "Format of the output file (yml|json) [yml]", "yml")
    .option("-o, --override", "Override the file if it exists. If this option is not set you will be prompted.")
    .option("-a, --account [username]", "Account to download rules from")
    .option("--stdout", "Print rules to stdout")
    .action((file, options) => {
        prepareAction(program)
        .then((config: ConfigLoadedFromFile) => DownloadRulesAction.doAction(config, file, options))
        .then(actionDone, actionError);
    });

program
    .command("daemon [sinceBlockNum]")
    .description("Reads all blocks since last confirmation (or saved state) a loop and sends votes/confirmations to blockchain")
    .action(sinceBlockNum => {
        if (sinceBlockNum) sinceBlockNum = parseInt(sinceBlockNum);
        else sinceBlockNum = undefined;

        prepareAction(program)
        .then((config: ConfigLoadedFromFile) => DaemonAction.doAction(config, sinceBlockNum))
        .then(actionDone, actionError);
    });

program
    .command("init [path]")
    .description("Creates default rules.yml, config.yml, synced-block-num.txt in specified location. Type 'wise init --help' to list options.")
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
        .then((config: ConfigLoadedFromFile) => InitAction.doAction(options, path))
        .then(actionDone, actionError);
    });

eastereggs.appendEasterEggCommands(program, prepareAction, actionDone, actionError);

program.parse(process.argv);

if (!program.args.length || !commandCorrect) {
    program.outputHelp();

    console.log();
    console.log(">  " + eastereggs.wisdomQuote());
}

/**
 * Prayer:
 *  Gloria Patri, et Filio, et Spiritui Sancto, sicut erat in principio et nunc et semper et in saecula
 *  saeculorum. Amen. In te, Domine, speravi: non confundar in aeternum.
 */
