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
router.get('/genome_table', (req, res) => {
	console.log('in genometable -get')

	var seqid_list;
	let myurl = url.parse(req.url, true);
	//console.log('otid',myurl.query.otid)
	var otid = myurl.query.otid
	if(['all','alloral'].indexOf(otid) == -1) {
		seqid_list = C.taxonomy_taxonlookup[otid].genomes
	}else{
		seqid_list = [] // TODO
	}
	//console.log('seqid_list',seqid_list)
	list_of_objs = []
	for(n in seqid_list)
	{

		list_of_objs.push(C.genomes_lookup[seqid_list[n]])
	}
	console.log(list_of_objs)

	res.render('pages/genome/genometable', {
		title: 'HOMD :: Genome Table', 
		hostname: CFG.hostname,
		otid: otid,  // default
		seqid_list: JSON.stringify(list_of_objs)
		
		
	});
})
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
router.get('/genome_description', (req, res) => {
	console.log('in genomedescription -get')
		/*
	1	Oral Taxon ID	191	
	2	HOMD Sequence ID	SEQF1851	
	3	HOMD Name (Genus, Species)	Propionibacterium acidifaciens	
	4	Genome Sequence Name
	(Name associated with genomic sequence)	Acidipropionibacterium acidifaciens	
	5	Comments on Name	NCBI Name : Propionibacterium acidifaciens	
	6	Culture Collection Entry Number	F0233	
	7	Isolate Origin	NA	
	8	Sequencing Status	High Coverage	
	9	NCBI Taxonomy ID	553198	
	10	NCBI Genome BioProject ID	31003	
	11	NCBI Genome BioSample ID	SAMN02436184	
	12	GenBank Accession ID	ACVN00000000.2	
	13	Genbank Assembly ID	GCA_000478805.1	
	14	Number of Contigs and Singlets	334
	15	Combined Length (bps)	3,017,605
	16	GC Percentage	70.36
	17	Sequencing Center	The Forsyth Institute - J. Craig Venter Institute	
	18	ATCC Medium Number	NA	
	19	Non-ATCC Medium	NA
	20  16S rRNA gene sequence
	21  Comments
	*/
	
	res.render('pages/genome/genomedescription', {
		title: 'HOMD :: Taxon Level', 
		hostname: CFG.hostname,
		taxonid: otid,
		data1: JSON.stringify(data1),
		data2: JSON.stringify(data2),
		data3: JSON.stringify(data3),
		data4: JSON.stringify(data4),
	});
});
module.exports = router;