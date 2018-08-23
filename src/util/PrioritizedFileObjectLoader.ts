import * as fs from "fs";
import * as _ from "lodash";
import * as yaml from "js-yaml";

import { Log } from "../log"; const log = Log.getLogger();

export class PrioritizedFileObjectLoader {
    public static loadFromFiles<T>(defaultObject: T, filePaths: string [], descriptionForWarnings: string): Promise<T> {
        return Promise.resolve().then(() => {
            for (let i = 0; i < filePaths.length; i++) {
                const filePath = filePaths[i];
                if (fs.existsSync(filePath)) {
                    log.debug("Trying to read " + descriptionForWarnings + " from " + filePath);
                    let fileContents: string;
                    try {
                        fileContents = fs.readFileSync(filePath, "utf8").toString();
                        log.debug("--- " + descriptionForWarnings + " file contents: ---\n" + fileContents + "\n---");
                    }
                    catch (error) {
                        log.debug("Could not read " + descriptionForWarnings + " file (" + filePath + "): " + error.message);
                        continue; // continue to next file
                    }
                    // if continue was not called, try to load as JSON:
                    try {
                        const loadedObj = JSON.parse(fileContents) as T;
                        const mergedObj = _.merge({}, defaultObject, loadedObj);
                        return mergedObj;
                    }
                    catch (error) {
                        log.debug("Failed to parse " + descriptionForWarnings + " (" + filePath + ") as JSON " + error.message);
                    }
                    // try to load as YAML:
                    try {
                        const loadedObj = yaml.safeLoad(fileContents) as T;
                        const mergedObj = _.merge({}, defaultObject, loadedObj);
                        return mergedObj;
                    }
                    catch (error) {
                        log.debug("Failed to parse " + descriptionForWarnings + " (" + filePath + ") as YAML " + error.message);
                        throw new Error("The " + descriptionForWarnings + " file " + filePath + " is malformed. Failed to parse it as JSON or YAML.");
                    }
                }
            }
            log.warn("No " + descriptionForWarnings + " was loaded");
            return defaultObject;
        });
    }
}