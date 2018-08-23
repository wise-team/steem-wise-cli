import * as os from "os";

import { Config } from "./Config";

export class StaticConfig {
    public static INTRODUCTION_OF_WISE_BLOCK_NUM: number = 21622860;
    public static DEFAULT_CONFIG_FILE_PATHS: string [] = [
        "./config.json", "./config.yml",
        os.homedir() + "/.wise/config.json", os.homedir() + "/.wise/config.yml"
    ];
    public static DEFAULT_RULES_FILE_PATHS: string [] = [
        "./rules.json", "./rules.yml",
        os.homedir() + "/.wise/rules.json", os.homedir() + "/.wise/rules.yml"
    ];
    public static DEFAULT_CONFIG: Config = {
        username: "",
        postingWif: "",
        defaultSyncStartBlockNum: 0, // introduction of smartvotes
        syncedBlockNumFile: "./wise-synced-block-num.txt",
        disableSend: false
    };
}