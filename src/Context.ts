import { Log } from "./log";

export class Context {
    public stdout: NodeJS.WritableStream;
    public stderr: NodeJS.WritableStream;
    public stdin: NodeJS.ReadableStream;
    public log: (msg: string) => void;
    public error: (msg?: string, error?: any) => void;
    public debug: (msg: string) => void;
    public info: (msg: string) => void;
    public exception: (exception: Error, level?: string) => void;

    public constructor() {
        this.stdout = process.stdout;
        this.stdin = process.stdin;
        this.stderr = process.stderr;
        this.log = console.log;
        this.error = console.error;
        this.debug = Log.log().debug;
        this.info = Log.log().info;
        this.exception = (exception: Error, level?: string) => Log.log().exception(level || Log.level.error, exception);
    }
}