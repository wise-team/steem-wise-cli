import * as program from "commander";
import * as _ from "lodash";
import * as Promise from "bluebird";
import * as prompt from "prompt";

import { Log } from "../log"; const log = Log.getLogger();
import { StaticConfig } from "./StaticConfig";
import { PrioritizedFileObjectLoader } from "../util/PrioritizedFileObjectLoader";

/**
 * Config parameters.
 */
export interface Config {
    username: string;
    postingWif: string;
    defaultSyncStartBlockNum: number;
    syncedBlockNumFile: string;
    disableSend: boolean;
    [x: string]: any; // any other attribute
}

/**
 * This Env variables can be used to override config settings.
 * This can be handful e.g. when using wise with docker-compose.
 */
const envMappings: [string, string][] = [
    ["WISE_STEEM_USERNAME", "username"],
    ["WISE_STEEM_POSTINGWIF", "postingWif"],
    ["WISE_DEFAULT_SYNC_START_BLOCK_NUM", "defaultSyncStartBlockNum"],
    ["WISE_SYNCED_BLOCK_NUM_FILE", "syncedBlockNumFile"],
];

/**
 * Config priority:
 * 1. Env variables (see envMappings)
 * 2. Files: (see StaticConfig.DEFAULT_CONFIG_FILE_PATHS)
 * 2.1. ./config/json
 * 2.2. ./config.yml
 * 2.3. ~/.wise/config.json
 * 2.4. ~/.wise/config.yml
 * 3. Default config (see ConfigLoader.defaultConfig())
 */

export class ConfigLoader {
    public static loadConfig(program: program.Command): Promise<Config> {
        const configFiles: string [] = _.cloneDeep(StaticConfig.DEFAULT_CONFIG_FILE_PATHS);
        if (program.configFile) configFiles.unshift(program.configFile);

        return Promise.resolve(StaticConfig.DEFAULT_CONFIG)
        .then(config => PrioritizedFileObjectLoader.loadFromFiles(config, configFiles, "config"))
        .then(config => ConfigLoader.loadEnv(config))
        .then(config => ConfigLoader.validateConfig(config))
        .then(config => { log.debug("Loaded config: " + JSON.stringify(config)); return config; });
    }

    private static loadEnv(config: Config): Config {
        envMappings.forEach(pair => {
            if (process.env[pair[0]]) {
                config = _.set(config, pair[1], process.env[pair[0]]);
            }
        });
        return config;
    }

    private static validateConfig(config: Config): Config {
        return config;
    }

    public static askForCredentialsIfEmpty(config: Config): Promise<Config> {
        return Promise.resolve().then((): Promise<Config> => {
            const askForUsername = (!config.username || config.username.trim().length == 0);
            const askForPostingWif = (!config.postingWif || config.postingWif.trim().length == 0);
            if (!askForUsername && !askForPostingWif) return Promise.resolve(config);

            const propertiesToAsk: any = {};

            if (askForUsername) {
                propertiesToAsk.username = {
                    description: "Enter your steem username (without @)",
                    required: true,
                    type: "string",
                    pattern: /^[0-9a-z-]{3,24}$/,
                };
            }

            if (askForPostingWif) {
                propertiesToAsk.postingWif = {
                    description: "Enter " + (askForUsername ? "your" : "your (@" + config.username + ")") + " steem posting key Wif \n(Here is an instruction where to find it: https://steemit.com/security/@noisy/public-and-private-keys-how-they-are-used-by-steem-making-all-of-these-possible-you-can-find-answer-here)",
                    required: true,
                    hidden: true,
                    type: "string",
                    pattern: /^[0-9A-Za-z-]+$/,
                };
            }
            return new Promise((resolve, reject) => {
                prompt.start({});
                prompt.get({
                    properties: propertiesToAsk
                }, (error: Error, result: { username: string, postingWif: string }) => {
                    if (error) reject(error);
                    else {
                        if (askForUsername) config.username = result.username;
                        if (askForPostingWif) config.postingWif = result.postingWif;
                        resolve(config);
                    }
                });
            });
        })
        .then(config => config);
    }
}
