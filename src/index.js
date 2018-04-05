#!/usr/bin/env node
'use strict';

var package_json = require('../package.json');


const program = require('commander');
var commandWasRun = false;
//console.log(program);

program
    .name('smartvotes')
    .version(package_json.version, '-v, --version')
    .option('-c, --config-file', 'Use specific config file');

program
    .command('sync-rules')
    .description('Synchronize rules from config file to blockchain')
    .action(function(){
        console.log("sync-rules not yet supported");
        commandWasRun = true;
    });

program
    .command('sync-votes')
    .description('Send issued votes to blockchain')
    .action(function(){
        console.log("sync-votes not yet supported");
        commandWasRun = true;
    });

program
    .command('sync-all')
    .description('sync-rules + sync-votes')
    .action(function(){
        console.log("sync-all not yet supported");
        commandWasRun = true;
    });

program
    .command('daemon')
    .description('sync-all in a loop')
    .action(function(){
        console.log("daemon not yet supported");
        commandWasRun = true;
    });

program.parse(process.argv);
if(!commandWasRun) {
    program.outputHelp();
}