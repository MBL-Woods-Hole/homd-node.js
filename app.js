"use strict"
// import dotenv from 'dotenv';
// dotenv.config();

//import dotenv from 'dotenv';
// for newrelic: start in config.js
//const winston = require('winston');
//import process.env from './config/config.js';

//import { pool } from './config/database.js';
//console.log('xx',envs)
//import { * } from './config/config.js';
//console.log(`Your DB_HOST is ${DB_HOST}`); // 8626
global.ENV = process.env;


console.log('NODE_ENV:',ENV.NODE_ENV)
import path from 'path';
const dirname = import.meta.dirname

//// SQL Connection ///////////////
// import pool from './config/database.js';
// global.TDBConn = pool 

import { getConnection } from './config/database.js';
global.TDBConn = getConnection;   // database:  homd

///////////////////////////////////

global.app_root = path.resolve(dirname);

import C from './public/constants.js';
import  * as helpers from './routes/helpers/helpers.js'


import fs from 'fs-extra';
//console.log('helpers',helpers)
//require('dotenv').config({path: __dirname + '/.env'})
//const createIframe = require("node-iframe");

import express from 'express';

const router = express.Router();
// console.log('dirname',dirname)
// console.log('process.env.LOG_DIR',process.env.LOG_DIR)
// console.log('process.env.PRODUCTION_LOG',process.env.PRODUCTION_LOG)
const logFilePath = path.join(process.env.LOG_DIR, process.env.PRODUCTION_LOG)
//import node_log from 'simple-node-logger').createSimpleFileLogger(logFilePath);
import pkg from 'simple-node-logger';
const { createSimpleFileLogger } = pkg;
var node_log = createSimpleFileLogger(logFilePath)

import session from 'express-session';

//const passport = require('passport');
//const passportConfig = require('./config/passportConfig');
//const passportConfig = require('./config/passport'); // pass passport for configuration

import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.urlencoded({
    extended: false,         // allows for richer json like experience https://www.npmjs.com/package/qs#readme
    limit: '50mb',          // size of body
    parameterLimit: 100000 // number of parameters
}));
app.use(bodyParser.json());

app.set('appName', 'HOMD');
app.set('trust proxy', true);  // now req.ip SHOULD return the requesting IP address
//app.timeout = 240000 // default is 120000
// https://blog.jscrambler.com/best-practices-for-secure-session-management-in-node
app.use(session({
  secret: 'veryimportantsecret',
  resave: false,
  saveUninitialized: false,
  //Default cookie  { path: '/', httpOnly: true, secure: false, maxAge: null }
  cookie: { 
     maxAge: 1800000  // 1 hour==3600000
  }  
  
}));

import flash from 'express-flash';

//const favicon = require('serve-favicon');
import async from 'async';

//const zlib = require('zlib');
//const sizeof = require('object-sizeof');


import home from './routes/index.js';

import taxa from './routes/routes_taxa.js';
import refseq from './routes/routes_refseq.js';
import genome from './routes/routes_genome.js';
import phage from './routes/routes_phage.js';

//const blast    = require('./routes/routes_blast');
import help from './routes/routes_help.js';

import download from './routes/routes_download.js';


// PRODUCTION: log every restart

if(process.env.NODE_ENV === 'production'){
    // const output = fs.createWriteStream('../homd-stats/restart.log', {flags : 'a'})
//     const restart_logger = new console.Console(output)
//     restart_logger.log('Restart on '+helpers.timestamp(false))
    console.log('!!Turning off console logging for production mode!!')
    console.log('To debug: run `npm run debug`')
    console.log = function() {};  // turn off console.logging
    // to see console.logs: "npm run debug"
}


//passportConfig(passport, TDBConn);
//app.use(passport.initialize());
//app.use(passport.session()); // persistent login sessions

app.use(flash());

