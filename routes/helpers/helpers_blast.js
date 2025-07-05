'use strict'
const C       = require(app_root + '/public/constants');
//const queries = require(app_root + '/routes/queries');
const CFG  = require(app_root + '/config/config');
const express     = require('express');
const fs          = require('fs-extra');
const readline = require('readline');
let accesslog = require('access-log');
const async = require('async')
const util        = require('util');
const path        = require('path');
const {exec, spawn} = require('child_process');
const helpers = require(app_root + '/routes/helpers/helpers');

//let hmt = 'HMT-'+("000" + otid).slice(-3)

//
// module.exports.parse_to_get_blast_query = function parse_to_get_blast_query(file_data, fxn){
//     
//     let string = file_data.toString()
//     let lines = string.split('\n')
//     
//     let query='',line
//     for(let i in lines){
//         line = lines[i].trim()
//         if(!line) continue;
//         if(line.indexOf('Query=') === 0){
//           query += line.substring(6).trim()
//           if(lines[parseInt(i)+1] != 'Length='){
//               query += ' '+lines[parseInt(i)+1]
//           }
//         }
//     }
//     if(query){
//        return query
//     }else{
//       return 'NotFound'
//     }
// }
module.exports.parse_blast_query_xml = function parse_blast_query_xml(jsondata, grab){
    //console.log('file_data',file_data)
    let json = JSON.parse(jsondata)  // xml
    if(grab === 'query'){
        ////console.log(json.BlastOutput)
        let query = json['BlastOutput']['BlastOutput_query-def']
        if(query){
           return query
        }else{
          return 'NotFound'
        }
    }else if(grab === 'homdhitids'){
        //for protein:: SEQF3712_01295 hypothetical protein [HMT-096 Lachnospiraceae_G-2 bacterium_HMT_096 F0428]
        // want SEQF3712_01295
        let ret = {},hits,homdhitid
        ret.hitid_ary = []
        ret.no_hits = false
        ret.queryid = json['BlastOutput']['BlastOutput_query-ID']
        let iteration = json['BlastOutput']['BlastOutput_iterations']['Iteration']
        if(iteration.hasOwnProperty('Iteration_message') && iteration['Iteration_message'] === 'No hits found'){
           ret.no_hits = true
        }else{
            for(let hit in json['BlastOutput']['BlastOutput_iterations']['Iteration']['Iteration_hits']){
                hits = json['BlastOutput']['BlastOutput_iterations']['Iteration']['Iteration_hits'][hit]
                if(hits instanceof Array){
                   //console.log('**hits**arry',hits)
                   // possibly many
                   for(let i in hits){
                      //console.log('**i in hits**',i,hits[i])
                      homdhitid = hits[i].Hit_def.split(/\s/)[0]
                      
                    }
                   
                }else{
                   //console.log('**hits**obj',hits)
                   // single
                   homdhitid = hits['Hit_def'].split(/\s/)[0]
                }
                ret.hitid_ary.push(homdhitid)
                
                
            }
        }
        //console.log('ret',ret)
        return ret
    }else if(grab === 'hitids'){
        let ret = {},hits,hitid
        ret.hitid_ary = []
        ret.no_hits = false
        ret.queryid = json['BlastOutput']['BlastOutput_query-ID']
        let iteration = json['BlastOutput']['BlastOutput_iterations']['Iteration']
        if(iteration.hasOwnProperty('Iteration_message') && iteration['Iteration_message'] === 'No hits found'){
           ret.no_hits = true
        }else{
            for(let n in json['BlastOutput']['BlastOutput_iterations']['Iteration']['Iteration_hits']){
                hits = json['BlastOutput']['BlastOutput_iterations']['Iteration']['Iteration_hits'][n]
                for(let i in hits){
                    hitid = hits[i].Hit_id
                    ret.hitid_ary.push(hitid)
                }
            }
        }
        //console.log('ret',ret)
        return ret
    }else{
       return "ERROR in blast XML parse"
    }
}
module.exports.parse_blast_xml2json = function parse_blast_xml2json(jsondata){
   //""" for genome blast xml file download"""
    //console.log(jsondata['BlastOutput'])
    let file_collector = {}
    let id_collector = {}
    let otid,hit_title,split_name,hit_id,hit,hits
    file_collector.query = jsondata['BlastOutput']['BlastOutput_query-def']
    file_collector.query_length = jsondata['BlastOutput']['BlastOutput_query-len']
    file_collector.version = jsondata['BlastOutput']['BlastOutput_version']
    let iteration = jsondata['BlastOutput']['BlastOutput_iterations']['Iteration']
    //['Iteration_message']
    let no_hits = false
    if(iteration.hasOwnProperty('Iteration_message') && iteration['Iteration_message'] === 'No hits found'){
       no_hits = true
    }else{
      for(let n in jsondata['BlastOutput']['BlastOutput_iterations']['Iteration']['Iteration_hits']){
        
        hits = jsondata['BlastOutput']['BlastOutput_iterations']['Iteration']['Iteration_hits'][n]
        for(let i in hits){
            hit = hits[i]
        
            //console.log('hit Hsps',hit['Hit_hsps']['Hsp'])
            hit_title = hit['Hit_def']
            split_name = hit_title.split(/\s/)
            hit_id = split_name[0].trim()
            // SEQF1595_KI535341.1 [HMT-389 Abiotrophia defectiva ATCC 49176]
            
            let regCapture = /HMT-(\d+)\s/   // grab inside parens
            otid = hit_title.match(regCapture)[1]
            //console.log('otid',otid)
            id_collector[hit_id] = {'hit_title': hit_title, 'hit_id': hit_id, otid: otid}
            id_collector[hit_id]['bitscore'] = hit['Hit_hsps']['Hsp']['Hsp_bit-score']
            id_collector[hit_id]['expect'] = hit['Hit_hsps']['Hsp']['Hsp_evalue']
            id_collector[hit_id]['identity'] = hit['Hit_hsps']['Hsp']['Hsp_identity']
            id_collector[hit_id]['gaps'] = hit['Hit_hsps']['Hsp']['Hsp_gaps']
            //id_collector[hit_id]['strand'] = hit['Hit_hsps']['Hsp']['Hsp_bit-score']
            id_collector[hit_id]['length'] = hit['Hit_len']
        }
      }
    }
    if(no_hits){
        file_collector.data = ['no hits']
    }else{
        file_collector.data = Object.values(id_collector)
    }
    //console.log('file_collector',file_collector)
    return file_collector

}
//
//
module.exports.parse_blast_refseq = function parse_blast_refseq(file_data, opt, blastID){
     // TODO combine parse_blast_best and parse_blast_custom here
}
module.exports.parse_blast_best = function parse_blast_best(file_data, opt, blastID){
    // for top-4-hits and best-hits-only
    // file_data is file array of file strings
    let indexes ={ query_id:0, hit_id:1, pct_identity:2, length:3, mismatches:4, gaps:5, 
                   qstart:6, qend:7, sstart:8, send:9, evalue:10, 
                   bit_score:11, qlen:12, stitle:13, qcov:14, qseq:15, sseq:16  // qseq;11, sseq:12
                 }
    
    let bbit_score,line_collector={},allheader='',header='',q_lookup = {}
    let row_counter =0,queryid
    for(let n=0; n<file_data.length; n++){
        
        let lines = file_data[n].toString().split('\n')
        //console.log('lines',n,lines)
        bbit_score=0,row_counter =0
        for(let i=0;i<lines.length; i++){
           
           if(!lines[i] || lines[i] === ''){
               continue
           }
           if(lines[i][0] === '#'){
              allheader += lines[i]+'<br>'
              if(n==0 && lines[i].startsWith('# BLASTN')){
                 header += lines[i]+'<br>'
              }
              if(n==0 && lines[i].startsWith('# Database:')){
                 header += lines[i]+'<br>'
              }
              if(lines[i].startsWith('# Query:')){
                 queryid = lines[i].split(/\s/)[2]
              }
              if(lines[i] === '# 0 hits found'){
                 //console.log('linesXXX',n,lines)
                 line_collector[queryid] = 'no data'
              }
              
           }else{
               row_counter +=1
               //console.log('line',lines[i])
               
               let line_items = lines[i].trim().split('\t')
               q_lookup[line_items[indexes.query_id]] = n
               if(row_counter===1){  // must assume that lines in descending order by bit score
                  bbit_score = parseInt(line_items[indexes.bit_score])
                  line_collector[line_items[indexes.query_id]] = [line_items]
                  //console.log('line_items[indexes.bit_score]',n,line_items[indexes.bit_score])
               }else{
                   if(opt === 'best'){
                       if(parseInt(line_items[indexes.bit_score]) === bbit_score){
                           line_collector[line_items[indexes.query_id]].push(line_items)
                       }
                   }else{
                       line_collector[line_items[indexes.query_id]].push(line_items)
                   }
               }
                
           }
         }  
         //console.log('line_collector',n,bbit_score,line_collector)
    }
    let html='',title,tparts,hmt,otid,species,strain,fpi,gb
    
    if(opt === 'best'){  // get table headers
        html += "<center><h3>Best Hits Only (per query)</h3></center>"
        html += "<table>"
        html += "<tr><th>Query-id</th><th>Bit Score</th><th># of best hits</th><th title='(% ident) x (coverage)'>Full_Pct_ID (%)</th>"
        html += '<th>HMT-ID</th><th>Species</th><th>Strain/Clone</th><th>GenBank</th><th>HOMD Clone Name/Hit Title</th>'
        html += '</tr>'
    }else if(opt === 'standard'){
        html += "<center><h3>Top 4 Hits for each Query</h3></center>"
        html += "<table><tr>"
        html += "<th class=''>Query-id</th>"
        html += "<th class=''>Query Length</th>"
        html += "<th class=''>Query Sequence</th>"
        html += "<th class=''>Alignment</th>"
        html += "<th class=''>Hit-id</th>"
        html += "<th class=''>HOMD Clone Name/Hit Title</th>"
        html += "<th class=''>E-value</th>"
        html += "<th class=''>Bit Score</th>"
        html += "<th class=''>% Identity</th>"
        html += "</tr>"
    }
    row_counter = 0
    let odd,bgcolor
    //console.log('line coll',line_collector)
    
    for(let qid in line_collector){
        row_counter +=1
        odd = row_counter % 2  // will be either 0 or 1
        if(odd){
          bgcolor = 'blastBGodd2'
        }else{
          bgcolor = 'blastBGeven2'
        }
        html += "<tr class='"+bgcolor+"'>"
        //console.log(qid,line_collector[qid])
        
        
        
        if(opt === 'best'){
           if(line_collector[qid] === 'no data'){
               html += "<td>"+qid+"</td><td></td><td></td><td></td><td></td><td>No Hits</td><td>No Hits</td><td>No Hits</td><td>No Hits</td>"
           }else{
               html += "<td rowspan='"+line_collector[qid].length.toString()+"'>"+qid+"</td>"
               html += "<td class='center' rowspan='"+line_collector[qid].length.toString()+"'>"+line_collector[qid][0][indexes.bit_score]+'</td>'
               html += "<td class='center' rowspan='"+line_collector[qid].length.toString()+"'>"+line_collector[qid].length.toString()+"</td>"
               
               for(let n in line_collector[qid]){
                   title = line_collector[qid][n][indexes.stitle]
                   tparts = title.split('|')
                   hmt = tparts[2].trim()
                   otid = hmt.split('-')[1]
                   species = tparts[1].trim()
                   strain = tparts[3].trim()
                   gb = tparts[4].trim().split(':')[1].trim()
                   fpi = parseFloat(line_collector[qid][n][indexes.pct_identity]) * parseFloat(line_collector[qid][n][indexes.qcov])/100 
                   html += "<td class='"+bgcolor+" center' nowrap title='(% ident) x (coverage)'>"+fpi.toFixed(2).toString()+"</td>"
                   html += "<td class='"+bgcolor+"' nowrap><a href='/taxa/tax_description?otid="+otid+"'>"+hmt+"</a></td>"
                   html += "<td class='"+bgcolor+"' nowrap><i>"+species+"</i></td>"
                   html += "<td class='"+bgcolor+"' nowrap>"+strain+"</td>"
                   html += "<td class='"+bgcolor+"' nowrap><a href='https://www.ncbi.nlm.nih.gov/nuccore/"+gb+"' target='_blank'>"+gb+"</a></td>"
                   html += "<td class='"+bgcolor+"'>"+line_collector[qid][n][indexes.stitle]+'</td>'
                   html += '</tr>'
               }
           //html += "</tr>"
           }
        
        }else if(opt === 'standard'){  // top 4
            //let filenumber = 0
            if(line_collector[qid] === 'no data'){
                html += "<td>"+qid+"</td><td></td><td></td><td>No Hits</td><td>No Hits</td><td>No Hits</td><td></td><td></td><td></td>"
            }else{
                html+="<td rowspan='4'>"+qid+"</td>" // query
                html+="<td rowspan='4' class='center'>"+line_collector[qid][0][indexes.qlen]+'</td>'
                html+="<td rowspan='4' class='center'><a href='#' onclick=\"getFileContent('seq','"+blastID+"','"+q_lookup[qid].toString()+"')\">view</a></td>"   // q seq (link)
        
                //for(let n in line_collector[qid]){
                //console.log(qid,line_collector[qid])
                for(let n=0;n<4;n++){// in line_collector[qid]){
                    //let qid    = line_collector[qid][n][indexes.query_id]
                    let stitle = line_collector[qid][n][indexes.stitle]
                    let qseq   = line_collector[qid][n][indexes.qseq]
                    let sseq   = line_collector[qid][n][indexes.sseq]
                    let qstart = line_collector[qid][n][indexes.qstart]
                    let qend   = line_collector[qid][n][indexes.qend]
                    let sstart = line_collector[qid][n][indexes.sstart]
                    let send = line_collector[qid][n][indexes.send]
                    let title_items = line_collector[qid][n][indexes.stitle].split('|')
                    let hmt = title_items[2].trim()
                    let otid = hmt.split('-')[1]
                    html+="<td class='"+bgcolor+" center'>"
                    html+="<a href='#'  onclick=\"create_alignment_client('"+qid+"','"+stitle+"','"+qseq+"','"+sseq+"','"+qstart+"','"+qend+"','"+sstart+"','"+send+"','open')\">open</a>"
                    html+="<br><a href='#'  onclick=\"create_alignment_client('"+qid+"','"+stitle+"','"+qseq+"','"+sseq+"','"+qstart+"','"+qend+"','"+sstart+"','"+send+"','download')\">download</a>"
                    html+="</td>"

                    html+="<td class='"+bgcolor+"'><a href='/taxa/tax_description?otid="+otid+"'>"+title_items[0].trim()+'</a></td>'  // hit id
                    html+="<td class='"+bgcolor+"'>"+line_collector[qid][n][indexes.stitle]+'</td>'  // whole title
                    html+="<td class='"+bgcolor+"' nowrap>"+line_collector[qid][n][indexes.evalue]+'</td>'   // ?
                    html+="<td class='"+bgcolor+" center'>"+line_collector[qid][n][indexes.bit_score]+'</td>'   // 
                    html+="<td class='"+bgcolor+" center'>"+line_collector[qid][n][indexes.pct_identity]+'</td>'   // 
                    html+='</tr>'
                }
                //html += "</tr>"
            }
            
        }  // end best/std
        //html += "</tr>"
    
        
    }  // for(let qid in line_collector){
    
    return header+html
      
}

