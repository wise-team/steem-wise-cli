import { expect, use as chaiUse } from "chai";
import * as chaiAsPromised from "chai-as-promised";
import "mocha";
import * as _ from "lodash";
import { Command } from "commander";
chaiUse(chaiAsPromised);

import { App } from "./app";


const execArgs = [ "node", "index.js" ];

describe("App", () => {
    it("on no command emits Error with incorrect_command", async () => {
        let app = new App(new Command(), [ ...execArgs ]);
        await expect(app.run()).to.be.rejectedWith(Error, "Incorrect command");

        app = new App(new Command(), [ ...execArgs ]);
        try {
            await app.run();
        }
        catch (error) {
            expect(error).to.haveOwnProperty("incorrect_command");
        }
    });

    it("on wrong command emits Error with incorrect_command", async () => {
        let app = new App(new Command(), [ ...execArgs, "non-existent-command" ]);
        await expect(app.run()).to.be.rejectedWith(Error, "Incorrect command");

        app = new App(new Command(), [ ...execArgs ]);
        try {
            await app.run();
        }
        catch (error) {
            expect(error).to.haveOwnProperty("incorrect_command");
        }
    });
});