// view engine setup
app.set('views', path.join(dirname, 'views'));
app.set('view engine', 'ejs');
//app.engine('html', require('ejs').renderFile);
//
// MIDDLEWARE  <-- must be in correct order:
//app.use(bodyParser({limit: 1024000000 })); // 1024MB
// app.use(bodyParser({uploadDir:'./uploads'}));
//app.use(createIframe);



app.use(express.static('public'));
//app.use(express.static(config.jbrowse_data));

app.use(express.static('tmp'));
//app.use('/genomes', express.static(__dirname + 'jbrowse2/static/js'))
//upload.single('singleInputFileName')
//app.use(upload.single('singleInputFileName'));  // for multipart uploads: files


/**
 * maxAge used to cache the content, # msec
 * to "uncache" some pages: http://stackoverflow.com/questions/17407770/express-setting-different-maxage-for-certain-files
 */
//app.use(express.static( 'public', {maxAge: '24h' }));
//app.use(express.static('tmp'));

//app.use(express.static('jbrowse2/static/js'));
//path.join(__dirname, 'public', 'javascripts')
app.use('/tree', express.static(process.env.PATH_TO_SS_DIRS));

// ROUTES:
app.use('/', home);
app.use('/taxa', taxa);
app.use('/refseq', refseq);
app.use('/genome', genome);
app.use('/phage', phage);
app.use('/help', help);
app.use('/download', download);

// for non-routing pages such as heatmap, counts and bar_charts
app.get('/*', function(req, res, next){
    //console.warn('req.params',req.params);
    
    // var url = req.params[0];
//     // I want to create a page like: counts_table_2014080_13452.html
//     // for each link
//     if (url === 'visuals/user_viz_data/ctable.html') { //
//         // Yay this is the File A...
//         console.warn("The user file  has been requested");
//         router.get('/visuals/user_viz_data/ctable.html',  function(req, res) {
//             console.warn('trying to open ctable.html');
//         });
//     } else {
//         // we don't care about any other file, let it download too
//         console.warn("No Route Found");
//         next();
//     }
});


