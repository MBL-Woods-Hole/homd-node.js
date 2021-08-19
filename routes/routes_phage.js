const express  = require('express');
var router   = express.Router();
const CFG   = require(app_root + '/config/config');
const fs       = require('fs-extra');
const url = require('url');
const path     = require('path');
const C		  = require(app_root + '/public/constants');
const helpers = require(app_root + '/routes/helpers/helpers');
const queries = require(app_root + '/routes/queries')

router.get('/', function index(req, res) {
  console.log('in phage hello')
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

router.get('/phage_table', function phage_table_get(req, res) {
  console.log('in phage table GET')
  helpers.accesslog(req, res)
  let myurl = url.parse(req.url, true);
  let host_otid = myurl.query.host_otid;
  let letter    = myurl.query.k
  let rank = 'family'  // default
  if(myurl.query.rank){
      rank = myurl.query.rank
  }
  let reset    = myurl.query.reset
  if(reset == '1'){
     req.session.cols = ''
  }
  let phage_list = []
  let tmp_phage_list = Object.values(C.phage_lookup)
  console.log(tmp_phage_list[0])
  if(host_otid){
      phage_list = tmp_phage_list.filter(item => item.host_otid == host_otid)
  }else if(letter && letter.match(/[a-z]{1}/)){
     console.log('got a letter ',letter,' rank: ',rank)
     //console.log(tmp_phage_list[0].family_ncbi.toLowerCase().charAt(0))
     if(rank == 'genus'){
         phage_list = tmp_phage_list.filter(item => item.genus_ncbi.toLowerCase().charAt(0) === letter)
     }else{
         phage_list = tmp_phage_list.filter(item => item.family_ncbi.toLowerCase().charAt(0) === letter)
     }
     
  }else{
     phage_list = tmp_phage_list
  }
  
  
  phage_list.sort(function (a, b) {
	return helpers.compareStrings_alpha(a.family_ncbi, b.family_ncbi);
  });
  //console.log(res)
  console.log(phage_list.length)
  let all_cols = [
      {name:'pid', view:'Phage-ID', width:'col1', order:'1'},
      {name:'host_otid', view:'Taxon-ID', width:'col1', order:'5'},
      {name:'assembly_ncbi', view:'', width:'col3', order:''},
      {name:'sra_accession_ncbi', view:'', width:'col3', order:''},
      {name:'submitters_ncbi', view:'', width:'col3', order:''},
      {name:'release_date_ncbi', view:'', width:'col3', order:''},
      {name:'family_ncbi', view:'Family', width:'col3', order:'2'},
      {name:'genus_ncbi', view:'Genus', width:'col3', order:'3'},
      {name:'species_ncbi', view:'Species', width:'col3', order:'4'},
      {name:'publications_ncbi', view:'', width:'col3', order:''},
      {name:'molecule_type_ncbi', view:'', width:'col3', order:''},
      {name:'sequence_type_ncbi', view:'', width:'col3', order:''},
      {name:'geo_location_ncbi', view:'', width:'col3', order:''},
      {name:'usa_ncbi', view:'', width:'col3', order:''},
      {name:'host_ncbi', view:'Host Name', width:'', order:'6'}, // one col should have no width
      {name:'isolation_source_ncbi', view:'', width:'col3', order:''},
      {name:'collection_date_ncbi', view:'', width:'col3', order:''},
      {name:'biosample_ncbi', view:'', width:'col3', order:''},
      {name:'genbank_title_ncbi', view:'', width:'col3', order:''}
  ]
  
  let default_cols = [  // six at most
       {name:'pid', view:'Phage-ID', width:'col1', order:'1'},
       {name:'family_ncbi', view:'Family', width:'col3', order:'2'},
       {name:'genus_ncbi', view:'Genus', width:'col3', order:'3'},
       {name:'species_ncbi', view:'Species', width:'col3', order:'4'},
       {name:'host_otid', view:'Taxon-ID', width:'col1', order:'5'},
       {name:'host_ncbi', view:'Host Name', width:'', order:'6'} // one col should have no width
  ] 
  console.log('session cols')
  console.log(req.session.cols)
  if(req.session.cols){
     cols_to_show = req.session.cols
  }else{
      cols_to_show = default_cols
  }     
  res.render('pages/phage/phagetable', {
		title: 'HOMD :: Human Oral Phage Database',
		config :  JSON.stringify({hostname:CFG.HOSTNAME, env:CFG.ENV}),
		ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
		pdata:    JSON.stringify(phage_list),
		phyla: JSON.stringify({}),
		rank: rank,
		cols: JSON.stringify(cols_to_show),
		count_text:'',
		letter: letter,
  });
      
});
router.post('/phage_table', function phage_table_post(req, res) {
  console.log('in phage table POST')
  console.log(req.body)
  // let letter = req.body.letter
//   let rank = req.body.rank
   // default_cols = ['pid','family_ncbi','genus_ncbi','species_ncbi','host_otid','host_ncbi'] 
   // make a new obj with ONLY the requested cols
//    let all_cols1 = [
//       {pid:{ view:'Phage-ID', width:'col1', order:'1'}},
//       {host_otid:{ view:'Taxon-ID', width:'col1', order:'5'}},
//       {assembly_ncbi:{ view:'', width:'col3', order:''}},
//       {sra_accession_ncbi:{ view:'', width:'col3', order:''}},
//       {submitters_ncbi:{ view:'', width:'col3', order:''}},
//       {release_date_ncbi:{ view:'', width:'col3', order:''}},
//       {family_ncbi:{ view:'Family', width:'col3', order:'2'}},
//       {genus_ncbi:{ view:'Genus', width:'col3', order:'3'}},
//       {species_ncbi:{ view:'Species', width:'col3', order:'4'}},
//       {publications_ncbi:{ view:'', width:'col3', order:''}},
//       {molecule_type_ncbi:{ view:'', width:'col3', order:''}},
//       {sequence_type_ncbi:{ view:'', width:'col3', order:''}},
//       {geo_location_ncbi:{ view:'', width:'col3', order:''}},
//       {usa_ncbi:{ view:'', width:'col3', order:''}},
//       {host_ncbi:{ view:'Host Name', width:'', order:'6'}}, // one col should have no width
//       {isolation_source_ncbi:{ view:'', width:'col3', order:''}},
//       {collection_date_ncbi:{ view:'', width:'col3', order:''}},
//       {biosample_ncbi:{ view:'', width:'col3', order:''}},
//       {genbank_title_ncbi:{ view:'', width:'col3', order:''}}
//    ]
   let all_cols = [
      {name:'pid', view:'Phage-ID', width:'col1', order:'1'},
      {name:'host_otid', view:'Taxon-ID', width:'col1', order:'5'},
      {name:'assembly_ncbi', view:'Assembly', width:'col3', order:''},
      {name:'sra_accession_ncbi', view:'SRA Accession', width:'col3', order:''},
      {name:'submitters_ncbi', view:'Submitters', width:'col5', order:''},
      {name:'release_date_ncbi', view:'Release Date', width:'col3', order:''},
      {name:'family_ncbi', view:'Family', width:'col3', order:'2'},
      {name:'genus_ncbi', view:'Genus', width:'col3', order:'3'},
      {name:'species_ncbi', view:'Species', width:'col3', order:'4'},
      {name:'publications_ncbi', view:'Publications', width:'col3', order:''},
      {name:'molecule_type_ncbi', view:'Molecule Type', width:'col1', order:''},
      {name:'sequence_type_ncbi', view:'Sequence Type', width:'col1', order:''},
      {name:'geo_location_ncbi', view:'Geo Location', width:'col1', order:''},
      {name:'usa_ncbi', view:'USA', width:'col1', order:''},
      {name:'host_ncbi', view:'Host Name', width:'', order:'6'}, // one col should have no width
      {name:'isolation_source_ncbi', view:'Isolation Source', width:'col3', order:''},
      {name:'collection_date_ncbi', view:'Collection Date', width:'col3', order:''},
      {name:'biosample_ncbi', view:'BioSample', width:'col3', order:''},
      {name:'genbank_title_ncbi', view:'Genbank Title', width:'col3', order:''}
  ]
   let phage_list = []
   let tmp_phage_list = Object.values(C.phage_lookup)
   let filtered_content =[]
   let cols_to_show =[]
   for(n in all_cols){
   for(item in req.body){
         if(item == all_cols[n].name && cols_to_show.indexOf(all_cols[n]) == -1){
           cols_to_show.push(all_cols[n])
         }
   }
   }
   req.session.cols = cols_to_show
   console.log('cols')
   console.log(cols_to_show)
   for(n in tmp_phage_list){
      tmp_obj = {}
      for(x in cols_to_show){
         tmp_obj[cols_to_show[x].name] = tmp_phage_list[n][cols_to_show[x].name]
      }
      filtered_content.push(tmp_obj)
   }
   
   //console.log(filtered_content)
//   if(letter && letter.match(/[a-z]{1}/)){
//      console.log('got a letter ',letter,' rank: ',rank)
//      //console.log(tmp_phage_list[0].family_ncbi.toLowerCase().charAt(0))
//      if(rank == 'genus'){
//          phage_list = tmp_phage_list.filter(item => item.genus_ncbi.toLowerCase().charAt(0) === letter)
//      }else{
//          phage_list = tmp_phage_list.filter(item => item.family_ncbi.toLowerCase().charAt(0) === letter)
//      }
//      
//   }else{
      phage_list = filtered_content
//   }
//   phage_list.sort(function (a, b) {
// 	return helpers.compareStrings_alpha(a.family_ncbi, b.family_ncbi);
//   })
   console.log(phage_list.length)
   console.log(phage_list[0])
  
  res.render('pages/phage/phagetable', {
		title: 'HOMD :: Human Oral Phage Database',
		config :  JSON.stringify({hostname:CFG.HOSTNAME, env:CFG.ENV}),
		ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
		pdata:    JSON.stringify(phage_list),
		phyla: JSON.stringify({}),
		rank: 'family',
		cols: JSON.stringify(cols_to_show),
		count_text:'',
		letter:'',
  });
  
});

router.get('/phagedesc', function phagedesc(req, res) {
  console.log('in phage desc')
  helpers.accesslog(req, res)
  let myurl = url.parse(req.url, true);
  let pid = myurl.query.pid;
  let phage = C.phage_lookup[pid]
  console.log(phage)
  res.render('pages/phage/phagedesc', {
				title: 'HOMD :: Human Oral Phage Database',
				config :  JSON.stringify({hostname:CFG.HOSTNAME, env:CFG.ENV}),
				ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
				phage_data:JSON.stringify(phage),
				pid:pid
		  });
});

router.get('/dld_table', function dld_table(req, res) {
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
//
//
router.get('/search_questions', function search_questions(req, res) {
  console.log('in search_questions')
  
  res.render('pages/phage/search_questions', {
				title: 'HOMD :: Human Oral Phage Questions',
				config :  JSON.stringify({hostname:CFG.HOSTNAME, env:CFG.ENV}),
				ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
		  });
});
////////////////////////////////
////////////////////////////////
function create_table(source, type) {

    if(source === 'table' && type === 'browser'){
       
        var headers_row = ["Phage-ID","Assembly.NCBI","Accession.NCBI","Family.NCBI","Genus.NCBI","Species.NCBI","Molecule_Type.NCBI","Sequence_Type.NCBI","Host.NCBI","Host.HOMD-TaxonID","Isolation_Source.NCBI","Collection_Date.NCBI","BioSample.NCBI","Genbank_Title.NCBI"]
        
        txt =  headers_row.join('\t')
        
        for(vid in C.phage_lookup){
            obj = C.phage_lookup[vid]
               
            
               //console.log(o2)
               var r = [vid, obj.assembly_ncbi, obj.sra_accession_ncbi, obj.family_ncbi, obj.genus_ncbi, obj.species_ncbi, obj.molecule_type_ncbi, obj.sequence_type_ncbi, obj.host_ncbi, obj.host_otid, obj.isolation_source_ncbi, obj.collection_date_ncbi, obj.biosample_ncbi, obj.genbank_title_ncbi]
               row = r.join('\t')
               txt += '\n'+row
            
        }
    }   
    //console.log(txt)
    return txt
}        
        
module.exports = router;