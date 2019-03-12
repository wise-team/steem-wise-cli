import * as _ from "lodash";
import * as path from "path";
import { DirectBlockchainApi, SetRulesForVoter, SteemOperationNumber, Wise } from "steem-wise-core";

import { Config, ConfigLoadedFromFile, ConfigLoader } from "../../config/Config";
import { StaticConfig } from "../../config/StaticConfig";
import { Context } from "../../Context";
import { PrioritizedFileObjectLoader } from "../../util/PrioritizedFileObjectLoader";

export class UploadRulesAction {
    private context: Context;
    public constructor(context: Context) {
        this.context = context;
    }

    public doAction(config: ConfigLoadedFromFile, rulesIn: string): Promise<string> {
        return this.loadRules(config, rulesIn)
            .then((rawRulesets: object[]) => this.syncRules(config, rawRulesets))
            .then((result: SteemOperationNumber | true) => {
                if (result === true) return "Rules are up to date";
                else return "Rules updated: " + result;
            });
    }

    private loadRules(config: ConfigLoadedFromFile, rulesIn: string): Promise<object[]> {
        let rulesPaths: string[];
        if (config.defaultRulesPath && config.defaultRulesPath.length > 0) {
            rulesPaths = [path.dirname(config.configFilePath) + "/" + config.defaultRulesPath];
        } else {
            rulesPaths = _.cloneDeep(StaticConfig.DEFAULT_RULES_FILE_PATHS);
        }

        if (rulesIn && rulesIn.length > 0) {
            try {
                let data: object[] | undefined;
                const input: object = JSON.parse(rulesIn);
                if (!(Object.prototype.toString.call(input) === "[object Array]")) {
                    throw new Error(
                        "Rules should be an array (incorrect type: " + Object.prototype.toString.call(input) + ")",
                    );
                }
                data = input as object[];

                return Promise.resolve(data); // succes parsing inline json
            } catch (error) {
                this.context.debug(
                    "Failed to parse " +
                        rulesIn +
                        " as inline JSON. Proceeding to loading files. Adding " +
                        rulesIn +
                        " as top-priority file.",
                );
                rulesPaths.unshift(rulesIn);
            }
        }

        return PrioritizedFileObjectLoader.loadFromFilesNoMerge([], rulesPaths, "rules").then(
            (result: { loadedObject: object[] | undefined; path: string | undefined }) => {
                if (!result.loadedObject) {
                    throw new Error("Could not load rulesets from any of the files: " + _.join(rulesPaths, ", "));
                }
                if (!(Object.prototype.toString.call(result.loadedObject) === "[object Array]")) {
                    throw new Error(
                        "Rules should be an array (incorrect type: " +
                            Object.prototype.toString.call(result.loadedObject) +
                            ") json=" +
                            JSON.stringify(result.loadedObject),
                    );
                }
                return result.loadedObject;
            },
        );
    }

    private syncRules(initialConfig: Config, rawRulesets: object[]): Promise<SteemOperationNumber | true> {
        return Promise.resolve()
            .then(() => ConfigLoader.askForCredentialsIfEmpty(initialConfig))
            .then(config => {
                const newRules: SetRulesForVoter[] = rawRulesets as SetRulesForVoter[];

                newRules.forEach((element: SetRulesForVoter) => {
                    if (!element.voter) return Promise.reject(new Error("Voter should be specified for each SetRules"));
                    if (!element.rulesets) {
                        return Promise.reject(new Error("Rulesets should be specified for each voter"));
                    }
                });

                const api: DirectBlockchainApi = new DirectBlockchainApi(
                    Wise.constructDefaultProtocol(),
                    config.postingWif,
                    { apiUrl: config.steemApi },
                );
                if (config.disableSend) api.setSendEnabled(false);
                const delegatorWise = new Wise(config.username, api);

                return delegatorWise.uploadAllRulesets(newRules, (msg: string, proggress: number) => {
                    this.context.log("[syncing a rule][" + Math.floor(proggress * 100) + "%]: " + msg);
                });
            });
    }
}
