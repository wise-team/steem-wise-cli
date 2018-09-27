# Steem WISE (cli tool)

[![npm](https://img.shields.io/npm/v/steem-wise-cli.svg?style=flat-square)](https://www.npmjs.com/package/steem-wise-cli) [![NpmLicense](https://img.shields.io/npm/l/steem-wise-cli.svg?style=flat-square)](https://www.npmjs.com/package/steem-wise-cli) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com) [![Chat](https://img.shields.io/badge/chat-on%20steem.chat-6b11ff.svg?style=flat-square)](https://steem.chat/channel/wise) [![Wise operations count](https://img.shields.io/badge/dynamic/json.svg?label=wise%20operations%20count&url=http%3A%2F%2Fmuon.jblew.pl%3A3000%2Foperations%3Fselect%3Dcount&query=%24%5B0%5D.count&colorB=blue&style=flat-square)](http://muon.jblew.pl:3000/operations?select=moment,delegator,voter,operation_type&order=moment.desc)

Vote delegation system for STEEM blockchain: cli tool.

Wise allows you to securely grant other users your voting power under conditions specified by you.

What is WISE? — see [steem-wise-core#how-does-wise-work](https://github.com/wise-team/steem-wise-core#how-does-wise-work) and [Manual](https://wise-team.github.io/steem-wise-manual/introduction).

Important links:

- [Wise home page](https://wise-team.github.io/steem-wise-manual/)
- [Voting page](https://wise.vote/)  — how to vote
- [Daemon installation](https://wise-team.github.io/steem-wise-manual/installation) — how to delegate
- [Wise manual](https://wise-team.github.io/steem-wise-manual/introduction) — details about wise
- [Wise core library](https://github.com/wise-team/steem-wise-core)



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

    --version                        output the version number
    -v, --verbose                    Verbose mode (log level: INFO)
    --debug                          Debug verbosity mode (log level: DEBUG)
    -c, --config-file [path]         Use specific config file
    -h, --help                       output usage information

  Commands:

    send-voteorder [voteorder]       Sends a voteorder. You can pass path to a JSON file or pass JSON directly
    upload-rules [rules]             Uploads rules to blockchain. You can pass path to a JSON file or pass JSON directly
    download-rules [options] [file]  Downloads rules from blockchain to the file. Type 'wise init --help' To get a list of the options.
    daemon [sinceBlockNum]           Reads all blocks since last confirmation (or saved state) a loop and sends votes/confirmations to blockchain
    init [options] [path]            Creates default rules.yml, config.yml, synced-block-num.txt in specified location. Type 'wise init --help' To get a list of the options.
```



## How to install

To install WISE CLI:

1. Install NodeJS
2. Install wise cli tool: `npm install -g steem-wise-cli`
3. Setup wise configuration files: `$ wise init`

Detailed instructions on how to install CLI and how to become a delegator (sync the rules and run the daemon) are here: https://wise-team.github.io/steem-wise-manual/installation. 

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



### Uploading rules (wise upload-rules)

```bash
$ wise upload-rules --help

  Usage: upload-rules [options] [rules]

  Uploads rules to blockchain. You can pass path to a JSON file or pass JSON directly

  Options:

    -h, --help  output usage information
```

This command synchronises the rules with the blockchain. It calculates the difference between provided rules and the rules that are present on the blockchain. It sends only those set_rules operations that are needed to make the rules on the blockchain up-to-date with the provided ones.

There are three ways to pass the rules to the command:

1. Yaml file: `$ wise upload-rules rules.yml` — See [rules.yml details](#rules.yml).

2. JSON file: `$ wise upload-rules rules.json` — See [JSON rules details](#JSON-rules).

3. Inline JSON:

   ```bash
   $ wise -c [path/to/config.json] upload-rules "[{\"name\": \"rulesetA\", \"rules\": [...]},{\"name\": \"Another ruleset\", \"rules\": [...]}]"
   ```

### Downloading rules (wise download-rules)

```bash
$ wise download-rules --help

  Usage: download-rules [options] [file]

  Downloads rules from blockchain to the file. Type 'wise download-rules --help' To list options.

  Options:

    -f, --format <format>  Format of the output file (yml|json) [yml] (default: yml)
    -o, --override         Override the file if it exists. If this option is not set you will be prompted.
    -a, --account          Account to download rules from
    --stdout               Print rules to stdout
    -h, --help             output usage information
```

This command synchronises the rules with the blockchain. It calculates the difference between provided rules and the rules that are present on the blockchain. It sends only those set_rules operations that are needed to make the rules on the blockchain up-to-date with the provided ones.

There are three ways to pass the rules to the command:

1. Yaml file: `$ wise upload-rules rules.yml` — See [rules.yml details](#rules.yml).

2. JSON file: `$ wise upload-rules rules.json` — See [JSON rules details](#JSON-rules).

3. Inline JSON:

   ```bash
   $ wise -c [path/to/config.json] upload-rules "[{\"name\": \"rulesetA\", \"rules\": [...]},{\"name\": \"Another ruleset\", \"rules\": [...]}]"
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



### Sending a voteorder (wise send-voteorder)

```bash
$ wise send-voteorder --help

  Usage: send-voteorder [options] [voteorder]

  Sends a voteorder. You can pass path to a JSON file or pass JSON directly

  Options:

    -h, --help  output usage information
```

This command sends a voteorder. You can either pass a link to YAML/JSON file, or you can pass an inline JSON.

This is the format of the voteorder:

```yaml
rulesetName: Vote WISEly
author: noisy
permlink: >-
  what-we-can-say-about-steem-users-based-on-traffic-generated-to-steemprojects-com-after-being-3-days-on-top-of-trending-page
delegator: steemprojects1
weight: 100
```

The JSON format and inline JSON is analogous. Inline JSON has to be escaped.



## Configuration files

### config.yml

Example config.yml file:

```yaml
username: jblew
postingWif: '' # you will be asked for it every time it is needed, because it is left blank
defaultRulesPath: rules.yml
syncedBlockNumFile: synced-block-num.txt
```

First of all - you don't need any config file. If you do not supply it - you will be asked for every property that is required by the task you are running. You can also omit or leave blank every property in the config file. For example if you leave empty username or postingWif - you will be asked for it when a command needs to broadcast some operations to blockchain.

Available properties in config file:

- **username** - your username. Optional. If not specified - you will be prompted when it is needed.
- **postingKey** - your posting key. Optional. Leave it blank if you do not want to store your key. If you leave it blank - you will be prompted.
- **defaultRulesPath** - path to rules.json/rules.yml that will be used for uploading/downloading rules if you do not specify other path in appropriate command.
- **syncedBlockNumFile** - this file is read by the daemon and updared each time it finishes processing a block. Thanks to this file the daemon can return to work after being shut down or interrupted.
- **disableSend** - Optional. By default set to false. This can be used for debugging wise CLI. Especially handy when used with --debug flag.

### rules.yml

You can write rules both in YaML or JSON format. Yaml is more human readable and it is the default format.

A detailed **[guide on writing rules](https://wise-team.github.io/steem-wise-manual/rules)** can be found in [manual](https://wise-team.github.io/steem-wise-manual/rules).

```yaml
- voter: jblew
  rulesets:
    - name: Vote only before payout for poor posts
      description: "You can use my full vote for \
        any post, that is not older than 7 days and \
        has payout less than 9.5 SBD"
      rules:
        - rule: weight
          min: 0
          max: 10000
        - rule: age_of_post
          mode: younger_than
          unit: day
          value: 7
        - rule: payout
          mode: less_than
          value: 9.5
```



#### JSON rules

An example of rules.json:

```json
[
    {
        "voter": "nicniezgrublem",
        "rulesets": [
            {
                "name": "Wise moderation team",
                "description": "You can use my full vote for any post, that is has not been voted on by any of your team peers and has no more than 100 voters.",
                "rules": [{
                        "rule": "weight",
                        "min": 0,
                        "max": 10000
                    },
                    {
                        "rule": "voters",
                        "mode": "none",
                        "usernames": [
                            "noisy", "perduta", "jblew", "smashedturtle", "andrej.cibik"
                        ]
                    },
                    {
                        "rule": "votes_count",
                        "mode": "less_than",
                        "value": 100
                    }
                ]
            }
        ]
    }
]
```



### synced-block-num.txt

This file is read by the daemon and updared each time it finishes processing a block. Thanks to this file the daemon can return to work after being shut down or interrupted.



## Security

### How is the posting key stored

There are two ways of storing your posting key. You can put it into the config file and then - it is written on your hard drive and possibly accessible to other programs on your computer. Another way is to omit the postingKey property in config file. When you do so - you will be prompted for posting key every time you use a wise command that needs it. In this mode your posting key is only stored in the volatile (RAM) memory of your computer and is not accessible to other programs (can be read only by the currently running wise cli tool) and will be lost after the tool exits.



## Wise daemon in docker mode

This is very a very handy way to run the daemon. You do not need to install anything. Docker image is not accessible through Docker hub, but you need only to clone this repository, **adjust the settings in docker-compose.yml file** (enter your username and posting key) and exec `docker-compose up`. That is all, what is needed to have a running daemon!

```bash
# First, clone the repo
$ git clone https://github.com/wise-team/Steem-wise-cli
$ cd Steem-wise-cli

# Enter (1) username and (2) posting key, (3) current block number as WISE_DEFAULT_SYNC_START_BLOCK_NUM (you can find what is current block e.g. num at steemd.com)
$ nano docker-compose.yml

# Run it! : The preferred way to run it is to use docker-compose (as it requires some config, and a volume). Iterating over blocks is quite slow (~ 3-6x), so it is good idea to adjust WISE_DEFAULT_SYNC_START_BLOCK_NUM in docker-compose.yml file, which will be used if the compose stack is run for the first time.
$ docker-compose up
```

Here is how the docker-compose.yml file looks like:

```yaml
version: "3"
services:
  wise-daemon:
    build:
      context: .
      dockerfile: Dockerfile
    command: bash -c "wise sync-rules rules.json && wise daemon"
    environment:
      WISE_STEEM_USERNAME: guest123
      WISE_STEEM_POSTINGWIF: 5JRaypasxMx1L97ZUX7YuC5Psb5EAbF821kkAGtBj7xCJFQcbLg
      WISE_DEFAULT_SYNC_START_BLOCK_NUM: 23085852
    volumes:
      - ${PWD}/samples/sample-rules.json:/app/rules.json:ro
      - wise_synced_block_num_volume:/wise-synced-block-num.txt
volumes:
  wise_synced_block_num_volume:
```

A block number that you can see above is the number of block, in which there is the first WISE transaction. See: it all started in a memorable 23085852 :D . If you are running the daemon for the first time - change it to the number of an recent block. Thenks to that you will not have to wait for a long time until the daemon comes to current blocks. It is important to change this env BEFORE YOU RUN THE DAEMON. After starting the daemon docker-compose creates a volume (named `wise_synced_block_num_volume`) that holds the number of block. If you would like to **change the number of block that will be synchronised**: delete that volume (`docker volume rm wise_synced_block_num_volume`) , change the value in docker-compose.yml file and run docker-compose up once again.



## Where to get help?

Feel free to talk with us on our #wise channel on steem.chat: https://steem.chat/channel/wise .
You can also contact Jędrzej at jedrzejblew@gmail.com.

You can also ask questions as issues in appropriate repository: See [issues for this repository](https://github.com/wise-team/steem-wise-core/issues).



## Contribute to steem Wise

We welcome warmly:

- Bug reports via [issues](https://github.com/wise-team/steem-wise-cli/issues).
- Enhancement requests via via [issues](https://github.com/wise-team/steem-wise-cli/issues).
- [Pull requests](https://github.com/wise-team/steem-wise-cli/pulls)
- Security reports to _jedrzejblew@gmail.com_.

**Before** contributing please **read [Wise CONTRIBUTING guide](https://github.com/wise-team/steem-wise-cli/blob/master/CONTRIBUTING.md)**.

Thank you for developing it together!



## Like the project? Let @wise-team become your favourite witness!

If you use & appreciate our software — you can easily support us. Just cast a vote for "wise-team" on your steem account. You can do it here: [https://steemit.com/~witnesses](https://steemit.com/~witnesses).



<!-- Prayer: Gloria Patri, et Filio, et Spiritui Sancto, sicut erat in principio et nunc et semper et in saecula saeculorum. Amen. In te, Domine, speravi: non confundar in aeternum. -->