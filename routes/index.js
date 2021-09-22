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
    // renders the overall downlads page
    res.render('pages/download', {
		title: 'HOMD :: Human Oral Microbiome Database',
		pgname: 'download',  //for AbountThisPage 
		config :  JSON.stringify({hostname:CFG.HOSTNAME, env:CFG.ENV}),
		ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
		
	});
});
//
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

	// Genomes
	let all_gid_obj_list = Object.values(C.genome_lookup)
	//let gid_lst = Object.keys(C.genome_lookup).filter(item => ((item.toLowerCase()+'').includes(search_txt))) 
    var gidkeylist = Object.keys(all_gid_obj_list[0])
    let gid_obj_lst = all_gid_obj_list.filter(function (el) {
          for(var n in gidkeylist){
             if(Array.isArray(el[gidkeylist[n]])){
                 //we're missing any arrays
             }else{
             if( (el[gidkeylist[n]]).toLowerCase().includes(search_txt)){
               return el.gid
             }
             }
          }
    });
    var gid_lst = gid_obj_lst.map(e => e.gid)
    
    // OTID
    let all_otid_obj_list = Object.values(C.taxon_lookup)
	var otidkeylist = Object.keys(all_otid_obj_list[0])
    let otid_obj_lst = all_otid_obj_list.filter(function (el) {
          for(var n in otidkeylist){
             //console.log( el[otidkeylist[n]] )
             if(Array.isArray(el[otidkeylist[n]])){
                 //we're missing any arrays
             }else{
               if((el[otidkeylist[n]]).toLowerCase().includes(search_txt)){
                 return el.otid
               }
             }
          }
    });
	let otid_lst = otid_obj_lst.map(e => e.otid)
	
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
	for(var n in taxon_otid_lst){
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
    // PHAGE
	let all_phage_obj_list = Object.values(C.phage_lookup)
	//let gid_lst = Object.keys(C.genome_lookup).filter(item => ((item.toLowerCase()+'').includes(search_txt))) 
    //console.log(all_phage_obj_list[0])
    var pidkeylist = Object.keys(all_phage_obj_list[0])
    let pid_obj_lst = all_phage_obj_list.filter(function (el) {
          for(var n in pidkeylist){
             //console.log(pidkeylist[n]+'-'+search_txt)
             if(Array.isArray(el[pidkeylist[n]])){
                 //we're missing any arrays
             }else{
             if((el[pidkeylist[n]]).toLowerCase().includes(search_txt)){
               return el.pid
             }
             }
          }
    });
    //console.log(pid_obj_lst)
    var phage_id_lst = pid_obj_lst.map(e => e.pid)
    

	res.render('pages/search_result', {
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