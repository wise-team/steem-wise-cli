import { expect, use as chaiUse } from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as fs from "fs";
import "mocha";
import * as _ from "lodash";
import { d } from "../../util/util";
import * as nock from "nock";
import * as uuid from "uuid/v4";
import * as mocks from "./mocks.test";
chaiUse(chaiAsPromised);

import { CliTestHelper } from "../../_test/CliTestHelper.test";
import { StaticConfig } from "../../config/StaticConfig";
import { Config } from "../../config/Config";
import { fstat } from "fs";
import { VoteorderWithDelegator } from "./SendVoteorderAction";

describe("$ wise send-voteorder", () => {
    let helper: CliTestHelper;
    beforeEach(async () => {
        helper = new CliTestHelper();
        await helper.testSetup();
    });

    afterEach(async () => {
        await helper.testTeardown();
    });

    const sampleConfig: Config = {
        ...StaticConfig.DEFAULT_CONFIG,
        username: `steemprojects2`,
        postingWif: `5Jdkd1vodKzavARhUBdhWh3GRot5xo2ykgvBPBZ15RKBWP7mTi2`,
        defaultRulesPath: "rules.json",
        defaultSyncStartBlockNum: Math.floor(_.random(3, 8) * 1000000),
        steemApi: `http://fancy.hostname.${uuid()}.wise:8900/`,
    };

    const nockOptions: nock.Options = {
        allowUnmocked: false,
    };
    nock.disableNetConnect();

    it("sends voteorder without error", async function() {
        this.timeout(7000);
        const voteorder: VoteorderWithDelegator = {
            delegator: "jblew",
            rulesetName: "test-ruleset",
            permlink: "permlink-" + uuid(),
            author: "jblew",
            weight: Math.floor(_.random(-10000, 10000)),
        };
        const voteorderStr = JSON.stringify(voteorder);
        const configFilePath = helper.writeFile("config.json", JSON.stringify({ ...sampleConfig }));

        const { app } = helper.setArgs(["-c", configFilePath, "send-voteorder", voteorderStr]).mockCliTest();

        const nockScope = nock(sampleConfig.steemApi, nockOptions)
            // .log(console.log)
            .persist()
            .post("/", mocks.jblew_account_history_request_matcher(voteorder.delegator))
            .reply(200, (uri: any, rqBody: any) => mocks.jblew_account_history_response)
            .post("/", mocks.dgop_matcher())
            .reply(200, (uri: any, rqBody: any) => mocks.dgop_response)
            .post("/", mocks.getblock_1_matcher())
            .reply(200, (uri: any, rqBody: any) => mocks.getblock_1_response)
            .post("/", (body: any) => {
                if (
                    !(
                        body.params[0] === "network_broadcast_api" &&
                        body.params[1] === "broadcast_transaction_synchronous"
                    )
                )
                    return false;
                const broadcastTx = body.params[2][0];
                // console.log(broadcastTx);
                const wiseOp = broadcastTx.operations[0];
                return wiseOp[0] === "custom_json" && wiseOp[1].id === "wise";
            })
            .reply(200, (uri: any, rqBody: any) => mocks.broadcast_response_missingRequiredAutority);

        try {
            await app.run();
            expect.fail("Should throw");
        } catch (error) {
            expect(error + "").to.contain("missing required posting authority");
        }

        expect(nockScope.isDone()).to.be.true;
    });
});