// error handler middleware:
app.use((error, req, res, next) => {
  console.error(error);
  //res.status(500).send('Something Broke! Please use the browsers \'Back\' button');
  //if(process.env.ENV === 'development'){
  //if(process.env.ENV === 'production'){
  node_log.debug(error.toString())
  //}
  
  let u = req.user || {}
  res.render('pages/lost', { 
      url: req.url,
      pgname: 'lost',
      title:'HOMD Lost',
      config: JSON.stringify(process.env),
      ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),
      user: JSON.stringify(req.user || {}),
      msg: 'We\'re Sorry -- Something Broke!<br><br>If it happens again please let us know. Below is the error message:',
      trace: error.toString()
  });
  
})
// LAST Middleware:
app.use(function(req, res, next){
  //console.log('in 404; Requested: ',req.url)
  res.status(404)
  // respond with html page
  let u = req.user || {}
  if (req.accepts('html')) {
    res.render('pages/lost', { 
      url: req.url,
      pgname: 'lost',
      title:'HOMD Lost',
      config: JSON.stringify(process.env),
      ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
      user:     JSON.stringify(u),
      msg: 'Sorry -- We can\'t find the page you requested.',
      trace: JSON.stringify(req.url)
    });
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
import CustomTaxa from './routes/helpers/taxa_class.js';



// First, an array of promises are built.
// Each Promise reads the file, then calls resolve with the result.
// This array is passed to Promise.all(), which then calls the callback, 
// passing the array of results in the same order.
const promises = [
    
  helpers.readFromFile(path.join(process.env.PATH_TO_DATA, C.taxon_lookup_fn),'json'),
  helpers.readFromFile(path.join(process.env.PATH_TO_DATA, C.lineage_lookup_fn),'json') ,
  //helpers.readFromFile(path.join(process.env.PATH_TO_DATA, C.tax_hierarchy_fn),'json'),  // gives you taxonomy lineage
  helpers.readFromFile(path.join(process.env.PATH_TO_DATA, C.genome_lookup_fn),'json'),
  helpers.readFromFile(path.join(process.env.PATH_TO_DATA, C.refseq_lookup_fn),'json'),
  helpers.readFromFile(path.join(process.env.PATH_TO_DATA, C.references_lookup_fn),'json'),
  //helpers.readFromFile(path.join(process.env.PATH_TO_DATA, C.info_lookup_fn),'json'),
  helpers.readFromFile(path.join(process.env.PATH_TO_DATA, C.taxcounts_fn),'json'),
  helpers.readFromFile(path.join(process.env.PATH_TO_DATA, C.annotation_lookup_fn),'json'),
 
  helpers.readFromFile(path.join('public','data', C.image_location_locfn),'json'),  // image name and text
  helpers.readFromFile(path.join('public','data', C.image_location_taxfn),'json'),  // match image w/ otid or tax rank
  helpers.readFromFile(path.join(process.env.PATH_TO_DATA, C.contig_lookup_fn),'json'),
  
  //2024-Sept  // #10,11,12
  helpers.readFromFile(path.join(process.env.PATH_TO_DATA, C.site_lookup_fn),'json'),
  //helpers.readFromFile(path.join(process.env.PATH_TO_DATA, 'GCA_ID_no_gff.txt'),'csv'),
  helpers.readFromFile(path.join(process.env.PATH_TO_DATA, C.missing_ncbi_genomes_fn),'json'),
  helpers.readFromFile(path.join(process.env.PATH_TO_DATA, 'GCA_NO_NCBI_DB.csv'),'csv'),
  
  //Oct 2025  // #13,14,15
  helpers.readFromFile(path.join(process.env.PATH_TO_DATA, C.crispr_lookup_fn),'json'),
  helpers.readFromFile(path.join(process.env.PATH_TO_DATA, C.phage_lookup_fn),'json'),
  helpers.readFromFile(path.join(process.env.PATH_TO_DATA, C.amr_lookup_fn),'json'),
  
  //DEC 2025  // #16
  helpers.readFromFile(path.join(process.env.PATH_TO_DATA, C.abundance_fn),'json'),
  //JAN 2026  // #17
  helpers.readFromFile(path.join(process.env.PATH_TO_DATA, C.pg_lookup_fn),'json'),
    // ETC ...
];
Promise.all(promises)
 .then(results => {
    //baseList = result[0];
    //currentList = result[1];
    //console.log(results[0]['998'])
    C.taxon_lookup              = results[0];// lookup by otid  TaxonLookup
    //console.log('parsing1')
    //console.log('C.taxon_lookup1',C.taxon_lookup['374'])
    C.taxon_lineage_lookup        = results[1]; // lookup by otid  TaxonLineagelookup
   
    
    // let homd_taxonomy = Object.keys(C.taxon_lineage_lookup).map(function test(el){
//         return C.taxon_lineage_lookup[el]
//     })
    let homd_taxonomy = Object.values(C.taxon_lineage_lookup)
    //console.log(homd_taxonomy)
    C.homd_taxonomy =  new CustomTaxa(homd_taxonomy); // TaxonHierarchy
    
    C.genome_lookup         = results[2];  // lookup by gid GenomeLookup
    //console.log('parsing4')
    C.refseq_lookup             = results[3]; //  TaxonRefSeqLookup
    //console.log('parsing5')
    C.taxon_references_lookup   = results[4];   // lookup by otid TaxonReferencesLookup
    //console.log('parsing6')
    //C.taxon_info_lookup         = results[5];  // lookup by otid TaxonInfoLookup
    //console.log('parsing7')
    C.taxon_counts_lookup   = results[5];   // lookup by lineage TaxonCounts
    C.annotation_lookup     = results[6];  // AnnotationLookup
    
    C.images_loc            = results[7];   // image name and text
    C.images_tax            = results[8];   // match image w/ otid or tax rank
    C.contig_lookup         = results[9];
    
    C.site_lookup           = results[10];
    //C.no_ncbi_annotation    = results[11];
    C.no_ncbi_genomes       = results[11];
    C.no_ncbi_blast_dbs     = results[12];
    
    C.crispr_lookup         = results[13];
    C.phage_lookup          = results[14];
    C.amr_lookup             = results[15];
    C.abundance_lookup       = results[16];  // should have same taxa keys as C.taxon_counts_lookup
    C.pangenome_lookup       = results[17]
    /// END of results files
    C.dropped_taxids    = Object.values(C.taxon_lookup).filter(item => (item.status.toLowerCase() === 'dropped')).map(x => x.otid)
    C.reference_taxids = Object.values(C.taxon_lookup).filter(item => (item.status.toLowerCase() === 'reference' && item.status.toLowerCase() !== 'dropped')).map(x => x.otid)
    C.no_refseq_otids = Object.values(C.taxon_lookup).filter(item => (!C.refseq_lookup.hasOwnProperty(item.otid) && item.status.toLowerCase() !== 'dropped')).map(x => x.otid)
    C.otids_w_abundance = Object.values(C.abundance_lookup).filter(item => {
        if(item.otid != ''){
            return item.otid
        }
    }).map(x => (parseInt(x.otid)).toString())  // turns '010' to '10'
    
    C.has_abundance_data = helpers.get_has_abundance()
    
    //console.log('C.otids_w_abundance',C.otids_w_abundance)
    //console.log('')
    
    //examples
    let size = Buffer.byteLength(JSON.stringify(C.taxon_lookup))
    console.log('C.taxon_lookup #ofKeys:',Object.keys(C.taxon_lookup).length,'\t\tsize(KB):',size/1024)
    
    size = Buffer.byteLength(JSON.stringify(C.taxon_references_lookup))
    console.log('C.taxon_references_lookup #ofKeys',Object.keys(C.taxon_references_lookup).length,'\tsize(KB):',size/1024)
    //console.log(C.phage_lookup)
    size = Buffer.byteLength(JSON.stringify(C.taxon_lineage_lookup))
    console.log('C.taxon_lineage_lookup #ofKeys',Object.keys(C.taxon_lineage_lookup).length,'\tsize(KB):',size/1024)
    
    //size = Buffer.byteLength(JSON.stringify(C.taxon_info_lookup))
    //console.log('C.taxon_info_lookup #ofKeys',Object.keys(C.taxon_info_lookup).length,'\t\tsize(KB):',size/1024)
    
    size = Buffer.byteLength(JSON.stringify(C.refseq_lookup))
    console.log('C.refseq_lookup #ofKeys',Object.keys(C.refseq_lookup).length,'\t\tsize(KB):',size/1024)
    
    size = Buffer.byteLength(JSON.stringify(C.genome_lookup))
    console.log('C.genome_lookup #ofKeys',Object.keys(C.genome_lookup).length,'\t\tsize(KB):',size/1024)
    
    size = Buffer.byteLength(JSON.stringify(C.annotation_lookup))
    console.log('C.annotation_lookup #ofKeys',Object.keys(C.annotation_lookup).length,'\t\tsize(KB):',size/1024)
    
    size = Buffer.byteLength(JSON.stringify(C.taxon_counts_lookup))
    console.log('C.taxon_counts_lookup #ofKeys',Object.keys(C.taxon_counts_lookup).length,'\tsize(KB):',size/1024)
    
    size = Buffer.byteLength(JSON.stringify(C.contig_lookup))
    console.log('C.contig_lookup #ofKeys',Object.keys(C.contig_lookup).length,'\t\tsize(KB):',size/1024)
    
    size = Buffer.byteLength(JSON.stringify(C.homd_taxonomy))
    console.log('C.homd_taxonomy','\t\t\tsize(KB):',size/1024)
    
    size = Buffer.byteLength(JSON.stringify(C.site_lookup))
    console.log('C.site_lookup #ofKeys',Object.keys(C.site_lookup).length,'\t\tsize(KB):',size/1024)
    
    console.log('C.no_ncbi_genomes #of els',C.no_ncbi_genomes.length)
    console.log('C.no_ncbi_blast_dbs #of els',C.no_ncbi_blast_dbs.length)
    
    for(var n in C.homd_taxonomy){
       console.log(n)
    }
    ///////// TESTING ////////////////////////////////////////////////////////////////////
   //console.log(C.taxon_lookup)
   //class
   //helpers.print(['app data1',C.taxon_lookup[389]])
   //Absconditabacteria (SR1) [C-1]
    //console.log('C.no_ncbi_annotation',C.no_ncbi_annotation)
    //console.log('C.no_ncbi_blast_dbs',C.no_ncbi_blast_dbs)
    //console.log('C.taxon_lookup.length',Object.keys(C.taxon_lookup).length)
    //helpers.print(['lineage 673',C.taxon_lookup[673]])
    //helpers.print(['Lookup 673',C.taxon_lookup[673]])
    //console.log('refseq 12',C.refseq_lookup[12])
    //helpers.print(['SEQF10010',C.genome_lookup['SEQF10010']])
    
    //console.log('362 Correct',C.taxon_lineage_lookup[886])
    //console.log(C.homd_taxonomy.taxa_tree_dict_map_by_name_n_rank['Streptococcus oralis subsp. dentisani clade 058_species'])
    //console.log(C.homd_taxonomy.taxa_tree_dict_map_by_name_n_rank['Hornefia minuta_species'])
    //console.log('Euryarchaeota_phylum',C.homd_taxonomy.taxa_tree_dict_map_by_name_n_rank['Euryarchaeota_phylum'])
    //console.log(C.homd_taxonomy.taxa_tree_dict_map_by_rank['subspecies'])
    //console.log('id 944 phy',C.homd_taxonomy.taxa_tree_dict_map_by_id[944])
    //console.log('id 943 phy',C.homd_taxonomy.taxa_tree_dict_map_by_id[943])
    //console.log('id 30 phy',C.homd_taxonomy.taxa_tree_dict_map_by_id[30])
    //console.log('id 29 phy',C.homd_taxonomy.taxa_tree_dict_map_by_id[29])
    //console.log('id 598 class',C.homd_taxonomy.taxa_tree_dict_map_by_id[598])
    //console.log('id 599 order',C.homd_taxonomy.taxa_tree_dict_map_by_id[599])
    //console.log('id 603 fam ERR',C.homd_taxonomy.taxa_tree_dict_map_by_id[603])
    //console.log('100_species',C.homd_taxonomy.taxa_tree_dict_map_by_otid_n_rank['100_species'])
    /////////////////////////////////////////////////////////////////////////////////////
    C.taxa_with_subspecies = Object.values(C.homd_taxonomy.taxa_tree_dict_map_by_rank['subspecies']).map(x => x.otid)
    
    C.homd_stats         = helpers.calculate_homd_stats()
    
    console.log('Dropped Taxa:',C.dropped_taxids,C.dropped_taxids.length)
    console.log('Reference Taxa:',C.reference_taxids,C.reference_taxids.length)
    console.log('C.taxa_with_subspecies',C.taxa_with_subspecies,C.taxa_with_subspecies.length)
    console.log('C.no_refseq_otids',C.no_refseq_otids,C.no_refseq_otids.length)
     //console.log(JSON.stringify(C.homd_taxonomy, null, '\t'))
     
     
    //session.site_search_result = {}
    // let num_zeros = 0
//     for(n in C.homd_taxonomy.taxa_tree_dict_map_by_rank['genus']){
//        var m = C.homd_taxonomy.taxa_tree_dict_map_by_rank['genus'][n]
//        if(m.parent_id==0){
//           console.log(m)
//           num_zeros += 1
//        }
//     }
   // console.log("number
    // do more stuff
});

console.log('start here in app.js')

export default app;



