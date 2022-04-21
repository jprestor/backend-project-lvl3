#!/usr/bin/env node
import { Command } from 'commander/esm.mjs';
import { cwd } from 'process';
import pageLoader from '../src/index.js';

const program = new Command();

program
  .description('Page loader utility')
  .version('1.0.0')
  .arguments('<url>')
  .option(
    '-o, --output [dir]',
    'output dir (default: "/home/user/current-dir")',
    cwd(),
  )
  .action((url, options) => {
    pageLoader(url, options.output).then((path) => console.log(path));
  });

program.parse();
