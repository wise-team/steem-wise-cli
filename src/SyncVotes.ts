import * as fs from "fs";
import * as program from "commander";

import { objectEquals } from "./util";
import { ConfigLoader, Config } from "./Config";
import { SteemSmartvotes, smartvotes_ruleset, smartvotes_operation, smartvotes_voteorder } from "steem-smartvotes";


export class SyncVotes { // TODO
    public static doAction(config: Config): Promise<void> {
        throw new Error("Not yet suported");
        // return SyncVotes.loadRulesHistory(config)
        // .then(SyncVotes.loadVoteOrdersForAllUsers)
        // .then(SyncRules.loadVotesHistory)
        // .then(SyncRules.);
        // TODO include voteorder tx id in vote metadata (to prevent vote duplication)
        // TODO dig only to the newest vote with smartvotes metadata.
    }
}
