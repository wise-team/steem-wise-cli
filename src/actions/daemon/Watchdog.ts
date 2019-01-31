import { DockerWatchdogServer, TimeWatchdogStrategy } from "node-docker-watchdog";

export class Watchdog {
    private heartbeat: TimeWatchdogStrategy;
    private watchdogServer: DockerWatchdogServer;

    public constructor() {
        this.heartbeat = new TimeWatchdogStrategy().setIdentitier("heartbeat watchdog");

        this.watchdogServer = new DockerWatchdogServer([this.heartbeat]);
    }

    public async start() {
        await this.watchdogServer.listen();
        this.heartbeatBeat();
    }

    public heartbeatBeat() {
        const ttlSeconds = 30 * 60; // 30 minutes
        this.heartbeat.beat(ttlSeconds * 1000);
    }
}
