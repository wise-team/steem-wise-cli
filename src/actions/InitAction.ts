import * as fs from "fs";
import * as path from "path";
import * as _ from "lodash";
import * as prompt from "prompt";
import * as yaml from "js-yaml";

import { Wise, DirectBlockchainApi, SendVoteorder, SteemOperationNumber } from "steem-wise-core";

import { Log } from "../log"; const log = Log.getLogger();
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
                    + "Type \"true\" to save or \"false\" to be asked for it in every command.",
                required: true,
                type: "boolean",
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
                else return prompt.history("savePostingKey").value;
            }
        };

        await new Promise((resolve, reject) => {
            prompt.start({});
            prompt.get({
                properties: propertiesToAsk
            }, (error: Error, result: { username: string, savePostingKey: boolean, postingWif: string }) => {
                if (error) reject(error);
                else {
                    if (!username) username = result.username;
                    if (savePostingKey === undefined) savePostingKey = result.savePostingKey;
                    if (savePostingKey) postingKey = result.postingWif;
                    resolve();
                }
            });
        });

        console.log("--- Settings: ---");
        console.log(JSON.stringify({
            wisePath: wisePath + " (" + path.resolve(wisePath) + ")",
            configPath: configPath + " (" + path.resolve(configPath) + ")",
            rulesPath: rulesPath + " (" + path.resolve(rulesPath) + ")",
            syncedBlockNumPath: syncedBlockNumPath + " (" + path.resolve(syncedBlockNumPath) + ")",
            username: username,
            savePostingKey: savePostingKey,
            postingKey: (postingKey ? "*".repeat((postingKey as string).length) : ""),
            sinceBlock: sinceBlock
        }, undefined, 2));
        console.log("------");

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


        if (sinceBlock === undefined) {
            console.log("Fetching HEAD block number...");
            sinceBlock = (await new DirectBlockchainApi("", "").getDynamicGlobalProperties()).head_block_number;
            console.log("HEAB block number is " + sinceBlock);
        }


        console.log("Writing " + configPath + "");
        const configObj = {
            username: username,
            postingWif: (savePostingKey ? postingKey : ""),
            syncedBlockNumFile: path.relative(path.dirname(configPath), syncedBlockNumPath)
        };
        fs.writeFileSync(configPath, yaml.safeDump(configObj));


        console.log("Writing " + syncedBlockNumPath + "");
        fs.writeFileSync(syncedBlockNumPath, sinceBlock + "");

        console.log("Writing " + rulesPath + "");
        fs.writeFileSync(rulesPath, yaml.safeDump(DefaultRules.DEFAULT_RULES));
        console.log("Done");

        return "Wise successfully set up in '" + wisePath + "'. Now you have to do two more actions to start the daemon: \n"
            + "  1. Run 'wise sync-rules' to publish the rules to the blockchain.\n"
            + "  2. Run 'wise daemon' to start the daemon.\n"
            + " That's all what is required for the daemon to work. If you would like a more complex setup \n"
            + " (e.g. Docker compose) please refer to the \"The Wise Handbook\".";
    }
}
