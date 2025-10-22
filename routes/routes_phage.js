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
    //console.log('phage q',q)
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
    //console.log(genome_lookup['GCA_000009645.1'])
       
    sort_list.sort((a, b) => {
        return helpers.compareStrings_alpha(a.org, b.org);
    })
    res.render('pages/phage/phagetable', {
            title: 'HOMD :: Phage Table',
            pgtitle: 'Human Oral/Nasal Phage',
            pgname: 'taxon/phage_table',  //for AbountThisPage
            config: JSON.stringify(CFG),
            ver_info: JSON.stringify(C.version_information),
            data: JSON.stringify(genome_lookup),
            full_count: full_count,
            gid_list: JSON.stringify(sort_list),
    })
  
})
//
router.post('/phage_ajax', function phage_ajax(req, res){
    console.log('in POST phage_ajax')
    let gid = req.body.gid
    let q = 'SELECT phage_id,type,contig,start,end,jbrowse_link FROM phage_data'
    q += " WHERE genome_id='"+gid+"'"
    let hmt = helpers.make_otid_display_name(C.genome_lookup[gid].otid)
    let org = C.genome_lookup[gid].organism
    let strain = C.genome_lookup[gid].strain
    let html_rows = "<div id='phage-sub-table-div'>"+gid+'; '+hmt+'; '+org+' ('+strain+')'
    html_rows += "<a href='#' onclick=close_sub_table() style='float:right;margin-right:100px;'>Close</a>"
    html_rows += "<table id='phage-sub-table' class='table table-condensed'>"
    html_rows += "<tr>"
    html_rows += "<th>Prediction<br>Tool</th><th>Genome<br>Viewer</th><th class=''>Phage-ID</th><th>Contig</th><th>Start</th><th>End</th>"
    html_rows += "</tr>"
    //console.log(q)
    TDBConn.query(q, (err, rows) => {
        for(let i in rows){
            //console.log(rows[i])
            
                //send_rows.push(rows[i])
                html_rows += "<tr><td nowrap>"+rows[i].type+"</td>"
                html_rows += "<td><a href='"+rows[i].jbrowse_link+"'>open"
                html_rows += '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-up-right-square" viewBox="0 0 16 16">'
                html_rows += '  <path fill-rule="evenodd" d="M15 2a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1zM0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm5.854 8.803a.5.5 0 1 1-.708-.707L9.243 6H6.475a.5.5 0 1 1 0-1h3.975a.5.5 0 0 1 .5.5v3.975a.5.5 0 1 1-1 0V6.707z"/>'
                html_rows += "</svg>"
                html_rows += "</a>"
                
                html_rows += "</td>"
                html_rows += "<td nowrap class=''>"+rows[i].phage_id+"</td>"
                html_rows += "<td nowrap class=''>"+rows[i].contig+"</td>"
                html_rows += "<td nowrap class='center'>"+rows[i].start+"</td>"
                html_rows += "<td nowrap class='center'>"+rows[i].end+"</td>"
                
                html_rows += "</tr>"
                //counter += 1
        }
            
        
        
        html_rows += "</table>"
        res.send(html_rows)
        //console.log(send_rows,send_rows.length)
        

    
    })
    
})
    
    

        
module.exports = router;