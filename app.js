"use strict"
// for newrelic: start in config.js
const config = require('./config/config');
const dbconn = require('./config/database').pool;
const path = require('path');
// explicitly makes conn global
global.DBConn = dbconn;
global.app_root = path.resolve(__dirname);
const C		= require('./public/constants');


const express = require('express');

const router = express.Router();
const session = require('express-session');

//const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
//const flash = require('express-flash');
//const favicon = require('serve-favicon');
const fs = require('fs-extra');
//const zlib = require('zlib');
//const sizeof = require('object-sizeof');


const home      = require('./routes/index');


const app = express();
app.set('appName', 'HOMD');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
//app.set(express.static(__dirname + 'tmp'));
// MIDDLEWARE  <-- must be in correct order:
//app.use(favicon( path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('dev'));
//app.use(bodyParser({limit: 1024000000 })); // 1024MB
// app.use(bodyParser({uploadDir:'./uploads'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true,         // allows for richer json like experience https://www.npmjs.com/package/qs#readme
    limit: '50mb',          // size of body
    parameterLimit: 1000000 // number of parameters
}));

//app.use(expressSanitizer()); // this line follows bodyParser() instantiations
//app.use(expressSanitized()); // this line follows bodyParser()
// app.use(expressValidator()); // this line must be immediately after any of the bodyParser middlewares!



//upload.single('singleInputFileName')
//app.use(upload.single('singleInputFileName'));  // for multipart uploads: files

app.use(cookieParser());

//app.use(compression());
/**
 * maxAge used to cache the content, # msec
 * to "uncache" some pages: http://stackoverflow.com/questions/17407770/express-setting-different-maxage-for-certain-files
 */
app.use(express.static( 'public', {maxAge: '24h' }));
app.use(express.static('tmp'));


// ROUTES:
app.use('/', home);



module.exports = app;
