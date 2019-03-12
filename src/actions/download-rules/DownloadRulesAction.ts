import * as fs from "fs";
import * as yaml from "js-yaml";
import * as _ from "lodash";
import * as path from "path";
import * as prompt from "prompt";
import {
    DirectBlockchainApi,
    EffectuatedSetRules,
    Wise,
} from "steem-wise-core";

import { Config, ConfigLoadedFromFile, ConfigLoader } from "../../config/Config";
import { StaticConfig } from "../../config/StaticConfig";
import { Context } from "../../Context";

export class DownloadRulesAction {

    private static downloadRules(username: string, config: Config): Promise<EffectuatedSetRules[]> {
        const delegatorWise = new Wise(
            username,
            new DirectBlockchainApi(Wise.constructDefaultProtocol(), "", { apiUrl: config.steemApi }),
        );
        return delegatorWise.downloadAllRulesets(username);
    }

    private static askIfOverride(file: string): Promise<boolean> {
        return Promise.resolve().then(
            (): Promise<boolean> =>
                new Promise((resolve, reject) => {
                    prompt.start({});
                    prompt.get(
                        {
                            properties: {
                                override: {
                                    description:
                                        "File " +
                                        file +
                                        " already exists. Would you like to overwrite it? [type yes / no]",
                                    pattern: /^y(es)?|no?$/gim,
                                    required: true,
                                    type: "string",
                                },
                            },
                        },
                        (error: Error, result: { override: string }) => {
                            if (error) reject(error);
                            else {
                                resolve(result.override.toLowerCase().substr(0, 1) === "y");
                            }
                        },
                    );
                }),
        );
    }
    private context: Context;
    public constructor(context: Context) {
        this.context = context;
    }

    public doAction(config: ConfigLoadedFromFile, file: string, options: any): Promise<string> {
        let format: "yml" | "json" = "yml";
        if (options.format) format = options.format;

        const override: boolean = !!options.override;

        if (!file || !file.trim().length) {
            file =
                format === "yml"
                    ? StaticConfig.DEFAULT_DOWNLOAD_RULES_PATH_YML
                    : StaticConfig.DEFAULT_DOWNLOAD_RULES_PATH_JSON;
        }
        if (!path.isAbsolute(file)) {
            file = path.resolve(path.dirname(config.configFilePath), file); // prepend with path to config file
        }

        return Promise.resolve()
            .then(() => {
                if (options.account) return options.account;
                else {
                    return ConfigLoader.askForCredentialsIfEmpty(
                        config,
                        true,
                        false, /* don't ask for posting key */
                    ).then(loadedConfig => loadedConfig.username);
                }
            })
            .then((account: string) => {
                this.context.log("Downloading rules set by @" + account + "...");
                return DownloadRulesAction.downloadRules(account, config);
            })
            .then(
                (result: EffectuatedSetRules[]): Promise<string> => {
                    const rulesWithoutMoment = result.map(esr => {
                        _.unset(esr, "moment");
                        return esr;
                    });

                    let outStr: string;
                    if (format === "yml") {
                        outStr = yaml.safeDump(rulesWithoutMoment);
                    } else {
                        outStr = JSON.stringify(rulesWithoutMoment, undefined, 2);
                    }

                    if (options.stdout) {
                        return Promise.resolve(outStr + "\n");
                    }

                    return Promise.resolve()
                        .then(() => {
                            if (fs.existsSync(file) && !override) return DownloadRulesAction.askIfOverride(file);
                            else return true;
                        })
                        .then(save => {
                            if (!save) return "Rules not saved to file";

                            fs.writeFileSync(file, outStr, { encoding: "utf8", flag: "w" });
                            return "Rules saved to file " + file;
                        });
                },
            );
    }
}
