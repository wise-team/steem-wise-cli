import { AbstractUniverseLog } from "universe-log";

export class Log extends AbstractUniverseLog {

    public static log(): Log {
        return Log.INSTANCE;
    }
    private static INSTANCE: Log = new Log();

    private constructor() {
        super("steem-wise-cli");
    }

    public initialize(debug: boolean, verbose: boolean) {
        super.init([
            (debug ? "debug" : undefined ),
            (verbose ? "verbose" : undefined ),
            process.env.WISE_CLI_LOG_LEVEL,
            process.env.WISE_LOG_LEVEL,
            "info",
        ]);
    }

    public init() {
        throw new Error("Instead of #init() please call #initialize(debug, verbose) which indirectly overrides init");
    }
}
