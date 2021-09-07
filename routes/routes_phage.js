const express  = require('express');
var router   = express.Router();
const CFG   = require(app_root + '/config/config');
const fs       = require('fs-extra');
const url = require('url');
const path     = require('path');
const C		  = require(app_root + '/public/constants');
const helpers = require(app_root + '/routes/helpers/helpers');
const queries = require(app_root + '/routes/queries')
var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();
today = yyyy + '-' + mm + '-' + dd;
var currentTimeInSeconds=Math.floor(Date.now()/1000); //unix timestamp in seconds

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
                pgname: 'phage_home',  //for AbountThisPage 
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
  var count_txt, count_txt0;
  let cols_to_show=[]
  if(myurl.query.rank){
      rank = myurl.query.rank
  }
  let reset    = myurl.query.reset
  if(reset == '1'){
     req.session.cols = C.default_phage_cols
     cols_to_show = req.session.cols
  }else if(req.session.cols){
     cols_to_show = req.session.cols
  }else{
      cols_to_show = C.default_phage_cols
      req.session.cols = C.default_phage_cols
  }   
  let send_list = []
  let send_list0 = []
  let tmp_phage_list = Object.values(C.phage_lookup)
  console.log(tmp_phage_list[0])
  if(host_otid){
      send_list0 = tmp_phage_list.filter(item => item.host_otid == host_otid)
      count_txt0 = 'Showing: '+send_list0.length.toString() +' rows for host TaxonID: HMT_'+host_otid
      letter='all'
  }else if(letter && letter.match(/[A-Z]{1}/)){  // always caps
     console.log('got a letter ',letter,' rank: ',rank)
     //console.log(tmp_phage_list[0].family_ncbi.toLowerCase().charAt(0))
     if(rank == 'genus'){
         send_list0 = tmp_phage_list.filter(item => item.genus_ncbi.toUpperCase().charAt(0) === letter)
     }else{
         send_list0 = tmp_phage_list.filter(item => item.family_ncbi.toUpperCase().charAt(0) === letter)
     }
     count_txt0 = 'Showing '+send_list0.length.toString()+' rows for phage '+rank+' starting with: "'+letter+'"'
  }else{
     send_list0 = tmp_phage_list
     count_txt0 = 'Showing: '+send_list0.length.toString() +' rows.'
     letter='all'
  }
  
  
  send_list0.sort(function (a, b) {
	return helpers.compareStrings_alpha(a.family_ncbi, b.family_ncbi);
  });
  
  //console.log(res)
  // here we pare down the send_list to contain only data from the pertinent cols
   for(n in send_list0){
      tmp_obj = {}
      for(x in cols_to_show){
         tmp_obj[cols_to_show[x].name] = send_list0[n][cols_to_show[x].name]
      }
      send_list.push(tmp_obj)
   }
   console.log('tmp_phage_list[0]')
   console.log(tmp_phage_list[0])
   
  
   count_txt = count_txt0 + ' <small>(Total:'+(tmp_phage_list.length).toString()+')</small> '
   res.render('pages/phage/phagetable', {
		title: 'HOMD :: Human Oral Phage Database',
		pgname: 'phage_table',  //for AbountThisPage 
		config :  JSON.stringify({hostname:CFG.HOSTNAME, env:CFG.ENV}),
		ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
		pdata:    JSON.stringify(send_list),
		
		rank: rank,
		cols: JSON.stringify(cols_to_show),
		count_text: count_txt,
		letter: letter,
		search_txt: '0',  // dont us empty string
		search_field: '0',  // dont us empty string
  });
      
});
//
//
router.post('/phage_table', function phage_table_post(req, res) {
   console.log('in phage table POST')
   console.log(req.body)
    // only change columns here in post
   let send_list = []
   let tmp_phage_list = Object.values(C.phage_lookup)
   let cols_to_show =[]
   for(n in C.all_phage_cols){
     for(item in req.body){
         if(item == C.all_phage_cols[n].name && cols_to_show.indexOf(C.all_phage_cols[n]) == -1){
           cols_to_show.push(C.all_phage_cols[n])
         }
     }
   }
   // reset session
   req.session.cols = cols_to_show
   //console.log('cols')
   //console.log(cols_to_show)
   // here we pare down the send_list to contain only data from the pertinent cols
   for(n in tmp_phage_list){
      tmp_obj = {}
      for(x in cols_to_show){
         tmp_obj[cols_to_show[x].name] = tmp_phage_list[n][cols_to_show[x].name]
      }
      send_list.push(tmp_obj)
   }
   
   console.log('tmp_phage_list[0]')
   console.log(tmp_phage_list[0])
   
   // console.log('POST::send_list.length')
//    console.log(send_list.length)
//    console.log('send_list')
//    console.log(send_list)
  let count_txt = 'Showing: '+send_list.length.toString() +' rows. <small>(Total:'+(tmp_phage_list.length).toString()+')</small> '
  res.render('pages/phage/phagetable', {
		title: 'HOMD :: Human Oral Phage Database',
		pgname: 'phage_table',  //for AbountThisPage 
		config :  JSON.stringify({hostname:CFG.HOSTNAME, env:CFG.ENV}),
		ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
		pdata:    JSON.stringify(send_list),
		rank: 'family',
		cols: JSON.stringify(cols_to_show),
		count_text: count_txt,
		letter:'all',  // dont us empty string
		search_txt:'0',  // dont us empty string
		search_field:'0',  // dont us empty string
  });
  
});
//
router.post('/search_phagetable', function search_phagetable(req, res) {
	console.log(req.body)
	let send_list = [];
	let send_list0 = []
	let search_txt = req.body.phage_srch.toLowerCase()  // already filtered for empty string and extreme length
	let search_field = req.body.field
	var count_txt, count_txt0;
	let tmp_phage_list = Object.values(C.phage_lookup)
	send_list0 = get_filtered_phage_list(tmp_phage_list, search_txt, search_field)
	
   for(n in send_list0){
      console.log('n',n)
      
      tmp_obj = {}
      for(x in req.session.cols){
         console.log(req.session.cols)
         tmp_obj[req.session.cols[x].name] = send_list0[n][req.session.cols[x].name]
      }
      send_list.push(tmp_obj)
    }
	//console.log('tmp_phage_list[0]')
    //console.log(tmp_phage_list[0])
	// console.log('SEARCH::send_list.length')
//     console.log(send_list.length)
//     console.log('send_list')
//     console.log(send_list)
    count_txt0 =  'Showing '+(Object.keys(send_list).length).toString()+' rows using search string: "'+req.body.phage_srch+'".'
    count_txt = count_txt0+' <small>(Total:'+(tmp_phage_list.length).toString()+')</small> '
	res.render('pages/phage/phagetable', {
		title: 'HOMD :: Human Oral Phage Database',
		pgname: 'phage_table',  //for AbountThisPage 
		config :  JSON.stringify({hostname:CFG.HOSTNAME, env:CFG.ENV}),
		ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
		pdata:    JSON.stringify(send_list),
		
		rank:    'family',
		cols:    JSON.stringify(req.session.cols),
		count_text: count_txt,
		letter:'all',  // dont us empty string
		search_txt: search_txt,
		search_field: search_field,
  });
	
});	
	

	// here we pare down the send_list to contain only data from the pertinent cols