//
module.exports.parse_blast_custom = function parse_blast_custom(file_data, opt, blastID, filenumber){
    //opt = 'full'  // one,two,full
    // file_data is single file string
    console.log('opt reqular',opt)  // alignments or full (or refseq custom download)
    let dnlds = ['text1-download','text4-download','text20-download','textAll-download',
         'excel1-download','excel4-download','excel20-download','excelAll-download']
    let download=false
    if(dnlds.indexOf(opt) != -1){
        download = true
    }
    // https://www.metagenomics.wiki/tools/blast/blastn-output-format-6
    let lines = file_data.toString().split('\n')
    // plan : get the top hits only (by bit_score)
    // split the id line
    // calculate FULL_PCT_ID 
    // qaccver, saccver, pident, length, mismatch, gaps, qstart, qend, sstart, send, evalue, bitscore, qlen, stitle qcov qseq sseq
    let indexes ={ query_id:0, hit_id:1, pct_identity:2, length:3, mismatches:4, gaps:5, 
                   qstart:6, qend:7, sstart:8, send:9, evalue:10, 
                   bit_score:11, qlen:12, stitle:13, qcov:14, qseq:15, sseq:16  // qseq;11, sseq:12
                 }
    let query = '',version=''
    let allheader = '',header=''
    
    let html ='',txt = ''
    let max_bitscore = 0
    let line_count = 0
    let row_collector = []
    let return_obj = {}
    for(let i in lines){
        if(!lines[i] || lines[i] === ''){
            continue
        }
        
        //console.log('line:',lines[i])
        if(lines[i][0] === '#'){
             allheader += lines[i]+'<br>'
             if(lines[i].startsWith('# Database:')){
                 header += lines[i]+'<br>'
                 version = lines[i]
              }
              if(lines[i].startsWith('# BLASTN')){
                 header += lines[i]+'<br>'
              }
              if(lines[i].startsWith('# Query:')){
                 query = lines[i] //.split(/\s/)[2,]
              }
          
        }else{
            line_count += 1
            let line_items = lines[i].split('\t')
            row_collector.push(line_items)
            
        }
    }
    //console.log('row_collector[0]',row_collector)
    if(row_collector.length === 0){
        return allheader+"No Data"
    }
    
    if(download){
        
        return_obj.data = []
        return_obj.query = query
        return_obj.version = version
        //if(row_collector.length === 0){
        //return_obj.data = "No Data"
    }else{
    
        html += "<center><h3>"+query+"</h3></center>"
        if(opt === 'alignments'){  // alignments
          html += "<table id='newSortTable' class='sortable'><tr>"
          html += '<th>Query-id</th><th>Hit-id</th><th>Bit Score</th><th>Mis-<br>Matches</th><th>Gaps</th><th>Alignments</th><th>Download</th>'
        
        }else{   // full table
        //qaccver, saccver, pident, length, mismatch, gaps, qstart, qend, sstart, send, evalue, bitscore, qlen, stitle
        
          html += "<table id='newSortTable' class='sortable'><tr>"
          html += "<th>Query-id</th><th>Hit-id</th><th>% Identity</th><th>% Cov</th><th title='Full Percent Identity:\n(% ident) x (coverage)'>FPI</th><th>Alignment Length</th><th>Mis-<br>matches</th><th>Gaps</th>"
          html += "<th>q-start</th><th>q-end</th><th>s-start</th><th>s-end</th><th>E-value</th><th>Bit Score</th><th>Query Length</th><th>HOMD Clone Name/Hit Title</th>"
        }
        html += '</tr>'
    }
    
    let odd,bgcolor
    for(let n in row_collector){
        odd = n % 2  // will be either 0 or 1
        if(odd){
          bgcolor = 'blastBGodd'
        }else{
          bgcolor = 'blastBGeven'
        }
        let BEST_PCT_ID = 0.0
        let BEST_FULL_PCT_ID = 0.0
        let row_items = row_collector[n]  // an array
        return_obj.query_length = row_items[indexes.qlen]
        let qid    = row_items[indexes.query_id]
        let stitle = row_items[indexes.stitle]
        let qseq   = row_items[indexes.qseq]
        let sseq   = row_items[indexes.sseq]
        let qstart = row_items[indexes.qstart]
        let qend   = row_items[indexes.qend]
        let sstart = row_items[indexes.sstart]
        let send = row_items[indexes.send]
        let title_items = row_items[indexes.stitle].split('|')
        let hmt = title_items[2].trim()
        let otid = hmt.split('-')[1]
        let hitid = title_items[0]
        //let ALIGNMENT_FRAC = parseFloat(parseInt(qend) - parseInt(qstart) + 1.0) / parseFloat(row_items[indexes.qlen])
        //let full_pct_id_calc = parseFloat(row_items[indexes.pct_identity]) * ALIGNMENT_FRAC
        let full_pct_id_mult = parseFloat(row_items[indexes.pct_identity]) * parseFloat(row_items[indexes.qcov])/100
        if(download){
            
            return_obj.data.push({
                query_id: row_items[indexes.query_id],
                hit_id: hitid,
                evalue: row_items[indexes.evalue],
                bitscore: row_items[indexes.bit_score],
                //qlength:row_items[indexes.qlen],   
                stitle: row_items[indexes.stitle],
            
                qstart: row_items[indexes.qstart],
                qend: row_items[indexes.qend],
                sstart: row_items[indexes.sstart],
                send: row_items[indexes.send],
                hmt: title_items[2].trim(),
                otid: hmt.split('-')[1],
                mismatches: row_items[indexes.mismatches],
                gaps: row_items[indexes.gaps],
                alength: row_items[indexes.length],
                identity: row_items[indexes.pct_identity],
                coverage: row_items[indexes.qcov],
                fpi: full_pct_id_mult.toFixed(2).toString()
            })
        
        }else{
        
            html+="<tr class='"+bgcolor+"'>"
            html+='<td>'+qid+'</td>'
            if(opt === 'alignments'){   // alignments
               html+="<td><a href='/taxa/tax_description?otid="+otid+"'>"+row_items[indexes.hit_id]+'</a></td>'
               html+="<td class='center'>"+row_items[indexes.bit_score]+'</td>'
               html+="<td class='center'>"+row_items[indexes.mismatches]+'</td>'
               html+="<td class='center'>"+row_items[indexes.gaps]+'</td>'
               html+="<td class='align'><pre>"+create_alignment(row_items,indexes)+'</pre></td>'
               html+="<td><a class='button' href='#' onclick=\"create_alignment_client('"+qid+"','"+stitle+"','"+qseq+"','"+sseq+"','"+qstart+"','"+qend+"','"+sstart+"','"+send+"','download')\">download</a></td>"
            }else{
                html+="<td><a href='/taxa/tax_description?otid="+otid+"'>"+row_items[indexes.hit_id]+'</a></td>'
                html+="<td class='center'>"+(parseFloat(row_items[indexes.pct_identity])).toFixed(2).toString()+'</td>'
                html+="<td class='center'>"+row_items[indexes.qcov]+'</td>'
                //html+='<td>'+full_pct_id_calc.toFixed(5).toString()+'</td>'
                html+="<td title='Full Percent Identity:\n(% ident) x (coverage)'>"+full_pct_id_mult.toFixed(2).toString()+'</td>'
                html+="<td class='center'>"+row_items[indexes.length]+'</td>'
                html+="<td class='center'>"+row_items[indexes.mismatches]+'</td>'
                html+="<td class='center'>"+row_items[indexes.gaps]+'</td>'
                html+="<td class='center'>"+qstart+'</td>'
                html+="<td class='center'>"+qend+'</td>'
                html+="<td class='center'>"+sstart+'</td>'
                html+="<td class='center'>"+send+'</td>'
                html+='<td nowrap>'+row_items[indexes.evalue]+'</td>'
                html+="<td class='center'>"+row_items[indexes.bit_score]+'</td>'
                html+="<td class='center'>"+row_items[indexes.qlen]+'</td>'
                html+='<td>'+stitle+'</td>'
            }
            html+='</tr>'
        }
    }
    html+='</table>'
    
    if(download){
        return return_obj  // for download
    }else{
        return allheader+'<br><br>'+html   // for show
    }
}
function create_alignment(row_items, indexes){
    
    let qseq_letters = row_items[indexes.qseq] //qseq.trim().split('')
    let sseq_letters = row_items[indexes.sseq] //sseq.trim().split('')
    let qstart = row_items[indexes.qstart].padStart(6,' ')
    let qend = row_items[indexes.qend]
    let sstart = row_items[indexes.sstart].padStart(6,' ')
    let send = row_items[indexes.send]
    
    let qcaps = 'Query:  '+qstart+' ', scaps = 'Subject:'+sstart+' '
    let qreturn_value = '',sreturn_value = '',align_value = "               "
    let onereturn = ''
    //console.log(qseq_letters.length,sseq_letters.length)
    for(let q in qseq_letters){
       
       let letter = qseq_letters[q].toUpperCase()
       qcaps += letter
      
    }
    onereturn += '\n'
    for(let q in qseq_letters){
       let qletter = qseq_letters[q].toUpperCase()
       let sletter = sseq_letters[q].toUpperCase()
        if(qletter == sletter){
             align_value += "|"
        }else{
             align_value += ' '
        }
    }
    
    for(let s in sseq_letters){
       let letter = sseq_letters[s].toUpperCase()
       scaps += letter
 
    }
    return qcaps+' '+qend+'<br>'+align_value+'<br>'+scaps+' '+send
    
    
    //return qreturn_value+'<br>'+align_value+'<br>'+sreturn_value
    //return onereturn
}

