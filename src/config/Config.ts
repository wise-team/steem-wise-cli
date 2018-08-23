import * as program from "commander";
import * as _ from "lodash";
import * as Promise from "bluebird";

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
        if (config.username.length == 0) throw new Error("Invalid config: Username cannot be empty");
        return config;
    }
}
