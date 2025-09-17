'use strict'
const express  = require('express');
let router   = express.Router();
const CFG   = require(app_root + '/config/config');
const fs       = require('fs-extra');
// const url = require('url');
const path     = require('path');
const C     = require(app_root + '/public/constants');
const helpers         = require(app_root + '/routes/helpers/helpers');
const helpers_taxa    = require(app_root + '/routes/helpers/helpers_taxa');
const helpers_genomes = require(app_root + '/routes/helpers/helpers_genomes');
const queries = require(app_root + '/routes/queries')


router.get('/download/:q', function download(req, res) {
  // renders the overall downlads page
  //console.log('q',req.params)
  let q = req.params.q
  res.render('pages/download', {
    title: 'HOMD :: Downloads',
    pgname: 'download', // for AbountThisPage
    section: q,
    config: JSON.stringify(CFG),
    ver_info: JSON.stringify(C.version_information)

  })
})
router.get('/download', function download(req, res) {
   res.redirect('download/all');
})
router.get('/download_file', function search(req, res) {
  //let page = req.params.pagecode
  let fullpath = req.query.filename
  helpers.print('file path: '+fullpath)
  res.download(fullpath)
  //res.end()
})

router.get('/dld_taxtable_all/:type/', function dld_taxtable_all(req, res) {
//router.get('/dld_table_all/:type/:letter/:stati/:search_txt/:search_field', function dld_tax_table(req, res) {
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;
    let currentTimeInSeconds=Math.floor(Date.now()/1000); //unix timestamp in seconds

    let type = req.params.type
    let file_filter_txt = "HOMD.org Taxon Data::No Filter Applied"+ " Date: "+today 
    let send_list = Object.values(C.taxon_lookup);
    
    let list_of_otids = send_list.map(item => item.otid)
    
    console.log('ALL::Count of OTIDs:',list_of_otids.length)
    
    let table_tsv = create_taxon_table(list_of_otids, 'table', type, file_filter_txt )
    
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
router.get('/dld_refseqtable_all/:type', function dld_refseqtable(req, res) {
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;
    let currentTimeInSeconds=Math.floor(Date.now()/1000); //unix timestamp in seconds
    let otid,tmp_ary,vals,hmt,refseq_array=[]
    let type = req.params.type
    let tableTsv = "HOMD.org RefSeq Data;"+ " Date: "+today + '\n'
    let headers = ["HMT-ID","RefSeq-ID","Species","Sequence Length","SeqID Count","Seq-IDs"]
    tableTsv +=  headers.join('\t') + '\n'
    let keys = Object.keys(C.refseq_lookup)
    for(let n in keys){
         otid = keys[n]
         hmt = helpers.make_otid_display_name(otid)
         vals = C.refseq_lookup[otid]
         for(let m  in vals){
            refseq_array.push({
                otid:        otid,
                species:     vals[m].species,
                refseq_id:   vals[m].refseq_id,
                length:      vals[m].seq_length,
                seqid_count: vals[m].seqid_count,
                seqids:      vals[m].seqids,
            })
         }
    
    }
    refseq_array.sort((a, b) => {
        return helpers.compareStrings_alpha(a.species, b.species);
    })
    for(let n in refseq_array){
        hmt = helpers.make_otid_display_name(refseq_array[n].otid)
        tableTsv += hmt+'\t'+refseq_array[n].refseq_id+'\t'+refseq_array[n].species+'\t'+refseq_array[n].length+'\t'+refseq_array[n].seqid_count+'\t'+refseq_array[n].seqids+'\n'
    }
    
    if (type === 'browser') {
        res.set('Content-Type', 'text/plain') // <= important - allows tabs to display
    } else if (type === 'text') {
        let fname = 'HOMD_refseq_table' + today + '_' + currentTimeInSeconds + '.txt'
        res.set({ 'Content-Disposition': 'attachment; filename="'+fname+'"' })
    } else if (type === 'excel') {
        let fname = 'HOMD_refseq_table' + today + '_' + currentTimeInSeconds + '.xls'
        res.set({ 'Content-Disposition': 'attachment; filename="'+fname+'"' })
    } else {
        // error
        console.log('Download table format ERROR')
    }
    res.send(tableTsv)
    res.end()
    

})
router.get('/dld_taxtable/:type', function dld_taxtable(req, res) {
//router.get('/dld_table/:type/:letter/:stati/:search_txt/:search_field', function dld_tax_table(req, res) {
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;
    let currentTimeInSeconds=Math.floor(Date.now()/1000); //unix timestamp in seconds
    let letter='all',statusfilter='on',search_txt='',search_field=''
    let send_list = []
    let type = req.params.type

    
    send_list = helpers_taxa.apply_ttable_filter(req, req.session.ttable_filter)
    let file_filter_txt = "HOMD.org Taxon Data::Site/Status Filter Applied"+ " Date: "+today 

    let list_of_otids = send_list.map(item => item.otid)
    //console.log('Table::Count of OTIDs:',list_of_otids)
    // type = browser, text or excel
    let table_tsv = create_taxon_table(list_of_otids, 'table', type, file_filter_txt )
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
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;
    let currentTimeInSeconds=Math.floor(Date.now()/1000); //unix timestamp in seconds

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
    }else if(fxn == 'lineage'){
        file_filter_txt = "HOMD.org Taxon Data::Taxonomic Lineage" 
        table_tsv = create_taxon_table(list_of_otids, 'lineage', type, file_filter_txt )
    
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
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;
    let currentTimeInSeconds=Math.floor(Date.now()/1000); //unix timestamp in seconds

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
router.get('/dld_genome_table_all/:type/:filter', function dld_genome_table_all (req, res) {
    let today = new Date()
    let dd = String(today.getDate()).padStart(2, '0')
    let mm = String(today.getMonth() + 1).padStart(2, '0') // January is 0!
    let yyyy = today.getFullYear()
    today = yyyy + '-' + mm + '-' + dd
    let currentTimeInSeconds=Math.floor(Date.now()/1000) // unix timestamp in seconds
    const type = req.params.type
    const filter = req.params.filter
    
    let fileFilterText,tableTsv
    const sendList = Object.values(C.genome_lookup)
    const listOfGids = sendList.map(item => item.gid)
    
    
    const q = queries.get_all_genomes()

    TDBConn.query(q, (err, mysqlrows) => {
        if(err){
           console.log(err)
           return
        }
        //console.log(mysqlrows)
        //const tableTsv = createTable(listOfGids, 'table', type, fileFilterText)
        if(filter === 'gtdb'){
            fileFilterText = 'HOMD.org Genome Data:: GTDB Taxonomy' + ' Date: ' + today
            tableTsv = create_full_genome_table_gtdb(mysqlrows, fileFilterText)
        }else{
            fileFilterText = 'HOMD.org Genome Data:: All Genome Data' + ' Date: ' + today
            tableTsv = create_full_genome_table(mysqlrows, fileFilterText)
        }
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
  
  console.log('in download table partial-genome:')
  let today = new Date()
  let dd = String(today.getDate()).padStart(2, '0')
  let mm = String(today.getMonth() + 1).padStart(2, '0') // January is 0!
  let yyyy = today.getFullYear()
  today = yyyy + '-' + mm + '-' + dd
  let currentTimeInSeconds=Math.floor(Date.now()/1000) // unix timestamp in seconds
  const type = req.params.type
  
  let letter = '0'
  let phylum = ''
  let otid = ''
  let searchText = ''
  let searchField = ''
  let filter = helpers_genomes.get_default_gtable_filter()
  if(req.session.hasOwnProperty('gtable_filter')){
    filter = req.session.gtable_filter
    //console.log('filter',filter)
    
  }
  //console.log('YYYfilter',filter)
  let sendList = helpers_genomes.apply_gtable_filter(req, filter)
 //  if(req.session.hasOwnProperty('gtable_filter')){
//      console.log('req.session.gtable_filter',req.session.gtable_filter)
//      letter = req.session.gtable_filter.letter
//      phylum = req.session.gtable_filter.phylum
//      otid = req.session.gtable_filter.otid
//      searchText = req.session.gtable_filter.text.txt_srch
//      searchField = req.session.gtable_filter.text.field
//   }
//   //helpers.print(['type', type,'letter', letter,'phylum', phylum,'otid', otid])
//   // Apply filters
//   const tempList = Object.values(C.genome_lookup)
//   let sendList = []
//   let fileFilterText = ''
//   if (letter && letter.match(/[A-Z]{1}/)) { // always caps
//     //console.log('in letter dnld')
//     helpers.print(['MATCH Letter: ', letter])
//     sendList = tempList.filter(item => item.organism.charAt(0) === letter)
//     //helpers.print(sendList)
//     fileFilterText = "HOMD.org Genome Data::Letter Filter Applied (genus with first letter of '" + letter + "')"
//   } else if (otid !== '') {
//     //console.log('in otid dnld')
//     const gidList = C.taxon_lookup[otid].genomes
//     // console.log('sil',seqid_list)
//     for (let n in gidList) {
//       sendList.push(C.genome_lookup[gidList[n]])
//     }
//     fileFilterText = 'HOMD.org Genome Data::Oral TaxonID: HMT-' + ('000' + otid).slice(-3)
//   } else if (phylum !== '') {
//     //console.log('in phylum dnld')
//     const lineageList = Object.values(C.taxon_lineage_lookup)
//     const objList = lineageList.filter(item => item.phylum === phylum) // filter for phylum
//     
//     const otidList = objList.map((el) => { // get list of otids with this phylum
//       return el.otid
//     })
//     //helpers.print(['otid_list', otidList])
//     sendList = tempList.filter(item => { // filter genome obj list for inclusion in otid list
//       return otidList.indexOf(item.otid) !== -1
//     })
//     //helpers.print(['cksend_list', sendList])
//     fileFilterText = 'HOMD.org Genome Data::Phylum: ' + phylum
//   } else if (searchText !== '') {
//     const bigGeneList = Object.values(C.genome_lookup)
//     sendList = helpers.get_filtered_genome_list(bigGeneList, searchText, searchField)
//     fileFilterText = 'HOMD.org Genome Data::Search Text: ' + searchText
//   } else {
//     // whole list as last resort
//     //console.log('in all dnld')
//     sendList = tempList
     let fileFilterText = 'HOMD.org Genome Data:: Filtered Genome Data'
//   }
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
router.get('/dld_static_file/:fname', function dld_static_file (req, res) {
    const fname = req.params.fname
    
    let fullpath = path.join(CFG.PATH_TO_STATIC_DOWNLOADS,fname)
    console.log('downloading',fullpath)
    res.download(fullpath)
    return 
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
function create_refseq_table(source, type, head_txt) {

}
function create_taxon_table(otids, source, type, head_txt) {
    // source == table, hirearchy or level
    let txt = head_txt+'\n'
    let headers,lineage,old_lineage,otid_pretty,rank,cnts
    if(source === 'table'){
        let obj1 = C.taxon_lookup
        let obj2 = C.taxon_lineage_lookup
        //let obj3 = C.taxon_info_lookup  // discontinued 2025-02-24
        let obj4 = C.taxon_references_lookup 
        let obj5 = C.site_lookup 
        //console.log('in create_taxon_table: '+source)
        //console.log('otids',otids)
        
        headers = ["HMT-ID",
                   "Domain","Phylum","Class","Order","Family","Genus","Species","Subspecies",
                   "Naming Status","Cultivation Status","Body Site(s)","Type Strain","16S_rRNA",
                   "Synonyms","NCBI Taxon ID","Genome IDs","Genome Size Range"
                   ]
        
        txt +=  headers.join('\t')
        let o1,o2 //,o3,o4
        for(let n in otids){
            
            let otid = otids[n].toString()
            if(C.dropped_taxids.indexOf(otid) != -1){
                let data1 = C.taxon_lookup[otid]
                //console.log('data1',data1)
                // let r = [("000" + otid).slice(-3),,
//                         
//                         ]
                let row = 'HMT-'+('000' + otid).slice(-3) +  '\tDROPPED Taxon\t\t\t\t\t' + data1.genus+'\t'+data1.species  //r.join('\t')
                txt += '\n'+row
                
            }else{
            
                o1 = obj1[otid]
                 //console.log('otid',otid)
                 
                if(otid in obj2){
                   o2 = obj2[otid]
                }else {
                   o2 = {'domain':'','phylum':'','klass':'','order':'','family':'','genus':'','species':'','subspecies':''}
                }
                // if(otid in obj3){
//                    o3 = obj3[otid]
//                 }else {
//                    o3 = {'general':'','culta':'','pheno':'','prev':'','disease':''}
//                 }
                // if(otid in obj4){
//                    o4 = obj4[otid]
//                 }else {
//                    o4 = {NCBI_pubmed_search_count: '0',NCBI_nucleotide_search_count: '0',NCBI_protein_search_count: '0'}
//                 }
                // list! o1.type_strain, o1,genomes, o1,synonyms, o1.sites, o1.ref_strains, o1,rrna_sequences
                // clone counts
                if(o2.domain){  // weeds out dropped
                   //console.log('o2',o2)
                   let tstrains = o1.type_strains.join(' | ')
                   let gn = o1.genomes.join(' | ')
                   let syn = o1.synonyms.join(' | ')
                   let sites = obj5[otid].s1
                   if(obj5[otid].hasOwnProperty('s2')){
                       sites = sites + ' | ' +obj5[otid].s2
                   }
                   let rstrains = o1.ref_strains.join(' | ')
                   let rnaseq = o1.rrna_sequences.join(' | ')
                   
                   // per FDewhirst: species needs to be unencumbered of genus for this table
                   // let species_pts = o2.species.split(/\s/)
    //                species_pts.shift()
    //                let species = species_pts.join(' ')
                   
                   otid_pretty = 'HMT-'+("000" + otids[n]).slice(-3);
                   let species = o2.species.replace(o2.genus,'').trim()  // removing gens from species name
                   let r = [otid_pretty,o2.domain,o2.phylum,o2.klass,o2.order,o2.family,o2.genus,species,o2.subspecies,
                            o1.naming_status,o1.cultivation_status,sites,tstrains,rnaseq,syn,o1.ncbi_taxid
                            //,o4.NCBI_pubmed_search_count,o4.NCBI_nucleotide_search_count,o4.NCBI_protein_search_count
                            ,gn,o1.tlength_str
                            //,o3.general,o3.culta,o3.pheno,o3.prev,o3.disease
                            
                            ]
                            
                   let row = r.join('\t')
                   txt += '\n'+row
                }
            }
        }
    }else if(source === 'lineage'){
       headers = ['HMT-ID','Domain','Phylum','Class','Order','Family','Genus','Species','Subspecies']
       txt +=  headers.join('\t')+'\n'
       for(let n in otids){
            otid_pretty = 'HMT-'+("000" + otids[n]).slice(-3);
            //console.log('hmt',otids[n])
            //console.log(C.taxon_lineage_lookup[otids[n]])
            if(otids[n] in C.taxon_lineage_lookup){
                txt += otid_pretty+'\t'+C.taxon_lineage_lookup[otids[n]].domain
                txt += '\t'+C.taxon_lineage_lookup[otids[n]].phylum
                txt += '\t'+C.taxon_lineage_lookup[otids[n]].klass
                txt += '\t'+C.taxon_lineage_lookup[otids[n]].order
                txt += '\t'+C.taxon_lineage_lookup[otids[n]].family
                txt += '\t'+C.taxon_lineage_lookup[otids[n]].genus
                txt += '\t'+C.taxon_lineage_lookup[otids[n]].species
                txt += '\t'+C.taxon_lineage_lookup[otids[n]].subspecies
                txt += '\n'
            }
        }
    }else if(source === 'level'){
        headers = ['Domain','Domain_count','Phylum','Phylum_count','Class','Class_count','Order','Order_count',
                   'Family','Family_count','Genus','Genus_count','Species','Species_count','Subspecies','Oral_Taxon_ID'
                   ]
        txt +=  headers.join('\t')+'\n'
        
        for(let n in otids){
            otid_pretty = 'HMT-'+("000" + otids[n]).slice(-3);
            //console.log(C.taxon_lineage_lookup[otids[n]])
            old_lineage = ''
            if(otids[n] in C.taxon_lineage_lookup){
                for( let m in C.ranks){
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
        for(let n in otids){
            otid_pretty = 'HMT-'+("000" + otids[n]).slice(-3);
            old_lineage = ''
            if(otids[n] in C.taxon_lineage_lookup){
                for( let m in C.ranks){
                    rank = C.ranks[m]
                    txt += C.taxon_lineage_lookup[otids[n]][rank] +'\t'
                }
                txt += otid_pretty+'\t'
                // tax_counts
                for( let m in C.ranks){
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
function create_full_genome_table_gtdb (sqlrows, startText) {
    let txt = startText + '\n'
    let tmp,data,i,n,hmt
    const headersRow = ['Genome-ID','HMT-ID','GTDB Taxonomy']
    txt += headersRow.join('\t')+'\n'
    //console.log('sqlrows',headersRow)
    for(n in sqlrows){
        //console.log(sqlrows[n])
        hmt = helpers.make_otid_display_name(sqlrows[n].otid)
        tmp = [sqlrows[n].genome_id, hmt, sqlrows[n].GTDB_taxonomy]
        
        // for(i in headersRow){
//            
//           data = []
//           if(headersRow[i] == 'otid'){
//               hmt = helpers.make_otid_display_name(sqlrows[n][headersRow[i]])
//               data.push(hmt)
//           }else{
//               data.push(sqlrows[n][headersRow[i]])
//           }
//           tmp.push(data)
//           //console.log('hd',sqlrows[n][headersRow[i]])
//         }
        txt += tmp.join('\t')
        txt += '\n'
    }
    return txt
}
// ////////////////////////////
function create_genome_table (gids, source, type, startText) {
  let txt = startText + '\n'
  if (source === 'table') {
    const headersRow = ['Genome-ID', 'Oral_Taxon-ID', 'Genus', 'Species', 'SubSpecies', 'Strain','No. Contigs',  'Total Length',   'Category','GC %']
    txt += headersRow.join('\t')+'\n'
    ///console.log('SEQF5379.1',C.genome_lookup['SEQF5379.1'])
    for (let n in gids) {
      const gid = gids[n]
      const obj = C.genome_lookup[gid]
      //console.log(obj)
      // per FDewhirst: species needs to be unencumbered of genus for this table
      //let species = obj.species.replace(obj.genus,'').trim()
      let genus = C.taxon_lookup[obj.otid].genus
      let species = C.taxon_lookup[obj.otid].species
      let subspecies = C.taxon_lookup[obj.otid].subspecies
      let hmt = helpers.make_otid_display_name(obj.otid)
      const r = [ gid, hmt, genus, species, subspecies, obj.strain, obj.contigs, obj.combined_size, obj.category,obj.gc]
      txt += r.join('\t') +'\n'
    }
  }
  // console.log(txt)
  return txt
}
module.exports = router;