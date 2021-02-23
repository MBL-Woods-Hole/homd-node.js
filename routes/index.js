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

//var rs_ds = ds.get_datasets( () => {  

/* GET home page. */
router.get('/', (req, res) => {
show_session(req)
res.render('pages/home', {
		title: 'HOMD :: Human Oral Microbiome Database',
		hostname: CFG.hostname 
	});
});



module.exports = router;

function show_session(req){
	console.log('(Availible for when sessions are needed) req.session: ')
    console.log(req.session)
    console.log(req.sessionID)
    console.log(req.session.id)
}
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