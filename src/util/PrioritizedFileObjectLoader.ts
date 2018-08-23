import * as fs from "fs";
import * as _ from "lodash";
import * as yaml from "js-yaml";

import { Log } from "../log"; const log = Log.getLogger();

export class PrioritizedFileObjectLoader {
    public static loadFromFiles<T>(defaultObject: T, filePaths: string [], descriptionForWarnings: string): Promise<T> {
        return PrioritizedFileObjectLoader._loadFromFiles(defaultObject, filePaths, descriptionForWarnings, true)
        .then((result: T | undefined) => {
            if (!result) throw new Error("PrioritizedFileObjectLoader.loadFromFiles: result is null. Maybe the default object was null?");
            return result;
        });
    }

    public static loadFromFilesNoMerge<T>(defaultObject: T, filePaths: string [], descriptionForWarnings: string): Promise<T | undefined> {
        return PrioritizedFileObjectLoader._loadFromFiles(defaultObject, filePaths, descriptionForWarnings, false);
    }

    private static _loadFromFiles<T>(defaultObject: T, filePaths: string [], descriptionForWarnings: string, merge: boolean = true): Promise<T | undefined> {
        return Promise.resolve().then(() => {
            for (let i = 0; i < filePaths.length; i++) {
                const filePath = filePaths[i];
                if (fs.existsSync(filePath)) {
                    log.debug("Trying to read " + descriptionForWarnings + " from " + filePath);
                    let fileContents: string;
                    try {
                        fileContents = fs.readFileSync(filePath, "utf8").toString();
                    }
                    catch (error) {
                        log.debug("Could not read " + descriptionForWarnings + " file (" + filePath + "): " + error.message);
                        continue; // continue to next file
                    }
                    // if continue was not called, try to load as JSON:
                    try {
                        const loadedObj = JSON.parse(fileContents) as T;
                        log.debug("Successfully parsed " + filePath + " as JSON");
                        if (merge) return _.merge({}, defaultObject, loadedObj);
                        else return loadedObj;
                    }
                    catch (error) {
                        log.debug("Failed to parse " + descriptionForWarnings + " (" + filePath + ") as JSON: " + error.message);
                    }
                    // try to load as YAML:
                    try {
                        const loadedObj = yaml.safeLoad(fileContents) as T;
                        log.debug("Successfully parsed " + filePath + " as YAML");
                        if (merge) return _.merge({}, defaultObject, loadedObj);
                        else return loadedObj;
                    }
                    catch (error) {
                        log.debug("Failed to parse " + descriptionForWarnings + " (" + filePath + ") as YAML: " + error.message);
                        throw new Error("The " + descriptionForWarnings + " file " + filePath + " is malformed. Failed to parse it as JSON or YAML.");
                    }
                }
            }
            log.warn("No " + descriptionForWarnings + " was loaded");
            if (merge) return defaultObject;
            else return undefined;
        });
    }
}