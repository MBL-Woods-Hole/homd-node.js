'use strict'
const express  = require('express');
let router   = express.Router();
const CFG   = require(app_root + '/config/config');
const fs       = require('fs-extra');
// const url = require('url');
const path     = require('path');
const C     = require(app_root + '/public/constants');
const helpers = require(app_root + '/routes/helpers/helpers');
const queries = require(app_root + '/routes/queries')

router.get('/phage', function phage(req, res) {
    //console.log('in phage',req.query.gid)
    let gid = req.query.gid
    
    const q = queries.get_phage(gid)
    console.log('phage q',q)
    TDBConn.query(q, (err, rows) => {
        if(err){
           console.log(err)
           return
        }
        
        res.render('pages/phage/phage', {
                title: 'HOMD :: Phage', 
                pgname: '', // for AboutThisPage
                config: JSON.stringify(CFG),
                ver_info: JSON.stringify(C.version_information),
                pgtitle: 'Phage',
                data: JSON.stringify(rows),
                gid: gid
        })
    })

})

router.get('/phage_table', function phage_explorer(req, res) {
    console.log('in phage hello')
    //let q = "SELECT genome_id as gid, site, cenote_taker3 as cenote,genomad from phage_counts"
    let q = "SELECT genome_id as gid,otid,genus,species,strain,contigs,site,cenote_taker3 as cenote,genomad from phage_counts"
    q += " JOIN `genomesV11.0` using(genome_id)"
    q += " JOIN otid_prime using(otid)"
    q += " JOIN taxonomy using(taxonomy_id)"
    q += " JOIN genus using(genus_id)"
    q += " JOIN species using (species_id)"
    q += " WHERE !(cenote_taker3=0 and genomad=0)"
    q += " Order by genus,species"
    // need contigs,HMT,species,strain,average
    TDBConn.query(q, (err, rows) => {
        if(err){
           console.log(err)
           return
        }
    
        res.render('pages/phage/phagetable', {
            title: 'HOMD :: Phage Table',
            pgtitle: 'Human Oral/Nasal Microbial Taxa',
            pgname: 'taxon/phage_table',  //for AbountThisPage
            config: JSON.stringify(CFG),
            ver_info: JSON.stringify(C.version_information),
            data: JSON.stringify(rows),
        })
  })
})


        
module.exports = router;