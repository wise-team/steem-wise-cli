import { Command } from "commander";
import * as BluebirdPromise from "bluebird";
import ow from "ow";
import { ow_extend } from "./util/ow-extend";

import { ConfigLoadedFromFile, ConfigLoader } from "./config/Config";
import { StaticConfig } from "./config/StaticConfig";
import { UploadRulesAction } from "./actions/UploadRulesAction";
import { DownloadRulesAction } from "./actions/DownloadRulesAction";
import { SendVoteorderAction } from "./actions/SendVoteorderAction";
import { DaemonAction } from "./actions/DaemonAction";
import { InitAction } from "./actions/InitAction";
import { Log } from "./log";

export class App {
    private static VERSION: string = require("../package.json").version;
    private commander: Command;
    private argv: string [];

    private doneCallback: (error: any, result?: string) => void = () => {};
    private commandExecutionBegun: boolean = false;

    public constructor(commander: Command, argv: string []) {
        this.commander = commander;
        this.argv = argv;

        this.setup();
    }

    private setup() {
        this.commander
            .name("wise")
            .version(App.VERSION, "--version")
            .option("-v, --verbose", "Verbose mode (log level: INFO)")
            .option("--debug", "Debug verbosity mode (log level: DEBUG)")
            .option("-c, --config-file [path]", "Use specific config file");

        this.commander
            .command("send-voteorder [voteorder]")
            .description("Sends a voteorder. You can pass path to a JSON file or pass JSON directly")
            .action(voteorder => this.actionWrapper(async () => {
                ow(voteorder, ow.any(ow_extend.isValidJson("voteorder"), ow_extend.fileExists("voteorder")));

                return SendVoteorderAction.doAction(await this.loadConfig(true), voteorder);
            }));

        this.commander
            .command("upload-rules [rules]")
            .description("Uploads rules to blockchain. You can pass path to a JSON file or pass JSON directly")
            .action(rules => this.actionWrapper(async () => {
                if (rules) ow(rules, ow.any(ow_extend.isValidJson("rules"), ow_extend.fileExists("rules")));

                return UploadRulesAction.doAction(await this.loadConfig(true), rules);
            }));

        this.commander
            .command("download-rules [file]")
            .description("Downloads rules from blockchain to the file. Type 'wise download-rules --help' to list options.")
            .option("-f, --format <format>", "Format of the output file (yml|json) [yml]", "yml")
            .option("-o, --override", "Override the file if it exists. If this option is not set you will be prompted.")
            .option("-a, --account [username]", "Account to download rules from")
            .option("--stdout", "Print rules to stdout")
            .action((file, options) => this.actionWrapper(async () => {
                if (file) ow(file, ow_extend.parentDirExists("file"));
                ow(options.format, ow.string.label("format").oneOf([ "yml", "json" ]));
                ow(options.override, ow.any(ow.undefined, ow.boolean.label("override")));
                if (options.account) ow(options.account, ow.string.minLength(3));
                ow(options.stdout, ow.any(ow.undefined, ow.boolean.label("override")));

                return DownloadRulesAction.doAction(await this.loadConfig(true), file, options);
            }));

        this.commander
            .command("daemon [sinceBlockNum]")
            .description("Reads all blocks since last confirmation (or saved state) a loop and sends votes/confirmations to blockchain")
            .action(sinceBlockNum => this.actionWrapper(async () => {
                ow(sinceBlockNum, ow.any(ow.undefined, ow.number.label("sinceBlockNum").finite.greaterThan(0)));

                if (sinceBlockNum) sinceBlockNum = parseInt(sinceBlockNum);
                else sinceBlockNum = undefined;

                return DaemonAction.doAction(await this.loadConfig(true), sinceBlockNum);
            }));

        this.commander
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
            .action((path, options) => this.actionWrapper(async () => {
                if (path) ow(path, ow_extend.fileExists("path"));
                ow(options.global, ow.any(ow.undefined, ow.boolean.label("global")));
                if (options.config) ow(options.config, ow_extend.fileExists("config"));
                if (options.rules) ow(options.rules, ow_extend.fileExists("rules"));
                if (options.username) ow(options.username, ow.string.minLength(3));
                ow(options.savePostingKey, ow.any(ow.undefined, ow.boolean.label("savePostingKey")));
                ow(options.dontSavePostingKey, ow.any(ow.undefined, ow.boolean.label("dontSavePostingKey")));
                ow(options.sinceBlockNum, ow.any(ow.undefined, ow.number.label("sinceBlockNum").finite.greaterThan(0)));
                if (options.syncedBlockNumPath) ow(options.syncedBlockNumPath, ow_extend.fileExists("syncedBlockNumPath"));

                return InitAction.doAction(options, path);
            }));

        // easteregg
        this.commander
            .command("man", "", { noHelp: true })
            .action((path, options) => this.actionWrapper(async () => {
                return "You are a wise gentleman";
            }));

        // easteregg
        this.commander
            .command("woman", "", { noHelp: true })
            .action((path, options) => this.actionWrapper(async () => {
                return "You are a wise lady";
            }));
    }

    private async initAction() {
        ow(this.commander.debug, ow.any(ow.undefined, ow.boolean.label("debug")));
        ow(this.commander.verbose, ow.any(ow.undefined, ow.boolean.label("verbose")));
        if (this.commander.configFile) ow_extend.fileExists(this.commander.configFile);

        Log.log().initialize(!!this.commander.debug, !!this.commander.verbose);
    }

    private async loadConfig(loadFromFile: boolean): Promise<ConfigLoadedFromFile> {
        if (loadFromFile) return ConfigLoader.loadConfig(this.commander);
        else return Promise.resolve({ ...StaticConfig.DEFAULT_CONFIG, configFilePath: process.cwd() });
    }

    private runCb(doneCallback: (error: any, result?: string) => void) {
        this.doneCallback = doneCallback;
        this.commander.parse(this.argv);

        if (!this.commandExecutionBegun) {
            const error = new Error("Incorrect command");
            (error as any).incorrect_command = true;
            doneCallback(error, undefined);
        }
    }

    public async run(): Promise<string> {
        const result = await BluebirdPromise.promisify(this.runCb, { context: this })();
        return result;
    }

    private actionWrapper(action: () => Promise<string>) {
        this.commandExecutionBegun = true;
        (async () => {
            try {
                this.initAction();
                const result: string = await action();
                this.doneCallback(undefined, result);
            }
            catch (error) {
                this.doneCallback(error, undefined);
            }
        })();
    }

    public outputHelp() {
        this.commander.outputHelp();
    }
}