router.get('/phagedesc', function phagedesc(req, res) {
  console.log('in phage desc')
  helpers.accesslog(req, res)
  let myurl = url.parse(req.url, true);
  let pid = myurl.query.pid;
  let phage = C.phage_lookup[pid]
  console.log(phage)
  res.render('pages/phage/phagedesc', {
				title: 'HOMD :: Human Oral Phage Database',
				pgname: 'phage_description',  //for AbountThisPage 
				config :  JSON.stringify({hostname:CFG.HOSTNAME, env:CFG.ENV}),
				ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
				phage_data:JSON.stringify(phage),
				pid:pid
		  });
});

router.get('/dld_table/:type/:letter/:rank/:search_txt/:search_field', function dld_table(req, res) {
	helpers.accesslog(req, res)
	console.log('in dld phage-get')
	
	let type = req.params.type
	let letter = req.params.letter
	let rank = req.params.rank
	let search_txt = req.params.search_txt
	let search_field = req.params.search_field
	
    console.log(type,letter,rank,search_txt,search_field)
  	let tmp_phage_list = Object.values(C.phage_lookup)
  	console.log('type '+type)
  	console.log('letter '+letter)
  	console.log('rank '+rank)
  	if(letter && letter.match(/[A-Z]{1}/)){   // match single letter
        console.log('got letter '+letter)
        if(rank == 'genus'){
             send_list0 = tmp_phage_list.filter(item => item.genus_ncbi.toLowerCase().charAt(0) === letter)
        }else{
             send_list0 = tmp_phage_list.filter(item => item.family_ncbi.toLowerCase().charAt(0) === letter)
        }
  	}else if(search_txt !== '0'){  // filter
  	    console.log('got search '+search_txt+'  fld: '+search_field)
  	    let tmp_phage_list = Object.values(C.phage_lookup)
  	    send_list0 = get_filtered_phage_list(tmp_phage_list, search_txt, search_field)
  	}else{  // full list
  	    console.log('default')
  	    send_list0 = tmp_phage_list
  	}
	// type = browser text or excel
	var table_tsv = create_table(send_list0, 'table','browser')
	if(type === 'browser'){
	    res.set('Content-Type', 'text/plain');  // <= important - allows tabs to display
	}else if(type === 'text'){
	    res.set({"Content-Disposition":"attachment; filename=\"HOMD_taxon_table"+today+'_'+currentTimeInSeconds+".txt\""});
	}else if(type === 'excel'){
	    res.set({"Content-Disposition":"attachment; filename=\"HOMD_taxon_table"+today+'_'+currentTimeInSeconds+".xls\""});
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
				pgname: 'phage_search',  //for AbountThisPage 
				config :  JSON.stringify({hostname:CFG.HOSTNAME, env:CFG.ENV}),
				ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
		  });
});
////////////////////////////////
////////////////////////////////
function create_table(list, source, type) {

    if(source === 'table' && type === 'browser'){
       
        var headers_row = ["Phage-ID","Assembly.NCBI","Accession.NCBI","Family.NCBI","Genus.NCBI","Species.NCBI","Molecule_Type.NCBI","Sequence_Type.NCBI","Host.NCBI","Host.HOMD-TaxonID","Isolation_Source.NCBI","Collection_Date.NCBI","BioSample.NCBI","Genbank_Title.NCBI"]
        
        txt =  headers_row.join('\t')
        
        for(pid in list){
            obj = list[pid]
               
               //console.log(o2)
               var r = [pid, obj.assembly_ncbi, obj.sra_accession_ncbi, obj.family_ncbi, obj.genus_ncbi, obj.species_ncbi, obj.molecule_type_ncbi, obj.sequence_type_ncbi, obj.host_ncbi, obj.host_otid, obj.isolation_source_ncbi, obj.collection_date_ncbi, obj.biosample_ncbi, obj.genbank_title_ncbi]
               row = r.join('\t')
               txt += '\n'+row
            
        }
    }   
    //console.log(txt)
    return txt
}  
//
function get_filtered_phage_list(big_phage_list, search_txt, search_field){
    
	if(search_field == 'hostid'){
	    send_list0 = big_phage_list.filter(item => item.host_otid.toLowerCase().includes(search_txt))
	}else if(search_field == 'hostname'){
	    send_list0 = big_phage_list.filter(item => item.host_ncbi.toLowerCase().includes(search_txt))
	}else if(search_field == 'phageid'){
	    send_list0 = big_phage_list.filter(item => item.pid.toLowerCase().includes(search_txt))
	}else if(search_field == 'pfamily'){
	    send_list0 = big_phage_list.filter(item => item.family_ncbi.toLowerCase().includes(search_txt))
	}else if(search_field == 'pgenus'){
	    send_list0 = big_phage_list.filter(item => item.genus_ncbi.toLowerCase().includes(search_txt))
	}else if(search_field == 'pspecies'){
	    send_list0 = big_phage_list.filter(item => item.species_ncbi.toLowerCase().includes(search_txt))
	}else if(search_field == 'assembly'){
	    send_list0 = big_phage_list.filter(item => item.assembly_ncbi.toLowerCase().includes(search_txt))
	}else if(search_field == 'sra_accession'){
	    send_list0 = big_phage_list.filter(item => item.sra_accession_ncbi.toLowerCase().includes(search_txt))
	}else if(search_field == 'submitters'){
	    send_list0 = big_phage_list.filter(item => item.submitters_ncbi.toLowerCase().includes(search_txt))
	
	}else if(search_field == 'publications'){
	    send_list0 = big_phage_list.filter(item => item.publications_ncbi.toLowerCase().includes(search_txt))
	
	}else if(search_field == 'molecule_type'){
	    send_list0 = big_phage_list.filter(item => item.molecule_type_ncbi.toLowerCase().includes(search_txt))
	
	}else if(search_field == 'sequence_type'){
	    send_list0 = big_phage_list.filter(item => item.sequence_type_ncbi.toLowerCase().includes(search_txt))
	
	
	}else if(search_field == 'geo_location'){
	    send_list0 = big_phage_list.filter(item => item.geo_location_ncbi.toLowerCase().includes(search_txt))
	}else if(search_field == 'isolation_source'){
	    send_list0 = big_phage_list.filter(item => item.isolation_source_ncbi.toLowerCase().includes(search_txt))
	}else if(search_field == 'biosample'){
	    send_list0 = big_phage_list.filter(item => item.biosample_ncbi.toLowerCase().includes(search_txt))
	}else if(search_field == 'genbank_title'){
	    send_list0 = big_phage_list.filter(item => item.genbank_title_ncbi.toLowerCase().includes(search_txt))
	}else{   // all
	    // search all
	    //send_list = send_tax_obj
	    let temp_obj = {}
	    //host_otid
	    send_list0 = big_phage_list.filter(item => item.host_otid.toLowerCase().includes(search_txt))
	    // for uniqueness convert to object
	    for(n in send_list0){
	       temp_obj[send_list0[n].pid] = send_list0[n]
	    }
	    //hostname
	    send_list0 = big_phage_list.filter(item => item.host_ncbi.toLowerCase().includes(search_txt))
	    for(n in send_list0){
	       temp_obj[send_list0[n].pid] = send_list0[n]
	    }
	    
	    //phageID
	    send_list0 = big_phage_list.filter(item => item.pid.toLowerCase().includes(search_txt))
	    for(n in send_list0){
	       temp_obj[send_list0[n].pid] = send_list0[n]
	    }
	    
	    //family_ncbi
	    send_list0 = big_phage_list.filter(item => item.family_ncbi.toLowerCase().includes(search_txt))
	    for(n in send_list0){
	       temp_obj[send_list0[n].pid] = send_list0[n]
	    }
	    
	    //genus
	    send_list0 = big_phage_list.filter(item => item.genus_ncbi.toLowerCase().includes(search_txt))
	    for(n in send_list0){
	       temp_obj[send_list0[n].pid] = send_list0[n]
	    }
	    
	    //species
	    send_list0 = big_phage_list.filter(item => item.species_ncbi.toLowerCase().includes(search_txt))
	    for(n in send_list0){
	       temp_obj[send_list0[n].pid] = send_list0[n]
	    }
	    
	    //assembly_ncbi
	    send_list0 = big_phage_list.filter(item => item.assembly_ncbi.toLowerCase().includes(search_txt))
	    for(n in send_list0){
	       temp_obj[send_list0[n].pid] = send_list0[n]
	    }
	    
	    //sra_accession_ncbi
	    send_list0 = big_phage_list.filter(item => item.sra_accession_ncbi.toLowerCase().includes(search_txt))
	    for(n in send_list0){
	       temp_obj[send_list0[n].pid] = send_list0[n]
	    }
	    
	    //submitters_ncbi
	    send_list0 = big_phage_list.filter(item => item.submitters_ncbi.toLowerCase().includes(search_txt))
	    for(n in send_list0){
	       temp_obj[send_list0[n].pid] = send_list0[n]
	    }
	    
	    //publications_ncbi
	    send_list0 = big_phage_list.filter(item => item.publications_ncbi.toLowerCase().includes(search_txt))
	    for(n in send_list0){
	       temp_obj[send_list0[n].pid] = send_list0[n]
	    }
	    
	    //molecule_type_ncbi
	    send_list0 = big_phage_list.filter(item => item.molecule_type_ncbi.toLowerCase().includes(search_txt))
	    for(n in send_list0){
	       temp_obj[send_list0[n].pid] = send_list0[n]
	    }
	    
	    //sequence_type_ncbi
	    send_list0 = big_phage_list.filter(item => item.sequence_type_ncbi.toLowerCase().includes(search_txt))
	    for(n in send_list0){
	       temp_obj[send_list0[n].pid] = send_list0[n]
	    }
	    
	    //geo_location_ncbi
	    send_list0 = big_phage_list.filter(item => item.geo_location_ncbi.toLowerCase().includes(search_txt))
	    for(n in send_list0){
	       temp_obj[send_list0[n].pid] = send_list0[n]
	    }
	    
	    //isolation_source_ncbi
	    send_list0 = big_phage_list.filter(item => item.isolation_source_ncbi.toLowerCase().includes(search_txt))
	    for(n in send_list0){
	       temp_obj[send_list0[n].pid] = send_list0[n]
	    }
	    
	    //biosample_ncbi
	    send_list0 = big_phage_list.filter(item => item.biosample_ncbi.toLowerCase().includes(search_txt))
	    for(n in send_list0){
	       temp_obj[send_list0[n].pid] = send_list0[n]
	    }
	    
	    //genbank_title_ncbi
	    send_list0 = big_phage_list.filter(item => item.genbank_title_ncbi.toLowerCase().includes(search_txt))
	    for(n in send_list0){
	       temp_obj[send_list0[n].pid] = send_list0[n]
	    }
	    
	    // now back to a list
	    send_list0 = Object.values(temp_obj);
	}
    return send_list0
}	

      
        
module.exports = router;