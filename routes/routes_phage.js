'use strict'
import express from 'express';
let router   = express.Router();

import fs from 'fs-extra';

// const url = require('url');
import path from 'path';

import C from '../public/constants.js';
import * as helpers from './helpers/helpers.js';
import * as queries from './queries.js';

router.get('/phage', async function phage(req, res) {
    //console.log('in phage',req.query.gid)
    let gid = req.query.gid
    
    const q = queries.get_phage(gid)
    //console.log('phage q',q)
    const rows = await queries.run_query(q, res)
        
        
    res.render('pages/phage/phage', {
            title: 'HOMD :: Phage', 
            pgname: '', // for AboutThisPage
            config: JSON.stringify(ENV),
            ver_info: JSON.stringify(C.version_information),
            pgtitle: 'Phage',
            data: JSON.stringify(rows),
            gid: gid
    })
    

})

router.get('/phage_table', function phage_table_GET(req, res) {
    
    // need contigs,HMT,species,strain,average
    let organism,strain,otid,contigs,length,tmp
    let genome_lookup = {}
    let sort_list=[]
    let tcount = Object.keys(C.phage_lookup).length
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
    
    //console.log('full_count',full_count)
    console.log('sort_list',sort_list.length)
    sort_list.sort((a, b) => {
        return helpers.compareStrings_alpha(a.org, b.org);
    })
    res.render('pages/phage/phagetable', {
            title: 'HOMD :: Phage Table',
            pgtitle: 'Human Oral/Nasal Phage',
            pgname: 'taxon/phage_table',  //for AbountThisPage
            config: JSON.stringify(ENV),
            ver_info: JSON.stringify(C.version_information),
            data: JSON.stringify(genome_lookup),
            row_count: sort_list.length,
            tcount:tcount,
            gid_list: JSON.stringify(sort_list),
            search:'',
    })
  
})
//
router.post('/phage_table', function phage_table_POST(req, res) {

    // need contigs,HMT,species,strain,average
    let s = req.body.search_input.toLowerCase()
    let organism,strain,otid,contigs,length,tmp,hmt
    let genome_lookup = {}
    let sort_list=[]
    let tcount = Object.keys(C.phage_lookup).length
    for(let gid in C.phage_lookup){
        organism = C.genome_lookup[gid].organism
        strain = C.genome_lookup[gid].strain
        otid = C.genome_lookup[gid].otid
        hmt = helpers.make_otid_display_name(otid)
        contigs = C.genome_lookup[gid].contigs
        length = C.genome_lookup[gid].combined_size
        tmp = {organism:organism,strain:strain,otid:otid,contigs:contigs,length:length}
        //merge objects:
        genome_lookup[gid] = Object.assign({}, tmp, C.phage_lookup[gid]);
        
        //genome_lookup[gid] = {organism:organism,strain:strain,otid:otid,contigs:contigs,length:length}
        if(organism.toLowerCase().includes(s)
           || strain.toLowerCase().includes(s)
           || gid.toLowerCase().includes(s)
           || hmt.toLowerCase().includes(s)
        ){
            sort_list.push({gid:gid, org:organism})
        }
    }
    
    //console.log('full_count',full_count)
    console.log('sort_list',sort_list.length)
    sort_list.sort((a, b) => {
        return helpers.compareStrings_alpha(a.org, b.org);
    })
    res.render('pages/phage/phagetable', {
            title: 'HOMD :: Phage Table',
            pgtitle: 'Human Oral/Nasal Phage',
            pgname: 'taxon/phage_table',  //for AbountThisPage
            config: JSON.stringify(ENV),
            ver_info: JSON.stringify(C.version_information),
            data: JSON.stringify(genome_lookup),
            row_count: sort_list.length,
            tcount: tcount,
            gid_list: JSON.stringify(sort_list),
            search:s,
    })
})
//
router.post('/phage_ajax', async function phage_ajax(req, res){
    console.log('in POST phage_ajax')
    let gid = req.body.gid
    let q = 'SELECT phage_id,type,contig,start,end FROM phage_data'
    q += " WHERE genome_id='"+gid+"'"
    let hmt = helpers.make_otid_display_name(C.genome_lookup[gid].otid)
    let org = C.genome_lookup[gid].organism
    let strain = C.genome_lookup[gid].strain
    let html_rows = "<div id='phage-sub-table-div'>"+gid+'; '+hmt+'; '+org+' ('+strain+')'
    html_rows += "<a href='#' onclick=close_sub_table() style='float:right;margin-right:100px;' border='1'>Close</a>"
    html_rows += "<table id='XXphage-sub-table' class='table result-table '>"
    html_rows += "<tr>"
    html_rows += "<th>Prediction<br>Tool</th><th>Genome<br>Viewer</th><th class=''>Phage-ID</th><th>Contig</th><th>Start</th><th>End</th>"
    html_rows += "</tr>"
    console.log(q)
    let stop,start,tmp,seqacc,loc,locstart,locstop
    const rows = await queries.run_query(q, res)
        
       
    for(let i in rows){
        //console.log(rows[i])
        
            //send_rows.push(rows[i])
            // create JB Link
            // https://www.homd.org/jbrowse/?data=homd_V11.02_phage_1.1/GCA_000008065.1&loc=GCA_000008065.1|AE017198.1:1291298..1331686&tracks=DNA,panggolin,cenote
            start = rows[i].start
            stop  = rows[i].end
            if(start[0] === "<" ){
                start = parseInt(start.substring(1))
            }else{ 
                start = parseInt(start) 
            } 
            if(stop[0] === ">" ){ 
                stop = parseInt(stop.substring(1))
            }else{ 
                stop = parseInt(stop)
            } 
            if(start > stop){ 
                tmp = stop 
                stop = start 
                start = tmp 
            }
            locstart = start - 500 
            locstop = stop + 500 
            //size = stop - start 
 
            if(locstart < 1){ 
                locstart = 1 
            }
            seqacc = rows[i].contig
            loc = seqacc+":"+locstart.toString()+".."+locstop.toString() 
            //highlight = seqacc+":"+start.toString()+".."+stop.toString() 
            
            html_rows += "<tr><td nowrap>"+rows[i].type+"</td>"
            html_rows += "<td><a href='#' onclick=\"open_jbrowse('"+gid+"','phage','','','','"+loc+"')\">open"
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




export default router;