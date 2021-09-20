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

    
    res.render('pages/home', {
		title: 'HOMD :: Human Oral Microbiome Database',
		pgname: 'home',  //for AbountThisPage 
		config :  JSON.stringify({hostname:CFG.HOSTNAME, env:CFG.ENV}),
		ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
		
	});
});

router.get('/download', (req, res) => {
    
    res.render('pages/download', {
		title: 'HOMD :: Human Oral Microbiome Database',
		pgname: 'download',  //for AbountThisPage 
		config :  JSON.stringify({hostname:CFG.HOSTNAME, env:CFG.ENV}),
		ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
		
	});
});


router.get('/poster', (req, res) => {
    
    res.render('pages/poster', {
		title: 'HOMD :: Human Oral Microbiome Database',
		pgname: 'poster',  //for AbountThisPage 
		config :  JSON.stringify({hostname:CFG.HOSTNAME, env:CFG.ENV}),
		ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
		
	});
});
router.get('/oralgen', (req, res) => {
    
    res.render('pages/oralgen', {
		title: 'HOMD :: Human Oral Microbiome Database',
		pgname: 'oralgen',  //for AbountThisPage 
		config :  JSON.stringify({hostname:CFG.HOSTNAME, env:CFG.ENV}),
		ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
		
	});
});

router.post('/site_search', (req, res) => {
	helpers.accesslog(req, res)
	console.log('in POST -Search')
	console.log(req.body)
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
	let search_txt = req.body.intext.toLowerCase()
	// pure numeric would be: otid
	let tax_search_lst = [] 
	//if(Number.isInteger(parseInt(search_txt))){
	   // search Object.keys(C.taxon_lookup)
	   
	// convert to text and true if includes
	let otid_lst = Object.keys(C.taxon_lookup).filter(item => ((item+'').includes(search_txt)))  // searches the otid only
	let gid_lst = Object.keys(C.genome_lookup).filter(item => ((item.toLowerCase()+'').includes(search_txt))) 

	// lets search the taxonomy names
	//test_val = 'rhiz' // only 9 grep results
	let taxon_lst = Object.values(C.taxon_lineage_lookup).filter( function(e){
	  if(Object.keys(e).length !== 0){
		//console.log(e)
		if(e.domain.toLowerCase().includes(search_txt) 
		|| e.phylum.toLowerCase().includes(search_txt) 
		 || e.klass.toLowerCase().includes(search_txt)
		  || e.order.toLowerCase().includes(search_txt)
		   || e.family.toLowerCase().includes(search_txt)
			|| e.genus.toLowerCase().includes(search_txt)
			 || e.species.toLowerCase().includes(search_txt)
			  || e.subspecies.toLowerCase().includes(search_txt)){
		  return e
		}
	  }
	  //
	})
	//  Now get the otids
	let taxon_otid_obj = {}
	let taxon_otid_lst = taxon_lst.map(e => e.otid)      
	for(n in taxon_otid_lst){
	   let otid = taxon_otid_lst[n]
	   taxon_otid_obj[otid]= {'genus':C.taxon_lineage_lookup[otid].genus,'species':C.taxon_lineage_lookup[otid].species}
	}
	
	// search help pages
	let dir = path.join(process.cwd(), 'public', 'static_help_files' )
	// https://www.npmjs.com/package/find-in-files
	// var result2 = findInFiles.find(search_txt, dir, '.ejs$')
// 		.then(function(help_page_results) {
//         console.log(help_page_results)
//         
//         res.render('pages/homd/search_result', {
// 			title: 'HOMD :: Site Search', 
// 			config : JSON.stringify({hostname:CFG.HOSTNAME,env:CFG.ENV}), 
// 			ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
// 			search_text: search_txt,
// 			otid_list: JSON.stringify(otid_lst),
// 			gid_list: JSON.stringify(gid_lst),
// 			taxon_otid_obj: JSON.stringify(taxon_otid_obj),
// 			help_pages: JSON.stringify(help_page_results)
// 	    });
//         
//      
//     });
    //  Now the phage db
    // phageID, phage:family,genus,species, host:genus,species, ncbi ids
    //console.log(C.phage_lookup['HPT-000001'])
    let phage_id_lst = Object.keys(C.phage_lookup).filter(item => ((item+'').includes(search_txt))) 
    let phage_db = Object.values(C.phage_lookup).filter( function(e){
        if(e.family_ncbi.toLowerCase().includes(search_txt) 
          || e.genus_ncbi.toLowerCase().includes(search_txt)
          || e.species_ncbi.toLowerCase().includes(search_txt)
          || e.host_ncbi.toLowerCase().includes(search_txt)){
          return e
        }
    })
    let phage_name_lst = phage_db.map(e => e.pid)   
    console.log(phage_name_lst)

	res.render('pages/homd/search_result', {
		title: 'HOMD :: Site Search', 
		pgname: 'site_search_result',  //for AbountThisPage 
		config : JSON.stringify({hostname:CFG.HOSTNAME,env:CFG.ENV}), 
		ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
		search_text: search_txt,
		otid_list: JSON.stringify(otid_lst),
		gid_list: JSON.stringify(gid_lst),
		taxon_otid_obj: JSON.stringify(taxon_otid_obj),
		//help_pages: JSON.stringify(lst),
		phage_id_list: JSON.stringify(phage_id_lst),  // phageIDs
		phage_name_list: JSON.stringify(phage_name_lst)          // family,genus,species,host
		
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