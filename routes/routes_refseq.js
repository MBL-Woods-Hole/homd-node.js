'use strict'
const express   = require('express');
var router    = express.Router();
const CFG     = require(app_root + '/config/config');
const fs        = require('fs-extra')
const fsp = require('fs').promises
// const url     = require('url');
const path      = require('path');
const C       = require(app_root + '/public/constants');
const helpers   = require(app_root + '/routes/helpers/helpers');
const open = require('open');


router.get('/refseq_blastn', function refseq_blastn(req, res) {
    console.log('MADEIT TO blastn-get')
    helpers.accesslog(req, res)
  
  res.render('pages/refseq/blastn', {
    title: 'HOMD :: RefSeq Blast', 
    pgname: 'blast/parameters',
    config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
    hostname: CFG.hostname,
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
    db_choices: JSON.stringify(C.refseq_blastn_db_choices),
    blast_prg: JSON.stringify(['blastn']),
    blastFxn: 'refseq',
    returnTo: '/refseq/refseq_blastn',
    blastmax: JSON.stringify(C.blast_max_file),
    blast_version: CFG.BLAST_VERSION,
  })
})

// router.get('/refseq_tree', function refseq_tree(req, res) {
//     console.log('phylo_tree')
//  helpers.accesslog(req, res)
//  let myurl = url.parse(req.url, true);
//  let otid = myurl.query.otid
//  console.log('otid',otid)
//  
// })
router.get('/refseq_tree', function refseq_tree(req, res) {
    console.log('in refseq_tree')
  helpers.accesslog(req, res)
  //let myurl = url.parse(req.url, true);
  let otid = req.query.otid
  console.log('otid',otid)
  let fullname = helpers.make_otid_display_name(otid)
  console.log(fullname)
  fs.readFile('public/trees/refseq_tree.svg','utf8', (err, data) => {
      if(err){
         console.log(err)
      }
      res.render('pages/refseq/refseq_tree', {
        title: 'HOMD :: Conserved Protein Tree',
        pgname: 'refseq/tree', // for AbountThisPage, 
        config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
        ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
        svg_data: JSON.stringify(data),
        otid: fullname,
      })
    
    })
  
  // res.render('pages/refseq/refseq_tree', {
//    title: 'HOMD :: Phylo Tree', 
//    config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
//    hostname: CFG.HOSTNAME,
//    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
//    otid:otid
//  })
})
router.get('/download', function download(req, res) {
    console.log('download')
  console.log(req.body)
  helpers.accesslog(req, res)
  res.render('pages/refseq/download', {
    title: 'HOMD :: Phylo Tree', 
    pgname: 'download', // for AbountThisPage
    config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
    hostname: CFG.HOSTNAME,
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
    
  })
})

module.exports = router;