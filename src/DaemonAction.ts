import * as fs from "fs";
import * as program from "commander";

import { objectEquals } from "./util";
import { ConfigLoader, Config } from "./Config";
import { SteemSmartvotes, smartvotes_ruleset, smartvotes_operation, smartvotes_voteorder, SynchronizationResult } from "steem-smartvotes";


export class SyncVotes {
    public static doAction(config: Config): Promise<void> {
        return new Promise((resolve, reject) => {
            const smartvotes = new SteemSmartvotes(config.username, config.postingWif);
            smartvotes.synchronizeSmartvotes((error: Error | undefined, result: SynchronizationResult | undefined): void => {
                if (error) reject(error);
                else resolve();
            }, (msg: string, proggress: number): void => {
                console.log("Synchronization: " + msg);
            });
        });
    }
}
