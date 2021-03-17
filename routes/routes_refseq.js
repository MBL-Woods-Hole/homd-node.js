const express  	= require('express');
var router   	= express.Router();
const CFG   	= require(app_root + '/config/config');
const fs       	= require('fs-extra');
const url 		= require('url');
const path     	= require('path');
const C		  	= require(app_root + '/public/constants');
const helpers 	= require(app_root + '/routes/helpers/helpers');
const open = require('open');


router.get('/refseqBLASTN', (req, res) => {
    console.log('MADEIT TO blastn-get')
	res.render('pages/refseq/blastn', {
		title: 'HOMD :: Taxon Table', 
		hostname: CFG.hostname,
		
	});
});

router.post('/refseqBLASTN', (req, res) => {
    console.log('MADEIT TO blastn-post')
	console.log(req.body)
	res.render('pages/refseq/blastn', {
		title: 'HOMD :: Taxon Table', 
		hostname: CFG.hostname,
		
	});
});

module.exports = router;