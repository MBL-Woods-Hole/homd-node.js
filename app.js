"use strict"
// for newrelic: start in config.js
const winston = require('winston');
const config = require('./config/config');
const taxdbconn = require('./config/database').taxon_pool;
const gendbconn = require('./config/database').genome_pool;
const path = require('path');
// explicitly makes conn global
global.TDBConn = taxdbconn;
global.GDBConn = gendbconn;
global.app_root = path.resolve(__dirname);
const C		= require('./public/constants');
const fs = require('fs-extra');
//const createIframe = require("node-iframe");
const express = require('express');

const router = express.Router();
const session = require('express-session');
const passport = require('passport');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const flash = require('express-flash');
//const favicon = require('serve-favicon');
const async = require('async')
//const zlib = require('zlib');
//const sizeof = require('object-sizeof');


const home      = require('./routes/index');
const admin     = require('./routes/routes_admin');
const help      = require('./routes/routes_help');
const taxa      = require('./routes/routes_taxa');
const refseq	= require('./routes/routes_refseq');
const genome	= require('./routes/routes_genome');
const virome	= require('./routes/routes_virome');
//const jbrowse2	= require('./routes/routes_jbrowse');


const app = express();



app.set('appName', 'HOMD');
require('./config/passport')(passport, TDBConn); // pass passport for configuration
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//app.engine('html', require('ejs').renderFile);
//
// MIDDLEWARE  <-- must be in correct order:
app.use(logger('dev'));
//app.use(bodyParser({limit: 1024000000 })); // 1024MB
// app.use(bodyParser({uploadDir:'./uploads'}));
//app.use(createIframe);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true,         // allows for richer json like experience https://www.npmjs.com/package/qs#readme
    limit: '50mb',          // size of body
    parameterLimit: 1000000 // number of parameters
}));
app.use(session({
  secret: 'gtf34ds',
  resave: true,
  saveUninitialized: true,
  cookie: { maxage:6000 }
  //store: new mongoStore({
  //  mongooseConnection: mongoose.connection,
   // collection: 'sessions' // default
  //})
}));
//app.use(expressSanitizer()); // this line follows bodyParser() instantiations
//app.use(expressSanitized()); // this line follows bodyParser()
// app.use(expressValidator()); // this line must be immediately after any of the bodyParser middlewares!

app.use(express.static('public'));
//app.use(express.static(config.jbrowse_data));
app.set('jbdata', config.jbrowse_data);
app.use(express.static('tmp'));
//app.use('/genomes', express.static(__dirname + 'jbrowse2/static/js'))
//upload.single('singleInputFileName')
//app.use(upload.single('singleInputFileName'));  // for multipart uploads: files

app.use(cookieParser());

//app.use(compression());
/**
 * maxAge used to cache the content, # msec
 * to "uncache" some pages: http://stackoverflow.com/questions/17407770/express-setting-different-maxage-for-certain-files
 */
//app.use(express.static( 'public', {maxAge: '24h' }));
//app.use(express.static('tmp'));

//app.use(express.static('jbrowse2/static/js'));
//path.join(__dirname, 'public', 'javascripts')
//app.use('data', express.static(path.join(__dirname, 'public', 'data')));

// ROUTES:
app.use('/', home);
//app.use('/tax', tax);
app.use('/admin', admin);
app.use('/help', help);
app.use('/taxa', taxa);
app.use('/refseq', refseq);
app.use('/genome', genome);
app.use('/virome', virome);
//app.use('/jbrowse2', jbrowse2);
// LAST Middleware:
app.use(function(req, res, next){
  res.status(404);

  // respond with html page
  if (req.accepts('html')) {
    res.render('pages/lost', { url: req.url,title:'HOMD Lost' });
    return;
  }

  // respond with json
  if (req.accepts('json')) {
    res.send({ error: 'Not found' });
    return;
  }

  // default to plain-text. send()
  res.type('txt').send('Not found');
});
/*
 * Create global objects once upon server startup
 */
const CustomTaxa  = require('./routes/helpers/taxa_class');

// scripts to create this data::
// homd-scripts/homd_init_data.py
//
var data_init_files =[
	
	C.taxon_lookup_fn,
    C.lineage_lookup_fn ,
 	C.tax_hierarchy_fn,  // gives you taxonomy lineage
	C.genome_lookup_fn,
	C.refseq_lookup_fn,
	
	C.references_lookup_fn,
	
	C.info_lookup_fn,
	
	// tax counts is not loaded here
	
	
]
 
function readAsync(file, callback) {
    fs.readFile(path.join(config.PATH_TO_DATA, file), 'utf8', callback);
}

async.map(data_init_files, readAsync, function(err, results) {
    // results = ['file 1 content', 'file 2 content', ...]
    // add the data to CONSTANTS so they are availible everywhere
    // the lookups are keyed on Oral_taxon_id
    C.taxon_lookup 			  = JSON.parse(results[0]);
    C.taxon_lineage_lookup 		= JSON.parse(results[1]);  // non-oral 'all'
    C.homd_taxonomy =  new CustomTaxa(JSON.parse(results[2]));
    C.genome_lookup 				= JSON.parse(results[3]);
    C.refseq_lookup 				= JSON.parse(results[4]);
    C.taxon_references_lookup 	= JSON.parse(results[5]);
    C.taxon_info_lookup 			= JSON.parse(results[6]);
    
    
   // C.oral_homd_taxonomy    =  new CustomTaxa(JSON.parse(results[5]));
    
    //examples
    console.log('length of C.taxonomy_taxonlookup: ',Object.keys(C.taxon_lookup).length)
    console.log('length of C.taxonomy_refslookup: ',Object.keys(C.taxon_references_lookup).length)
    console.log('length of C.taxonomy_lineagelookup: ',Object.keys(C.taxon_lineage_lookup).length)
    console.log('length of C.taxonomy_infolookup: ',Object.keys(C.taxon_info_lookup).length)
    console.log('length of C.refseq_lookup: ',Object.keys(C.refseq_lookup).length)
    for(var n in C.nonoral_homd_taxonomy){
       console.log(n)
    }
    console.log(C.homd_taxonomy.taxa_tree_dict_map_by_name_n_rank[ 'Methanobrevibacter_genus'])
    
});




console.log('start here in app.js')

module.exports = app;



