'use strict'

import express from 'express';
let router   = express.Router();
// import C from '../../public/constants.js';
// //const queries = require(app_root + '/routes/queries');
// 
// import express from 'express';
// import fs from 'fs-extra';
// import readline from 'readline';
// //import accesslog from 'access-log';
// import async from 'async';
// import util from 'util';
import path from 'path';
// import { exec, spawn } from 'child_process';
// 
// import * as helpers_taxa from './helpers_taxa.js'
// import pino from 'pino';
global.ENV = process.env;
import pino from 'pino';
//const logger = pino(); // Default raw JSON output


let pino_logfile                = path.join(ENV.LOGGING_DIR,'logs','homd-combined.log')
console.log('ENV.pino_logfile',pino_logfile)
const pino_conf = (pino) => {
    return pino({
     // https://github.com/pinojs/pino
      transport: {
        targets: [
          {
            // Outputs formatted text to the terminal
            target: 'pino-pretty', 
            level: ENV.NODE_ENV === 'production' ? 'silent' : 'debug',
            options: { 
                colorize: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname',
            }
          },
          {
            // Outputs structured JSON to a file
            target: 'pino/file',   // Outputs structured JSON to a file
            level: ENV.NODE_ENV === 'production' ? 'silent' : 'info',     // Only saves 'info' and higher severities
            options: { 
              destination: pino_logfile,  // name set in apps.js, PATH is process.env.LOGGING_DIR (in .env)
              mkdir: true 
            }
          }
        ]
      }
    });
    
}
const logger = pino_conf(pino)

export default logger;

