import * as fs from "fs";
import { expect, use as chaiUse } from "chai";
import * as chaiAsPromised from "chai-as-promised";
import "mocha";
import * as _ from "lodash";
import { d } from "../../util/util";
import * as nock from "nock";
import * as BluebirdPromise from "bluebird";
import Wise, { DirectBlockchainApi, SetRulesForVoter } from "steem-wise-core";
import * as yaml from "js-yaml";

chaiUse(chaiAsPromised);

import { CliTestHelper } from "../../_test/CliTestHelper.test";

describe("$ wise download-rules", function() {
    this.timeout(17000);
    const account = "guest123";

    let helper: CliTestHelper;
    beforeEach(async () => {
        helper = new CliTestHelper();
        await helper.testSetup();
    });

    afterEach(async () => {
        await helper.testTeardown();
        nock.restore();
    });

    ["json", "yml"].forEach(format =>
        it("Downloads rules in helper.getTmpDir() " + format, async () => {
            const rulesFile = helper.getTmpDir() + "/rules." + format;

            const { app } = helper
                .setArgs(["download-rules", "--format", format, "--override", "--account", account, rulesFile])
                .mockCliTest();

            const appPromise: Promise<string> = app.run();
            const testPromise: Promise<void> = (async () => {
                const sTimeMs = Date.now();
                const downloadedRules: SetRulesForVoter[] = (await new Wise(
                    "",
                    new DirectBlockchainApi(Wise.constructDefaultProtocol())
                ).downloadAllRulesets(account)).map(esr => _.omit(esr, "moment") as SetRulesForVoter);
                await BluebirdPromise.delay(Math.max(10000 - (Date.now() - sTimeMs), 0));
                helper.endStdin();

                const stdout = helper.getStdoutLines().join("\n");
                expect(stdout).to.match(new RegExp("Downloading rules set by @" + account));

                let savedRules: any;
                if (format === "json") {
                    savedRules = JSON.parse(fs.readFileSync(rulesFile).toString());
                } else {
                    savedRules = yaml.safeLoad(fs.readFileSync(rulesFile).toString());
                }

                expect(savedRules).to.deep.equal(downloadedRules);
            })();
            const result = await Promise.all([appPromise, testPromise]);

            expect(result[0]).to.match(new RegExp("Rules saved to file (.*)." + format));
        })
    );
});
