#!/usr/bin/env node

import { Command } from 'commander';
import { version } from '../../package.json';
import { generateComponent } from '../commands/generate';
import { analyze } from '../commands/analyze';
import { initProject } from '../commands/init';
import { configureZapCircle } from '../commands/configure';
import { checkZapCircleStatus } from '../commands/status';

const program = new Command();

program
  .name('ZapCircle CLI')
  .description('Command-line tool for the ZapCircle Behavior Driven Development SDK')
  .version(version);

program
  .command('analyze <filetype> <path>')
  .description('Analyze the provided file or directory for <filetype> - such as jsx')
  .action((filetype, path) => {
    console.log(`Analyzing filetype "${filetype}" for the path "${path}"...`);
    analyze(filetype, path, {});
  });

program
  .command('generate <filetype> <pathToToml>')
  .description('Generate a file from the provided .zap.toml file')
  .action((filetype, pathToToml) => {
    console.log(`Generating "${filetype}" from "${pathToToml}"...`);
    generateComponent(filetype, pathToToml, {});
  });

program
  .command('generateTests <filetype> <pathToToml>')
  .description('Generate test files from the provided .zap.toml file')
  .action((filetype, pathToToml) => {
    console.log(`Generating tests "${filetype}" from "${pathToToml}"...`);
  });

program
  .command('configure')
  .description('Configure the ZapCircle CLI (e.g., set preferred LLMs and API keys)')
  .action(() => {
    console.log(`Configuring ZapCircle CLI...`);
    configureZapCircle();
  });

program
  .command('init')
  .description('Initialize a new project with ZapCircle')
  .action(() => {
    console.log(`Initializing new ZapCircle project...`);
    initProject();
  });

program
  .command('status')
  .description('Show the current ZapCircle configuration status')
  .action(() => {
    console.log(`Checking ZapCircle status...`);
    checkZapCircleStatus();
  });

if (require.main === module) {
  program.parse(process.argv);
}

export { program };