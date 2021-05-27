const express  = require('express');
var router   = express.Router();
const CFG   = require(app_root + '/config/config');
const fs       = require('fs-extra');
const url = require('url');
const path     = require('path');
const C		  = require(app_root + '/public/constants');
const helpers = require(app_root + '/routes/helpers/helpers');
const queries = require(app_root + '/routes/queries')

router.get('/', (req, res) => {
  console.log('in phage')
  helpers.accesslog(req, res)
  fs.readFile(path.join(CFG.PATH_TO_DATA, C.phage_list_fn), 'utf8', (err, data) => {
    	if (err)
      		console.log(err)
    	else{
         // add virome to global constants
          
          C.phage_list = JSON.parse(data) // will only be loaded once
          
          res.render('pages/phage/index', {
                title: 'HOMD :: Human Oral Phage Database',
                config :  JSON.stringify({hostname:CFG.HOSTNAME, env:CFG.ENV}),
                ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
        
          });
     }
  });
});

router.get('/phage_table', (req, res) => {
  console.log('in phage table')
  helpers.accesslog(req, res)

  fs.readFile(path.join(CFG.PATH_TO_DATA, C.phage_list_fn), 'utf8', (err, data) => {
    	if (err)
      		console.log(err)
    	else{
           // will only be loaded once
           // Is this the right way to do this?? (load for each page)
          C.phage_list = JSON.parse(data) // will only be loaded once
		  console.log(C.phage_list[0])
		  C.phage_list.sort(function (a, b) {
      		return helpers.compareStrings_alpha(a.genus_ncbi, b.genus_ncbi);
    	  });
		  res.render('pages/phage/phagetable', {
				title: 'HOMD :: Human Oral Phage Database',
				config :  JSON.stringify({hostname:CFG.HOSTNAME, env:CFG.ENV}),
				ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
				vdata:    JSON.stringify(C.phage_list),
		  });
         }
   });
});
router.get('/phagedesc', (req, res) => {
  console.log('in phage table')
  helpers.accesslog(req, res)
  res.render('pages/phage/phagedesc', {
				title: 'HOMD :: Human Oral Phage Database',
				config :  JSON.stringify({hostname:CFG.HOSTNAME, env:CFG.ENV}),
				ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
				vdata:    JSON.stringify(C.phage_list),
		  });
});

router.get('/dld_table', (req, res) => {
	helpers.accesslog(req, res)
	console.log(req.body)
	let myurl = url.parse(req.url, true);
  	let type = myurl.query.type;
	// type = browser text or excel
	var table_tsv = create_table('table','browser')
	if(type === 'browser'){
	    res.set('Content-Type', 'text/plain');  // <= important - allows tabs to display
	}else if(type === 'text'){
	    res.set({"Content-Disposition":"attachment; filename=\"HOMD_taxon_table.txt\""});
	}else if(type === 'excel'){
	    res.set({"Content-Disposition":"attachment; filename=\"HOMD_taxon_table.xls\""});
	}else{
	    // error
	    console.log('Download table format ERROR')
	}
	res.send(table_tsv)
	res.end()
});

////////////////////////////////
////////////////////////////////
function create_table(source, type) {

    if(source === 'table' && type === 'browser'){
       
        var headers_row = ["Phage-ID","Assembly.NCBI","Accession.NCBI","Family.NCBI","Genus.NCBI","Species.NCBI","Molecule_Type.NCBI","Sequence_Type.NCBI","Host.NCBI","Isolation_Source.NCBI","Collection_Date.NCBI","BioSample.NCBI","Genbank_Title.NCBI"]
        
        txt =  headers_row.join('\t')
        
        for(vid in C.phage_lookup){
            obj = C.phage_lookup[vid]
               
            
               //console.log(o2)
               var r = [vid, obj.assembly_ncbi, obj.sra_accession_ncbi, obj.family_ncbi, obj.genus_ncbi, obj.species_ncbi, obj.molecule_type_ncbi, obj.sequence_type_ncbi, obj.host_ncbi, obj.isolation_source_ncbi, obj.collection_date_ncbi, obj.biosample_ncbi, obj.genbank_title_ncbi]
               row = r.join('\t')
               txt += '\n'+row
            
        }
    }   
    //console.log(txt)
    return txt
}        
        
module.exports = router;