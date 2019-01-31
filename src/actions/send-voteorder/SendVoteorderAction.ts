import * as fs from "fs";
import * as _ from "lodash";

import { Wise, DirectBlockchainApi, SendVoteorder, SteemOperationNumber } from "steem-wise-core";

import { Log } from "../../log";
import { ConfigLoader, Config } from "../../config/Config";
import { PrioritizedFileObjectLoader } from "../../util/PrioritizedFileObjectLoader";
import { Context } from "../../Context";

export class SendVoteorderAction {
    private context: Context;
    public constructor(context: Context) {
        this.context = context;
    }

    public doAction(config: Config, voteorderIn: string): Promise<string> {
        return this.loadVoteorder(config, voteorderIn)
            .then(rawVoteorder => this.sendVoteorder(config, rawVoteorder))
            .then((moment: SteemOperationNumber) => {
                return "Voteorder sent: " + moment;
            });
    }

    private loadVoteorder(config: Config, voteordetIn: string): Promise<object> {
        const voteorderPaths: string[] = [];

        if (voteordetIn && voteordetIn.length > 0) {
            try {
                let data: object | undefined = undefined;
                const input: object = JSON.parse(voteordetIn);
                data = input as { loadedObject: object | undefined; path: string | undefined };

                return Promise.resolve(data); // succes parsing inline json
            } catch (error) {
                this.context.debug(
                    "Failed to parse " +
                        voteordetIn +
                        " as inline JSON. Proceeding to loading files. " +
                        voteorderPaths +
                        " will be loaded as file."
                );
                voteorderPaths.unshift(voteordetIn);
            }
        }

        return PrioritizedFileObjectLoader.loadFromFilesNoMerge({}, voteorderPaths, "voteorder").then(
            (result: { loadedObject: object | undefined; path: string | undefined } | undefined) => {
                if (!result || !result.loadedObject)
                    throw new Error("Could not load rulesets from any of the files: " + _.join(voteorderPaths, ", "));
                return result.loadedObject;
            }
        );
    }

    private sendVoteorder(config: Config, rawVoteorder: object): Promise<SteemOperationNumber> {
        return Promise.resolve()
            .then(() => ConfigLoader.askForCredentialsIfEmpty(config))
            .then(() => {
                const voteorder: VoteorderWithDelegator = rawVoteorder as VoteorderWithDelegator;
                this.context.log(JSON.stringify(voteorder));
                if (!voteorder.delegator || voteorder.delegator.length == 0)
                    throw new Error("You must specify delegator in voteorder JSON");

                const api: DirectBlockchainApi = new DirectBlockchainApi(
                    Wise.constructDefaultProtocol(),
                    config.postingWif,
                    { url: config.steemApi }
                );
                if (config.disableSend) api.setSendEnabled(false);
                const wise = new Wise(config.username, api);

                return wise.sendVoteorder(voteorder.delegator, voteorder, (msg: string, proggress: number) => {
                    this.context.log("[voteorder sending][" + Math.floor(proggress * 100) + "%]: " + msg);
                });
            });
    }
}

export interface VoteorderWithDelegator extends SendVoteorder {
    delegator: string;
}
