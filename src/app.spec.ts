import * as fs from "fs";
import * as os from "os";
import * as BluebirdPromise from "bluebird";
import * as rimraf_ from "rimraf";
const rimraf = BluebirdPromise.promisify(rimraf_);
import * as yaml from "js-yaml";
import { expect, use as chaiUse } from "chai";
import { stdio, MockReadable, MockWritable } from "stdio-mock";
import * as chaiAsPromised from "chai-as-promised";
import "mocha";
import * as nock from "nock";
import * as _ from "lodash";
import { Command } from "commander";
import { d } from "./util/util";
chaiUse(chaiAsPromised);

import { App } from "./app";
import { Context } from "./Context";
import { StaticConfig } from "./config/StaticConfig";
import { DefaultRules } from "./config/DefaultRules";
import Wise, { DirectBlockchainApi, EffectuatedSetRules, SetRulesForVoter } from "steem-wise-core";

const execArgs = [ "node", "index.js" ];
function createContext(stdio: { stdin: MockReadable, stderr: MockWritable, stdout: MockWritable }): Context {
    const context = new Context();
    context.stdout = stdio.stdout;
    context.stdin = stdio.stdin;
    context.stderr = stdio.stderr;
    context.log = (msg: string) => stdio.stdout.write(msg + "\n");
    context.error = (msg?: string, error?: Error) => stdio.stderr.write((msg ? msg : "") + "\n" +
        error ? (d(error).name + ": " + d(error).message + "\n " + (d(error).stack || "")) : "");
    context.debug = (msg: string) => stdio.stdout.write(msg + "\n");
    context.info = (msg: string) => stdio.stdout.write(msg + "\n");
    context.exception = (exception: Error, level?: string) =>
        stdio.stderr.write(exception.name + ": " + exception.message + "\n " + (exception.stack || ""));
    return context;
}

