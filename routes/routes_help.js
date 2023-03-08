'use strict'
const express  = require('express');
var router   = express.Router();
const CFG   = require(app_root + '/config/config');
const C     = require(app_root + '/public/constants');
const path  = require('path')
const helpers = require('./helpers/helpers')
const queries = require(app_root + '/routes/queries')
const { exec, spawn } = require('child_process');


router.get('/index', function index(req, res) {
  
    res.render('pages/help/index', {
        title: 'HOMD :: Help Pages',
        pgname: '', // for AboutThisPage
        config: JSON.stringify(CFG),
        ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
        user: JSON.stringify(req.user || {}),

    })
  
})
router.get('/help-page', function help_page(req, res) {
  //let page = req.params.pagecode
  let page = req.query.pagecode
  //console.log('page',page)
  const renderFxn = (req, res, page, updates, date_sort) => {
      //console.log('updates',updates)
      res.render('pages/help/helppage', {
        title: 'HOMD :: Help Pages',
          pgname: '', // for AboutThisPage
          pagecode: page,
          pagetitle: getPageTitle(page),
          db_updates: JSON.stringify(updates),
          date_sort: date_sort,
          config: JSON.stringify(CFG),
          ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
          user: JSON.stringify(req.user || {}),
      })
    }
  
  if(page === 'database_update'){
      let q = queries.get_db_updates_query()
      let rowarray = []
      let byDate = {}
      
      TDBConn.query(q, (err, rows) => {
        if(err) console.log(err)
        console.log('row',rows)
        for(let n in rows){
           if(rows[n].date in byDate){
             byDate[rows[n].date].push({otid:rows[n].otid, description:rows[n].description, reason:rows[n].reason})
           }else{
             byDate[rows[n].date] = [{otid:rows[n].otid, description:rows[n].description, reason:rows[n].reason}]
              
           }
           
           //rowarray.push({otid:rows[n].otid,description:rows[n].description,reason:rows[n].reason,date:rows[n].date})
        }
        console.log(byDate)
        let date_array = Object.keys(byDate)
        //console.log('date_array1',date_array)
        date_array.sort(function(a, b){
            const date1 = new Date(a)
            const date2 = new Date(b)
            return date2 - date1;
        })
        //console.log('date_array2',date_array)
        renderFxn(req, res, page, byDate, date_array)
      })
  }else{
    renderFxn(req, res, page, [], [])
  }
})

router.get('/search', function search(req, res) {
  //let page = req.params.pagecode
  res.render('pages/help/search', {
        title: 'HOMD :: Help Search',
        pgname: '', // for AboutThisPage
        config: JSON.stringify(CFG),
        ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
        user: JSON.stringify(req.user || {}),
    })
})
router.post('/help_search_result', function help_search_result(req, res) {
  console.log('in POST -Search Help')
  console.log(req.body)
  let searchText = req.body.input_string
  // help pages uses grep
  let helpLst = []
  let help_trunk = path.join(CFG.PROCESS_DIR,'views','partials','help')
  const grep_cmd = "/usr/bin/grep -liR "+help_trunk + " -e '" + helpers.addslashes(searchText) + "'" 
  //console.log('grep_cmd',grep_cmd)
  exec(grep_cmd, (err, stdout, stderr) => {
      if (stderr) {
        console.error('stderr',stderr);
        return;
      }
      //console.log('stdout',stdout);
      let fileLst = []
      if(stdout){
        fileLst = stdout.trim().split('\n')
      }
      if(fileLst.length > 0){
        for(let n in fileLst){
          //console.log('file',fileLst[n])
          let cleanfinal = fileLst[n].replace(help_trunk,'').replace(/^\//,'').replace(/\.ejs$/,'')
          helpLst.push(cleanfinal)
        }
      }

      res.render('pages/help/search_result', {
        title: 'HOMD :: Help Search',
        pgname: '', // for AbountThisPage
        config: JSON.stringify(CFG),
        ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
        user: JSON.stringify(req.user || {}),
        search_text: searchText,
        help_pages: JSON.stringify(helpLst),
      })
   });
  
})

router.get('/download_file', function search(req, res) {
  //let page = req.params.pagecode
  let fullpath = path.join(CFG.PATH_TO_DATA,req.query.filename)
  helpers.print('file path: '+fullpath)
  res.download(fullpath)
  //res.end()
})
//=====================================================================================
function getPageTitle(page){
    
    if(page === 'cite'){
       return 'How to Cite the Human Oral Microbiome Database'
    }
    if(page === 'description'){
       return 'The HOMD Project Description'
    }
    if(page === 'strains'){
       return 'Strains and DNA Availability'
    }
    if(page === 'team'){
       return 'Team'
    }
    if(page === 'contact'){
       return 'Contact Us'
    }
    if(page === 'mailing'){
       return 'Mailing Lists'
    }
    if(page === 'download'){
       return 'Downloading HOMD Data'
    }
    if(page === 'publications'){
       return 'Publications'
    }
    if(page === 'announcement'){
       return 'Announcements'
    }
     if(page === 'database_update'){
       return 'HOMD Database Updates'
    }
    // GENOME
    if(page === 'genome/genome_table'){
       return 'Page Help::Genome Table'
    }
    if(page === 'genome/genome_version'){
       return 'HOMD Reference Genomes Version History'
    }
    if(page === 'genome/description'){
       return 'Page Help::Genome Description'
    }
    if(page === 'genome/explorer'){
       return 'Page Help::Genome Explorer and Annotations'
    }
    if(page === 'genome/jbrowse'){
       return 'Page Help::JBrowse'
    }
    // REFSEQ
    if(page === 'refseq/refseq_version'){
       return 'HOMD 16S rRNA Gene Reference Sequence Version History'
    }
    if(page === 'refseq/blastn'){
       return 'Page Help:: Refseq BLASTN'
    }
    if(page === 'refseq/trees'){
       return 'Page Help:: Refseq Phylogenetic Trees'
    }
    // TAXON
    if(page === 'taxon/tax_table'){
       return 'Page Help::Taxon Table'
    }
    if(page === 'taxon/description'){
       return 'Page Help::Taxon Description'
    }
    if(page === 'taxon/ecology'){
       return 'Page Help::Ecology and Abundance'
    }
    if(page === 'taxon/hierarchy'){
       return 'Page Help::Taxon Dynamic Tree Hierarchy'
    }
    if(page === 'taxon/level'){
       return 'Page Help::Taxon by Rank Level Selection'
    }
    if(page === 'taxon/life'){
       return "Page Help::Taxon 'life' Pages"
    }
    // PHAGE
    if(page === 'phage/phage_table'){
       return 'Page Help::Phage Table'
    }
    if(page === 'phage/description'){
       return 'Page Help::Phage Description'
    }
    // BLAST
    if(page === 'blast/blast'){
       return 'Page Help::Blast Menu'
    }
    if(page === 'blast/formats'){
       return 'Page Help::Blast Formats'
    }
    if(page === 'blast/formats'){
       return 'Page Help::Blast Formats'
    }
    if(page === 'blast/databases'){
       return 'Page Help::Blast Databases'
    }
    if(page === 'blast/parameters'){
       return 'Page Help::Blast Parameters'
    }
    if(page === 'blast/programs'){
       return 'Page Help::Blast Programs'
    }
    if(page === 'blast/advanced'){
       return 'Page Help::Blast Advanced Parameters'
    }
    
    
    return page+'-FixmyTitle'
}






module.exports = router;