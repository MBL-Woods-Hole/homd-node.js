const express  	= require('express');
var router   	= express.Router();
const CFG   	= require(app_root + '/config/config');
const fs       	= require('fs-extra');
const url 		= require('url');
const path     	= require('path');
const C		  	= require(app_root + '/public/constants');
const helpers 	= require(app_root + '/routes/helpers/helpers');
const open = require('open');


router.get('/refseq_blastn', (req, res) => {
    console.log('MADEIT TO blastn-get')
    helpers.accesslog(req, res)
	res.render('pages/refseq/blastn', {
		title: 'HOMD :: BLAST', 
		config : JSON.stringify({hostname:CFG.HOSTNAME,env:CFG.ENV}),
		hostname: CFG.hostname,
		ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
		
	});
});

router.post('/refseq_blastn', (req, res) => {
    console.log('MADEIT TO blastn-post')
	console.log(req.body)
	helpers.accesslog(req, res)
	res.render('pages/refseq/blastn', {
		title: 'HOMD :: BLAST', 
		config : JSON.stringify({hostname:CFG.HOSTNAME,env:CFG.ENV}),
		hostname: CFG.HOSTNAME,
		ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
		
	});
});
//
router.get('/phylo_tree', (req, res) => {
    console.log('phylo_tree')
	console.log(req.body)
	helpers.accesslog(req, res)
	res.render('pages/refseq/phylo_tree', {
		title: 'HOMD :: Phylo Tree', 
		config : JSON.stringify({hostname:CFG.HOSTNAME,env:CFG.ENV}),
		hostname: CFG.HOSTNAME,
		ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
		
	});
});
router.get('/download', (req, res) => {
    console.log('download')
	console.log(req.body)
	helpers.accesslog(req, res)
	res.render('pages/refseq/download', {
		title: 'HOMD :: Phylo Tree', 
		config : JSON.stringify({hostname:CFG.HOSTNAME,env:CFG.ENV}),
		hostname: CFG.HOSTNAME,
		ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
		
	});
});

module.exports = router;