import * as fs from "fs";
import * as os from "os";
import * as program from "commander";
import * as _ from "lodash";
import * as Promise from "bluebird";
import * as yaml from "js-yaml";

import { Log } from "../log"; const log = Log.getLogger();

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
 * 2. Files: (see ConfigLoader.DEFAULT_CONFIG_PATHS)
 * 2.1. ./config/json
 * 2.2. ./config.yml
 * 2.3. ~/.wise/config.json
 * 2.4. ~/.wise/config.yml
 * 3. Default config (see ConfigLoader.defaultConfig())
 */

export class ConfigLoader {
    private static DEFAULT_CONFIG_PATHS: string [] = [
        "./config.json", "./config.yml",
        os.homedir() + "/.wise/config.json", os.homedir() + "/.wise/config.yml"
    ];

    public static loadConfig(program: program.Command): Promise<Config> {
        const configFiles: string [] = _.cloneDeep(ConfigLoader.DEFAULT_CONFIG_PATHS);
        if (program.configFile) configFiles.unshift(program.configFile);

        return Promise.resolve(ConfigLoader.defaultConfig())
        .then(config => ConfigLoader.tryLoadFromFiles(config, configFiles))
        .then(config => ConfigLoader.loadEnv(config))
        .then(config => ConfigLoader.validateConfig(config))
        .then(config => { log.debug("Loaded config: " + JSON.stringify(config)); return config; });
    }

    private static defaultConfig(): Config {
        return {
            username: "",
            postingWif: "",
            defaultSyncStartBlockNum: 0, // introduction of smartvotes
            syncedBlockNumFile: "./wise-synced-block-num.txt",
            disableSend: false
        };
    }

    private static tryLoadFromFiles(prevConfig: Config, configFiles: string []): Promise<Config> {
        return Promise.resolve().then(() => {
            for (let i = 0; i < configFiles.length; i++) {
                const configPath = configFiles[i];
                if (fs.existsSync(configPath)) {
                    log.debug("Trying to read config from " + configPath);
                    let configFileContents: string;
                    try {
                        configFileContents = fs.readFileSync(configPath, "utf8").toString();
                        log.debug("--- Config file contents: ---\n" + configFileContents + "\n---");
                    }
                    catch (error) {
                        log.debug("Could not read config file (" + configPath + "): " + error.message);
                        continue; // continue to next file
                    }
                    // if continue was not called, try to load as JSON:
                    try {
                        const loadedConfig = JSON.parse(configFileContents) as Config;
                        const config = _.merge({}, prevConfig, loadedConfig);
                        return config;
                    }
                    catch (error) {
                        log.debug("Failed to parse config (" + configPath + ") as JSON " + error.message);
                    }
                    // try to load as YAML:
                    try {
                        const loadedConfig = yaml.safeLoad(configFileContents) as Config;
                        const config = _.merge({}, prevConfig, loadedConfig);
                        return config;
                    }
                    catch (error) {
                        log.debug("Failed to parse config (" + configPath + ") as YAML " + error.message);
                    }
                }
            }
            log.warn("No config was loaded");
            return prevConfig;
        });
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
        if (config.postingWif.length == 0) throw new Error("Invalid config: PostingWif cannot be empty");
        return config;
    }
}
