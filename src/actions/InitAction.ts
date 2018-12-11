import * as fs from "fs";
import * as path from "path";
import * as _ from "lodash";
import * as prompt from "prompt";
import * as yaml from "js-yaml";

import { Wise, DirectBlockchainApi, SendVoteorder, SteemOperationNumber } from "steem-wise-core";

import { Log } from "../log";
import { Config } from "../config/Config";
import { StaticConfig } from "../config/StaticConfig";
import { DefaultRules } from "../config/DefaultRules";

export class InitAction {
    public static async doAction(options: any, wisePath_: string): Promise<string> {
        let wisePath: string = ".";
        if (options.global) wisePath = StaticConfig.DEFAULT_GLOBAL_PATH;
        if (wisePath_) wisePath = wisePath_;

        let configPath = wisePath + "/config.yml";
        if (options.config) configPath = options.config;

        let rulesPath = wisePath + "/rules.yml";
        if (options.rules) rulesPath = options.rules;

        let syncedBlockNumPath = wisePath + "/synced-block-num.txt";
        if (options.syncedBlockNumPath) syncedBlockNumPath = options.syncedBlockNumPath;

        let username: string | undefined = undefined; // undefined means ask
        if (options.username) username = options.username;

        let savePostingKey: boolean | undefined = undefined; // undefined means ask
        if (options.savePostingKey) savePostingKey = true;
        if (options.dontSavePostingKey) savePostingKey = false;

        let sinceBlock: number | undefined = undefined; // undefined means HEAD
        if (options.sinceBlock) sinceBlock = options.sinceBlock;

        let postingKey: string | undefined = undefined;


        const propertiesToAsk: any = {};

        if (!username) {
            propertiesToAsk.username = {
                description: "Enter your steem username (without @)",
                required: true,
                type: "string",
                pattern: /^[0-9a-z-]{3,24}$/,
            };
        }

        if (savePostingKey === undefined) {
            propertiesToAsk.savePostingKey = {
                description: "Would you like to store your posting key in the config file or type it manually for every command? "
                    + "Type \"yes\" to save or \"no\" to be asked for it in every command.",
                required: true,
                pattern: /^y(es)?|no?$/gmi,
                type: "string",
            };
        }

        propertiesToAsk.postingWif = {
            description: "Enter your steem posting key Wif \n(Here is an instruction where to find it: https://steemit.com/security/@noisy/public-and-private-keys-how-they-are-used-by-steem-making-all-of-these-possible-you-can-find-answer-here)",
            required: true,
            hidden: true,
            type: "string",
            pattern: /^[0-9A-Za-z-]+$/,
            ask: function() {
                if (savePostingKey !== undefined) return savePostingKey;
                else return prompt.history("savePostingKey").value.toLowerCase().substr(0, 1) === "y";
            }
        };

        await new Promise((resolve, reject) => {
            prompt.start({});
            prompt.get({
                properties: propertiesToAsk
            }, (error: Error, result: { username: string, savePostingKey: string, postingWif: string }) => {
                if (error) reject(error);
                else {
                    if (!username) username = result.username;
                    if (savePostingKey === undefined) savePostingKey = (result.savePostingKey.toLowerCase().substr(0, 1) === "y");
                    if (savePostingKey) postingKey = result.postingWif;
                    resolve();
                }
            });
        });

        if (sinceBlock === undefined) {
            console.log("Fetching HEAD block number...");
            sinceBlock = (await new DirectBlockchainApi(Wise.constructDefaultProtocol()).getDynamicGlobalProperties()).head_block_number;
            console.log("HEAB block number is " + sinceBlock);
        }

        console.log("--- Your settings ---");
        console.log("Account name: " + username);
        console.log("Save posting key: " +
            (savePostingKey ? "Yes. Your posting key is saved to config file. You will not be prompted for it"
                           : "No. You will be asked for your posting key every time it is required")
        );
        console.log("Daemon will start synchronisation from block " + sinceBlock);
        console.log("Wise path: " + path.resolve(wisePath));
        console.log("Config path: " + path.resolve(configPath));
        console.log("Rules path: " + path.resolve(rulesPath));
        console.log("Synced block num file path: " + path.resolve(syncedBlockNumPath));
        console.log("");

        if (fs.existsSync(wisePath)) {
            if (!fs.lstatSync(wisePath).isDirectory()) throw new Error("Path " + wisePath + " is not a directory");
            try {
                fs.accessSync(wisePath, fs.constants.R_OK | fs.constants.W_OK);
            } catch (err) {
                throw new Error("Directory " + wisePath + " is not writeable and readable");
            }
        }
        else {
            console.log("Creating " + wisePath + ".");
            fs.mkdirSync(wisePath);
        }


        console.log("Writing " + configPath + "");
        const configObj = _.merge({}, StaticConfig.DEFAULT_CONFIG, {
            username: username,
            postingWif: (savePostingKey ? postingKey : ""),
            defaultRulesPath: path.relative(path.dirname(configPath), rulesPath),
            defaultSyncStartBlockNum: sinceBlock,
            syncedBlockNumFile: path.relative(path.dirname(configPath), syncedBlockNumPath),
        });
        fs.writeFileSync(configPath, yaml.safeDump(configObj));


        console.log("Writing " + syncedBlockNumPath + "");
        fs.writeFileSync(syncedBlockNumPath, sinceBlock + "");

        console.log("Writing " + rulesPath + "");
        fs.writeFileSync(rulesPath, yaml.safeDump(DefaultRules.DEFAULT_RULES));
        console.log("Done");

        return "Wise successfully set up in '" + wisePath + "'. Now you have to do two more actions to start the daemon: \n"
            + "  1. Run 'wise upload-rules' to publish the rules to the blockchain.\n"
            + "  2. Run 'wise daemon' to start the daemon.\n"
            + " That's all what is required for the daemon to work. If you would like a more complex setup \n"
            + " (e.g. Docker compose) please refer to the \"The Wise Manual\".";
    }
}
