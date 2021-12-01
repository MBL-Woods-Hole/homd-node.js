'use strict'
const express  = require('express');
var router   = express.Router();
const CFG   = require(app_root + '/config/config');
const C     = require(app_root + '/public/constants');
const path  = require('path')
const { exec, spawn } = require('child_process');

router.get('/index', function index(req, res) {
  
    res.render('pages/help/index', {
        title: 'HOMD :: Help Pages',
        pgname: '', // for AboutThisPage
        config:  JSON.stringify({hostname:CFG.HOSTNAME, env:CFG.ENV, rootPath: CFG.PROCESS_DIR}),
        ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),

    })
  
})
router.get('/help-page', function help_page(req, res) {
  //let page = req.params.pagecode
  let page = req.query.pagecode
  console.log('page',page)
  res.render('pages/help/helppage', {
        title: 'HOMD :: Help Pages',
        pgname: '', // for AboutThisPage
        pagecode: page,
        pagetitle: getPageTitle(page),
        config:  JSON.stringify({hostname:CFG.HOSTNAME, env:CFG.ENV, rootPath: CFG.PROCESS_DIR}),
        ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
    })
})
router.get('/search', function search(req, res) {
  //let page = req.params.pagecode
  res.render('pages/help/search', {
        title: 'HOMD :: Help Search',
        pgname: '', // for AboutThisPage
        config:  JSON.stringify({hostname:CFG.HOSTNAME, env:CFG.ENV, rootPath: CFG.PROCESS_DIR}),
        ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
    })
})
router.post('/help_search_result', function help_search_result(req, res) {
  console.log('in POST -Search Help')
  console.log(req.body)
  let searchText = req.body.input_string
  // help pages uses grep
  let helpLst = []
  let help_trunk = path.join(CFG.PROCESS_DIR,'views','partials','help')
  const grep_cmd = "/usr/bin/grep -liRw "+help_trunk + " -e '" + searchText + "'" 
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
        config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
        ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
        search_text: searchText,
        help_pages: JSON.stringify(helpLst),
      })
   });
  
})
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
    if(page === 'announcement'){
       return 'Announcements'
    }
     if(page === 'database_update'){
       return 'HOMD Database Updates'
    }
    // GENOME
    if(page === 'genome/genome_table'){
       return 'Page::Genome Table'
    }
    if(page === 'genome/genome_version'){
       return 'HOMD Reference Genomes Version History'
    }
    if(page === 'genome/description'){
       return 'Page::Genome Description'
    }
    if(page === 'genome/explorer'){
       return 'Page::Genome Explorer and Annotations'
    }
    if(page === 'genome/jbrowse'){
       return 'Page::JBrowse'
    }
    // REFSEQ
    if(page === 'refseq/refseq_version'){
       return 'HOMD 16S rRNA Gene Reference Sequence Version History'
    }
    if(page === 'refseq/blastn'){
       return 'Page:: Refseq BLASTN'
    }
    if(page === 'refseq/trees'){
       return 'Page:: Refseq Phylogenetic Trees'
    }
    // TAXON
    if(page === 'taxon/tax_table'){
       return 'Page::Taxon Table'
    }
    if(page === 'taxon/Description'){
       return 'Page::Taxon Description'
    }
    if(page === 'taxon/ecology'){
       return 'Page::Ecology and Abundance'
    }
    if(page === 'taxon/hierarchy'){
       return 'Page::Taxon Dynamic Tree Hierarchy'
    }
    if(page === 'taxon/level'){
       return 'Page::Taxon by Rank Level Selection'
    }
    if(page === 'taxon/life'){
       return "Page::Taxon 'life' Pages"
    }
    // PHAGE
    if(page === 'phage/phage_table'){
       return 'Page::Phage Table'
    }
    if(page === 'phage/description'){
       return 'Page::Phage Description'
    }
    // BLAST
    if(page === 'blast/blast'){
       return 'Page::Blast Menu'
    }
    if(page === 'blast/formats'){
       return 'Page::Blast Formats'
    }
    if(page === 'blast/formats'){
       return 'Page::Blast Formats'
    }
    if(page === 'blast/databases'){
       return 'Page::Blast Databases'
    }
    if(page === 'blast/parameters'){
       return 'Page::Blast Parameters'
    }
    if(page === 'blast/programs'){
       return 'Page::Blast Programs'
    }
    if(page === 'blast/advanced'){
       return 'Page::Blast Advanced Parameters'
    }
    
    
    return page+'-FixmyTitle'
}






module.exports = router;