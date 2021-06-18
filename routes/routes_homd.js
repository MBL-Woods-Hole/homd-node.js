const express  = require('express');
var router   = express.Router();
const CFG   = require(app_root + '/config/config');
const fs       = require('fs-extra');
const url = require('url');
const path     = require('path');
const C		  = require(app_root + '/public/constants');
const helpers = require(app_root + '/routes/helpers/helpers');
const queries = require(app_root + '/routes/queries')
const findInFiles = require('find-in-files');


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
    var result2 = findInFiles.find({'term': search_txt, 'flags': 'ig'}, dir, '.ejs$')
                .then(function(help_page_results) {
		
        console.log('help_page_results',help_page_results)
        let lst = []
        for(fpath in help_page_results){
           console.log(fpath, help_page_results[fpath])
           lst.push(path.basename(fpath, path.extname(fpath)))
        }
        res.render('pages/homd/search_result', {
			title: 'HOMD :: Site Search', 
			config : JSON.stringify({hostname:CFG.HOSTNAME,env:CFG.ENV}), 
			ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
			search_text: search_txt,
			otid_list: JSON.stringify(otid_lst),
			gid_list: JSON.stringify(gid_lst),
			taxon_otid_obj: JSON.stringify(taxon_otid_obj),
			help_pages: JSON.stringify(lst),
	    });
        
     });
   
    
      // console.log('res2',result2); // Code depending on result
    
   
	//console.log(taxon_lst,'taxon_lst',taxon_lst.length)
	//console.log(taxon_lst2,'taxon_lst2',taxon_lst2.length)
	//console.log('110',C.taxon_lineage_lookup[110])

	

	
	
});
//
//
router.post('/open_tree', function phylo_phlan_tree(req, res) {
    // load trees from menu.js
    // tree names: refseq, conserved, ribosomal, 16S_rRNA
    helpers.accesslog(req, res)
    console.log('in refseq_tree')
    console.log(req.body)
    let tree = req.body.tree_name
    fs.readFile('public/trees/'+tree+'_tree.svg', (err, data) => {
        if(err){
           console.log(err)
        }
        res.set('Content-Type', 'application/svg+xml');
        res.send(data)
        res.end()
    })

});


module.exports = router;