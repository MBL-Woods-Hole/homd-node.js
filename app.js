"use strict"
// for newrelic: start in config.js
const config = require('./config/config');
const dbconn = require('./config/database').pool;
const path = require('path');
// explicitly makes conn global
global.DBConn = dbconn;
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

//const zlib = require('zlib');
//const sizeof = require('object-sizeof');


const home      = require('./routes/index');
const admin     = require('./routes/routes_admin');
const help      = require('./routes/routes_help');
const taxa      = require('./routes/routes_taxa');
const refseq	= require('./routes/routes_refseq');
const genomes	= require('./routes/routes_genomes');
//const jbrowse2	= require('./routes/routes_jbrowse');


const app = express();

app.set('appName', 'HOMD');
require('./config/passport')(passport, DBConn); // pass passport for configuration
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

app.use(express.static(path.join(__dirname, 'public')));
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
app.use('/genomes', genomes);
//app.use('/jbrowse2', jbrowse2);
// LAST Middleware:
app.use(function(req, res, next){
  res.status(404);

  // respond with html page
  if (req.accepts('html')) {
    res.render('pages/lost', { url: req.url });
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
/**
 * Create global objects once upon server startup
 */
const CustomTaxa  = require('./routes/helpers/taxa_class');
//const silvaTaxonomy_from_file = require('./models/homd_taxonomy_file');

//app.use(createIframe);
// this file was created from vamps taxonomy table using the python script:
//  taxonomy_csv2json.py
fs.readFile('public/data/all_silva_taxonomy.json', {"flag": 'rs'}, (err, data) => {
    if (err)
      console.log(err)
    else
      C.silva_taxonomy = new CustomTaxa(JSON.parse(data));
      //console.log(C.silva_taxonomy.taxa_tree_dict_map_by_rank["order"])
      //console.log(C.silva_taxonomy.taxa_tree_dict_map_by_id["2"])
      //console.log(C.silva_taxonomy.taxa_tree_dict["2"])
      //console.log(C.silva_taxonomy.taxa_tree_dict_map_by_db_id_n_rank["3_domain"])
      for( var d in C.silva_taxonomy){
	  // taxa_tree_dict, taxa_tree_dict_map_by_rank, taxonomy_obj, taxa_tree_dict_map_by_id, taxa_tree_dict_map_by_db_id_n_rank, taxa_tree_dict_map_by_name_n_rank
	   //console.log(d)
	 }
})

const homdTaxonomy = require('./models/homd_taxonomy_db');
const all_homd_taxonomy = new homdTaxonomy();
//console.log('silvaTaxonomy_from_file')
//console.log(silvaTaxonomy_from_file.all_silva_taxonomy)  from vamps::localhost

//console.log('C.silva_taxonomy')

//console.log(C.silva_taxonomy.taxa_tree_dict_map_by_rank["domain"])

//taxa_tree_dict_map_by_id
//console.log(C.silva_taxonomy.taxa_tree_dict_map_by_db_id_n_rank)

// all_homd_taxonomy.get_all_taxa(function(err, results) {
//     if (err)
//         throw err; // or return an error message, or something
//     else
//     {
//        console.log('Success with homd taxonomy')
//        //console.log(results)
//        C.tax_table_results = results
//        
//        
//     }
//     
// });

console.log('start here in app.js')

module.exports = app;



