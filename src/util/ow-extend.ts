import ow from "ow";
import * as fs from "fs";
import * as path from "path";

export const ow_extend = {
    fileExists: (label: string) => ow.string.label(label).minLength(1).is(filePath => {
        return fs.existsSync(filePath) || `Expected ${filePath} to be a file that exists`;
    }),
    parentDirExists: (label: string) => ow.string.label(label).minLength(1).is(filePath => {
        let parentPath: string = "";
        try {
            parentPath = path.dirname(path.normalize(filePath));
        }
        catch (error) {
            return `Expected ${filePath} to be a valid path: ${error}`;
        }
        return (fs.existsSync(parentPath) && fs.statSync(parentPath).isDirectory())
                    || `Expected ${parentPath} to be a directory that exists`;
    }),
    isValidJson: (label: string) => ow.string.label(label).minLength(1).is(v => {
        try {
            JSON.parse(v);
            return true;
        }
        catch (error) {
            return `Expected ${v} to be a valid JSON object`;
        }
    })
};