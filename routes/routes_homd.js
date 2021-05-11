const express  = require('express');
var router   = express.Router();
const CFG   = require(app_root + '/config/config');
const fs       = require('fs-extra');
const url = require('url');
const path     = require('path');
const C		  = require(app_root + '/public/constants');
const helpers = require(app_root + '/routes/helpers/helpers');
const queries = require(app_root + '/routes/queries')



router.post('/site_search', (req, res) => {
	helpers.accesslog(req, res)
	console.log('in POST -Search')
	console.log(req.body)
	var search_txt = req.body.search_text
	// pure numeric would be: otid
	// 
	if(Number.isInteger(search_txt)){
	   // search Object.keys(C.taxon_lookup)
	   
	}
	/*
	Taxonomy DB - genus;species
	    TaxObjects:strain,refseqID,OTID
	Genome DB   - genus;species
		GeneObjects: SeqID
	Phage DB - host Genus;Species
		PhageObjects:
	Help Pages
	NCBI Genome Annot
	Prokka Genome Annot
	*/
	res.render('pages/homd/search_result', {
		title: 'HOMD :: Site Search', 
		config : JSON.stringify({hostname:CFG.HOSTNAME,env:CFG.ENV}), 
		ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
	});
	
	
	
});
module.exports = router;