import * as fs from "fs";
import * as program from "commander";

import { ConfigLoader, Config } from "./Config";
import { Wise, DirectBlockchainApi, SteemOperationNumber, Synchronizer } from "steem-wise-core";
import { Constants } from "./Constants";


export class DaemonAction {
    public static doAction(config: Config, sinceBlockNum: undefined | number): Promise<string> {
        const lastBlockFile = config.syncedBlockNumFile ? config.syncedBlockNumFile : "";
        const delegatorWise = new Wise(config.username, new DirectBlockchainApi(config.username, config.postingWif));

        return Promise.resolve()
        .then(() => {
            if (sinceBlockNum) {
                return new SteemOperationNumber(sinceBlockNum, 0, 0);
            }
            else if (lastBlockFile && fs.existsSync(lastBlockFile)) {
                return new SteemOperationNumber(parseInt(fs.readFileSync(lastBlockFile, "UTF-8")) + 1, 0, 0);
            }
            else if (config.defaultSyncStartBlockNum > 0) {
                return new SteemOperationNumber(parseInt(config.defaultSyncStartBlockNum + ""), 0, 0);
            }
            else {
                return delegatorWise.getLastConfirmationMomentAsync()
                .then((moment: SteemOperationNumber | undefined) => (moment ? moment : new SteemOperationNumber(Constants.INTRODUCTION_OF_WISE_BLOCK_NUM, 0, 0)));
            }
        })
        .then((since: SteemOperationNumber) => {
            console.log("Synchronization starting at: " + since);

            delegatorWise.runSynchronizerLoop(since, (error: Error | undefined, event: Synchronizer.Event) => {
                if (error) {
                    console.error(error);
                }

                if (event.type === Synchronizer.EventType.EndBlockProcessing) {
                    try {
                        fs.writeFileSync(lastBlockFile, "" + event.blockNum, { flag: "w+" });
                        console.log("Processed block " + event.blockNum);
                    }
                    catch (error) {
                        console.error(error);
                    }
                }
                else if (event.type === Synchronizer.EventType.StartBlockProcessing) {

                }
                else if (event.type === Synchronizer.EventType.SynchronizationStop) {

                }
                else if (event.type === Synchronizer.EventType.VoteorderPassed) {
                    console.log("[Synchronization] " + event.message);
                    console.log(JSON.stringify(event.voteorder, undefined, 2));
                }
                else if (event.type === Synchronizer.EventType.VoteorderRejected) {
                    console.log("[Synchronization] " + event.message);
                    console.log(JSON.stringify(event.voteorder, undefined, 2));
                }
                else if (event) {
                    console.log("[Synchronization] " + event.message);
                }
            });

            return new Promise((resolve, reject) => { /* newer resolve */ });
        })
        .then(() => {
            return "Synchronization started...";
        });
    }
}
