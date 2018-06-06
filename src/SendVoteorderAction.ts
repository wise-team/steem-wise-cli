import * as fs from "fs";
import * as program from "commander";

import { ConfigLoader, Config } from "./Config";
import { Wise, DirectBlockchainApi, SendVoteorder, SteemOperationNumber } from "steem-wise-core";


export class SendVoteorderAction {
    public static doAction(config: Config, voteorderIn: string): Promise<string> {
        return SendVoteorderAction.loadJSON(config, voteorderIn)
        .then(SendVoteorderAction.sendVoteorder)
        .then((moment: SteemOperationNumber) => {
            return "Voteorder sent: " + moment;
        });
    }

    private static loadJSON(config: Config, voteorderIn: string): Promise<{config: Config, rawVoteorder: object}> {
        return new Promise(function(resolve, reject): void {
            if (!voteorderIn || voteorderIn.length == 0) throw new Error("You must specify voteorder to send (either JSON or path to JSON file)");

            let jsonStr: string = "";

            const potentialPath: string = voteorderIn;
            if (fs.existsSync(potentialPath)) {
                jsonStr = fs.readFileSync(potentialPath).toString();
            }
            else {
                jsonStr = voteorderIn;
            }

            let data: object | undefined = undefined;
            try {
                data = JSON.parse(jsonStr) as object;
            }
            catch (e) {
                reject(e);
            }
            if (data) resolve({config: config, rawVoteorder: data});
            else throw new Error("Could not load voteorder");
        });
    }

    private static sendVoteorder(input: {config: Config, rawVoteorder: object}): Promise<SteemOperationNumber> {
        return Promise.resolve()
        .then(() => {
            const voteorder: VoteorderWithDelegator = input.rawVoteorder as VoteorderWithDelegator;
            if (!voteorder.delegator || voteorder.delegator.length == 0) throw new Error("You must specify delegator in voteorder JSON");

            const wise = new Wise(input.config.username, new DirectBlockchainApi(input.config.username, input.config.postingWif));

            return wise.sendVoteorderAsync(voteorder.delegator, voteorder, (msg: string, proggress: number) => {
                console.log("[voteorder sending][" + Math.floor(proggress * 100) + "%]: " + msg);
            });
        });
    }
}

export interface VoteorderWithDelegator extends SendVoteorder {
    delegator: string;
}