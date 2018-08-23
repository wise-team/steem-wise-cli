import * as fs from "fs";
import * as _ from "lodash";
import * as program from "commander";

import { Log } from "../log"; const log = Log.getLogger();
import { ConfigLoader, Config } from "../config/Config";
import { Wise, DirectBlockchainApi, SetRules, SetRulesForVoter, EffectuatedSetRules, SteemOperationNumber, SmartvotesOperation } from "steem-wise-core";
import { Rules } from "../types/Rules";
import { StaticConfig } from "../config/StaticConfig";
import { PrioritizedFileObjectLoader } from "../util/PrioritizedFileObjectLoader";


export class SyncRulesAction {
    public static doAction(config: Config, rulesIn: string): Promise<string> {
        return SyncRulesAction.loadRules(config, rulesIn)
        .then((rawRulesets: object []) => SyncRulesAction.syncRules(config, rawRulesets))
        .then((result: SteemOperationNumber | true) => {
            if (result === true) return "Rules are up to date";
            else return "Rules updated: " + result;
        });
    }

    private static loadRules(config: Config, rulesIn: string): Promise<object []> {
        const rulesPaths: string [] = _.cloneDeep(StaticConfig.DEFAULT_RULES_FILE_PATHS);

        if (rulesIn && rulesIn.length > 0) {
            try {
                let data: object [] | undefined = undefined;
                const input: object = JSON.parse(rulesIn);
                if (!(Object.prototype.toString.call(input) === "[object Array]")) throw new Error("Rules should be an array");
                data = input  as object [];

                return Promise.resolve(data); // succes parsing inline json
            }
            catch (error) {
                log.debug("Failed to parse " + rulesIn + " as inline JSON. Proceeding to loading files. Adding " + rulesIn + " as top-priority file.");
                rulesPaths.unshift(rulesIn);
            }
        }

        return PrioritizedFileObjectLoader.loadFromFilesNoMerge([], rulesPaths, "rules")
        .then((result: object [] | undefined) => {
            if (!result) throw new Error("Could not load rulesets from any of the files: " + _.join(rulesPaths, ", "));
            if (!(Object.prototype.toString.call(result) === "[object Array]")) throw new Error("Rules should be an array");
            return result;
        });
    }

    private static syncRules(config: Config, rawRulesets: object []): Promise<SteemOperationNumber | true> {
        return Promise.resolve()
        .then(() => {
            const newRules: SetRulesForVoter [] = rawRulesets as SetRulesForVoter [];

            newRules.forEach((element: SetRulesForVoter) => {
                if (!element.voter) return Promise.reject(new Error("Voter should be specified for each SetRules"));
                if (!element.rulesets) return Promise.reject(new Error("Rulesets should be specified for each voter"));
            });

            const api: DirectBlockchainApi = new DirectBlockchainApi(config.username, config.postingWif);
            if (config.disableSend) api.setSendEnabled(false);
            const delegatorWise = new Wise(config.username, api);

            return delegatorWise.diffAndUpdateRulesAsync(newRules, (msg: string, proggress: number) => {
                console.log("[syncing a rule][" + Math.floor(proggress * 100) + "%]: " + msg);
            });
        });
    }
}
