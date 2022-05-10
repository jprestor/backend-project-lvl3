#!/usr/bin/env node
import { Command } from 'commander/esm.mjs';
import { cwd, exit } from 'process';
import pageLoader from '../src/index.js';

const program = new Command();

program
  .description('Page loader utility')
  .version('1.0.0')
  .arguments('<url>')
  .option('-o, --output [dir]', 'output dir (default: "/home/user/current-dir")', cwd())
  .action((url, options) => {
    pageLoader(url, options.output)
      .then((path) => console.log(path))
      .catch((e) => {
        if (e.response) {
          console.error(`${e.message}, path: ${e.response.request.path}`);
        } else {
          console.error(e.message);
        }
        exit(1);
      });
  });

program.parse();
