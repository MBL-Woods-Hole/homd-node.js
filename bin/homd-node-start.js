#!/usr/bin/env node
import dotenv from 'dotenv';
import app from '../app.js'

import fs from 'fs-extra';

// CL example: nodemon bin/www testing
console.log('process.argv[0]',process.argv[0]); 
console.log('process.argv[1]',process.argv[1]); 
console.log('process.argv[2]',process.argv[2]); 

const available_environments = ['testing','development','production'];
console.log( 'Set Environment in .env file as NODE_ENV');
console.log('ENV.HOSTNAME: ',ENV.HOSTNAME)

console.log("Setting Environment to: ",ENV.NODE_ENV);
console.log("Node Options: ",ENV.NODE_OPTIONS);
console.log('For Production: Use "node --max-old-space-size=8096 bin/homd-node-start" (in systemd command)')

const options = {}
let http,https;
if(ENV.SERVER_PORT === '443'){
   try {
      http = await import('node:https');
    } catch (err) {
      console.error('https support is disabled!');
    } 
   options.key = fs.readFileSync(ENV.KEY_FILE),
   options.cert= fs.readFileSync(ENV.CERT_FILE)
   
   console.log('Reading https cert files',ENV.KEY_FILE,ENV.CERT_FILE)
}else{
   try {
      http = await import('node:http');
    } catch (err) {
      console.error('http support is disabled!');
    } 
};

app.set('env', ENV.NODE_ENV);
ENV.PORT = ENV.SERVER_PORT || '3001'
console.log('PORT',ENV.PORT)
app.set('port', ENV.PORT);

console.log('SQL DATABASE: => (Databases set in config/database.js)');


console.log('ENV:',ENV.ENV,'(Environment set in ~/.env)');

const server = http.createServer(options, app).listen(app.get('port'), function(){
    //debug('Express server listening on port ' + server.address().port);
    global.ENV = process.env
    console.log(`HOMD-Node.js server is listening on ${ENV.HOSTNAME}:${process.env.PORT}`)
});
server.timeout = 100 * 1000

