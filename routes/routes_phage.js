'use strict'
const express  = require('express');
var router   = express.Router();
const CFG   = require(app_root + '/config/config');
const fs       = require('fs-extra');
// const url = require('url');
const path     = require('path');
const C     = require(app_root + '/public/constants');
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
      else {
         // add virome to global constants
          
          C.phage_list = JSON.parse(data) // will only be loaded once
          
          res.render('pages/phage/index', {
                title: 'HOMD :: Human Oral Phage Database',
                pgname: '', // for AbountThisPage
                config:  JSON.stringify({hostname:CFG.HOSTNAME, env:CFG.ENV}),
                ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
                user: JSON.stringify(req.user || {}),
          })
     }
  })
})

router.get('/phage_table', function phage_table_get(req, res) {
  console.log('in phage table GET')
  helpers.accesslog(req, res)
  //let myurl = url.parse(req.url, true);
  let host_otid = req.query.host_otid;
  let letter    = req.query.k
  let rank = 'family'  // default
  let count_txt, count_txt0, tmpObj;
  let cols_to_show=[]
  if(req.query.rank){
      rank = req.query.rank
  }
  let reset    = req.query.reset
  if(reset == '1'){
     req.session.cols = C.default_phage_cols
     cols_to_show = req.session.cols
  }else if(req.session.cols){
     cols_to_show = req.session.cols
  }else {
      cols_to_show = C.default_phage_cols
      req.session.cols = C.default_phage_cols
  }   
  let sendList = [],sendList0 = []
  
  let tmpPhageList = Object.values(C.phage_lookup)
  //console.log(tmpPhageList[0])
  if(host_otid){
      sendList0 = tmpPhageList.filter(item => item.host_otid == host_otid)
      count_txt0 = 'Showing: '+sendList0.length.toString() +' rows for host TaxonID: HMT_'+host_otid
      letter='all'
  }else if(letter && letter.match(/[A-Z]{1}/)){  // always caps
     console.log('got a letter ',letter,' rank: ',rank)
     //console.log(tmpPhageList[0].family_ncbi.toLowerCase().charAt(0))
     if(rank == 'genus'){
         sendList0 = tmpPhageList.filter(item => item.genus_ncbi.toUpperCase().charAt(0) === letter)
     }else {
         sendList0 = tmpPhageList.filter(item => item.family_ncbi.toUpperCase().charAt(0) === letter)
     }
     count_txt0 = 'Showing '+sendList0.length.toString()+' rows for phage '+rank+' starting with: "'+letter+'"'
  }else {
     sendList0 = tmpPhageList
     count_txt0 = 'Showing: '+sendList0.length.toString() +' rows.'
     letter='all'
  }
  
  
  sendList0.sort(function (a, b) {
     return helpers.compareStrings_alpha(a.family_ncbi, b.family_ncbi);
  })
  
  //console.log(res)
  // here we pare down the sendList to contain only data from the pertinent cols
   for(let n in sendList0){
      tmpObj = {}
      for(var x in cols_to_show){
         tmpObj[cols_to_show[x].name] = sendList0[n][cols_to_show[x].name]
      }
      sendList.push(tmpObj)
   }
   //console.log('tmpPhageList[0]')
   //console.log(tmpPhageList[0])
   
  
   count_txt = count_txt0 + ' <small>(Total:'+(tmpPhageList.length).toString()+')</small> '
   res.render('pages/phage/phagetable', {
    title: 'HOMD :: Human Oral Phage Database',
    pgname: 'phage/phage_table', // for AbountThisPage
    config:  JSON.stringify({hostname:CFG.HOSTNAME, env:CFG.ENV}),
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
    user: JSON.stringify(req.user || {}),
    pdata:    JSON.stringify(sendList),
    
    rank: rank,
    cols: JSON.stringify(cols_to_show),
    count_text: count_txt,
    letter: letter,
    search_txt: '0',  // dont us empty string
    search_field: '0',  // dont us empty string
  })
      
})
//
//
router.post('/phage_table', function phage_table_post(req, res) {
   console.log('in phage table POST')
   console.log(req.body)
    // only change columns here in post
   let sendList = []
   let tmpPhageList = Object.values(C.phage_lookup)
   let cols_to_show =[]
   let tmpObj
   for(var n in C.all_phage_cols){
     for(var item in req.body){
         if(item == C.all_phage_cols[n].name && cols_to_show.indexOf(C.all_phage_cols[n]) == -1){
           cols_to_show.push(C.all_phage_cols[n])
         }
     }
   }
   // reset session
   req.session.cols = cols_to_show
   //console.log('cols')
   //console.log(cols_to_show)
   // here we pare down the sendList to contain only data from the pertinent cols
   for(var n in tmpPhageList){
      tmpObj = {}
      for(var x in cols_to_show){
         tmpObj[cols_to_show[x].name] = tmpPhageList[n][cols_to_show[x].name]
      }
      sendList.push(tmpObj)
   }
   
   //console.log('tmpPhageList[0]')
   //console.log(tmpPhageList[0])
   
   // console.log('POST::sendList.length')
//    console.log(sendList.length)
//    console.log('sendList')
//    console.log(sendList)
  let count_txt = 'Showing: '+sendList.length.toString() +' rows. <small>(Total:'+(tmpPhageList.length).toString()+')</small> '
  res.render('pages/phage/phagetable', {
    title: 'HOMD :: Human Oral Phage Database',
    pgname: 'phage/phage_table', // for AbountThisPage
    config:  JSON.stringify({hostname:CFG.HOSTNAME, env:CFG.ENV}),
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
    user: JSON.stringify(req.user || {}),
    pdata:    JSON.stringify(sendList),
    rank: 'family',
    cols: JSON.stringify(cols_to_show),
    count_text: count_txt,
    letter:'all',  // dont us empty string
    search_txt:'0',  // dont us empty string
    search_field:'0',  // dont us empty string
  })
  
})
//
router.post('/search_phagetable', function search_phagetable(req, res) {
  console.log(req.body)
  let sendList = [];
  let sendList0 = []
  let searchText = req.body.phage_srch.toLowerCase()  // already filtered for empty string and extreme length
  let searchField = req.body.field
  var countText, countText0, tmpObj;
  let tmpPhageList = Object.values(C.phage_lookup)
  sendList0 = get_filtered_phage_list(tmpPhageList, searchText, searchField)
  
   for(let n in sendList0){
      
      
      tmpObj = {}
      for(let x in req.session.cols){
         //console.log(req.session.cols)
         tmpObj[req.session.cols[x].name] = sendList0[n][req.session.cols[x].name]
      }
      sendList.push(tmpObj)
    }
  //console.log('tmpPhageList[0]')
    //console.log(tmpPhageList[0])
  // console.log('SEARCH::sendList.length')
//     console.log(sendList.length)
//     console.log('sendList')
//     console.log(sendList)
    countText0 =  'Showing '+(Object.keys(sendList).length).toString()+' rows using search string: "'+req.body.phage_srch+'".'
    countText = countText0+' <small>(Total:'+(tmpPhageList.length).toString()+')</small> '
  res.render('pages/phage/phagetable', {
    title: 'HOMD :: Human Oral Phage Database',
    pgname: 'phage/phage_table', // for AbountThisPage
    config:  JSON.stringify({hostname:CFG.HOSTNAME, env:CFG.ENV}),
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
    user: JSON.stringify(req.user || {}),
    pdata:    JSON.stringify(sendList),
    
    rank:    'family',
    cols:    JSON.stringify(req.session.cols),
    count_text: countText,
    letter: 'all',  // dont us empty string
    search_txt: searchText,
    search_field: searchField,
  })
  
}) 
  

  // here we pare down the sendList to contain only data from the pertinent cols

