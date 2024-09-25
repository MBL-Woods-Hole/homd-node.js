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


router.get('/dld_taxtable_all/:type/', function dld_taxtable_all(req, res) {
//router.get('/dld_table_all/:type/:letter/:stati/:search_txt/:search_field', function dld_tax_table(req, res) {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;
    var currentTimeInSeconds=Math.floor(Date.now()/1000); //unix timestamp in seconds

    let type = req.params.type
    let file_filter_txt = "HOMD.org Taxon Data::No Filter Applied"+ " Date: "+today 
    let send_list = Object.values(C.taxon_lookup);
    let list_of_otids = send_list.map(item => item.otid)
    
    var table_tsv = create_taxon_table(list_of_otids, 'table', type, file_filter_txt )
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
router.get('/dld_taxtable/:type', function dld_taxtable(req, res) {
//router.get('/dld_table/:type/:letter/:stati/:search_txt/:search_field', function dld_tax_table(req, res) {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;
    var currentTimeInSeconds=Math.floor(Date.now()/1000); //unix timestamp in seconds
    let letter='all',statusfilter='on',search_txt='',search_field=''
    let send_list = []
    let type = req.params.type
//   if(req.session.ttable_filter){
//      console.log('dld_taxtable/:type --filter')
//      
//      if(req.session.ttable_filter.letter){
//         letter = req.session.ttable_filter.letter
//      }
//      if(req.session.ttable_filter.status){
//         statusfilter = Object.keys(req.session.ttable_filter.status).filter(item => req.session.ttable_filter.status[item] === 'on')
//      }
//      if(req.session.ttable_filter.txt_srch){
//         search_txt = req.session.ttable_filter.text.txt_srch
//      }
//      if(req.session.ttable_filter.field){
//         search_field = req.session.ttable_filter.text.field
//      }
//   }
//   
//   //console.log(type,letter,statusfilter,search_txt,search_field)
//   // Apply filters
//   //console.log('C.taxon_lookup-1',C.taxon_lookup['1'])
//   //console.log('C.taxon_lookup374',C.taxon_lookup['374'])
//   let temp_list = Object.values(C.taxon_lookup);
//   //console.log('list_of_otids1',temp_list.indexOf('374'))
//   let file_filter_txt = ""
//   if(letter && letter.match(/[A-Z]{1}/)){
//       helpers.print(['MATCH Letter: ',letter])
//       send_list = temp_list.filter(item => item.genus.charAt(0) === letter)
//       //console.log('list_of_otids2',temp_list.indexOf('374'))
//       file_filter_txt = "HOMD.org Taxon Data::Letter Filter Applied (genus with first letter of '"+letter+"')"
//   }else if(search_txt !== ''){
//       send_list = get_filtered_taxon_list(search_txt, search_field)
//       //console.log('list_of_otids3',temp_list.indexOf('374'))
//       file_filter_txt = "HOMD.org Taxon Data::Search Filter Applied (Search text '"+search_txt+"')"
//   //}else if(sitefilter.length > 0 ||  statusfilter.length > 0){
//   }else if(statusfilter.length === 0){
//     // this is for download default table. on the downloads page
//     // you cant get here from the table itself (javascript prevents)
//     helpers.print('in dwnld filters==[][]')
//     send_list = temp_list
//     //console.log('list_of_otids4',temp_list.indexOf('374'))
//   }else {
//     // apply site/status filter as last resort
//     //console.log('in dwnld filters',statusfilter)
//     
//     if(statusfilter.length == 0){  // only items from site filter checked
//       send_list = temp_list
//     }else {
//       send_list = temp_list.filter( function(e){
//         if(e.sites.length == 0){
//             return e  // important to capture taxa with no presence in sites table
//         }else{
//             for(var n in e.sites){
//               
//               var status = e.status.toLowerCase()
//               if( statusfilter.indexOf(status) !== -1 )
//               { return e }
//             }
//         }
//          
//         })
//         //console.log('list_of_otids5',temp_list.indexOf('374'))
//     } 
//   } 
//     
    
   send_list = helpers.apply_ttable_filter(req, req.session.ttable_filter)
  let file_filter_txt = "HOMD.org Taxon Data::Site/Status Filter Applied"+ " Date: "+today 

  let list_of_otids = send_list.map(item => item.otid)

  // type = browser, text or excel
  var table_tsv = create_taxon_table(list_of_otids, 'table', type, file_filter_txt )
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
router.get('/dld_tax/:type/:fxn', function dld_tax(req, res) {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;
    var currentTimeInSeconds=Math.floor(Date.now()/1000); //unix timestamp in seconds

    let type = req.params.type   // browser, text or excel
    let fxn = req.params.fxn     // hierarchy or level
    helpers.print(['in download: '+type+'::'+fxn])
    let file_filter_txt, table_tsv;
   
    let temp_list = Object.values(C.taxon_lookup);
    let list_of_otids = temp_list.map(item => item.otid)  // use all the otids
    if(fxn == 'level'){
        file_filter_txt = "HOMD.org Taxon Data::Taxonomic Level" 
        table_tsv = create_taxon_table(list_of_otids, 'level', type, file_filter_txt )
    }else if(fxn == 'hierarchy'){
        file_filter_txt = "HOMD.org Taxon Data::Taxonomic Hierarchy" 
        table_tsv = create_taxon_table(list_of_otids, 'hierarchy', type, file_filter_txt )
    }else {
       // type error
    }
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

router.get('/dld_taxabund/:type/:source/', function dld_taxabund(req, res) {
    //console.log('in dld abund - taxon')
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;
    var currentTimeInSeconds=Math.floor(Date.now()/1000); //unix timestamp in seconds

    let type = req.params.type
    let source = req.params.source
    //helpers.print('type: '+type+' source: '+source)
    let table_tsv='',row,site
    let temp_list = Object.values(C.taxon_counts_lookup)
    let abundance_order
    let header = 'HOMD (https://homd.org/)::'
    if(source === 'dewhirst'){
        header += 'HOMD Data from Dewhirst(unpublished); '
        abundance_order = C.dewhirst_abundance_order
    }else if(source === 'erenv1v3'){
        if(type === 'samples_file'){
            let fullpath = path.join(CFG.PATH_TO_STATIC_DOWNLOADS,'eren2014_v1v3_rank_abundance_sums_homd.csv.gz')
            res.download(fullpath)
            return 
        }
        header += 'HOMD Data from Eren(2014) V1-V3; '
        abundance_order = C.eren_abundance_order
    }else if(source === 'erenv3v5'){
        if(type === 'samples_file'){
            let fullpath = path.join(CFG.PATH_TO_STATIC_DOWNLOADS,'eren2014_v3v5_rank_abundance_sums_homd.csv.gz')
            res.download(fullpath)
            return
        }
        header += 'HOMD Data from Eren(2014) V3-V5; '
        abundance_order = C.eren_abundance_order
    }else if(source === 'hmpmeta'){
        header += 'HOMD Data from HMP MetaPhlan (unpublished); '
        abundance_order = C.hmp_metaphlan_abundance_order
    }else if(source === 'hmprefseqv1v3'){
        if(type === 'samples_file'){
            let fullpath = path.join(CFG.PATH_TO_STATIC_DOWNLOADS,'HMP_16SRefseq_Ranked_Abundance_v1v3_homd.tar.gz')
            res.download(fullpath)
            return 
        }
        header += 'HOMD Data from HMP 16S RefSeq V1-V3 (unpublished); '
        abundance_order = C.hmp_refseq_abundance_order
    }else if(source === 'hmprefseqv3v5'){
        if(type === 'samples_file'){
            let fullpath = path.join(CFG.PATH_TO_STATIC_DOWNLOADS,'HMP_16SRefseq_Ranked_Abundance_v3v5_homd.tar.gz')
            res.download(fullpath)
            return 
        }
        header += 'HOMD Data from HMP 16S RefSeq V3-V5 (unpublished); '
        abundance_order = C.hmp_refseq_abundance_order
    }
    header += 'HMT == Human Microbial Taxon'
    table_tsv += header+'\nTAX\tHMT' 
    
    for(let n in abundance_order){
         site = abundance_order[n]
         table_tsv += '\t' +site+'_mean'+'\t'+site+'_stdev'+'\t'+site+'_prev'
    }
    table_tsv += '\n'
    for(let tax_string in C.taxon_counts_lookup){
      if(source === 'dewhirst' 
                && C.taxon_counts_lookup[tax_string].hasOwnProperty('dewhirst') 
                && Object.keys(C.taxon_counts_lookup[tax_string]['dewhirst']).length > 0)
            {
            table_tsv += tax_string+'\t'+C.taxon_counts_lookup[tax_string]['otid']
            row = C.taxon_counts_lookup[tax_string]['dewhirst']
            for(let n in abundance_order){
                site = abundance_order[n]
                table_tsv += '\t'+row[site]['avg']+'\t'+row[site]['sd']+'\t'+row[site]['prev']
            }
            table_tsv += '\n'
      }else if(source === 'erenv1v3' 
                && C.taxon_counts_lookup[tax_string].hasOwnProperty('eren_v1v3')
                && Object.keys(C.taxon_counts_lookup[tax_string]['eren_v1v3']).length > 0)
            {
            table_tsv += tax_string+'\t'+C.taxon_counts_lookup[tax_string]['otid']
            row = C.taxon_counts_lookup[tax_string]['eren_v1v3']
            for(let n in abundance_order){
                site = abundance_order[n]
                table_tsv += '\t'+row[site]['avg']+'\t'+row[site]['sd']+'\t'+row[site]['prev']
            }
            table_tsv += '\n'
      }else if(source === 'erenv3v5' 
                && C.taxon_counts_lookup[tax_string].hasOwnProperty('eren_v3v5')
                &&  Object.keys(C.taxon_counts_lookup[tax_string]['eren_v3v5']).length > 0)
            {
            table_tsv += tax_string+'\t'+C.taxon_counts_lookup[tax_string]['otid']
            row = C.taxon_counts_lookup[tax_string]['eren_v3v5']
            for(let n in abundance_order){
                site = abundance_order[n]
                table_tsv += '\t'+row[site]['avg']+'\t'+row[site]['sd']+'\t'+row[site]['prev']
            }
            table_tsv += '\n'
      }else if(source === 'hmpmeta' 
                && C.taxon_counts_lookup[tax_string].hasOwnProperty('hmp_metaphlan')
                &&  Object.keys(C.taxon_counts_lookup[tax_string]['hmp_metaphlan']).length > 0)
            {
            table_tsv += tax_string+'\t'+C.taxon_counts_lookup[tax_string]['otid']
            row = C.taxon_counts_lookup[tax_string]['hmp_metaphlan']
            for(let n in abundance_order){
                site = abundance_order[n]
                table_tsv += '\t'+row[site]['avg']+'\t'+row[site]['sd']+'\t'+row[site]['prev']
            }
            table_tsv += '\n'
            
            
      }else if(source === 'hmprefseqv1v3'
              && C.taxon_counts_lookup[tax_string].hasOwnProperty('hmp_refseq_v1v3')
                &&  Object.keys(C.taxon_counts_lookup[tax_string]['hmp_refseq_v1v3']).length > 0)
            {
            table_tsv += tax_string+'\t'+C.taxon_counts_lookup[tax_string]['otid']
            row = C.taxon_counts_lookup[tax_string]['hmp_refseq_v1v3']
            for(let n in abundance_order){
                site = abundance_order[n]
                table_tsv += '\t'+row[site]['avg']+'\t'+row[site]['sd']+'\t'+row[site]['prev']
            }
            table_tsv += '\n'
      }else if(source === 'hmprefseqv3v5'
              && C.taxon_counts_lookup[tax_string].hasOwnProperty('hmp_refseq_v3v5')
                &&  Object.keys(C.taxon_counts_lookup[tax_string]['hmp_refseq_v3v5']).length > 0)
            {
            table_tsv += tax_string+'\t'+C.taxon_counts_lookup[tax_string]['otid']
            row = C.taxon_counts_lookup[tax_string]['hmp_refseq_v3v5']
            for(let n in abundance_order){
                site = abundance_order[n]
                table_tsv += '\t'+row[site]['avg']+'\t'+row[site]['sd']+'\t'+row[site]['prev']
            }
            table_tsv += '\n'
      }else{
         // error
      }
    }
    let filename = 'HOMD_abundance_table_'+source
    if(type === 'browser'){
      res.set('Content-Type', 'text/plain');  // <= important - allows tabs to display
    }else if(type === 'text'){
      res.set({"Content-Disposition":"attachment; filename=\""+filename+today+'_'+currentTimeInSeconds+".txt\""})
    }else if(type === 'excel'){
      res.set({"Content-Disposition":"attachment; filename=\""+filename+today+'_'+currentTimeInSeconds+".xls\""})
    }else {
      // error
      console.log('Download table format ERROR')
    }
    res.send(table_tsv)
    res.end()
}) 
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
router.get('/dld_genome_table_all/:type', function dld_genome_table_all (req, res) {
    var today = new Date()
var dd = String(today.getDate()).padStart(2, '0')
var mm = String(today.getMonth() + 1).padStart(2, '0') // January is 0!
var yyyy = today.getFullYear()
today = yyyy + '-' + mm + '-' + dd
var currentTimeInSeconds=Math.floor(Date.now()/1000) // unix timestamp in seconds
    const type = req.params.type
    let fileFilterText = 'HOMD.org Genome Data:: All Genome Data'
    const sendList = Object.values(C.genome_lookup)
    const listOfGids = sendList.map(item => item.gid)
    fileFilterText = fileFilterText + ' Date: ' + today
    
    let q = "SELECT * from genomes"
    console.log(q)
    TDBConn.query(q, (err, mysqlrows) => {
        if(err){
           console.log(err)
           return
        }
        //console.log(mysqlrows)
        //const tableTsv = createTable(listOfGids, 'table', type, fileFilterText)
        const tableTsv = create_full_genome_table(mysqlrows, fileFilterText)
    
        if (type === 'browser') {
          res.set('Content-Type', 'text/plain') // <= important - allows tabs to display
        } else if (type === 'text') {
          res.set({ 'Content-Disposition': 'attachment; filename="HOMD_genome_table' + today + '_' + currentTimeInSeconds + '.txt"' })
        } else if (type === 'excel') {
          res.set({ 'Content-Disposition': 'attachment; filename="HOMD_genome_table' + today + '_' + currentTimeInSeconds + '.xls"' })
        } else {
          // error
          console.log('Download table format ERROR')
        }
        res.send(tableTsv)
        res.end()
    })
})
//
router.get('/dld_genome_table/:type', function dld_genome_table (req, res) {
  
  //console.log('in download table -genome:')
  var today = new Date()
  var dd = String(today.getDate()).padStart(2, '0')
  var mm = String(today.getMonth() + 1).padStart(2, '0') // January is 0!
  var yyyy = today.getFullYear()
  today = yyyy + '-' + mm + '-' + dd
  var currentTimeInSeconds=Math.floor(Date.now()/1000) // unix timestamp in seconds
  const type = req.params.type
  const letter = req.session.gtable_filter.letter
  const phylum = req.session.gtable_filter.phylum
  const otid = req.session.gtable_filter.otid
  const searchText = req.session.gtable_filter.text.txt_srch
  const searchField = req.session.gtable_filter.text.field

  helpers.print(['type', type,'letter', letter,'phylum', phylum,'otid', otid])
  // Apply filters
  const tempList = Object.values(C.genome_lookup)
  let sendList = []
  let fileFilterText = ''
  if (letter && letter.match(/[A-Z]{1}/)) { // always caps
    //console.log('in letter dnld')
    helpers.print(['MATCH Letter: ', letter])
    sendList = tempList.filter(item => item.genus.charAt(0) === letter)
    helpers.print(sendList)
    fileFilterText = "HOMD.org Genome Data::Letter Filter Applied (genus with first letter of '" + letter + "')"
  } else if (otid !== '') {
    //console.log('in otid dnld')
    const gidList = C.taxon_lookup[otid].genomes
    // console.log('sil',seqid_list)
    for (let n in gidList) {
      sendList.push(C.genome_lookup[gidList[n]])
    }
    fileFilterText = 'HOMD.org Genome Data::Oral TaxonID: HMT-' + ('000' + otid).slice(-3)
  } else if (phylum !== '') {
    //console.log('in phylum dnld')
    const lineageList = Object.values(C.taxon_lineage_lookup)
    const objList = lineageList.filter(item => item.phylum === phylum) // filter for phylum
    
    const otidList = objList.map((el) => { // get list of otids with this phylum
      return el.otid
    })
    helpers.print(['otid_list', otidList])
    sendList = tempList.filter(item => { // filter genome obj list for inclusion in otid list
      return otidList.indexOf(item.otid) !== -1
    })
    helpers.print(['cksend_list', sendList])
    fileFilterText = 'HOMD.org Genome Data::Phylum: ' + phylum
  } else if (searchText !== '') {
    const bigGeneList = Object.values(C.genome_lookup)
    sendList = getFilteredGenomeList(bigGeneList, searchText, searchField)
    fileFilterText = 'HOMD.org Genome Data::Search Text: ' + searchText
  } else {
    // whole list as last resort
    //console.log('in all dnld')
    sendList = tempList
    fileFilterText = 'HOMD.org Genome Data:: All Genome Data'
  }
  const listOfGids = sendList.map(item => item.gid)
  fileFilterText = fileFilterText + ' Date: ' + today

  //helpers.print(['listOfGids', listOfGids])
  // type = browser, text or excel
  const tableTsv = create_genome_table(listOfGids, 'table', type, fileFilterText)

  if (type === 'browser') {
    res.set('Content-Type', 'text/plain') // <= important - allows tabs to display
  } else if (type === 'text') {
    let fname = 'HOMD_genome_table' + today + '_' + currentTimeInSeconds + '.txt'
    res.set({ 'Content-Disposition': 'attachment; filename="'+fname+'"' })
  } else if (type === 'excel') {
    let fname = 'HOMD_genome_table' + today + '_' + currentTimeInSeconds + '.xls'
    res.set({ 'Content-Disposition': 'attachment; filename="'+fname+'"' })
  } else {
    // error
    console.log('Download table format ERROR')
  }
  res.send(tableTsv)
  res.end()
  
})

// /////////////////////////////
router.get('/dld_peptide_table_all/:study', function dld_peptide_table_all (req, res) {
    const study = req.params.study
    let fullpath = path.join(CFG.PATH_TO_STATIC_DOWNLOADS,'homd_protein-peptides_study'+study+'.csv')
    res.download(fullpath)
    return 
})
router.get('/dnld_pangenome',(req, res) => {
    console.log('req query',req.query)
    let pg = req.query.pg
    let ver = req.query.V
    let fn
    let obj = C.pangenomes.find(o => o.name === pg);
    
    if(ver === '7'){
       fn = obj.dnld_v7
    }else{
       fn = obj.dnld_v8
    }
    
    let fullpath = path.join(CFG.PATH_TO_PANGENOMES, req.query.pg, fn)
    
    helpers.print('file path: '+fullpath)
    res.download(fullpath)

});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function create_taxon_table(otids, source, type, head_txt) {
    // source == table, hirearchy or level
    let txt = head_txt+'\n'
    let headers,lineage,old_lineage,otid_pretty,rank,cnts
    if(source === 'table'){
        let obj1 = C.taxon_lookup
        let obj2 = C.taxon_lineage_lookup
        let obj3 = C.taxon_info_lookup 
        let obj4 = C.taxon_references_lookup 
        //console.log('o1-3')
        //console.log(obj1[3])
        
        headers = ["HMT_ID",
                   "Domain","Phylum","Class","Order","Family","Genus","Species","Subspecies",
                   "Status","Body_site","Warning","Type_strain","16S_rRNA","Clone_count",
                   "Clone_%","Clone_rank","Synonyms","NCBI_taxon_id","NCBI_pubmed_count",
                   "NCBI_nucleotide_count","NCBI_protein_count","Genome_ID","General_info",
                   "Cultivability","Phenotypic_characteristics","Prevalence","Disease","References",
                   "Genome_Size"
                   ]
        
        txt +=  headers.join('\t')
        var o1,o2,o3,o4
        for(var n in otids){
            
            let otid = otids[n].toString()
            o1 = obj1[otid]
             //console.log('otid',otid)
             
            if(otid in obj2){
               o2 = obj2[otid]
            }else {
               o2 = {'domain':'','phylum':'','klass':'','order':'','family':'','genus':'','species':'','subspecies':''}
            }
            if(otid in obj3){
               o3 = obj3[otid]
            }else {
               o3 = {'general':'','culta':'','pheno':'','prev':'','disease':''}
            }
            if(otid in obj4){
               o4 = obj4[otid]
            }else {
               o4 = {NCBI_pubmed_search_count: '0',NCBI_nucleotide_search_count: '0',NCBI_protein_search_count: '0'}
            }
            // list! o1.type_strain, o1,genomes, o1,synonyms, o1.sites, o1.ref_strains, o1,rrna_sequences
            // clone counts
            if(o2.domain){  // weeds out dropped
               //console.log('o2',o2)
               let tstrains = o1.type_strains.join(' | ')
               let gn = o1.genomes.join(' | ')
               let syn = o1.synonyms.join(' | ')
               let sites = o1.sites.join(' | ')
               let rstrains = o1.ref_strains.join(' | ')
               let rnaseq = o1.rrna_sequences.join(' | ')
               
               // per FDewhirst: species needs to be unencumbered of genus for this table
               // let species_pts = o2.species.split(/\s/)
//                species_pts.shift()
//                let species = species_pts.join(' ')
               
               let species = o2.species.replace(o2.genus,'').trim()  // removing gens from species name
               var r = [("000" + otid).slice(-3),o2.domain,o2.phylum,o2.klass,o2.order,o2.family,o2.genus,species,o2.subspecies,
                        o1.status,sites,o1.warning,tstrains,rnaseq,,,,syn,o1.ncbi_taxid,o4.NCBI_pubmed_search_count,
                        o4.NCBI_nucleotide_search_count,o4.NCBI_protein_search_count,gn,o3.general,
                        o3.culta,o3.pheno,o3.prev,o3.disease,,
                        o1.tlength_str
                        ]
               var row = r.join('\t')
               txt += '\n'+row
            }
        }
    }else if(source === 'level'){
        headers = ['Domain','Domain_count','Phylum','Phylum_count','Class','Class_count','Order','Order_count',
                   'Family','Family_count','Genus','Genus_count','Species','Species_count','Subspecies','Oral_Taxon_ID'
                   ]
        txt +=  headers.join('\t')+'\n'
        
        for(var n in otids){
            otid_pretty = 'HMT-'+("000" + otids[n]).slice(-3);
            //console.log(C.taxon_lineage_lookup[otids[n]])
            old_lineage = ''
            if(otids[n] in C.taxon_lineage_lookup){
                for( var m in C.ranks){
                    rank = C.ranks[m]
                
                    lineage = old_lineage + C.taxon_lineage_lookup[otids[n]][rank]
                    //console.log(rank,lineage)
                    cnts = C.taxon_counts_lookup[lineage].taxcnt
                    if(rank == 'subspecies' ){
                          txt += C.taxon_lineage_lookup[otids[n]]['subspecies']+'\t'+otid_pretty // no counts
                    }else if(rank == 'species' ){
                      if(C.taxon_lineage_lookup[otids[n]]['subspecies'] == ''){
                         old_lineage = lineage
                      }else {
                         old_lineage = lineage+';'
                      }
                      txt += C.taxon_lineage_lookup[otids[n]]['species']+'\t'+cnts+'\t'
                    }else {
                       old_lineage = lineage+';'
                       txt += C.taxon_lineage_lookup[otids[n]][rank]+'\t'+cnts+'\t'
                    }
                }
                txt += '\n'
            }
        }
    }else if(source === 'hierarchy'){
        headers = ['Domain','Phylum','Class','Order','Family','Genus','Species','Subspecies','Oral_Taxon_ID',
                   'Domain_Taxon_Count','Domain_Seq_Count','Domain_Clone_Count',
                   'Phylum_Taxon_Count','Phylum_Seq_Count','Phylum_Clone_Count',
                   'Class_Taxon_Count','Class_Seq_Count','Class_Clone_Count',
                   'Order_Taxon_Count','Order_Seq_Count','Order_Clone_Count',
                   'Family_Taxon_Count','Family_Seq_Count','Family_Clone_Count',
                   'Genus_Taxon_Count','Genus_Seq_Count','Genus_Clone_Count',
                   'Species_Taxon_Count','Species_Seq_Count','Species_Clone_Count',
                   'Subspecies_Taxon_Count','Subspecies_Seq_Count','Subspecies_Clone_Count'
                   ]
        txt +=  headers.join('\t')+'\n'
        for(var n in otids){
            otid_pretty = 'HMT-'+("000" + otids[n]).slice(-3);
            old_lineage = ''
            if(otids[n] in C.taxon_lineage_lookup){
                for( var m in C.ranks){
                    rank = C.ranks[m]
                    txt += C.taxon_lineage_lookup[otids[n]][rank] +'\t'
                }
                txt += otid_pretty+'\t'
                // tax_counts
                for( var m in C.ranks){
                    rank = C.ranks[m]
                    lineage = old_lineage + C.taxon_lineage_lookup[otids[n]][rank]
                    cnts = C.taxon_counts_lookup[lineage]
                    //console.log(lineage)
                    //console.log(cnts)
                    txt += cnts.taxcnt +'\t'+cnts.gcnt +'\t'+cnts.refcnt +'\t'
                    if(rank == 'species' ){
                      if(C.taxon_lineage_lookup[otids[n]]['subspecies'] == ''){
                         old_lineage = lineage
                      }else {
                         old_lineage = lineage+';'
                      }
                    }else {
                      old_lineage = lineage+';'
                    }
                }
                // are clone counts the same as refseq counts????
                txt += '\n'
            }
        }
        
    }else {
       // source ERROR
       return 'ERROR'
    }
    //console.log(C.homd_taxonomy)
    //console.log(C.taxon_counts_lookup )
    return txt
}        
//
function create_full_genome_table (sqlrows, startText) {
    let txt = startText + '\n'
    let tmp,data,i,n,hmt
    const headersRow = Object.keys(sqlrows[0])
    txt += headersRow.join('\t')+'\n'
    //console.log('sqlrows',headersRow)
    for(n in sqlrows){
        tmp = []
        for(i in headersRow){
          data = []
          if(headersRow[i] == 'otid'){
              hmt = helpers.make_otid_display_name(sqlrows[n][headersRow[i]])
              data.push(hmt)
          }else{
              data.push(sqlrows[n][headersRow[i]])
          }
          tmp.push(data)
          //console.log('hd',sqlrows[n][headersRow[i]])
        }
        txt += tmp.join('\t')
        txt += '\n'
    }
    return txt
}
// ////////////////////////////
function create_genome_table (gids, source, type, startText) {
  let txt = startText + '\n'
  if (source === 'table') {
    const headersRow = ['Genbank Acc no.','Genome-ID', 'Oral_Taxon-ID', 'Genus', 'Species',  'No. Contigs',  'Total Length',  'Infraspecific Names', 'GC %']
    txt += headersRow.join('\t')+'\n'
    console.log('SEQF5379.1',C.genome_lookup['SEQF5379.1'])
    for (let n in gids) {
      const gid = gids[n]
      const obj = C.genome_lookup[gid]
      // per FDewhirst: species needs to be unencumbered of genus for this table
      let species = obj.species.replace(obj.genus,'').trim()
      let hmt = helpers.make_otid_display_name(obj.otid)
      const r = [obj.gb_asmbly, gid, hmt, obj.genus, obj.species, obj.ncontigs, obj.tlength, obj.ccolct, obj.gc]
      txt += r.join('\t') +'\n'
    }
  }
  // console.log(txt)
  return txt
}
module.exports = router;