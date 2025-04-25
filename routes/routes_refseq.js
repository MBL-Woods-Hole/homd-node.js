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
//const open = require('open');
const https = require('https'); 

router.get('/blast_server', function refseq_blast_server(req, res) {
    res.render('pages/blast/blast_server', {
        title: 'HOMD :: HOMD Blast Server',
        pgname: '', // for AbountThisPage
        config: JSON.stringify(CFG),
        ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),
        user: JSON.stringify(req.user || {}),
        blast_type: 'refseq'
      })
})
router.get('/refseq_blastn', function refseq_blastn(req, res) {
    console.log('MADEIT TO blastn-get')
    //helpers.accesslog(req, res)
  
  res.render('pages/refseq/blastn', {
    title: 'HOMD :: RefSeq Blast', 
    pgname: 'blast/blast',
    config: JSON.stringify(CFG),
    hostname: CFG.hostname,
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),
    user: JSON.stringify(req.user || {}),
    db_choices: JSON.stringify(C.refseq_blastn_db_choices),
    blast_prg: JSON.stringify(['blastn']),
    blastFxn: 'refseq',
    spamguard: helpers.makeid(3).toUpperCase(),
    returnTo: '/refseq/refseq_blastn',
    blastmax: JSON.stringify(C.blast_max_file),
    blast_version: CFG.BLAST_VERSION,
  })
})


router.get('/refseq_tree', function refseq_tree(req, res) {
  console.log('in refseq_tree')
   
  // https://www.homd.org/ftp//phylogenetic_trees/refseq/current/eHOMD_16S_rRNA_RefSeq.svg
  // here from taxdescription page  public/trees/
  
  //let filepath = CFG.FTP_TREE_URL +'/refseq/V16.0/HOMD_16S_rRNA_RefSeq_Tree_V16.0.svg'
  let filepath = CFG.HOMD_URL_BASE+CFG.REFSEQ_TREE_PATH//"/ftp/phylogenetic_trees/refseq/V16.0/HOMD_16S_rRNA_RefSeq_Tree_V16.0.svg"
  
  //let myurl = url.parse(req.url, true);
  let otid = req.query.otid
  //console.log('otid',otid)
  let fullname = helpers.make_otid_display_name(otid)
  //console.log(fullname)
  
  https.get(filepath, (response) => { 
     let data = ''; 
 
     response.on('data', (chunk) => { 
        data += chunk; 
     }); 
 
     response.on('end', () => { 
        
        //console.log('data',data); 
         res.render('pages/refseq/refseq_tree', {
            title: 'HOMD :: Conserved Protein Tree',
            pgname: 'refseq/tree', // for AbountThisPage, 
            config: JSON.stringify(CFG),
            ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),
            user: JSON.stringify(req.user || {}),
            svg_data: JSON.stringify(data),
            //path: 'public/trees/'+fname,
            otid: fullname,
          })
     }); 
  }).on('error', (error) => { 
    console.error(`Error fetching data: ${error.message}`); 
  }); 
  
//   fs.readFile(filepath,'utf8', (err, data) => {
//     
//       if(err){
//          console.log(err)
//       }
//       
//           res.render('pages/refseq/refseq_tree', {
//             title: 'HOMD :: Conserved Protein Tree',
//             pgname: 'refseq/tree', // for AbountThisPage, 
//             config: JSON.stringify(CFG),
//             ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),
//             user: JSON.stringify(req.user || {}),
//             svg_data: JSON.stringify(data),
//             path: 'public/trees/'+fname,
//             otid: fullname,
//           })
//     })
  
  // res.render('pages/refseq/refseq_tree', {
//    title: 'HOMD :: Phylo Tree', 
//    config: JSON.stringify(CFG),
//    hostname: CFG.HOSTNAME,
//    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),
//    otid:otid
//  })
})
//
router.get('/download', function download(req, res) {
    console.log('download')
  console.log(req.body)
  //helpers.accesslog(req, res)
  res.render('pages/refseq/download', {
    title: 'HOMD :: Phylo Tree', 
    pgname: 'download', // for AbountThisPage
    config: JSON.stringify(CFG),
    hostname: CFG.HOSTNAME,
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),
    user: JSON.stringify(req.user || {}),
  })
})

module.exports = router;