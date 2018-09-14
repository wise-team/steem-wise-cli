import * as fs from "fs";
import * as _ from "lodash";

import { Wise, DirectBlockchainApi, SendVoteorder, SteemOperationNumber } from "steem-wise-core";

import { Log } from "../log"; const log = Log.getLogger();
import { ConfigLoader, Config } from "../config/Config";
import { PrioritizedFileObjectLoader } from "../util/PrioritizedFileObjectLoader";


export class SendVoteorderAction {
    public static doAction(config: Config, voteorderIn: string): Promise<string> {
        return SendVoteorderAction.loadVoteorder(config, voteorderIn)
        .then(rawVoteorder => SendVoteorderAction.sendVoteorder(config, rawVoteorder))
        .then((moment: SteemOperationNumber) => {
            return "Voteorder sent: " + moment;
        });
    }

    private static loadVoteorder(config: Config, voteordetIn: string): Promise<object> {
        const voteorderPaths: string [] = [];

        if (voteordetIn && voteordetIn.length > 0) {
            try {
                let data: object | undefined = undefined;
                const input: object = JSON.parse(voteordetIn);
                data = input  as { loadedObject: object | undefined, path: string | undefined};

                return Promise.resolve(data); // succes parsing inline json
            }
            catch (error) {
                log.debug("Failed to parse " + voteordetIn + " as inline JSON. Proceeding to loading files. " + voteorderPaths + " will be loaded as file.");
                voteorderPaths.unshift(voteordetIn);
            }
        }

        return PrioritizedFileObjectLoader.loadFromFilesNoMerge({}, voteorderPaths, "voteorder")
        .then((result: { loadedObject: object | undefined; path: string | undefined } | undefined) => {
            if (!result || !result.loadedObject) throw new Error("Could not load rulesets from any of the files: " + _.join(voteorderPaths, ", "));
            return result.loadedObject;
        });
    }

    private static sendVoteorder(config: Config, rawVoteorder: object): Promise<SteemOperationNumber> {
        return Promise.resolve()
        .then(() => ConfigLoader.askForCredentialsIfEmpty(config))
        .then(() => {
            const voteorder: VoteorderWithDelegator = rawVoteorder as VoteorderWithDelegator;
            console.log(JSON.stringify(voteorder));
            if (!voteorder.delegator || voteorder.delegator.length == 0) throw new Error("You must specify delegator in voteorder JSON");

            const api: DirectBlockchainApi = new DirectBlockchainApi(config.postingWif);
            if (config.disableSend) api.setSendEnabled(false);
            const wise = new Wise(config.username, api);

            return wise.sendVoteorder(voteorder.delegator, voteorder, undefined, (msg: string, proggress: number) => {
                console.log("[voteorder sending][" + Math.floor(proggress * 100) + "%]: " + msg);
            });
        });
    }
}

export interface VoteorderWithDelegator extends SendVoteorder {
    delegator: string;
}