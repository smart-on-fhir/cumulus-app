#!/usr/bin/env -S node_modules/.bin/ts-node --transpile-only --skipProject

import { Command, Option }   from "commander"
import { SITES }             from "./config"
import healthCheck           from "./charts_healthcheck"
import copySubscription      from "./copy_subscription"
import copySubscriptionGroup from "./copy_subscription_group"
import configure             from "./configure"


const program = new Command();

// ./cumulus.ts charts_healthcheck
program
    .command('charts_healthcheck')
    .description('Removes chart options that should not be persisted')
    .addOption(new Option('-s, --site <id>', 'Source site identifier').makeOptionMandatory(true).choices(Object.keys(SITES)))
    .action(async ({ site }: { site: keyof typeof SITES }) => await healthCheck(site));


// ./cumulus.ts copy_subscription
program
    .command('copy_subscription')
    .description("Copies a subscription (including it's data and charts) from source to destination")
    .addOption(new Option('--id <id>', 'Source subscription ID').makeOptionMandatory(true).argParser(parseFloat))
    .addOption(new Option('-s, --src <id>', 'Source site identifier').makeOptionMandatory(true).choices(Object.keys(SITES)))
    .addOption(new Option('-d, --dst <id>', 'Destination site identifier').makeOptionMandatory(true).choices(Object.keys(SITES)))
    .action(copySubscription);


// ./cumulus.ts copy_subscription_group
program
    .command('copy_subscription_group')
    .description("Copies a subscription group (including data and charts for every included subscription) from source to destination")
    .addOption(new Option('--id <id>', 'Source subscription group ID').makeOptionMandatory(true).argParser(parseFloat))
    .addOption(new Option('-s, --src <id>', 'Source site identifier').makeOptionMandatory(true).choices(Object.keys(SITES)))
    .addOption(new Option('-d, --dst <id>', 'Destination site identifier').makeOptionMandatory(true).choices(Object.keys(SITES)))
    .action(copySubscriptionGroup);


// ./cumulus.ts configure
program
    .command("configure")
    .description("Generates or updates configuration files")
    .action(configure)


// ./cumulus.ts 
program.parseAsync(process.argv).then(() => process.exit(0)).catch(async error => {
    console.log(error.stack)
    process.exit(1)
});