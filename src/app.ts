#!/usr/bin/env node

import * as program from "commander";

import { Config, ConfigLoader } from "./Config";
import { SyncRulesAction } from "./SyncRulesAction";
import { SendVoteorderAction } from "./SendVoteorderAction";
import { DaemonAction } from "./DaemonAction";
import { ConfigureLogger } from "./ConfigureLogger";

/*
 * CLI setup
 */
let commandCorrect = false;

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
        commandCorrect = true;
        ConfigureLogger.configureLogger(program);

        ConfigLoader.loadConfig(program)
        .then((config: Config) => SendVoteorderAction.doAction(config, voteorder))
        .then((msg: string) => {
            console.log(msg);
            console.log();
        })
        .catch(error => {
            console.error(error);
            process.exit(1);
        });
    });

program
    .command("sync-rules [rules]")
    .description("Synchronize rules from config file to blockchain. You can pass path to a JSON file or pass JSON directly")
    .action(function(rules) {
        commandCorrect = true;
        ConfigureLogger.configureLogger(program);

        ConfigLoader.loadConfig(program)
        .then((config: Config) => SyncRulesAction.doAction(config, rules))
        .then((msg: string) => {
            console.log(msg);
            console.log();
        })
        .catch(error => {
            console.error(error);
            process.exit(1);
        });
    });

program
    .command("daemon [sinceBlockNum]")
    .description("reads all blocks since last confirmation (or saved state) a loop and sends votes/confirmations to blockchain")
    .action(function(sinceBlockNum) {
        commandCorrect = true;
        ConfigureLogger.configureLogger(program);

        if (sinceBlockNum) sinceBlockNum = parseInt(sinceBlockNum);
        else sinceBlockNum = undefined;

        ConfigLoader.loadConfig(program)
        .then((config: Config) => DaemonAction.doAction(config, sinceBlockNum))
        .then((msg: string) => {
            console.log(msg);
            console.log();
        })
        .catch(error => {
            console.error(error);
            process.exit(1);
        });
    });

program.parse(process.argv);

if (!commandCorrect) {
    program.outputHelp();
}