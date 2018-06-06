import * as fs from "fs";
import * as program from "commander";

import { ConfigLoader, Config } from "./Config";
import { Wise, DirectBlockchainApi, SetRules, SetRulesForVoter, EffectuatedSetRules, SteemOperationNumber, SmartvotesOperation } from "steem-wise-core";
import { Rules } from "./Rules";


export class SyncRulesAction {
    public static doAction(config: Config, rulesIn: string): Promise<string> {
        return SyncRulesAction.loadJSON(config, rulesIn)
        .then(SyncRulesAction.syncRules)
        .then((result: SteemOperationNumber | true) => {
            if (result === true) return "Rules are up to date";
            else return "Rules updated: " + result;
        });
    }

    private static loadJSON(config: Config, rulesIn: string): Promise<{config: Config, rawRulesets: object []}> {
        return new Promise(function(resolve, reject): void {
            if (!rulesIn || rulesIn.length == 0) throw new Error("You must specify rules to sync (either JSON or path to JSON file)");

            let jsonStr: string = "";

            const potentialPath: string = rulesIn;
            if (fs.existsSync(potentialPath)) {
                jsonStr = fs.readFileSync(potentialPath).toString();
            }
            else {
                jsonStr = rulesIn;
            }

            let data: object [] | undefined = undefined;
            try {
                const input: object = JSON.parse(jsonStr);
                if (!(Object.prototype.toString.call(input) === "[object Array]")) throw new Error("Rules should be an array");
                data = input  as object [];
            }
            catch (e) {
                reject(e);
            }
            if (data) resolve({config: config, rawRulesets: data});
            else throw new Error("Could not load rulesets from file/json");
        });
    }

    private static syncRules(input: {config: Config, rawRulesets: object []}): Promise<SteemOperationNumber | true> {
        return Promise.resolve()
        .then(() => {
            const newRules: SetRulesForVoter [] = input.rawRulesets as SetRulesForVoter [];

            newRules.forEach((element: SetRulesForVoter) => {
                if (!element.voter) return Promise.reject(new Error("Voter should be specified for each SetRules"));
                if (!element.rulesets) return Promise.reject(new Error("Rulesets should be specified for each voter"));
            });

            const delegatorWise = new Wise(input.config.username, new DirectBlockchainApi(input.config.username, input.config.postingWif));

            return delegatorWise.diffAndUpdateRulesAsync(newRules, (msg: string, proggress: number) => {
                console.log("[syncing a rule][" + Math.floor(proggress * 100) + "%]: " + msg);
            });
        });
    }
}
