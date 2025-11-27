#!/usr/bin/env node
import dotenv from 'dotenv';
import app from '../app.js'
const options = {}
let http,https;
try {
      http = await import('node:http');
    } catch (err) {
      console.error('http support is disabled!');
    } 
app.set('port', process.env.SERVER_PORT);

const server = http.createServer(options, app).listen(app.get('port'), function(){
    //debug('Express server listening on port ' + server.address().port);
    console.log(`HOMD-Node.js server is listening on ${ENV.HOSTNAME}:${process.env.PORT}`)
});
server.timeout = 100 * 1000

