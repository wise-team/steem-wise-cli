import * as fs from "fs";
import * as _ from "lodash";
import * as yaml from "js-yaml";

import { Log } from "../log";

export class PrioritizedFileObjectLoader {
    public static loadFromFiles<T>(defaultObject: T, filePaths: string [], descriptionForWarnings: string): Promise<{ loadedObject: T, path: string | undefined }> {
        return PrioritizedFileObjectLoader._loadFromFiles(defaultObject, filePaths, descriptionForWarnings, true)
        .then((result: {loadedObject: T | undefined, path: string | undefined }) => {
            if (!result.loadedObject) throw new Error("PrioritizedFileObjectLoader.loadFromFiles: result is null. Maybe the default object was null?");
            return { loadedObject: result.loadedObject, path: result.path };
        });
    }

    public static loadFromFilesNoMerge<T>(defaultObject: T, filePaths: string [], descriptionForWarnings: string): Promise<{ loadedObject: T | undefined, path: string | undefined }> {
        return PrioritizedFileObjectLoader._loadFromFiles(defaultObject, filePaths, descriptionForWarnings, false);
    }

    private static _loadFromFiles<T>(defaultObject: T, filePaths: string [], descriptionForWarnings: string, merge: boolean = true): Promise<{ loadedObject: T | undefined, path: string | undefined }> {
        return Promise.resolve().then(() => {
            for (let i = 0; i < filePaths.length; i++) {
                const filePath = filePaths[i];
                if (fs.existsSync(filePath)) {
                    Log.log().debug("Trying to read " + descriptionForWarnings + " from " + filePath);
                    let fileContents: string;
                    try {
                        fileContents = fs.readFileSync(filePath, "utf8").toString();
                    }
                    catch (error) {
                        Log.log().debug("Could not read " + descriptionForWarnings + " file (" + filePath + "): " + error.message);
                        continue; // continue to next file
                    }
                    // if continue was not called, try to load as JSON:
                    try {
                        const loadedObj = JSON.parse(fileContents) as T;
                        Log.log().debug("Successfully parsed " + filePath + " as JSON");
                        if (merge) return { loadedObject: _.merge({}, defaultObject, loadedObj), path: filePath };
                        else return { loadedObject: loadedObj, path: filePath };
                    }
                    catch (error) {
                        Log.log().debug("Failed to parse " + descriptionForWarnings + " (" + filePath + ") as JSON: " + error.message);
                    }
                    // try to load as YAML:
                    try {
                        const loadedObj = yaml.safeLoad(fileContents) as T;
                        Log.log().debug("Successfully parsed " + filePath + " as YAML");
                        if (merge) return { loadedObject: _.merge({}, defaultObject, loadedObj), path: filePath };
                        else return { loadedObject: loadedObj, path: filePath };
                    }
                    catch (error) {
                        Log.log().debug("Failed to parse " + descriptionForWarnings + " (" + filePath + ") as YAML: " + error.message);
                        throw new Error("The " + descriptionForWarnings + " file " + filePath + " is malformed. Failed to parse it as JSON or YAML.");
                    }
                }
            }
            Log.log().warn("No " + descriptionForWarnings + " was loaded");
            if (merge) return { loadedObject: defaultObject, path: undefined };
            else return { loadedObject: undefined, path: undefined };
        });
    }
}