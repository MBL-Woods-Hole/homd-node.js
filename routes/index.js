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
// router.get('/downloadPDF/:shortname', (req, res) => {
//     // downloads the requested pdf file stored in ../homd-data/
//     let shortname = req.params.shortname;
//     console.log(shortname)
//     let filename = C.posters_pdfs.filter(item => item.shortname === shortname)[0].filename
//     console.log(filename)
//     let file = path.join(CFG.PATH_TO_DATA,filename)
//     res.download(file);
//     
// });
// router.get('/downloadPDF2', (req, res) => {
//     // downloads the requested pdf file stored in ../homd-data/
//     //var EasyFtp = require('easy-ftp');
//     var http = require('http');
// 	var filepath = 'http://www.homd.org/ftp/poster/2012a.pdf'
// 	const request = http.get({uri: filepath, encoding: null}, function(resp) {
//        let data = '';
// 
// 	  // A chunk of data has been received.
// 	  resp.on('data', (chunk) => {
// 		data += chunk;
// 		
// 	  });
// 
// 	  // The whole response has been received. Print out the result.
// 	  resp.on('end', () => {
// 		//console.log(JSON.parse(data).explanation);
// 		//console.log(JSON.parse(data).explanation)
// 		var pdffile = new Buffer.concat(data)  //.toString('utf8');
// 		console.log('converted to base64');
//         response.header("Access-Control-Allow-Origin", "*");
//         response.header("Access-Control-Allow-Headers", "X-Requested-With");
//         response.header('content-type', 'application/pdf');
//         response.send(pdffile);
// 	  });
// 
// 	}).on("error", (err) => {
// 	  //console.log("Error: " + err.message);
// 	});
// 	
// 	
// // 	var request = http.get(filepath, function(response) {
// //       response.pipe(file);
// //       file.on('finish', function() {
// //          file.close(cb);  // close() is async, call cb after close completes.
// //       });
// //     }).on('error', function(err) { // Handle errors
// //         fs.unlink(dest); // Delete the file async. (But we don't check the result)
// //         if (cb) cb(err.message);
// //     });
// // 	res.download(filepath, '2012a.pdf', (err) => {
// // 			if (err) {
// // 			  res.status(500).send({
// // 				message: "Could not download the file. " + err,
// // 			  });
// // 			}
// // 	});
// 	
//     	
// });
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