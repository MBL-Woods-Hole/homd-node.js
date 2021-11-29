'use strict'
const express  = require('express');
var router   = express.Router();
const CFG   = require(app_root + '/config/config');
const C     = require(app_root + '/public/constants');


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
    if(page === 'genome/genome_version'){
       return 'HOMD Reference Genomes Version History'
    }
    if(page === 'refseq/refseq_version'){
       return 'HOMD 16S rRNA Gene Reference Sequence Version History'
    }
    if(page === 'database_update'){
       return 'HOMD Database Updates'
    }
    if(page === 'taxon/tax_table'){
       return 'Page::Taxon Table'
    }
    if(page === 'genome/genome_table'){
       return 'Page::Genome Table'
    }
    if(page === 'phage/phage_table'){
       return 'Page::Phage Table'
    }
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