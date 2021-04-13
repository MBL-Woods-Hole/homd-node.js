"use strict"
const express = require('express');
var router = express.Router();


const fs   = require('fs-extra');
const path  = require('path');
const helpers = require('./helpers/helpers');
const url       = require('url');
//const ds = require('./load_all_datasets');
const CFG = require(app_root + '/config/config');
const C	  = require(app_root + '/public/constants');
var timestamp = new Date(); // getting current timestamp
//var rs_ds = ds.get_datasets( () => {  

/* GET home page. */
router.get('/', (req, res) => {

 helpers.accesslog(req, res)
 //  console.log('Timestamp:', timestamp);
//   console.log('Request Headers:', req.headers);
//   console.log('Request Query Params:', req.query); // for all query params
//   console.log('Request Path:', req.path);
//   console.log('Request Route:', req.route);
helpers.show_session(req)
res.render('pages/home', {
		title: 'HOMD :: Human Oral Microbiome Database',
		config :  JSON.stringify({hostname:CFG.HOSTNAME, env:CFG.ENV}),
		ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
		
	});
});



module.exports = router;


function get_options_by_node(node) {
  let options_obj = {
    id: node.node_id,
    text: node.taxon,
    child: 0,
    tooltip: node.rank,
  };
  if (node.children_ids.length > 0) {
    options_obj.child = 1;
    options_obj.item = [];
  }
  return options_obj;
}