module.exports.readFromblastDb = function readFromblastDb(filepath,gid,ext) {
    return new Promise((resolve, reject) => {
        let full_data = '',hit
        let run = spawn('/Users/avoorhis/.sequenceserver/ncbi-blast-2.12.0+/bin/blastdbcmd',['-db',filepath,'-info'])
           run.stdout.on("data", data => {
                //console.log(`stdout: ${data}`);
                full_data += data
            });

            run.stderr.on("data", data => {
                console.log(`stderr: ${data}`);
                //reject(data)
            });

            run.on('error', (error) => {
                console.log(`error: ${error.message}`);
                reject(data)
            });

            run.on("close", code => {
                console.log(`readFromblastDb() spawn child process exited with code ${code}`);
                if(code == 0){
                  hit = parse_blast_db_info(full_data.toString(), ext, filepath)
                  resolve(hit)
                  //console.log('hit',exts[e],hit)
                }else{
                  resolve('No Database: '+filepath)
                }
            });
    });
}
function parse_blast_db_info(hit_data,ext,path){
//  Database: ftp/faa/SEQF1595.faa
//  1,842 sequences; 605,679 total residues
// 
//  Date: Feb 7, 2022 11:14 PM  Longest sequence: 4,231 residues
// 
//  BLASTDB Version: 4
// 
//  Volumes:
//  /Users/avoorhis/programming/blast-db-alt/faa/SEQF1595.faa

    let lines,line,tmp
    let hit = {
       path: path,
       ext: ext,
       mol_type: '',
       name: '',
       seqs: '',
       bps: '',
       date: '',
       db_version: ''
    }
    if(ext === 'faa'){
       hit.mol_type = 'protein'
    }else{
      hit.mol_type = 'nucleotide'
    }
    lines = hit_data.split('\n')
    
    for(let l in lines){
       line = lines[l].trim()
       if(line.substring(0,8) === "Database"){
           hit.name = line.split(':')[1].trim()
       }
       if(line.indexOf('sequences;') != -1){
           tmp = line.split('sequences;')
           hit.seqs = tmp[0].trim().replace(/,/g,'')
           hit.bps = tmp[1].trim().split(/\s/)[0].replace(/,/g,'')
       }
       if(line.substring(0,4) === "Date"){
           hit.date = line.split('\t')[0].split(':')[1].trim()
       }
       if(line.substring(0,15) === "BLASTDB Version"){
           hit.db_version = line.split(':')[1].trim()
       }
    } 
    
    
    return hit
    
}
// module.exports.createBlastCommandFile = function createBlastCommandFile(fastaFilePaths, opts, dataDir) {
//     console.log('in createBlastCommandFile')
//     //console.log(fastaFilePaths)
//     let make_blast_script_txt = ''
//     make_blast_script_txt += "#!/bin/bash\n\n"
//     
// //     /usr/local/blast/bin/blastall -p blastn \
// // -d /mnt/LV1/blast_db/oral16S/HOMD_16S_rRNA_RefSeq_V15.22.p9.fasta \
// // -e 0.0001 -F F -v 20 -b 20 -q -3 -r 2 -G 5 -E 2 \
// // -i /mnt/LV1/oral16S6_tmp/feu9hoakrcsg3r9cukjp5r36k7/389_0541_Abiotrophia_defectiva_HMT \
// // -o /mnt/LV1/oral16S6_tmp/feu9hoakrcsg3r9cukjp5r36k7/blast_results/tmp/389_0541_Abiotrophia_defectiva_HMT \
// // 1>/dev/null 2>>/mnt/LV1/oral16S6_tmp/feu9hoakrcsg3r9cukjp5r36k7/error2; \
// // mv /mnt/LV1/oral16S6_tmp/feu9hoakrcsg3r9cukjp5r36k7/blast_results/tmp/389_0541_Abiotrophia_defectiva_HMT \
// // /mnt/LV1/oral16S6_tmp/feu9hoakrcsg3r9cukjp5r36k7/blast_results/389_0541_Abiotrophia_defectiva_HMT;\
// // /mnt/myBROP/let/www/html/homd_modules/RNAblast/parse_blast_single.pl \
// // feu9hoakrcsg3r9cukjp5r36k7 389_0541_Abiotrophia_defectiva_HMT S ;\
// // #rm /mnt/LV1/oral16S6_tmp/feu9hoakrcsg3r9cukjp5r36k7/submit_command0
//     //console.log(opts)
//     console.log('XXXXXXXXHostname: ',CFG.HOSTNAME)
//     console.log('XXXXXXXXSITE: ',CFG.SITE)
//     for (let i = 0; i < fastaFilePaths.length; i++) {
//        make_blast_script_txt += path.join(CFG.PATH_TO_BLAST_PROG, opts.program)
//        if(CFG.SITE === 'localhome'){
//           make_blast_script_txt += ' -db /Users/avoorhis/programming/blast_db/HOMD_16S_rRNA_RefSeq_V15.22.fasta'
//        }else if(CFG.SITE === 'localmbl'){
//           make_blast_script_txt += ' -db /Users/avoorhis/programming/blast/Bv6/Bv6'
//        }else{   // HOMD
//           make_blast_script_txt += ' -db ' + opts.dbPath
//        }
//        
//        make_blast_script_txt += ' -evalue ' + opts.expect
//        make_blast_script_txt += ' -max_target_seqs ' + opts.descriptions
//        //make_blast_script_txt += ' -num_alignments ' + opts.alignments
//        // Error: Argument "num_alignments".num_descriptions Incompatible with argument:  `max_target_seqs'
//        // 
//        make_blast_script_txt += ' -query ' + fastaFilePaths[i]
//        make_blast_script_txt += ' -outfmt 15'   // single file: JSON
//        //make_blast_script_txt += ' -outfmt 16'   //single file:XML
//       // make_blast_script_txt += ' -html'   //JSON
//        make_blast_script_txt += ' -out ' + dataDir + '/result' + i.toString() + '.blast' 
//        make_blast_script_txt += " 1>/dev/null 2>>" + dataDir + "/error.log;"
//        
//        make_blast_script_txt += '\n\n'
//        
//     }
//     //console.log('batch blast content:')
//     //console.log(make_blast_script_txt)
//     return make_blast_script_txt
// }
// module.exports.readFilesInDirectory = function readFilesInDirectory(directory, destination) {
// 
//   return new Promise((resolve, reject) => {
// 
//     fs.readdir(directory, (err, files) => {
//         if (err)
//             return reject(err);
// 
//         files = files.map(file => path.join(directory,file));
// 
//         //Read all files in parallel
//         async.map(files, fs.readFile, (err, results) => {
//             if (err)
//                 return reject(err);
// 
//           
//         });
// 
//     });
//   });
// }
//
//
// module.exports.get_qsub_script_text = function get_qsub_script_text(req, scriptlog, dir_path, cmd_name, cmd_list) {
//   /*
//    #!/bin/sh
//    # CODE:
//    # source environment:\n";
//    source /groups/vampsweb/"+site+"/seqinfobin/vamps_environment.sh
//    TSTAMP=`date "+%Y%m%d%H%M%S"`'
//    # . /usr/share/Modules/init/sh
//    # export MODULEPATH=/usr/local/www/vamps/software/modulefiles
//    # module load clusters/vamps
//    cd "+pwd+"
//    function status() {
//    qstat -f
//    }
//    function submit_job() {
//    cat<<END | qsub
//    #!/bin/bash
//    #$ -j y
//    #$ -o "+scriptlog+"
//    #$ -N "+name+"
//    #$ -cwd
//    #$ -V
//    echo -n "Hostname: "
//    hostname
//    echo -n "Current working directory: "
//    pwd
//    source /groups/vampsweb/"+site+"/seqinfobin/vamps_environment.sh
//    for (i in cmd_list) {
//    cmd_list[i]
//    }
//    END
//    }
//    status
//    submit_job
//    */
//   //### Create Cluster Script
//   // TODO: DRY with l 1380
//   script_text = "#!/bin/bash\n\n";
//   script_text += "# CODE:\t" + cmd_name + "\n\n";
//   //script_text += "# source environment:\n";
//   //script_text += "source /groups/vampsweb/" + req.CONFIG.site + "/seqinfobin/vamps_environment.sh\n\n";
//   script_text += 'TSTAMP=`date "+%Y%m%d%H%M%S"`' + "\n\n";
//   //script_text += "# Loading Module didn't work when testing:\n";
//   //$script_text .= "LOGNAME=test-output-$TSTAMP.log\n";
//   script_text += ". /usr/share/Modules/init/sh\n";
//   //script_text += "export MODULEPATH=/usr/local/www/vamps/software/modulefiles\n";
//   //script_text += "module load clusters/vamps\n\n";
//   script_text += "cd /groups/vampsweb/tmp\n\n";
//   //script_text += "cd "+pwd+"\n\n";
//   //script_text += "mkdir "+pwd+"/gast\n\n";
//   //script_text += "mkdir gast\n\n";
//   //    script_text += "function status() {\n";
// //     script_text += "   qstat -f\n";
// //     script_text += "}\n\n";
//   script_text += "function submit_job() {\n";
//   script_text += "cat<<END | qsub\n";
//   script_text += "#!/bin/bash\n";
//   script_text += "#$ -j y\n";
//   script_text += "#$ -o " + scriptlog + "\n";
//   script_text += "#$ -N " + cmd_name + "\n";
//   script_text += "#$ -pe allslots 12\n";
//   //script_text += "#$ -p 100\n";   // priority default is 0
//   script_text += "#$ -cwd\n";
//   script_text += "#$ -V\n";
//   
//   script_text += 'echo -n "Hostname: "' + "\n";
//   script_text += "hostname\n";
//   script_text += 'echo -n "qsub: Current working directory: "' + "\n";
//   script_text += "pwd\n\n";
//   //script_text += "source /groups/vampsweb/" + req.CONFIG.site + "/seqinfobin/vamps_environment.sh;\n\n"
// //     script_text += "source /groups/vampsweb/"+site+"/seqinfobin/vamps_environment.sh\n\n";
// 
//   for (let i in cmd_list) {
//     script_text += cmd_list[i] + "\n";
//     script_text += "echo \"DONE-"+i.toString()+"\" >> " + scriptlog + "\n\n"
//   }
// //
// //     //script_text += "chmod 666 "+log+"\n";
// //     //$script_text .= "sleep 120\n";   # for testing
//   script_text += "\nEND\n";
//   script_text += "}\n";
// //     script_text += "status\n";  //#  status will show up in export.out
//   script_text += "submit_job\n";
//   //##### END  create command
// 
//   return script_text;
// 
// };
//
//

