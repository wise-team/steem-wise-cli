import { expect, use as chaiUse } from "chai";
import * as chaiAsPromised from "chai-as-promised";
import "mocha";
import * as _ from "lodash";
import { d } from "../../util/util";
chaiUse(chaiAsPromised);

import { CliTestHelper } from "../../_test/CliTestHelper";

describe("$ wise send-voteorder", () => {
    let helper: CliTestHelper;
    beforeEach(async () => {
        helper = new CliTestHelper();
        await helper.testSetup();
    });

    afterEach(async () => await helper.testTeardown());

    describe("$ wise send-voteorder", () => {
        it("sends voteorder without error", async function() {
            const { app } = helper.mockCliTest();

            await app.run();
            // todo
        });
    });
});
