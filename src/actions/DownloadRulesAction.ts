import * as path from "path";
import * as fs from "fs";
import * as _ from "lodash";
import * as prompt from "prompt";
import * as yaml from "js-yaml";

import { Log } from "../log"; const log = Log.getLogger();
import { ConfigLoader, Config, ConfigLoadedFromFile } from "../config/Config";
import { Wise, DirectBlockchainApi, SetRulesForVoter, SteemOperationNumber, SetRules, EffectuatedSetRules } from "steem-wise-core";
import { StaticConfig } from "../config/StaticConfig";
import { PrioritizedFileObjectLoader } from "../util/PrioritizedFileObjectLoader";


export class DownloadRulesAction {
    public static doAction(config: ConfigLoadedFromFile, file: string, options: any): Promise<string> {
        let format: "yml" | "json" = "yml";
        if (options.format) format = "yml";

        const override: boolean = !!options.override;

        if (!file || !file.trim().length) file = (format === "yml" ? StaticConfig.DEFAULT_DOWNLOAD_RULES_PATH_YML : StaticConfig.DEFAULT_DOWNLOAD_RULES_PATH_JSON);
        if (!path.isAbsolute(file)) file = path.resolve(path.dirname(config.configFilePath), file); // prepend with path to config file

        return Promise.resolve()
        .then(() => {
            if (options.account) return options.account;
            else {
                return ConfigLoader.askForCredentialsIfEmpty(config, true, false /* don't ask for posting key */)
                .then(config => config.username);
            }
        })
        .then((account: string) => {
            console.log("Downloading rules set by @" + account + "...");
            return DownloadRulesAction.downloadRules(account);
        })
        .then((result: EffectuatedSetRules []): Promise<string> => {
            const rulesWithoutMoment = result.map(esr => {
                _.unset(esr, "moment");
                return esr;
            });

            const outStr = yaml.safeDump(rulesWithoutMoment);

            if (options.stdout) {
                return Promise.resolve(outStr + "\n");
            }

            return Promise.resolve()
            .then(() => {
                if (fs.existsSync(file) && !override) return DownloadRulesAction.askIfOverride(file);
                else return true;
            })
            .then((save) => {
                if (!save) return "Rules not saved to file";

                fs.writeFileSync(file, outStr, {encoding: "utf8", flag: "w" });
                return "Rules saved to file " + file;
            });
        });
    }

    private static downloadRules(username: string): Promise<EffectuatedSetRules []> {
        const delegatorWise = new Wise(username, new DirectBlockchainApi());
        return delegatorWise.downloadAllRulesets(username);
    }

    private static askIfOverride(file: string): Promise<boolean> {
        return Promise.resolve()
        .then((): Promise<boolean> => new Promise((resolve, reject) => {
            prompt.start({});
            prompt.get({
                properties: {
                    override: {
                        description: "File " + file + " already exists. Would you like to overwrite it? [type yes / no]",
                        pattern: /^y(es)?|no?$/gmi,
                        required: true,
                        type: "string",
                    }
                }
            }, (error: Error, result: { override: string }) => {
                if (error) reject(error);
                else {
                    resolve(result.override.toLowerCase().substr(0, 1) === "y");
                }
            });
        }));
    }
}
