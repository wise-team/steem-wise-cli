# Steem WISE (cli tool)

[![npm](https://img.shields.io/npm/v/steem-wise-cli.svg?style=flat-square)](https://www.npmjs.com/package/steem-wise-cli) [![NpmLicense](https://img.shields.io/npm/l/steem-wise-cli.svg?style=flat-square)](https://www.npmjs.com/package/steem-wise-cli) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com) [![Chat](https://img.shields.io/badge/chat-on%20steem.chat-6b11ff.svg?style=flat-square)](https://steem.chat/channel/wise) [![Wise operations count](https://img.shields.io/badge/dynamic/json.svg?label=wise%20operations%20count&url=http%3A%2F%2Fmuon.jblew.pl%3A3000%2Foperations%3Fselect%3Dcount&query=%24%5B0%5D.count&colorB=blue&style=flat-square)](http://muon.jblew.pl:3000/operations?select=moment,delegator,voter,operation_type&order=moment.desc)

Vote delegation system for STEEM blockchain: cli tool.

Wise allows you to securely grant other users your voting power under conditions specified by you.

What is WISE? — see [steem-wise-core#how-does-wise-work](https://github.com/noisy-witness/steem-wise-core#how-does-wise-work) and [Handbook](https://noisy-witness.github.io/steem-wise-handbook/introduction).

Important links:

- [Wise home page](https://noisy-witness.github.io/steem-wise-handbook/)
- [Voting page](https://wise.vote/)  — how to vote
- [Daemon installation](https://noisy-witness.github.io/steem-wise-handbook/installation) — how to delegate
- [Wise handbook (manual)](https://noisy-witness.github.io/steem-wise-handbook/introduction) — details about wise
- [Wise core library](https://github.com/noisy-witness/steem-wise-core)



### Definitions

- **Delegator** — a user who owns the voting power and allows the voter to use it.
- **Voter** — a user who votes using the account of the delegator (with delegator's voting power)
- **Daemon** — a service that is running on delegator's server, that receives vote orders sent by the voter and decides weather to vote as the voter asked, or to reject the voteorder.
- ***Wise platform*** *(planned)* — an alternative to the daemon, which allows a user to be a delegator without setting up the daemon (instead the daemon is operated by us). Wise platform is under development now.
- **Ruleset** — named set of rules under which specified voter can vote with the delegator's account. Ruleset has a name, has a voter defined and has zero or more rules specified.
- **Voteorder** — a request from the voter to the delegator to vote for a given post. Contains name of the ruleset, author and permlink of the post.



## The WISE CLI

This is a fully featured tool for using WISE system. It allows to perform all possible Wise operations. Possible commands are:

```bash
$ wise
 Usage: wise [options] [command]

  Options:

    --version                   output the version number
    -v, --verbose               Verbose mode (log level: INFO)
    --debug                     Debug verbosity mode (log level: DEBUG)
    -c, --config-file [path]    Use specific config file
    -h, --help                  output usage information

  Commands:

    send-voteorder [voteorder]  Sends a voteorder. You can pass path to a JSON file or pass JSON directly
    sync-rules [rules]          Synchronize rules from config file to blockchain. You can pass path to a JSON file or pass JSON directly
    daemon [sinceBlockNum]      Reads all blocks since last confirmation (or saved state) a loop and sends votes/confirmations to blockchain
    init [options] [path]       Creates default rules.yml, config.yml, synced-block-num.txt in specified location. Type 'wise help init' To get a list of the options.

```



## How to install

To install WISE CLI:

1. Install NodeJS
2. Install wise cli tool: `npm install -g steem-wise-cli`
3. Setup wise configuration files: `$ wise init`

Detailed instructions on how to install CLI and how to become a delegator (sync the rules and run the daemon) are here: https://noisy-witness.github.io/steem-wise-handbook/installation. 

After installation you can:

1. Synchronise the rules (rules can be changed in rules.yml file): `$ wise sync-rules`
2. Run the daemon (which will synchronise voteorders from your voters): `$ wise daemon`

Congratulations! You are a delegator now.



## Commands

### Initialising config (wise init)

```bash
$ wise init --help

  Usage: init [options] [path]

  Creates default rules.yml, config.yml, synced-block-num.txt in specified location. Type 'wise init --help' To get a list of the options.

  Options:

    -g, --global                        Puts config and rules in home directory (~/.wise/)
    -n, --config [path]                 Specify path for config.yml [default:config.yml]
    -r, --rules [path]                  Specify path for rules.yml [defualt:rules.yml]
    -u, --username [account]            Account name
    -k, --save-posting-key              Saves private post key in config file
    -d, --dont-save-posting-key         Do not save posting key in config file
    -b, --since-block [block-num]       Number of block, from which synchronisation starts [default: head]
    -s, --synced-block-num-path [path]  Path to file, which stores number of last synced block [default: synced-block-num.txt]
    -h, --help                          output usage information
```

`wise init` creates default config files. These files are:

- config.yml — wise cli configuration (steem username, optional posting key, etc.). See [config.yml details](#config.yml).
- rules.yml — stores the rules that are synchronised to the blockchain. Storing it in file allows easy synchronisation of changes. See [rules.yml details](#rules.yml).
- synced-block-num.txt — stores the number of last processed block. Allows the daemon to continue the synchronisation from a saved point. See [synced-block-num.txt details](#synced-block-num.txt).

You can run `wise init` in two modes.

- Local mode: `$ wise init` — creates all the files in current directory
- Global mode: `$ wise init --global` — creates the files in `$HOME/.wise`.

Furthermore, you can manually specify locations of each of the files separately using command options. If any of the informations is missing, wise-init will ask you for it. But, if you specify all the files, the username, and decide weather to save posting key or not, `wise init` will not ask you for anything simply creating all necessary files.

Wise-init will ask you if you want to store your posting key, but you don't have to. If you choose not to save the posting key — you will be prompted for it when running a cli command. Read more about [security of storing the posting key](#how-is-posting-key-stored).



### Synchronising rules (wise sync-rules)

```bash
$ wise sync-rules --help

  Usage: sync-rules [options] [rules]

  Synchronize rules from config file to blockchain. You can pass path to a JSON file or pass JSON directly

  Options:

    -h, --help  output usage information
```

This command synchronises the rules with the blockchain. It calculates the difference between provided rules and the rules that are present on the blockchain. It sends only those set_rules operations that are needed to make the rules on the blockchain up-to-date with the provided ones.

There are three ways to pass the rules to the command:

1. Yaml file: `$ wise sync-rules rules.yml` — See [rules.yml details](#rules.yml).

2. JSON file: `$ wise sync-rules rules.json` — See [JSON rules details](#JSON-rules).

3. Inline JSON:

   ```bash
   $ wise -c [path/to/config.json] sync-rules "[{\"name\": \"rulesetA\", \"rules\": [...]},{\"name\": \"Another ruleset\", \"rules\": [...]}]"
   ```



### Running the daemon (wise daemon)

```bash
$ wise daemon --help

  Usage: daemon [options] [sinceBlockNum]

  Reads all blocks since last confirmation (or saved state) in a loop and sends votes/confirmations to the blockchain

  Options:

    -h, --help  output usage information
```

Starts the daemon. The daemon loops through all the block since the specified one looking for wise transactions sent by you or your voters. When it comes across a voteorder — it runs validation of the rules. If the validation is passed, the vote is cast, and confirmation is sent to the blockchain. If the validation fails — a confirm_vote is placed on the blockchain with an information why the voteorder was rejected.

Remember, that you can change and syhchronise the rules while the daemon is operating. There is no need to shut it down for rules synchronisation. The daemon will fetch your new rules and validate the subsequent voteorders using the new rules. Rules are deterministic, which means that they have their place on the blockchain timeline which is marked with a block number and transaction number. A voteorder is always validated using the rules that were the most up-to-date rules at the moment (block_num, trx_num) of the voteorder.

After each processed block the daemon saves the number of the block to the file that is specified in config.yml. The default path is "./synced-block-num.txt". When you resume the daemon — it reads the file and continues processing starting at theblock with number: read value plus one.


## Contribute to steem Wise

We welcome warmly:

- Bug reports via [issues](https://github.com/noisy-witness/steem-wise-cli/issues).
- Enhancement requests via via [issues](https://github.com/noisy-witness/steem-wise-cli/issues).
- [Pull requests](https://github.com/noisy-witness/steem-wise-cli/pulls)
- Security reports to _jedrzejblew@gmail.com_.

**Before** contributing please **read [Wise CONTRIBUTING guide](https://github.com/noisy-witness/steem-wise-cli/blob/master/CONTRIBUTING.md)**.

Thank you for developing it together!



## Like the project? Let @noisy-witness become your favourite witness!

If you use & appreciate our software — you can easily support us. Just cast a vote for "noisy-witness" on your steem account. You can do it here: [https://steemit.com/~witnesses](https://steemit.com/~witnesses).



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
