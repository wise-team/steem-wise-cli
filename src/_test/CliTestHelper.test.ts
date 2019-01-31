import { stdio as stdioMock, MockReadable, MockWritable } from "stdio-mock--fork-by-wiseteam";
import * as _ from "lodash";
import * as os from "os";
import * as fs from "fs";
import * as rimraf from "rimraf";
import ow from "ow";
import { Context } from "../Context";
import { d } from "../util/util";
import { App } from "../app";
import { Command } from "commander";
import { Config } from "../config/Config";

export class CliTestHelper {
    private static REQUIRED_EXEC_ARGS = ["node", "index.js"];
    private started: boolean = false;
    private args: string[] = [];
    private stdio: { stdin: MockReadable; stderr: MockWritable; stdout: MockWritable };
    private tmpDir: string;

    public constructor() {
        this.stdio = stdioMock();
        this.tmpDir = this.uniqueTmpDirName();
    }

    public setArgs(args: string[]): CliTestHelper {
        this.args = args;
        ow(this.args, ow.array.ofType(ow.string.nonEmpty).label("args"));
        return this;
    }

    public createTestAppContext(): Context {
        const context = new Context();
        context.stdout = this.stdio.stdout;
        context.stdin = this.stdio.stdin;
        context.stderr = this.stdio.stderr;
        context.log = (msg: string) => this.stdio.stdout.write(msg + "\n");
        context.error = (msg?: string, error?: Error) =>
            this.stdio.stderr.write(
                (msg ? msg : "") + "\n" + error
                    ? d(error).name + ": " + d(error).message + "\n " + (d(error).stack || "")
                    : ""
            );
        context.debug = (msg: string) => this.stdio.stdout.write(msg + "\n");
        context.info = (msg: string) => this.stdio.stdout.write(msg + "\n");
        context.exception = (exception: Error, level?: string) =>
            this.stdio.stderr.write(exception.name + ": " + exception.message + "\n " + (exception.stack || ""));
        return context;
    }

    public mockCliTest() {
        this.ensureSingleStart();

        const appContext = this.createTestAppContext();

        const app = new App(appContext, new Command(), [...CliTestHelper.REQUIRED_EXEC_ARGS, ...this.args]);

        return { appContext, app, stdio: this.stdio };
    }

    public async testSetup() {
        this.createTestDirectory();
    }

    public async testTeardown() {
        await this.removeRecursivelyTestDirtectory();
    }

    public getStderrLines(): string[] {
        return this.stdio.stderr.data();
    }

    public getStderr(): string {
        return this.getStderrLines().join("\n");
    }

    public getStdoutLines(): string[] {
        return this.stdio.stdout.data();
    }

    public getStdout(): string {
        return this.getStdoutLines().join("\n");
    }

    public writeToStdin(str: string) {
        this.stdio.stdin.write(str);
    }

    public endStdin() {
        this.stdio.stdin.end();
    }

    public getTmpDir(): string {
        return this.tmpDir;
    }

    public writeFile(relativeFilePath: string, contents: string): string {
        const filePath = `${this.getTmpDir()}/${relativeFilePath}`;
        fs.writeFileSync(filePath, contents, "UTF-8");
        return filePath;
    }

    private uniqueTmpDirName(): string {
        return os.tmpdir() + "/wise_cli_test_" + Date.now();
    }

    private createTestDirectory() {
        fs.mkdirSync(this.tmpDir);
    }

    private removeRecursivelyTestDirtectory(): Promise<void> {
        return new Promise((resolve, reject) => {
            rimraf(this.tmpDir, (error?: Error) => {
                if (error) reject(error);
                else resolve();
            });
        });
    }

    private ensureSingleStart() {
        if (this.started) throw new Error("You can start CliTestHelper only once");
        this.started = true;
    }
}
