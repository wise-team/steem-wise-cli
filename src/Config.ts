import * as fs from "fs";
import * as program from "commander";

import { objectAssign } from "./util";

export interface Config {
    username: string;
    postingWif: string;
    syncedBlockNumFile: string;
    [x: string]: any; // any other attribute
}

const defaultConfig: Config = {
    username: "",
    postingWif: "",
    syncedBlockNumFile: "~/.wise-synced-block-num.txt"
};

export class ConfigLoader {
    public static loadConfig(program: program.Command): Promise<Config> {
        return new Promise(function(resolve, reject) {
            if (program.configFile) {
                if (!fs.existsSync(program.configFile)) {
                    throw new Error("Config file " + program.configFile + " does not exist!");
                }
                fs.readFile(program.configFile, function(error: Error, data: Buffer) {
                    if (error) reject(error);
                    else {
                        try {
                            const loadedConfig = JSON.parse(data.toString()) as Config;
                            const config = objectAssign({}, defaultConfig, loadedConfig);
                            ConfigLoader.validateConfig(config);
                            resolve(config);
                        }
                        catch (error) {
                            reject(error);
                        }
                    }
                });
            }
        });
    }

    private static validateConfig(config: Config) {
        if (config.username.length == 0) throw new Error("Invalid config: Username cannot be empty");
        if (config.postingWif.length == 0) throw new Error("Invalid config: PostingWif cannot be empty");
    }
}
