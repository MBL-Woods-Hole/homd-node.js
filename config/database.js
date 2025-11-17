import mysql from 'mysql2';
import fs from 'fs-extra';
//var path  = require('path');

import db_config from './db-connection.js';
//eval(fs.readFileSync('./config/db-connection.js').toString());

export const taxon_pool = mysql.createPool({
    connectionLimit : 100, //important
    host     : db_config.host,
    user     : db_config.user,
    password : db_config.password,
    socketPath : db_config.socketPath,
    database : db_config.database,
    debug    :  false
});

