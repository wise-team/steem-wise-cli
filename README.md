# Steem WISE (cli tool)

[![npm](https://img.shields.io/npm/v/steem-wise-cli.svg?style=flat-square)](https://www.npmjs.com/package/steem-wise-cli) [![NpmLicense](https://img.shields.io/npm/l/steem-wise-cli.svg?style=flat-square)](https://www.npmjs.com/package/steem-wise-cli) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com) [![Chat](https://img.shields.io/badge/chat-on%20steem.chat-6b11ff.svg?style=flat-square)](https://steem.chat/channel/wise) [![Wise operations count](https://img.shields.io/badge/dynamic/json.svg?label=wise%20operations%20count&url=http%3A%2F%2Fmuon.jblew.pl%3A3000%2Foperations%3Fselect%3Dcount&query=%24%5B0%5D.count&colorB=blue&style=flat-square)](http://muon.jblew.pl:3000/operations?select=count)

Vote delegation system for STEEM blockchain: cli tool.

Wise allows you to securely grant other users your voting power under conditions specified by you.

What is WISE? — see [steem-wise-core#how-does-wise-work](https://github.com/noisy-witness/steem-wise-core#how-does-wise-work) and [Handbook](https://noisy-witness.github.io/steem-wise-handbook/introduction).

Important links:

- [Wise home page](https://noisy-witness.github.io/steem-wise-handbook/)
- [Voting page](https://wise.vote/)  — how to vote
- [Daemon installation](https://noisy-witness.github.io/steem-wise-handbook/installation) — how to delegate
- [Wise handbook (manual)](https://noisy-witness.github.io/steem-wise-handbook/introduction) — details about wise
- [Wise core library](https://github.com/noisy-witness/steem-wise-core)

## How to use?

Installation:

```bash
$ npm install -g steem-wise-cli
```

Play with samples:

```bash
npm install -g steem-wise-cli
git clone https://github.com/noisy-witness/steem-wise-cli
cd samples

# Send voteorder
wise -c ./guest123.settings.json send-voteorder ./sample-voteorder.json

# Sync rules
wise -c ./guest123.settings.json sync-rules ./sample-rules.json
```

Running the daemon:

```bash
# Daemon solo
wise -c ../path/to/your/config.json daemon

# Sync rules & daemon
wise -c ../path/to/your/config.json daemon & wise -c ../path/to/your/config.json daemon

# Using Dockerfile (no setup required!)
docker-compose up
## Configuration is done via ENV variables (in docker-compose.yml). Last synced block num is saved to Docker's named volume "wise_synced_block_num_volume"
```

### Requirements

STEEM WISE cli is a **node.js** app, 
it uses **nvm** for local node version management
and **npm** for dependencies.

In order to use app easily and safely in a standarized environment, please install the following:

- [NVM](https://github.com/creationix/nvm)

  - After installation type "nvm use" in project directory
to activate proper version of node

- [NPM](https://www.npmjs.com/)

  - Type "npm install" to install both dev & production dependencies

### Usage:

```bash
# Shows help
$ wise  # if you installed it globally
$ ./wise  # if you built it locally

# Updates rules in blockchain if the file was changed
$ wise -c [path/to/config.json] sync-rules [path/to/rulesets/file.json] 

# Updates rules in blockchain (if they were changed) using given JSON array string
$ wise -c [path/to/config.json] sync-rules "[{\"name\": \"rulesetA\", \"rules\": [...]},{\"name\": \"Another ruleset\", \"rules\": [...]}]"

# Sends voteorder using file
$ wise -c [path/to/config.json] send-voteorder [path/to/voteorder.json]

# Sends voteorder using given JSON object
$ wise -c [path/to/config.json] send-voteorder "[{\"delegator\": \"...\", \"ruleset_name\": \"...\", ...}"

# Run Delegator's synchronization daemon
$ wise -c [path/to/config.json] daemon
```

### Config file

This is the config file format:

```json
{
    "username": "",
    "postingWif": "",
    "syncedBlockNumFile": "~/.wise-synced-block-num.txt"
}
```

## Like the project? Let @noisy-witness become your favourite witness!

If you use & appreciate our software — you can easily support us. Just cast a vote for "noisy-witness" on your steem account. You can do it here: \[https://steemit.com/~witnesses](https://steemit.com/~witnesses).

## Thank you

I send many thanks to the authors of vendor dependencies of the project. You are the ones, who made development of this tool so joyful and smooth. Many thanks to the contributors of:

- [steem-js](https://github.com/steemit/steem-js)
- [node](https://nodejs.org/en/)
- [npm](https://www.npmjs.com/)
- [nvm](https://github.com/creationix/nvm)
- [snyk](https://snyk.io/)
- [docker](https://www.docker.com/)

*I owe you a lot,<br />*
 *Jędrzej*
