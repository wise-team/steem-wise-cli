import * as fs from "fs";
import * as program from "commander";

import { objectEquals } from "./util";
import { ConfigLoader, Config } from "./Config";
import { SteemSmartvotes, smartvotes_operation, smartvotes_voteorder } from "steem-smartvotes";


export class SendVoteorder {
    public static doAction(config: Config, voteorderIn: string): Promise<void> {
        return SendVoteorder.loadJSON(config, voteorderIn)
        .then(SendVoteorder.parseJSON)
        .then(SendVoteorder.sendVoteorder);
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

    private static parseJSON(input: {config: Config, rawVoteorder: object}): Promise<{config: Config, voteorder: smartvotes_voteorder}> {
        return new Promise(function(resolve, reject) {
            const voteorder: smartvotes_voteorder = input.rawVoteorder as smartvotes_voteorder;
            const op: smartvotes_operation = {
                name: "send_voteorder",
                voteorder: voteorder
            };
            if (SteemSmartvotes.validateJSON(JSON.stringify(op))) {
                resolve({config: input.config, voteorder: voteorder});
            }
            else {
                reject(new Error("Voteorder syntax is invalid"));
            }
        });
    }

    private static sendVoteorder(input: {config: Config, voteorder: smartvotes_voteorder}): Promise<void> {
        return new Promise(function(resolve, reject) {
            console.log("Sending voteorder...");
            const smartvotes = new SteemSmartvotes(input.config.username, input.config.postingWif);
            smartvotes.sendVoteOrder(input.voteorder, function(error: Error | undefined, result: any) {
                if (error) {
                    reject(error);
                }
                else {
                    console.log("Voteorder sent. You can see it on https://steemd.com/@" + input.config.username + ".");
                    console.log(result);
                    resolve();
                }
            }, function(msg: string, proggress: number) {
                console.log("Sending voteorder: " + msg);
            });
        });
    }
}