describe("App", () => {
    const tmpDir = os.tmpdir() + "/wise_cli_test_" + Date.now();

    beforeEach(() => fs.mkdirSync(tmpDir));
    afterEach(async () => await rimraf(tmpDir));

    describe("$ wise", () => {
        it("on no command emits Error with incorrect_command", async function () {
            const stdioMock = stdio();
            const app = new App(createContext(stdioMock), new Command(), [ ...execArgs ]);

            try {
                await app.run();
                expect.fail("App should throw");
            }
            catch (error) {
                expect(error).to.haveOwnProperty("incorrect_command");
            }

            expect(stdioMock.stderr.data().join("\n")).to.be.a("string").with.length(0);
        });

        it("on wrong command emits Error with incorrect_command", async () => {
            const stdioMock = stdio();
            const app = new App(createContext(stdioMock), new Command(), [ ...execArgs, "nonexistent-command" ]);

            try {
                await app.run();
                expect.fail("App should throw");
            }
            catch (error) {
                expect(error).to.haveOwnProperty("incorrect_command");
            }

            expect(stdioMock.stderr.data().join("\n")).to.be.a("string").with.length(0);
        });
    });

    describe("$ wise init", () => {
        const account = "guest123";
        const postingKey = "857rytegfd";
        const headBlockNum = 8765432;

        [false, true].forEach(storePassword => it ("Scenario: ask for everything, store password=" + storePassword, async () => {
            let stdoutPtr = 0;

            const steemRpcNock = nock(StaticConfig.DEFAULT_CONFIG.steemApi)
                .post("/", (body: any) => _.isEqual(body.params, [ "database_api", "get_dynamic_global_properties", [] ]))
                .reply(200, (uri: any, rqBody: any) => ({jsonrpc: "2.0", id: rqBody.id, result: {head_block_number: headBlockNum }}));

            const stdioMock = stdio();
            const app = new App(createContext(stdioMock), new Command(), [ ...execArgs, "init", tmpDir ]);

            const appPromise: Promise<string> = app.run();
            const testPromise: Promise<void> = (async () => {
                await BluebirdPromise.delay(60);
                expect(stdioMock.stdout.data()[stdoutPtr]).to.match(/username/);
                stdoutPtr = stdioMock.stdout.data().length;
                expect(stdioMock.stderr.data().length).to.equal(0);
                stdioMock.stdin.write(account + "\n");

                await BluebirdPromise.delay(30);
                expect(stdioMock.stdout.data()[stdoutPtr]).to.match(/Would you like to store your posting key in the config file/);
                stdoutPtr = stdioMock.stdout.data().length;
                expect(stdioMock.stderr.data().length).to.equal(0);
                stdioMock.stdin.write((storePassword ? "yes" : "no") + "\n");

                if (storePassword) {
                    await BluebirdPromise.delay(30);
                    expect(stdioMock.stdout.data()[stdoutPtr]).to.match(/Enter your steem posting key Wif/);
                    stdoutPtr = stdioMock.stdout.data().length;
                    expect(stdioMock.stderr.data().length).to.equal(0);
                    stdioMock.stdin.write(postingKey + "\n");
                }

                stdioMock.stdin.end();
                await BluebirdPromise.delay(50);
                const stdout = stdioMock.stdout.data().slice(stdoutPtr).join("\n");
                expect(stdout).to.match(new RegExp("HEAD block number is " + headBlockNum));
                expect(stdout).to.match(new RegExp("Account name: " + account));
                if (storePassword) expect(stdout).to.match(/Your posting key is saved to config file/);
                expect(stdout).to.match(new RegExp("Daemon will start synchronisation from block " + headBlockNum));
                expect(stdout).to.match(/Writing (.*)\/config.yml/);
                expect(stdout).to.match(/Writing (.*)\/synced-block-num.txt/);
                expect(stdout).to.match(/Writing (.*)\/rules.yml/);

                const loadedConfig = yaml.safeLoad(fs.readFileSync(tmpDir + "/config.yml").toString());
                expect(loadedConfig).to.deep.equal({
                    username: account,
                    postingWif: (storePassword ? postingKey : ""),
                    steemApi: StaticConfig.DEFAULT_CONFIG.steemApi,
                    defaultSyncStartBlockNum: headBlockNum,
                    defaultRulesPath: "rules.yml",
                    syncedBlockNumFile: "synced-block-num.txt",
                    disableSend: false
                });

                expect(yaml.safeLoad(fs.readFileSync(tmpDir + "/rules.yml").toString())).to.deep.equal(DefaultRules.DEFAULT_RULES);
                expect(fs.readFileSync(tmpDir + "/synced-block-num.txt").toString()).to.equal(headBlockNum + "");
            })();
            await Promise.all([appPromise, testPromise]);
        }));
    });

    describe("$ wise download-rules", function () {
        this.timeout(17000);
        const account = "guest123";

        this.beforeEach(() => nock.restore());

        [ "json", "yml" ].forEach(format => it ("Downloads rules in format " + format, async () => {
            const rulesFile = tmpDir + "/rules." + format;

            const stdioMock = stdio();
            const app = new App(createContext(stdioMock), new Command(),
                [ ...execArgs, "download-rules", "--format", format, "--override", "--account", account, rulesFile ]);

            const appPromise: Promise<string> = app.run();
            const testPromise: Promise<void> = (async () => {
                const sTimeMs = Date.now();
                const downloadedRules: SetRulesForVoter [] = (await new Wise("", new DirectBlockchainApi(Wise.constructDefaultProtocol()))
                    .downloadAllRulesets(account))
                    .map(esr => _.omit(esr, "moment") as SetRulesForVoter);
                await BluebirdPromise.delay(Math.max(10000 - (Date.now() - sTimeMs), 0));
                stdioMock.stdin.end();

                const stdout = stdioMock.stdout.data().join("\n");
                expect(stdout).to.match(new RegExp("Downloading rules set by @" + account));

                let savedRules: any;
                if (format === "json") {
                    savedRules = JSON.parse(fs.readFileSync(rulesFile).toString());
                }
                else {
                    savedRules = yaml.safeLoad(fs.readFileSync(rulesFile).toString());
                }

                expect(savedRules).to.deep.equal(downloadedRules);
            })();
            const result = await Promise.all([appPromise, testPromise]);

            expect(result[0]).to.match(new RegExp("Rules saved to file (.*)\." + format));
        }));
    });
});