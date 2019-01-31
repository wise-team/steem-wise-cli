import * as fs from "fs";
import * as BluebirdPromise from "bluebird";
import * as yaml from "js-yaml";
import { expect, use as chaiUse } from "chai";
import * as chaiAsPromised from "chai-as-promised";
import "mocha";
import * as nock from "nock";
import * as _ from "lodash";
chaiUse(chaiAsPromised);

import { CliTestHelper } from "../../_test/CliTestHelper";

import { StaticConfig } from "../../config/StaticConfig";
import { DefaultRules } from "../../config/DefaultRules";

describe("$ wise init", () => {
    let helper: CliTestHelper;
    beforeEach(async () => {
        helper = new CliTestHelper();
        await helper.testSetup();
    });

    afterEach(async () => {
        await helper.testTeardown();
    });

    const account = "guest123";
    const postingKey = "857rytegfd";
    const headBlockNum = 8765432;

    [false, true].forEach(storePassword =>
        it("Scenario: ask for everything, store password=" + storePassword, async () => {
            let stdoutPtr = 0;

            const steemRpcNock = nock(StaticConfig.DEFAULT_CONFIG.steemApi)
                .post("/", (body: any) => _.isEqual(body.params, ["database_api", "get_dynamic_global_properties", []]))
                .reply(200, (uri: any, rqBody: any) => ({
                    jsonrpc: "2.0",
                    id: rqBody.id,
                    result: { head_block_number: headBlockNum },
                }));

            const { app } = helper.setArgs(["init", helper.getTmpDir()]).mockCliTest();

            const appPromise: Promise<string> = app.run();
            const testPromise: Promise<void> = (async () => {
                await BluebirdPromise.delay(60);
                expect(helper.getStdoutLines()[stdoutPtr]).to.match(/username/);
                stdoutPtr = helper.getStdoutLines().length;
                expect(helper.getStderrLines().length).to.equal(0);
                helper.writeToStdin(account + "\n");

                await BluebirdPromise.delay(30);
                expect(helper.getStdoutLines()[stdoutPtr]).to.match(
                    /Would you like to store your posting key in the config file/
                );
                stdoutPtr = helper.getStdoutLines().length;
                expect(helper.getStderrLines().length).to.equal(0);
                helper.writeToStdin((storePassword ? "yes" : "no") + "\n");

                if (storePassword) {
                    await BluebirdPromise.delay(30);
                    expect(helper.getStdoutLines()[stdoutPtr]).to.match(/Enter your steem posting key Wif/);
                    stdoutPtr = helper.getStdoutLines().length;
                    expect(helper.getStderrLines().length).to.equal(0);
                    helper.writeToStdin(postingKey + "\n");
                }

                helper.endStdin();
                await BluebirdPromise.delay(50);
                const stdout = helper
                    .getStdoutLines()
                    .slice(stdoutPtr)
                    .join("\n");
                expect(stdout).to.match(new RegExp("HEAD block number is " + headBlockNum));
                expect(stdout).to.match(new RegExp("Account name: " + account));
                if (storePassword) expect(stdout).to.match(/Your posting key is saved to config file/);
                expect(stdout).to.match(new RegExp("Daemon will start synchronisation from block " + headBlockNum));
                expect(stdout).to.match(/Writing (.*)\/config.yml/);
                expect(stdout).to.match(/Writing (.*)\/synced-block-num.txt/);
                expect(stdout).to.match(/Writing (.*)\/rules.yml/);

                const loadedConfig = yaml.safeLoad(fs.readFileSync(helper.getTmpDir() + "/config.yml").toString());
                expect(loadedConfig).to.deep.equal({
                    username: account,
                    postingWif: storePassword ? postingKey : "",
                    steemApi: StaticConfig.DEFAULT_CONFIG.steemApi,
                    defaultSyncStartBlockNum: headBlockNum,
                    defaultRulesPath: "rules.yml",
                    syncedBlockNumFile: "synced-block-num.txt",
                    disableSend: false,
                });

                expect(yaml.safeLoad(fs.readFileSync(helper.getTmpDir() + "/rules.yml").toString())).to.deep.equal(
                    DefaultRules.DEFAULT_RULES
                );
                expect(fs.readFileSync(helper.getTmpDir() + "/synced-block-num.txt").toString()).to.equal(
                    headBlockNum + ""
                );
            })();
            await Promise.all([appPromise, testPromise]);
        })
    );
});
