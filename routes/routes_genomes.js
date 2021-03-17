const express  	= require('express');
var router   	= express.Router();
const CFG   	= require(app_root + '/config/config');
const fs       	= require('fs-extra');
const url 		= require('url');
const path     	= require('path');
const C		  	= require(app_root + '/public/constants');
const helpers 	= require(app_root + '/routes/helpers/helpers');
const open = require('open');
const createIframe = require("node-iframe");
//const JB = require('jbrowse2');
//app.use(createIframe);

router.get('/jbrowse', (req, res) => {
//router.get('/taxTable', helpers.isLoggedIn, (req, res) => {
	
	console.log('jbrowse-get')
	
	// See models/homd_taxonomy.js for C.tax_table_results
	
	//jbrowse install on my localhost mac osx:
	//https://jbrowse.org/jb2/
	// installed locally at $HOME/programming/jbrowse2
	// SHOULD THIS BE IN THE HOMD DIR???
	// GOOD: https://genomebiology.biomedcentral.com/articles/10.1186/s13059-016-0924-1
	// https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4350995/
	res.render('pages/genomes/jbrowse2_stub_iframe', {
		title: 'HOMD :: Taxon Table', 
		hostname: CFG.hostname,
		gnom: '',  // default
		genomes: JSON.stringify(C.available_jbgenomes)
	});
});
router.post('/jbrowse', (req, res) => {
//router.get('/taxTable', helpers.isLoggedIn, (req, res) => {
	
	console.log('jbrowse-post')
	
	// See models/homd_taxonomy.js for C.tax_table_results
	console.log(req.body);
	var gnom = req.body.gnom_select
	
	//res.send(JSON.stringify({'static_data':gnom}));
	res.render('pages/genomes/jbrowse2_stub_iframe', {
		title: 'HOMD :: Taxon Table', 
		hostname: CFG.hostname,
		gnom: gnom,  // default
		genomes: JSON.stringify(C.available_jbgenomes)
	});
});
router.post('/jbrowse_ajax', (req, res) => {
	console.log('AJAX JBrowse')
	console.log(req.body);
	//open(jburl)
	
	res.send(JSON.stringify({'static_data':req.body.gnom}));
});

// router.get('/iframe', (req, res) => {
// 		console.log('iframe')
// 		console.log(req.query)
// 		//jburl = '/Users/avoorhis/programming/jbrowse2/index.ejs'
// 		// res.createIframe({
// // 			url: req.query.url,
// // 			baseHref: req.query.baseHref, // optional: determine how to control link redirects,
// // 			config: { cors: { script: true } }, // optional: determine element cors or inlining #shape src/iframe.ts#L34
// // 		  });
// 		res.render('jbrowse2/index.ejs', {
// 			title: 'HOMD :: Taxon Table', 
// 			hostname: CFG.hostname,
// 			//config: '/jbrowse2/config.json'
// 		
// 		});
// });

// router.get('/GRCh38.aliases.txt', (req, res) => {
// 
// });

module.exports = router;