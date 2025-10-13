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
    //console.log('in phage hello')
    //let q = "SELECT genome_id as gid, site, cenote_taker3 as cenote,genomad from phage_counts"
    // let q = "SELECT genome_id as gid,combined_size,otid,genus,species,strain,contigs,site,"
//     //q += " (SELECT COUNT(*) from phage_data where phage_data.genome_id = phage_stats.genome_id) as hit_count,"
//     q += " cenote_taker3 as cenote_count,cenote_coverage_bps,cenote_coverage_pct,"
//     q += " genomad as genomad_count,genomad_coverage_bps,genomad_coverage_pct"
//     q += " FROM phage_stats"
//     q += " JOIN `genomesV11.0` using(genome_id)"
//     q += " JOIN otid_prime using(otid)"
//     q += " JOIN taxonomy using(taxonomy_id)"
//     q += " JOIN genus using(genus_id)"
//     q += " JOIN species using (species_id)"
//     q += " WHERE !(cenote_taker3=0 and genomad=0)"
//     q += " Order by genus,species"
//     console.log(q)
    // need contigs,HMT,species,strain,average
    let organism,strain,otid,contigs,length,tmp
    let genome_lookup = {}
    let sort_list=[]
    for(let gid in C.phage_lookup){
        organism = C.genome_lookup[gid].organism
        strain = C.genome_lookup[gid].strain
        otid = C.genome_lookup[gid].otid
        contigs = C.genome_lookup[gid].contigs
        length = C.genome_lookup[gid].combined_size
        tmp = {organism:organism,strain:strain,otid:otid,contigs:contigs,length:length}
        //merge objects:
        genome_lookup[gid] = Object.assign({}, tmp, C.phage_lookup[gid]);
        
        //genome_lookup[gid] = {organism:organism,strain:strain,otid:otid,contigs:contigs,length:length}
        sort_list.push({gid:gid, org:organism})
    }
    let full_count = Object.keys(genome_lookup).length
    console.log(genome_lookup['GCA_000009645.1'])
       
    sort_list.sort((a, b) => {
        return helpers.compareStrings_alpha(a.org, b.org);
    })
    res.render('pages/phage/phagetable', {
            title: 'HOMD :: Phage Table',
            pgtitle: 'Human Oral/Nasal Microbial Taxa',
            pgname: 'taxon/phage_table',  //for AbountThisPage
            config: JSON.stringify(CFG),
            ver_info: JSON.stringify(C.version_information),
            data: JSON.stringify(genome_lookup),
            full_count: full_count,
            gid_list: JSON.stringify(sort_list),
    })
  
})


        
module.exports = router;