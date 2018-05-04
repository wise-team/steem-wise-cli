import * as fs from "fs";
import * as program from "commander";

import { objectEquals } from "./util";
import { ConfigLoader, Config } from "./Config";
import { SteemSmartvotes, smartvotes_ruleset, smartvotes_operation } from "steem-smartvotes";


export class SyncRules {
    public static doAction(config: Config, rulesIn: string): Promise<void> {
        return SyncRules.loadJSON(config, rulesIn)
        .then(SyncRules.parseNewRules)
        .then(SyncRules.loadOldRules)
        .then(SyncRules.compareAndSync);
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
                data = JSON.parse(jsonStr) as object [];
            }
            catch (e) {
                reject(e);
            }
            if (data) resolve({config: config, rawRulesets: data});
            else throw new Error("Could not load rulesets");
        });
    }

    private static parseNewRules(input: {config: Config, rawRulesets: object []}): Promise<{config: Config, newRulesets: smartvotes_ruleset []}> {
        return new Promise(function(resolve, reject) {
            const rulesets: smartvotes_ruleset [] = input.rawRulesets as smartvotes_ruleset [];
            const op: smartvotes_operation = {
                name: "set_rules",
                rulesets: input.rawRulesets as smartvotes_ruleset []
            };
            if (SteemSmartvotes.validateJSON(JSON.stringify(op))) {
                resolve({config: input.config, newRulesets: rulesets});
            }
            else {
                reject(new Error("Rulesets are invalid"));
            }
        });
    }

    private static loadOldRules(input: {config: Config, newRulesets: smartvotes_ruleset []}): Promise<{config: Config, newRulesets: smartvotes_ruleset [], oldRulesets: smartvotes_ruleset []}> {
        return new Promise(function(resolve, reject) {
            console.log("Loading old rulesets...");

            SteemSmartvotes.getRulesetsOfUser(input.config.username, new Date(), function(error: Error | undefined, rulesets: smartvotes_ruleset []): void {
                if (error) reject(error);
                else resolve({config: input.config, newRulesets: input.newRulesets, oldRulesets: rulesets});
            });
        });
    }

    private static compareAndSync(input: {config: Config, oldRulesets: smartvotes_ruleset [], newRulesets: smartvotes_ruleset []}): Promise<void> {
        return new Promise(function(resolve, reject) {
            if (objectEquals(input.oldRulesets, input.newRulesets)) {
                console.log("Rulesets are up to date.");
                resolve();
            }
            else {
                console.log("Updating rulesets...");
                const smartvotes = new SteemSmartvotes(input.config.username, input.config.postingWif);
                smartvotes.sendRulesets(input.newRulesets, function(error: Error | undefined, result: any) {
                    if (error) {
                        reject(error);
                    }
                    else {
                        console.log("Rulesets sent. You can see then on https://steemd.com/@" + input.config.username + ".");
                        console.log(result);
                        resolve();
                    }

                });
            }
        });
    }
}
