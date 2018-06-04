import * as fs from "fs";
import * as program from "commander";

import { objectEquals } from "./util";
import { ConfigLoader, Config } from "./Config";
import { Wise, DirectBlockchainApi, SteemOperationNumber, Synchronizer } from "steem-wise-core";


export class DaemonAction {
    public static doAction(config: Config): Promise<string> {
        const lastBlockFile = config.syncedBlockNumFile ? config.syncedBlockNumFile : "";
        const delegatorWise = new Wise(config.username, new DirectBlockchainApi(config.username, config.postingWif));

        return Promise.resolve()
        .then(() => {
            if (lastBlockFile && fs.existsSync(lastBlockFile)) {
                return new SteemOperationNumber(parseInt(fs.readFileSync(lastBlockFile, "UTF-8")) + 1, 0, 0);
            }
            else {
                return delegatorWise.getLastConfirmationMomentAsync()
                .then((moment: SteemOperationNumber | undefined) => (moment ? moment : new SteemOperationNumber(0, 0, 0)));
            }
        })
        .then((since: SteemOperationNumber) =>
            delegatorWise.runSynchronizerLoop(since, (error: Error | undefined, event: Synchronizer.Event) => {
                if (error) {
                    console.error(error);
                }

                if (event.type === Synchronizer.EventType.EndBlockProcessing) {
                    fs.writeFileSync(lastBlockFile, "" + event.blockNum);
                }
                else if (event.type === Synchronizer.EventType.StartBlockProcessing) {

                }
                else if (event.type === Synchronizer.EventType.SynchronizationStop) {

                }
                else if (event) {
                    console.log("Synchronization" + event.message);
                }
            })
        )
        .then(() => {
            return "Synchronization finished without an error";
        });
    }
}
