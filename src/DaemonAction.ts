import * as fs from "fs";
import * as program from "commander";

import { objectEquals } from "./util";
import { ConfigLoader, Config } from "./Config";


export class DaemonAction {
    public static doAction(config: Config): Promise<string> {
        return Promise.reject(new Error("Not implemented yet"));
    }
}
