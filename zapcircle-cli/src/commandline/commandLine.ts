#!/usr/bin/env node

import { Command } from 'commander';
import { version } from '../../package.json';
import { generateComponent } from '../commands/generate';
import { analyze } from '../commands/analyze';

const program = new Command();

program
  .name('ZapCircle CLI')
  .description('Command-line tool for the ZapCircle Behavior Driven Development SDK')
  .version(version);

// Stub for the `analyze` command
program
  .command('analyze <filetype> <path>')
  .description('Analyze the provided file or directory for <filetype> - such as jsx')
  .action((filetype, path) => {
    console.log(`Analyzing filetype "${filetype}" for the path "${path}"...`);
    analyze(filetype, path, {});
  });

// Stub for the `generate` command
program
  .command('generate <filetype> <pathToToml>')
  .description('Generate a file from the provided .zap.toml file')
  .action((filetype, pathToToml) => {
    console.log(`Generating "${filetype}" from "${pathToToml}"...`);
    generateComponent(filetype, pathToToml, {});
  });

// Stub for the `generateTests` command
program
  .command('generateTests <filetype> <pathToToml>')
  .description('Generate test files from the provided .zap.toml file')
  .action((filetype, pathToToml) => {
    console.log(`Generating tests "${filetype}" from "${pathToToml}"...`);
  });

if (require.main === module) {
  program.parse(process.argv);
}

export { program };