import { expect, use as chaiUse } from "chai";
import * as chaiAsPromised from "chai-as-promised";
import "mocha";
chaiUse(chaiAsPromised);

import { CliTestHelper } from "./_test/CliTestHelper.test";

describe("$ wise", () => {
    let helper: CliTestHelper;
    beforeEach(async () => {
        helper = new CliTestHelper();
        await helper.testSetup();
    });

    afterEach(async () => {
        await helper.testTeardown();
    });

    it("on no command emits Error with incorrect_command", async function() {
        const { app } = helper.mockCliTest();

        try {
            await app.run();
            expect.fail("Should throw");
        } catch (error) {
            expect(error).to.haveOwnProperty("incorrect_command");
        }

        expect(helper.getStderr())
            .to.be.a("string")
            .with.length(0);
    });

    it("on wrong command emits Error with incorrect_command", async () => {
        const { app } = helper.setArgs(["nonexistent-command"]).mockCliTest();

        try {
            await app.run();
            expect.fail("App should throw");
        } catch (error) {
            expect(error).to.haveOwnProperty("incorrect_command");
        }

        expect(helper.getStderr())
            .to.be.a("string")
            .with.length(0);
    });
});