// module.exports.make_blast1_script_txt = function make_blast_script_txt(req, dataDir, cmd_list, opts) {
//   //console.log('OPTS: ')
//   //console.log(opts)
//   make_blast_script_txt = "";
//   
// 
//   make_blast_script_txt += "ls " + dataDir + "/*.fa > " + dataDir + "/filenames.list\n"
//   make_blast_script_txt += "# chmod 666 " + dataDir + "/filenames.list\n"
//   make_blast_script_txt += "cd " + dataDir + "\n";
// 
//   make_blast_script_txt += "\n";
//   make_blast_script_txt += "\n";
//   //make_blast_script_txt += `FILE_NUMBER=\`/usr/bin/wc -l < ${data_dir}/filenames.list\``;
//   make_blast_script_txt += `FILE_NUMBER=\`/usr/bin/sed -n '$=' < ${dataDir}/filenames.list\``;
//   make_blast_script_txt += "\n";
//   //make_blast_script_txt += "FILE_NUMBER=\"$({FILE_NUMBER##*( )}+1-1)\""
//   
//   make_blast_script_txt += "\n";
//   make_blast_script_txt += "echo \"total files = $FILE_NUMBER\" >> " + dataDir + "/clust_blast.log\n"
// 
//   make_blast_script_txt += "cat >" + dataDir + "/clust_blast.sh <<InputComesFromHERE\n"
//   make_blast_script_txt += "#!/bin/bash\n";
// 
//     make_blast_script_txt += "#$ -S /bin/bash\n"
//     make_blast_script_txt += "#$ -N clust_blast.sh\n"
//     make_blast_script_txt += "# Giving the name of the output log file\n"
//     make_blast_script_txt += "#$ -o " + dataDir + "/cluster.log\n"
//     make_blast_script_txt += "#$ -j y\n"
//     make_blast_script_txt += "# Send mail to these users\n"
//     //make_blast_script_txt += "#$ -M " + req.user.email + "\n"
//     //make_blast_script_txt += "# Send mail; -m as sends on abort, suspend.\n"
//     make_blast_script_txt += "#$ -m as\n"
//     make_blast_script_txt += "#$ -t 1-\${FILE_NUMBER##*( )}\n"   // ##*( )supposed to remove white space
//     make_blast_script_txt += "# Now the script will iterate $FILE_NUMBER times.\n"
// 
//     //make_blast_script_txt += "  . /xraid/bioware/Modules/etc/profile.modules\n"
//     //make_blast_script_txt += "  module load bioware\n"
//     //make_blast_script_txt += "  PATH=$PATH:"+app_root+"/public/scripts/gast:"+req.CONFIG.GAST_SCRIPT_PATH+"\n"
//     //make_blast_script_txt += "  source /groups//vampsweb/" + req.CONFIG.site + "/seqinfobin/vamps_environment.sh\n"
//     //make_blast_script_txt += "  echo \"===== $PATH ====\" >> " + data_dir + "/clust_blast.log\n"
// 
//     make_blast_script_txt += "  LISTFILE=" + dataDir + "/filenames.list\n"
//     //make_blast_script_txt += "  echo \"LISTFILE is \\$LISTFILE\" >> " + data_dir + "/clust_blast.log\n";
// 
//     make_blast_script_txt += "\n";
//     make_blast_script_txt += '  INFILE=\\`sed -n "\\${SGE_TASK_ID}p" \\$LISTFILE\\`';
//   
// 
//   make_blast_script_txt += "\n";
//   make_blast_script_txt += "  echo \"=====\" >> " + dataDir + "/clust_blast.log\n"
//   make_blast_script_txt += "  echo \"file name is \\$INFILE\" >> " + dataDir + "/clust_blast.log\n"
//   make_blast_script_txt += "  echo '' >> " + dataDir + "/clust_blast.log\n"
//   make_blast_script_txt += "  echo \"SGE_TASK_ID = \\${SGE_TASK_ID}\" >> " + dataDir + "/clust_blast.log\n"
//   make_blast_script_txt += "  echo '' >> " + dataDir + "/clust_blast.log\n"
// 
// 
// // ORIGINAL::make_blast_script_txt += "  echo \"" + opts.gast_script_path + "/gast/gast_ill -saveuc -nodup " + opts.full_option + " -in \\$INFILE -db " + opts.gast_db_path + "/" + opts.ref_db_name + ".fa -rtax " + opts.gast_db_path + "/" + opts.ref_db_name + ".tax -out \\$INFILE.gast -uc \\$INFILE.uc -threads 0\" >> " + data_dir + "/clust_gast_ill_" + project + ".sh.sge_script.sh.log\n"
// //   make_blast_script_txt += "  echo \"" + "/usr/local/blast/bin/blastall  -p blastn "
// //   make_blast_script_txt += "-d /mnt/LV1/blast_db/oral16S/HOMD_16S_rRNA_RefSeq_V15.22.p9.fasta "
// //   make_blast_script_txt += "-e 0.0001 -F F -v 20 -b 20 -q -3 -r 2 -G 5 -E 2 "
// //   make_blast_script_txt += "-i \\$INFILE " 
// //   make_blast_script_txt += "-o "+data_dir+"/out_file.out "
// //   make_blast_script_txt += "1>/dev/null 2>>"+data_dir+"/error2;\""
//   //make_blast_script_txt += ""
// //  make_blast_script_txt += "   " + opts.gast_script_path + "/gast/gast_ill -saveuc -nodup " + opts.full_option + " -in \\$INFILE -db " + opts.gast_db_path + "/" + opts.ref_db_name + ".fa -rtax " + opts.gast_db_path + "/" + opts.ref_db_name + ".tax -out \\$INFILE.gast -uc \\$INFILE.uc -threads 0\n";
//   make_blast_script_txt += "\n\n";
//   
//   // The qsub blast command
//   //blast_command = "/usr/local/blast/bin/blastall  -p blastn "
//   blast_command = C.PATH_TO_BLAST_PROGS + '/' + blastProg
//   blast_command += " -d /mnt/LV1/blast_db/oral16S/HOMD_16S_rRNA_RefSeq_V15.22.p9.fasta"
//   blast_command += " -e 0.0001 -F F -v 20 -b 20 -q -3 -r 2 -G 5 -E 2"
//   blast_command += " -i \\$INFILE" 
//   blast_command += " -o "+dataDir+"/out_file.out"
//   blast_command += " 1>/dev/null 2>>"+dataDir+"/error2;"
// 
//   //make_blast_script_txt += "  echo \"BLASTn Commamd:\n " + blast_command + "\n<--END Command\"\n\n"
//   make_blast_script_txt += "  echo \"" + blast_command + "\" >> " + dataDir + "/clust_blast.log\n"
//   
//   make_blast_script_txt += "\n\n";
//   
//   //make_blast_script_txt += blast_command;
// 
// /////////////////////////////////////////////////////////////////
// // testing:: must port >> to log
// make_blast_script_txt += "  echo \"# print date and time \" >> " + dataDir + "/clust_blast.log\n"
// make_blast_script_txt += "date >>" + dataDir + "/clust_blast.log\n\n"
// make_blast_script_txt += "  echo \"File to run:\" >> " + dataDir + "/clust_blast.log\n"
// make_blast_script_txt += "  echo \"\\$INFILE\" >> " + dataDir + "/clust_blast.log\n"
// 
// 
// 
// // make_blast_script_txt += "  echo \"# Sleep for 20 seconds \" >> " + data_dir + "/clust_blast.log\n"
// // make_blast_script_txt += "sleep 20 >>" + data_dir + "/clust_blast.log\n"
// // make_blast_script_txt += "  echo \"# print date and time again \" >> " + data_dir + "/clust_blast.log\n"
// // make_blast_script_txt += "date >> " + data_dir + "/clust_blast.log\n"
// //////////////////////////////////////////
// 
//   // https://stackoverflow.com/questions/16483977/sge-task-id-not-getting-set-with-qsub-array-grid-job
//   make_blast_script_txt += "\n\n";
//   make_blast_script_txt += "  chmod 666 " + dataDir + "/clust_blast.log\n"
//   make_blast_script_txt += "\n";
//   make_blast_script_txt += "InputComesFromHERE\n\n"
// 
//   //make_blast_script_txt += "echo \"Running clust_blast.sh >> " + data_dir + "/clust_blast.log\n"
// 
//   make_blast_script_txt += "chmod 775 "+dataDir+"/clust_blast.sh\n";
// 
//   //make_blast_script_txt += "\n";
//   //make_blast_script_txt += "\n";
//   //make_blast_script_txt += "export SGE_ROOT=/opt/sge\n";
//   //make_blast_script_txt += "source /groups/vampsweb/" + req.CONFIG.site + "/seqinfobin/vamps_environment.sh\n\n"
//   
//     // the -sync y tag means that the following install scripts will run AFTER the cluster gast scripts finish
//     // this is important to have -sync y
//     //let sync_tag = '-sync y' // forces qsub to wait until all jobs finish before exiting and then running install
//     //let parallel_env_tag = '-pe smp 8'  // req to work on vamps cluster 2019-01
//     //let parallel_env_tag = '-pe allslots 12'
//     //make_blast_script_txt += "qsub "+parallel_env_tag+" "+sync_tag+" " + data_dir + "/clust_blast.sh\n";
//   
//   
//   //make_blast_script_txt += "qsub " + data_dir + "/clust_blast.sh\n";
// 
// /////////////////////////////////////////////////////////////////
// // testing:: run the script locally
// make_blast_script_txt += "bash "+dataDir + "/clust_blast.sh\n";
// ///////////////////////////////////////////////////////////////////
//   
//   //make_blast_script_txt += "echo \"Done with cluster_blast\" >> " + data_dir + "/cluster.log\n"
//   //make_blast_script_txt += "echo \"Running install scripts (see log)\" >> " + data_dir + "/cluster.log\n"
//   
// 
//   make_blast_script_txt += "\n";
//   // make_blast_script_txt += "touch " + path.join(data_dir, "TEMP.tmp");
//   // make_blast_script_txt += "\n";
//   return make_blast_script_txt
// }
//