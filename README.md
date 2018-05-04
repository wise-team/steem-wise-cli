# steem-smartvotes-cli

[![Known Vulnerabilities](https://snyk.io/test/github/noisy-witness/steem-smartvotes-cli/badge.svg?targetFile=package.json)](https://snyk.io/test/github/noisy-witness/steem-smartvotes-cli?targetFile=package.json)

Vote delegation system for STEEM blockchain: cli tool for delegators.

More **general info** on the system ( why-s & how-s) can be found in core repository: [github.com/Jblew/steem-smartvotes-core](https://github.com/Jblew/steem-smartvotes-core). Other components of smartvotes system are listed there.



## How to use?

### Requirements
STEEM smartvotes cli is a **node.js** app, 
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
$ ./smartvotes

# Updates rules in blockchain if the file was changed
$ ./smartvotes -f [path/to/config.json] sync-rules [path/to/rulesets/file.json] 

# Updates rules in blockchain (if they were changed) using given JSON array string
$ ./smartvotes -f [path/to/config.json] sync-rules "[{\"name\": \"rulesetA\", \"rules\": [...]},{\"name\": \"Another ruleset\", \"rules\": [...]}]"

# Sends voteorder using file
$ ./smartvotes -f [path/to/config.json] send-voteorder [path/to/voteorder.json]

# Sends voteorder using given JSON object
$ ./smartvotes -f [path/to/config.json] send-voteorder "[{\"delegator\": \"...\", \"ruleset_name\": \"...\", ...}"
```

### Config file
This is the config file format:

```json
{
    "username": "",
    "postingWif": ""
}
```


## Thank you
I would like to thank [@noisy](https://steemit.com/@noisy) ([github.com/noisy](https://github.com/noisy)) who invented smartvotes 
and is a total backer of this project. 
Let the light of his wisdom shine down upon steem community for ever ;)

I also send many thanks to the authors of vendor dependencies of the project. You are the ones, who made development of this tool so joyful and smooth. Many thanks to the contributors of:

 - [steem-js](https://github.com/steemit/steem-js)
 - [node](https://nodejs.org/en/)
 - [npm](https://www.npmjs.com/)
 - [nvm](https://github.com/creationix/nvm)
 - [snyk](https://snyk.io/)
 - [docker](https://www.docker.com/)




*I owe you a lot,<br />*
 *Jędrzej*