router.get('/phagedesc', function phagedesc(req, res) {
  console.log('in phage desc')
  helpers.accesslog(req, res)
  //let myurl = url.parse(req.url, true);
  let pid = req.query.pid;
  let phage = C.phage_lookup[pid]
  console.log(phage)
  res.render('pages/phage/phagedesc', {
        title: 'HOMD :: Human Oral Phage Database',
        pgname: 'phage/phage_description', // for AbountThisPage
        config:  JSON.stringify({hostname:CFG.HOSTNAME, env:CFG.ENV}),
        ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
        user: JSON.stringify(req.user || {}),
        phage_data: JSON.stringify(phage),
        pid: pid
      })
})

router.get('/dld_table/:type/:letter/:rank/:search_txt/:search_field', function dld_table(req, res) {
  helpers.accesslog(req, res)
  console.log('in dld phage-get')
  let sendList, sendList0
  let type = req.params.type
  let letter = req.params.letter
  let rank = req.params.rank
  let searchText = req.params.search_txt
  let searchField = req.params.search_field
  
    //console.log(type, letter, rank, searchText, searchField)
    let tmpPhageList = Object.values(C.phage_lookup)
    console.log('type ' + type)
    console.log('letter ' + letter)
    console.log('rank ' + rank)
    if(letter && letter.match(/[A-Z]{1}/)){   // match single letter
        //console.log('got letter ' + letter)
        if(rank == 'genus'){
             sendList0 = tmpPhageList.filter(item => item.genus_ncbi.toLowerCase().charAt(0) === letter)
        }else {
             sendList0 = tmpPhageList.filter(item => item.family_ncbi.toLowerCase().charAt(0) === letter)
        }
    }else if(searchText !== '0'){  // filter
        //console.log('got search '+searchText+'  fld: '+searchField)
        let tmpPhageList = Object.values(C.phage_lookup)
        sendList0 = get_filtered_phage_list(tmpPhageList, searchText, searchField)
    }else {  // full list
        //console.log('default')
        sendList0 = tmpPhageList
    }
  // type = browser text or excel
  var table_tsv = create_table(sendList0, 'table','browser')
  if(type === 'browser'){
      res.set('Content-Type', 'text/plain');  // <= important - allows tabs to display
  }else if(type === 'text'){
      res.set({"Content-Disposition":"attachment; filename=\"HOMD_taxon_table"+today+'_'+currentTimeInSeconds+".txt\""})
  }else if(type === 'excel'){
      res.set({"Content-Disposition":"attachment; filename=\"HOMD_taxon_table"+today+'_'+currentTimeInSeconds+".xls\""})
  }else {
      // error
      console.log('Download table format ERROR')
  }
  res.send(table_tsv)
  res.end()
})
//
//
router.get('/search_questions', function search_questions(req, res) {
  console.log('in search_questions')
  
  res.render('pages/phage/search_questions', {
        title: 'HOMD :: Human Oral Phage Questions',
        pgname: '', // for AbountThisPage
        config:  JSON.stringify({ hostname:CFG.HOSTNAME, env:CFG.ENV }),
        ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
        user: JSON.stringify(req.user || {}),
      })
})
////////////////////////////////
////////////////////////////////
function create_table(list, source, type) {
    let txt,items,obj
    if(source === 'table' && type === 'browser'){
       
        var headers_row = ["Phage-ID","Assembly.NCBI","Accession.NCBI","Family.NCBI","Genus.NCBI","Species.NCBI","Molecule_Type.NCBI","Sequence_Type.NCBI","Host.NCBI","Host.HOMD-TaxonID","Isolation_Source.NCBI","Collection_Date.NCBI","BioSample.NCBI","Genbank_Title.NCBI"]
        
        txt =  headers_row.join('\t')
        
        for(var pid in list){
            obj = list[pid]
               
            //console.log(o2)
            items = [pid, obj.assembly_ncbi, obj.sra_accession_ncbi, obj.family_ncbi, obj.genus_ncbi, obj.species_ncbi, obj.molecule_type_ncbi, obj.sequence_type_ncbi, obj.host_ncbi, obj.host_otid, obj.isolation_source_ncbi, obj.collection_date_ncbi, obj.biosample_ncbi, obj.genbank_title_ncbi]
            txt += '\n'+items.join('\t')
            
        }
    }   
    //console.log(txt)
    return txt
}  
//
function get_filtered_phage_list(bigPhageList, searchText, searchField){
  let sendList0 
  if(searchField == 'hostid'){
      sendList0 = bigPhageList.filter(item => item.host_otid.toLowerCase().includes(searchText))
  }else if(searchField == 'hostname'){
      sendList0 = bigPhageList.filter(item => item.host_ncbi.toLowerCase().includes(searchText))
  }else if(searchField == 'phageid'){
      sendList0 = bigPhageList.filter(item => item.pid.toLowerCase().includes(searchText))
  }else if(searchField == 'pfamily'){
      sendList0 = bigPhageList.filter(item => item.family_ncbi.toLowerCase().includes(searchText))
  }else if(searchField == 'pgenus'){
      sendList0 = bigPhageList.filter(item => item.genus_ncbi.toLowerCase().includes(searchText))
  }else if(searchField == 'pspecies'){
      sendList0 = bigPhageList.filter(item => item.species_ncbi.toLowerCase().includes(searchText))
  }else if(searchField == 'assembly'){
      sendList0 = bigPhageList.filter(item => item.assembly_ncbi.toLowerCase().includes(searchText))
  }else if(searchField == 'sra_accession'){
      sendList0 = bigPhageList.filter(item => item.sra_accession_ncbi.toLowerCase().includes(searchText))
  }else if(searchField == 'submitters'){
      sendList0 = bigPhageList.filter(item => item.submitters_ncbi.toLowerCase().includes(searchText))
  
  }else if(searchField == 'publications'){
      sendList0 = bigPhageList.filter(item => item.publications_ncbi.toLowerCase().includes(searchText))
  
  }else if(searchField == 'molecule_type'){
      sendList0 = bigPhageList.filter(item => item.molecule_type_ncbi.toLowerCase().includes(searchText))
  
  }else if(searchField == 'sequence_type'){
      sendList0 = bigPhageList.filter(item => item.sequence_type_ncbi.toLowerCase().includes(searchText))
  
  
  }else if(searchField == 'geo_location'){
      sendList0 = bigPhageList.filter(item => item.geo_location_ncbi.toLowerCase().includes(searchText))
  }else if(searchField == 'isolation_source'){
      sendList0 = bigPhageList.filter(item => item.isolation_source_ncbi.toLowerCase().includes(searchText))
  }else if(searchField == 'biosample'){
      sendList0 = bigPhageList.filter(item => item.biosample_ncbi.toLowerCase().includes(searchText))
  }else if(searchField == 'genbank_title'){
      sendList0 = bigPhageList.filter(item => item.genbank_title_ncbi.toLowerCase().includes(searchText))
  }else {   // all
      // search all
      //sendList = send_tax_obj
      let temp_obj = {}
      //host_otid
      sendList0 = bigPhageList.filter(item => item.host_otid.toLowerCase().includes(searchText))
      // for uniqueness convert to object
      for(var n in sendList0){
         temp_obj[sendList0[n].pid] = sendList0[n]
      }
      //hostname
      sendList0 = bigPhageList.filter(item => item.host_ncbi.toLowerCase().includes(searchText))
      for(var n in sendList0){
         temp_obj[sendList0[n].pid] = sendList0[n]
      }
      
      //phageID
      sendList0 = bigPhageList.filter(item => item.pid.toLowerCase().includes(searchText))
      for(var n in sendList0){
         temp_obj[sendList0[n].pid] = sendList0[n]
      }
      
      //family_ncbi
      sendList0 = bigPhageList.filter(item => item.family_ncbi.toLowerCase().includes(searchText))
      for(var n in sendList0){
         temp_obj[sendList0[n].pid] = sendList0[n]
      }
      
      //genus
      sendList0 = bigPhageList.filter(item => item.genus_ncbi.toLowerCase().includes(searchText))
      for(var n in sendList0){
         temp_obj[sendList0[n].pid] = sendList0[n]
      }
      
      //species
      sendList0 = bigPhageList.filter(item => item.species_ncbi.toLowerCase().includes(searchText))
      for(var n in sendList0){
         temp_obj[sendList0[n].pid] = sendList0[n]
      }
      
      //assembly_ncbi
      sendList0 = bigPhageList.filter(item => item.assembly_ncbi.toLowerCase().includes(searchText))
      for(var n in sendList0){
         temp_obj[sendList0[n].pid] = sendList0[n]
      }
      
      //sra_accession_ncbi
      sendList0 = bigPhageList.filter(item => item.sra_accession_ncbi.toLowerCase().includes(searchText))
      for(var n in sendList0){
         temp_obj[sendList0[n].pid] = sendList0[n]
      }
      
      //submitters_ncbi
      sendList0 = bigPhageList.filter(item => item.submitters_ncbi.toLowerCase().includes(searchText))
      for(var n in sendList0){
         temp_obj[sendList0[n].pid] = sendList0[n]
      }
      
      //publications_ncbi
      sendList0 = bigPhageList.filter(item => item.publications_ncbi.toLowerCase().includes(searchText))
      for(var n in sendList0){
         temp_obj[sendList0[n].pid] = sendList0[n]
      }
      
      //molecule_type_ncbi
      sendList0 = bigPhageList.filter(item => item.molecule_type_ncbi.toLowerCase().includes(searchText))
      for(var n in sendList0){
         temp_obj[sendList0[n].pid] = sendList0[n]
      }
      
      //sequence_type_ncbi
      sendList0 = bigPhageList.filter(item => item.sequence_type_ncbi.toLowerCase().includes(searchText))
      for(var n in sendList0){
         temp_obj[sendList0[n].pid] = sendList0[n]
      }
      
      //geo_location_ncbi
      sendList0 = bigPhageList.filter(item => item.geo_location_ncbi.toLowerCase().includes(searchText))
      for(var n in sendList0){
         temp_obj[sendList0[n].pid] = sendList0[n]
      }
      
      //isolation_source_ncbi
      sendList0 = bigPhageList.filter(item => item.isolation_source_ncbi.toLowerCase().includes(searchText))
      for(var n in sendList0){
         temp_obj[sendList0[n].pid] = sendList0[n]
      }
      
      //biosample_ncbi
      sendList0 = bigPhageList.filter(item => item.biosample_ncbi.toLowerCase().includes(searchText))
      for(var n in sendList0){
         temp_obj[sendList0[n].pid] = sendList0[n]
      }
      
      //genbank_title_ncbi
      sendList0 = bigPhageList.filter(item => item.genbank_title_ncbi.toLowerCase().includes(searchText))
      for(var n in sendList0){
         temp_obj[sendList0[n].pid] = sendList0[n]
      }
      
      // now back to a list
      sendList0 = Object.values(temp_obj);
  }
    return sendList0
} 

      
        
module.exports = router;