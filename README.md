# Steem WISE Cli

Vote delegation system for STEEM blockchain: cli tool for delegators.

More **general info** on the system ( why-s & how-s) can be found in core repository: [github.com/noisy-witness/steem-wise-core](https://github.com/noisy-witness/steem-wise-core). Other components of WISE system are listed there.

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

If you use & appreciate our software — you can easily support us. Just cast a vote for "noisy-witness" on your steem account. You can do it here: \[https://steemit.com/~witnesses\](https://steemit.com/~witnesses).

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
