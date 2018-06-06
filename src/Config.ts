import * as fs from "fs";
import * as program from "commander";
import * as _ from "lodash";

export interface Config {
    username: string;
    postingWif: string;
    syncedBlockNumFile: string;
    [x: string]: any; // any other attribute
}

const envMappings: [string, string][] = [
    ["WISE_STEEM_USERNAME", "username"],
    ["WISE_STEEM_POSTINGWIF", "postingWif"],
    ["WISE_SYNCED_BLOCK_NUM_FILE", "syncedBlockNumFile"],
];

export class ConfigLoader {
    public static loadConfig(program: program.Command): Promise<Config> {
        return Promise.resolve(ConfigLoader.defaultConfig())
        .then(config => {
            if (program.configFile) return ConfigLoader.loadFromFile(config, program.configFile);
            else return Promise.resolve(config);
        })
        .then(config => ConfigLoader.loadEnv(config))
        .then(config => ConfigLoader.validateConfig(config));
    }

    private static defaultConfig(): Config {
        return {
            username: "",
            postingWif: "",
            syncedBlockNumFile: "./wise-synced-block-num.txt"
        };
    }

    private static loadFromFile(prevConfig: Config, configFile: string): Promise<Config> {
        return new Promise((resolve, reject) => {
            if (!fs.existsSync(program.configFile)) {
                throw new Error("Config file " + program.configFile + " does not exist!");
            }
            fs.readFile(program.configFile, function(error: Error, data: Buffer) {
                if (error) reject(error);
                else {
                    try {
                        const loadedConfig = JSON.parse(data.toString()) as Config;
                        const config = _.merge({}, prevConfig, loadedConfig);
                        resolve(config);
                    }
                    catch (error) {
                        reject(error);
                    }
                }
            });
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
