'use strict'
const express = require('express')
const router = express.Router()
const fs        = require('fs-extra')
// const fs   = require('fs-extra')
const path  = require('path')
const helpers = require('./helpers/helpers')
// const url = require('url')
// const ds = require('./load_all_datasets')
const CFG = require(app_root + '/config/config')
const C = require(app_root + '/public/constants')
const { exec, spawn } = require('child_process');
const queries = require(app_root + '/routes/queries')
// let timestamp = new Date() // getting current timestamp
// var rs_ds = ds.get_datasets( () => {
var browseDir = require("browse-directory");
//const Stream = require( 'stream-json/streamers/StreamArray');
/* GET home page. */
router.get('/', function index(req, res) {
  
  console.log('Session ID:',req.session.id)
  //console.log('CFG.ENV :',CFG.ENV )
  res.render('pages/home', {
    title: 'HOMD :: Human Oral Microbiome Database',
    pgname: 'home', // for AbountThisPage
    config: JSON.stringify(CFG),
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
    user: JSON.stringify(req.user || {})
    

  })
})
router.get('/taxon=(\\d+)', function index(req, res) {
  // sequence server
  //console.log('taxon=/.d/')
  var url = req.url;
  //console.log(url)
  let otid = url.split('=')[1]
  res.redirect('/taxa/tax_description?otid='+otid)
  
})
router.get('/idn=SEQF(\\d+.\\d)', function index(req, res) {
  // sequence server
  //console.log('idn=SEQF')
  var url = req.url;
  //console.log(url)
  let gid = url.split('=')[1]
  res.redirect('/genome/genome_description?gid='+gid)
 
})

router.get('/download_file', function search(req, res) {
  //let page = req.params.pagecode
  let fullpath = req.query.filename
  helpers.print('file path: '+fullpath)
  res.download(fullpath)
  //res.end()
})


router.get('/download', function download(req, res) {
  // renders the overall downlads page
  res.render('pages/download', {
    title: 'HOMD :: Human Oral Microbiome Database',
    pgname: 'download', // for AbountThisPage
    config: JSON.stringify(CFG),
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
    user: JSON.stringify(req.user || {})

  })
})
//
router.get('/poster', function poster(req, res) {
  res.render('pages/poster', {
    title: 'HOMD :: Human Oral Microbiome Database',
    pgname: '', // for AbountThisPage
    config: JSON.stringify(CFG),
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
    user: JSON.stringify(req.user || {})

  })
})

router.get('/oralgen', function oralgen(req, res) {
  res.render('pages/oralgen', {
    title: 'HOMD :: Human Oral Microbiome Database',
    pgname: '', // for AbountThisPage
    config: JSON.stringify(CFG),
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
    user: JSON.stringify(req.user || {})

  })
})
//
//
function create_protein_table(anno, obj, searchtext){
    // for site search::protein
    let html = '',data_lst,organism='',pid,product,idx,send_obj={}
    html += "<center><small>(click header to sort)</small><table id='anno_result_table' class='table sortable'><thead>"
    html += '<tr><th>SEQ-ID</th><th>Genome ('+anno.toUpperCase()+')</th><th>Number<br>of Hits</th><th class="sorttable_nosort"></th></tr>'
    html += '</thead><tbody>'
    console.log('in create_protein_table')
    //console.log(obj)
    let send_list = []
    for(let gid in obj){
        //data_lst = obj[gid]
        send_obj = {}
        if(C.genome_lookup.hasOwnProperty(gid)){
           organism = C.genome_lookup[gid].genus +' '+C.genome_lookup[gid].species+' '+C.genome_lookup[gid].ccolct
        }
        send_obj.gid = gid
        send_obj.org = organism
        send_obj.count = obj[gid].length
        send_list.push(send_obj)
    }
    send_list.sort(function (a, b) {
       return helpers.compareStrings_alpha(a.org, b.org);
    })
    for(let i in send_list){
        html += '<tr><td>'+send_list[i].gid+'</td>'
        html += '<td>'+send_list[i].org+'</td>'
        html += '<td><center>'+send_list[i].count+' items<center></td>'
        html += '<td>'
        html += " <form method='POST' action='/genome/open_explorer_search'>"
        html += " <input type='hidden' name='anno' value='"+anno+"'>"
        html += " <input type='hidden' name='gid' value='"+send_list[i].gid+"'>"
        html += " <input type='hidden' name='searchtext' value='"+searchtext+"'>"
        html += " <input class='link' type='submit' value='View Results'>"
        html += " </form>"
        html += '</td>'
        html += '</tr>'
    }
    html += '</tbody></table></center>'
    
    return html

}
router.post('/anno_protein_search', function anno_protein_search(req, res) {
    console.log('in POST::anno_protein_search')
    console.log(req.body)
    let obj,data,gid,name,resultObj={}
    let anno = req.body.anno
    //console.log(req.session)
    console.log('chose:',anno,Object.values(req.session['site_search_result_'+anno]).length)
    //console.log('sess-ncbi',req.session.site_search_result.ncbi)
    let searchTextLower = req.body.search_text.toLowerCase()
    
    resultObj = req.session['site_search_result_'+anno]
    
    res.send(create_protein_table(anno, resultObj, searchTextLower))
})
router.post('/get_annotations_counts_ncbi', function get_annotations_counts_ncbi(req, res) {
    console.log('POST::get_annotations_counts_ncbiGREP')
    console.log(req.body)
    let searchText = req.body.intext
    let anno_type //= req.body.anno_type  // ncbi or prokka
    let searchTextLower = req.body.intext.toLowerCase()
    let obj,data,pid,gid,gid_count,organism=''
    let ngenome_count=0, ngene_count=0
    let output,subArr
    //const grep_cmd = "/usr/bin/grep -liR "+searchText + " -e '" + helpers.addslashes(searchText) + "'" 
    // -i === case insensitive
    // -h never pring file name
    let grep_cmd = "/usr/bin/grep -ih "+searchText+" "+ path.join(CFG.PATH_TO_DATA,"homdData-ORFNCBI_meta*")
    console.log('grep_cmd',grep_cmd)
    exec(grep_cmd, (err, stdout, stderr) => {
      if (stderr) {
        console.error('stderr',stderr);
        return;
      }
      if(stdout){
        var ar = [];
        
        var pid_count = 0
        var gid_collector = {}
        var sp = stdout.split('\n');
        for (var i = 0; i < sp.length; i++) {
            var sub = sp[i].trim().split(':');
                if(sub[0]){
                    let clean0 = sub[0].replace(/['"]+/g, '')
                    let clean1 = sub[1].replace(/['"]+/g, '')
                    let product = clean1.split('|')[1]
                    let pts = clean0.split('|')
                    pid = pts[1]
                    gid = pts[0]
                    gid_collector[gid] = 1
                    if(gid in C.genome_lookup){
                        organism = C.genome_lookup[gid].genus +' '+C.genome_lookup[gid].species+' '+C.genome_lookup[gid].ccolct
                    }
                    if(! req.session.site_search_result_ncbi){
                        req.session.site_search_result_ncbi = {}
                    }
                    if(gid in req.session.site_search_result_ncbi){
                        req.session.site_search_result_ncbi[gid].push({name:organism, pid:pid, product:product})
                    }else{
                        req.session.site_search_result_ncbi[gid] = [{name:organism, pid:pid, product:product}]
                    }
                    pid_count += 1
                    ar.push(sub[0].replace(/['"]+/g, ''));
                }
        }
        gid_count = Object.keys(gid_collector).length // genome_count
        // pid_count = pid_count   //gene_count
        console.log('req.session.site_search_result_ncbi.length',req.session.site_search_result_ncbi.length)
      }
      
      console.log(ar,ar.length)
      console.log(gid_count, pid_count)
      res.send([gid_count, pid_count])
    })
   
   
})
router.post('/get_annotations_counts_prokka', function get_annotations_counts_ncbi(req, res) {
    console.log('POST::get_annotations_counts_prokkaGREP')
    console.log(req.body)
    let searchText = req.body.intext
    let anno_type //= req.body.anno_type  // ncbi or prokka
    let searchTextLower = req.body.intext.toLowerCase()
    let obj,data,pid,gid,gid_count,organism=''
    let ngenome_count=0, ngene_count=0
    let output,subArr
    //const grep_cmd = "/usr/bin/grep -liR "+searchText + " -e '" + helpers.addslashes(searchText) + "'" 
    // -i === case insensitive
    // -h never pring file name
    let grep_cmd = "/usr/bin/grep -ih "+searchText+" "+ path.join(CFG.PATH_TO_DATA,"homdData-ORFPROKKA_meta*")
    console.log('grep_cmd',grep_cmd)
    exec(grep_cmd, (err, stdout, stderr) => {
      if (stderr) {
        console.error('stderr',stderr);
        return;
      }
      if(stdout){
        var ar = [];
        
        var pid_count = 0
        var gid_collector = {}
        var sp = stdout.split('\n');
        for (var i = 0; i < sp.length; i++) {
            var sub = sp[i].trim().split(':');
                if(sub[0]){
                    let clean0 = sub[0].replace(/['"]+/g, '')
                    let clean1 = sub[1].replace(/['"]+/g, '')
                    let product = clean1.split('|')[1]
                    let pts = clean0.split('|')
                    pid = pts[1]
                    gid = pts[0]
                    gid_collector[gid] = 1
                    if(gid in C.genome_lookup){
                        organism = C.genome_lookup[gid].genus +' '+C.genome_lookup[gid].species+' '+C.genome_lookup[gid].ccolct
                    }
                    if(! req.session.site_search_result_prokka){
                        req.session.site_search_result_prokka = {}
                    }
                    if(gid in req.session.site_search_result_prokka){
                        req.session.site_search_result_prokka[gid].push({name:organism, pid:pid, product:product})
                    }else{
                        req.session.site_search_result_prokka[gid] = [{name:organism, pid:pid, product:product}]
                    }
                    pid_count += 1
                    ar.push(sub[0].replace(/['"]+/g, ''));
                }
        }
        gid_count = Object.keys(gid_collector).length // genome_count
        // pid_count = pid_count   //gene_count
        console.log('req.session.site_search_result_prokka.length',req.session.site_search_result_prokka.length)
      }
      
      console.log(ar,ar.length)
      console.log(gid_count, pid_count)
      
      res.send([gid_count, pid_count])
    })
   
   
})

router.post('/get_annotations_counts_ncbiXX', function get_annotations_counts_ncbi(req, res) {
    console.log('POST::get_annotations_counts_ncbi')
    console.log(req.body)
    let searchText = req.body.intext
    let anno_type //= req.body.anno_type  // ncbi or prokka
    let searchTextLower = req.body.intext.toLowerCase()
    let obj,data,gid,organism=''
   let ngenome_count=0, ngene_count=0
   // V10.1
   //https://github.com/uhop/stream-json/wiki/StreamValues
   //let q = queries.get_annotation_query4(searchTextLower, anno_type)
   let q_ncbi   = queries.get_annotation_query4(searchTextLower, 'ncbi')
   //let q_prokka = queries.get_annotation_query4(searchTextLower, 'prokka')
   
   console.log(q_ncbi)
   //const jsonStream = StreamValues.withParser();
//   if(CFG.ENV === 'development'){
    TDBConn.query(q_ncbi, (err, rows) => {
        if (err) {
            console.log(err)
            return
        }
    
   
        console.log(anno_type,'Query Success Num Rows: '+rows.length.toString())
    
        //req.session.site_search_result.prokka = {}
        //req.session.site_search_result.ncbi = {}
        if(rows.length === 0){
           //prokka_genome_count_lookup={},prokka_gene_count=0,ncbi_genome_count_lookup={},ncbi_gene_count=0
        }else{
       
           for(let i in rows){
            gid = rows[i].gid
         
            if(gid in C.genome_lookup){
                organism = C.genome_lookup[gid].genus +' '+C.genome_lookup[gid].species+' '+C.genome_lookup[gid].ccolct
            }
            if(! req.session.site_search_result_ncbi){
              //req.session.site_search_result = {}
              //req.session.site_search_result.prokka = {}
              req.session.site_search_result_ncbi = {}
            }
            
        
        
            //req.session.site_search_result[anno_type] = {}
            if(gid in req.session.site_search_result_ncbi){
                req.session.site_search_result_ncbi[gid].push({name:organism, pid:rows[i].protein_id, product:rows[i].product})
            }else{
                req.session.site_search_result_ncbi[gid] = [{name:organism, pid:rows[i].protein_id, product:rows[i].product}]
            }
            
            ngene_count += 1 
         
           }
        }
        //console.log('x',anno_type,req.session['site_search_result_'+anno_type])
    
        ngenome_count = Object.keys(req.session.site_search_result_ncbi).length
        //console.log('x',anno_type, genome_count, gene_count)
        
        res.send([ngenome_count, ngene_count])
    })

})
router.post('/get_annotations_counts_prokkaXXX', function get_annotations_counts_prokka(req, res) {
    console.log('POST::get_annotations_counts_NEW')
    console.log(req.body)
    let searchText = req.body.intext
    let anno_type //= req.body.anno_type  // ncbi or prokka
    let searchTextLower = req.body.intext.toLowerCase()
    let obj,data,gid,organism=''
   let pgenome_count=0, pgene_count=0,ngenome_count=0, ngene_count=0
   // V10.1
   //https://github.com/uhop/stream-json/wiki/StreamValues
   //let q = queries.get_annotation_query4(searchTextLower, anno_type)
   //let q_ncbi   = queries.get_annotation_query4(searchTextLower, 'ncbi')
   let q_prokka = queries.get_annotation_query4(searchTextLower, 'prokka')
   
   console.log(q_prokka)
   //const jsonStream = StreamValues.withParser();
//   if(CFG.ENV === 'development'){

        //console.log('x',anno_type, genome_count, gene_count)
        
    TDBConn.query(q_prokka, (err, rows) => {
            if (err) {
                console.log(err)
                return
            }
            //console.log(anno_type,'Query Success Num Rows: '+rows.length.toString())
    
            //req.session.site_search_result.prokka = {}
            //req.session.site_search_result.ncbi = {}
            if(rows.length === 0){
               //prokka_genome_count_lookup={},prokka_gene_count=0,ncbi_genome_count_lookup={},ncbi_gene_count=0
            }else{
       
               for(let i in rows){
                gid = rows[i].gid
         
                if(gid in C.genome_lookup){
                    organism = C.genome_lookup[gid].genus +' '+C.genome_lookup[gid].species+' '+C.genome_lookup[gid].ccolct
                }
                
                if(! req.session.site_search_result_prokka ){
                  //req.session.site_search_result = {}
                  req.session.site_search_result_prokka = {}
                  //req.session.site_search_result.ncbi = {}
                }
        
                //req.session.site_search_result[anno_type] = {}
                if(gid in req.session.site_search_result_prokka){
                    req.session.site_search_result_prokka[gid].push({name:organism, pid:rows[i].protein_id, product:rows[i].product})
                }else{
                    req.session.site_search_result_prokka[gid] = [{name:organism, pid:rows[i].protein_id, product:rows[i].product}]
                }
            
                pgene_count += 1 
         
               }
            }
            //console.log('x',anno_type,req.session['site_search_result_'+anno_type])
    
            pgenome_count = Object.keys(req.session.site_search_result_prokka).length
            //console.log('x',anno_type, genome_count, gene_count)
            res.send([pgenome_count, pgene_count])
        
    })

})
router.post('/get_annotations_counts_NEW', function get_annotations_counts(req, res) {
    console.log('POST::get_annotations_counts_NEW')
    console.log(req.body)
    const searchText = req.body.intext
    let anno //= req.body.anno_type  // ncbi or prokka
    const searchTextLower = req.body.intext.toLowerCase()
    let acc,pid,gid,prod,organism=''
   let pgid_count=0, ppid_count=0,ngid_count=0, npid_count=0
   req.session.site_search_result_ncbi = {}
   req.session.site_search_result_prokka = {}
   let full_data = ''
   //https://github.com/uhop/stream-json/wiki/StreamValues
   //let q = queries.get_annotation_query4(searchTextLower, anno_type)
   let grep_cmd = "/usr/bin/grep -ih "+searchText+" "+ path.join(CFG.PATH_TO_DATA,"homdData-ORF*")
    console.log('grep_cmd',grep_cmd)
    let child = spawn("/bin/sh", ['-c',grep_cmd]) //, (err, stdout, stderr) => {
    
    child.stdout.on('data', (data) => {
      //console.log(`child stdout:\n${data}`);
      
      full_data += data
    });

    child.stderr.on('data', (data) => {
      console.error(`child stderr:\n${data}`);
    });
    
    child.on('exit', function (code, signal) {
      //console.log('child process exited with ' +`code ${code} and signal ${signal}`);
      if(code === 0){
         //console.log(full_data)
         var ar = [];
        var pid_count = 0
        var pgid_collector = {}
        var ngid_collector = {}
        var sp = full_data.split('\n');
        for (var i = 0; i < sp.length; i++) {
            console.log(sp[i])
            var sub = sp[i].trim().split('|');
                // ncbi|SEQF4098|MBX3952457.1|QGBS01000001.1|hypothetical protein
                // 
                if(sub.length == 5){
                //if(sub[0]){
                    anno = sub[0]
                    gid = sub[1]
                    pid = sub[2]
                    acc =sub[3]
                    prod=sub[4]
                    
                    if(gid in C.genome_lookup){
                        organism = C.genome_lookup[gid].genus +' '+C.genome_lookup[gid].species+' '+C.genome_lookup[gid].ccolct
                    }
                    if(anno == 'ncbi'){
                        ngid_collector[gid] = 1
                        // if(! req.session.site_search_result_ncbi){
//                             req.session.site_search_result_ncbi = {}
//                         }
                        if(gid in req.session.site_search_result_ncbi){
                            req.session.site_search_result_ncbi[gid].push({name:organism, pid:pid, product:prod})
                        }else{
                            req.session.site_search_result_ncbi[gid] = [{name:organism, pid:pid, product:prod}]
                        }
                        npid_count += 1
                    }else if(anno === 'prokka'){
                        pgid_collector[gid] = 1
                        // if(! req.session.site_search_result_prokka){
//                             req.session.site_search_result_prokka = {}
//                         }
                        if(gid in req.session.site_search_result_prokka){
                            req.session.site_search_result_prokka[gid].push({name:organism, pid:pid, product:prod})
                        }else{
                            req.session.site_search_result_prokka[gid] = [{name:organism, pid:pid, product:prod}]
                        }
                        ppid_count += 1
                    }
                    
                    //ar.push(sub[0].replace(/['"]+/g, ''));
                }
        }
      }  //end if code ==0
      pgid_count = Object.keys(pgid_collector).length // genome_count
      ngid_count = Object.keys(ngid_collector).length // genome_count
      console.log('req.session.site_search_result_prokka.length',Object.keys(req.session.site_search_result_prokka).length)
      console.log('req.session.site_search_result_ncbi.length',Object.keys(req.session.site_search_result_ncbi).length)
      //console.log(ar,ar.length)
      //console.log(gid_count, pid_count)
      
      res.send([pgid_count, ppid_count,ngid_count, npid_count])
      
    });
    
//     return
//       if (stderr) {
//         console.error('stderr',stderr);
//         return;
//       }
//       if(stdout){
//         var ar = [];
//         var pid_count = 0
//         var pgid_collector = {}
//         var ngid_collector = {}
//         var sp = stdout.split('\n');
//         for (var i = 0; i < sp.length; i++) {
//             var sub = sp[i].trim().split('|');
//                 // ncbi|SEQF4098|MBX3952457.1|QGBS01000001.1|hypothetical protein
//                 // 
//                 if(sub.length == 5){
//                 //if(sub[0]){
//                     anno = sub[0]
//                     gid = sub[1]
//                     pid = sub[2]
//                     acc =sub[3]
//                     prod=sub[4]
//                     
//                     if(gid in C.genome_lookup){
//                         organism = C.genome_lookup[gid].genus +' '+C.genome_lookup[gid].species+' '+C.genome_lookup[gid].ccolct
//                     }
//                     if(anno == 'ncbi'){
//                         ngid_collector[gid] = 1
//                         // if(! req.session.site_search_result_ncbi){
// //                             req.session.site_search_result_ncbi = {}
// //                         }
//                         if(gid in req.session.site_search_result_ncbi){
//                             req.session.site_search_result_ncbi[gid].push({name:organism, pid:pid, product:prod})
//                         }else{
//                             req.session.site_search_result_ncbi[gid] = [{name:organism, pid:pid, product:prod}]
//                         }
//                         npid_count += 1
//                     }else if(anno === 'prokka'){
//                         pgid_collector[gid] = 1
//                         // if(! req.session.site_search_result_prokka){
// //                             req.session.site_search_result_prokka = {}
// //                         }
//                         if(gid in req.session.site_search_result_prokka){
//                             req.session.site_search_result_prokka[gid].push({name:organism, pid:pid, product:prod})
//                         }else{
//                             req.session.site_search_result_prokka[gid] = [{name:organism, pid:pid, product:prod}]
//                         }
//                         ppid_count += 1
//                     }
//                     
//                     //ar.push(sub[0].replace(/['"]+/g, ''));
//                 }
//         }
//         pgid_count = Object.keys(pgid_collector).length // genome_count
//         ngid_count = Object.keys(ngid_collector).length // genome_count
//         // pid_count = pid_count   //gene_count
//         
//       }
//       console.log('req.session.site_search_result_prokka.length',Object.keys(req.session.site_search_result_prokka).length)
//       console.log('req.session.site_search_result_ncbi.length',Object.keys(req.session.site_search_result_ncbi).length)
//       //console.log(ar,ar.length)
//       //console.log(gid_count, pid_count)
//       
//       res.send([pgid_count, ppid_count,ngid_count, npid_count])
//    })
    
//    return
   
   
   
//   let q_ncbi   = queries.get_annotation_query4(searchTextLower, 'ncbi')
//   let q_prokka = queries.get_annotation_query4(searchTextLower, 'prokka')
   
   //console.log(q)
   //const jsonStream = StreamValues.withParser();
//   if(CFG.ENV === 'development'){



//     TDBConn.query(q_ncbi, (err, rows) => {
//         if (err) {
//             console.log(err)
//             return
//         }
//     
//    
//         console.log(anno_type,'Query Success Num Rows: '+rows.length.toString())
//     
//         //req.session.site_search_result.prokka = {}
//         //req.session.site_search_result.ncbi = {}
//         if(rows.length === 0){
//            //prokka_genome_count_lookup={},prokka_gene_count=0,ncbi_genome_count_lookup={},ncbi_gene_count=0
//         }else{
//        
//            for(let i in rows){
//             gid = rows[i].gid
//          
//             if(gid in C.genome_lookup){
//                 organism = C.genome_lookup[gid].genus +' '+C.genome_lookup[gid].species+' '+C.genome_lookup[gid].ccolct
//             }
//             if(! req.session.site_search_result_ncbi){
//               //req.session.site_search_result = {}
//               //req.session.site_search_result.prokka = {}
//               req.session.site_search_result_ncbi = {}
//             }
//             
//         
//         
//             //req.session.site_search_result[anno_type] = {}
//             if(gid in req.session.site_search_result_ncbi){
//                 req.session.site_search_result_ncbi[gid].push({name:organism, pid:rows[i].protein_id, product:rows[i].product})
//             }else{
//                 req.session.site_search_result_ncbi[gid] = [{name:organism, pid:rows[i].protein_id, product:rows[i].product}]
//             }
//             
//             ngene_count += 1 
//          
//            }
//         }
//         //console.log('x',anno_type,req.session['site_search_result_'+anno_type])
//     
//         ngenome_count = Object.keys(req.session.site_search_result_ncbi).length
//         //console.log('x',anno_type, genome_count, gene_count)
//         
//         TDBConn.query(q_prokka, (err, rows) => {
//             if (err) {
//                 console.log(err)
//                 return
//             }
//             //console.log(anno_type,'Query Success Num Rows: '+rows.length.toString())
//     
//             //req.session.site_search_result.prokka = {}
//             //req.session.site_search_result.ncbi = {}
//             if(rows.length === 0){
//                //prokka_genome_count_lookup={},prokka_gene_count=0,ncbi_genome_count_lookup={},ncbi_gene_count=0
//             }else{
//        
//                for(let i in rows){
//                 gid = rows[i].gid
//          
//                 if(gid in C.genome_lookup){
//                     organism = C.genome_lookup[gid].genus +' '+C.genome_lookup[gid].species+' '+C.genome_lookup[gid].ccolct
//                 }
//                 
//                 if(! req.session.site_search_result_prokka ){
//                   //req.session.site_search_result = {}
//                   req.session.site_search_result_prokka = {}
//                   //req.session.site_search_result.ncbi = {}
//                 }
//         
//                 //req.session.site_search_result[anno_type] = {}
//                 if(gid in req.session.site_search_result_prokka){
//                     req.session.site_search_result_prokka[gid].push({name:organism, pid:rows[i].protein_id, product:rows[i].product})
//                 }else{
//                     req.session.site_search_result_prokka[gid] = [{name:organism, pid:rows[i].protein_id, product:rows[i].product}]
//                 }
//             
//                 pgene_count += 1 
//          
//                }
//             }
//             //console.log('x',anno_type,req.session['site_search_result_'+anno_type])
//     
//             pgenome_count = Object.keys(req.session.site_search_result_prokka).length
//             //console.log('x',anno_type, genome_count, gene_count)
//             res.send([pgenome_count, pgene_count,ngenome_count, ngene_count])
//         })
//     })

})
//
//  Global Site Search
//
router.post('/site_search', function site_search(req, res) {
  helpers.accesslog(req, res)
  console.log('in index.js POST -Search')
  console.log(req.body)

  
  
////////// GENOMES ////////////////////////////////////////////////////////////////////////////////
  
  const searchText = req.body.intext
  const searchTextLower = req.body.intext.toLowerCase()
  let add_genome_to_otid = {}
  // Genome  Metadata
  const allGidObjList = Object.values(C.genome_lookup)
  // let gid_lst = Object.keys(C.genome_lookup).filter(item => ((item.toLowerCase()+'').includes(searchTextLower)))
  const gidKeyList = Object.keys(allGidObjList[0])
  const gidObjList = allGidObjList.filter(function (el) {
    for (let n in gidKeyList) {
      if (Array.isArray(el[gidKeyList[n]])) {
        // we're missing any arrays
      } else {
        if ( Object.prototype.hasOwnProperty.call(el, gidKeyList[n]) && (el[gidKeyList[n]]).toString().toLowerCase().includes(searchTextLower)) {
          add_genome_to_otid[el.otid] = el.genus+' '+el.species
          return el.gid
        }
      }
    }
  })
  //helpers.print(gidObjList[0])
  const gidLst = gidObjList.map(e => ({gid:e.gid, species: '<i>'+e.genus+' '+e.species+'</i>'}))
  gidLst.sort(function (a, b) {
       return helpers.compareStrings_alpha(a.species, b.species);
  })




///////////// OTIDs /////////////////////////////////////////////////////////////////////////////
  // OTID Metadata
  const allOtidObjList = Object.values(C.taxon_lookup)
  const otidKeyList = Object.keys(allOtidObjList[0])
  const otidObjList = allOtidObjList.filter(function (el) {
    for (let n in otidKeyList) {
      //console.log( 'el[otidkeylist[n]]',el[otidkeylist[n]] )
      if (Array.isArray(el[otidKeyList[n]])) {
        // we're missing any arrays
      } else {
        
        //helpers.print(['el',el])
        
        if ( Object.prototype.hasOwnProperty.call(el, otidKeyList[n]) && el[otidKeyList[n]].toString().toLowerCase().includes(searchTextLower)) {
          return el.otid
        }
       
      }
    }
  })
  const otidLst = otidObjList.map(e => ({otid:e.otid, species: '<i>'+e.genus+' '+e.species+'</i>'}))
  //console.log('otidLst')
  otidLst.sort(function (a, b) {
       return helpers.compareStrings_alpha(a.species, b.species);
  })
  //console.log(otidLst)
  //let otidLst = []
  // if(Object.keys(add_genome_to_otid).length > 0){
//      
//       for(let otid in add_genome_to_otid){
//           let o = {otid: otid, species: '<i>'+add_genome_to_otid[otid]+'</i>'}
//           if(){
//           
//           }
//           otidLst.push({otid: otid, species: '<i>'+add_genome_to_otid[otid]+'</i>'})
//       }
//   }
  //console.log('otidLst[0]',otidLst)

////////////// TAXON NAMES ////////////////////////////////////////////////////////////////////////////

  // lets search the taxonomy names
  // Bacterial Taxonomy Names
  //helpers.print(Object.keys(C.taxon_counts_lookup)[0])
  const taxonList = Object.values(C.taxon_lineage_lookup).filter(function (e) {
    if (Object.keys(e).length !== 0) {
      // console.log(e)
      if (e.domain.toLowerCase().includes(searchTextLower) ||
        e.phylum.toLowerCase().includes(searchTextLower) ||
        e.klass.toLowerCase().includes(searchTextLower) ||
        e.order.toLowerCase().includes(searchTextLower) ||
        e.family.toLowerCase().includes(searchTextLower) ||
        e.genus.toLowerCase().includes(searchTextLower) ||
        e.species.toLowerCase().includes(searchTextLower) ||
        e.subspecies.toLowerCase().includes(searchTextLower)) {
        return e
      }
    }
    //
  })
  //  Now get the otids
  const taxonOtidObj = {}
  const taxonOtidList = taxonList.map(e => e.otid)
  for (let n in taxonOtidList) {
    const otid = taxonOtidList[n]
    taxonOtidObj[otid] = C.taxon_lineage_lookup[otid].domain
    taxonOtidObj[otid] += ';' + C.taxon_lineage_lookup[otid].phylum
    taxonOtidObj[otid] += ';' + C.taxon_lineage_lookup[otid].klass
    taxonOtidObj[otid] += ';' + C.taxon_lineage_lookup[otid].order
    taxonOtidObj[otid] += ';' + C.taxon_lineage_lookup[otid].family
    taxonOtidObj[otid] += ';' + C.taxon_lineage_lookup[otid].genus
    taxonOtidObj[otid] += ';' + C.taxon_lineage_lookup[otid].species
    if (C.taxon_lineage_lookup[otid].subspecies !== '') {
      taxonOtidObj[otid] += ';' + C.taxon_lineage_lookup[otid].subspecies
    }

    // {
    // 'genus':C.taxon_lineage_lookup[otid].genus,'species':C.taxon_lineage_lookup[otid].species
    // }
  }
  
///////////// CONTIGS /////////////////////////////////////////////////////////////////////////////

  // search contigs
  let contigObj_list = []
  //console.log('C.contig_lookup',C.contig_lookup )
  let all_contigs = Object.keys(C.contig_lookup)
  const contig_list = all_contigs.filter(el => {
    if (el.toLowerCase().indexOf(searchTextLower) !== -1) {
        return true;
    }
  });
  for(let n in contig_list){
      
      contigObj_list.push({contig:contig_list[n], gids: C.contig_lookup[contig_list[n]]})
  }
  
///////////// PHAGE /////////////////////////////////////////////////////////////////////////////


  //  Now the phage db
  // phageID, phage:family,genus,species, host:genus,species, ncbi ids
  // console.log(C.phage_lookup['HPT-000001'])
  // PHAGE Metadata
//   const allPhageObjList = Object.values(C.phage_lookup)
//   // let gid_lst = Object.keys(C.genome_lookup).filter(item => ((item.toLowerCase()+'').includes(searchTextLower)))
//   // console.log(allPhageObjList[0])
//   const pidKeyList = Object.keys(allPhageObjList[0])
//   const pidObjList = allPhageObjList.filter(function (el) {
//     for (let n in pidKeyList) {
//       // console.log(pidkeylist[n]+'-'+searchTextLower)
//       if (Array.isArray(el[pidKeyList[n]])) {
//         // we're missing any arrays
//         // return 0
//       } else {
//         if ((el[pidKeyList[n]]).toString().toLowerCase().includes(searchTextLower)) {
//           return el.pid
//         }
//         // return 0
//       }
//     }
//   })
//   // console.log(pidObjList)
//   
//   const phageIdLst = pidObjList.map(e => e.pid)
//////////// HELP PAGES //////////////////////////////////////////////////////////////////////////////  
  // help pages uses grep
  let helpLst = []
  let help_trunk = path.join(CFG.PROCESS_DIR,'views','partials','help')
  const grep_cmd = "/usr/bin/grep -liR "+help_trunk + " -e '" + helpers.addslashes(searchText) + "'" 
  console.log('grep_cmd',grep_cmd)
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
      //if(CFG.ENV == 'productionX'){
      let prokka_genome_count=0
      let prokka_gene_count=0
      let ncbi_genome_count=0
      let ncbi_gene_count=0
      // set req.session.site_search_result = {} here before annotation collection
      req.session.site_search_result_prokka = {}
      req.session.site_search_result_ncbi = {}
      res.render('pages/search_result', {
        title: 'HOMD :: Site Search',
        pgname: '', // for AbountThisPage
        config: JSON.stringify(CFG),
        ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
        user: JSON.stringify(req.user || {}),
        search_text: searchText,
        otid_list: JSON.stringify(otidLst),
        gid_list: JSON.stringify(gidLst),
        
        //let prokka_genome_count_lookup={},prokka_gene_count=0,ncbi_genome_count_lookup={},ncbi_gene_count=0
        num_prokka_genomes: prokka_genome_count,
        num_prokka_genes: prokka_gene_count,
        num_ncbi_genomes: ncbi_genome_count,
        num_ncbi_genes: ncbi_gene_count,
        
        
        taxon_otid_obj: JSON.stringify(taxonOtidObj),
        help_pages: JSON.stringify(helpLst),
        contig_list:JSON.stringify(contigObj_list),
        //phage_id_list: JSON.stringify(phageIdLst) // phageIDs
      })
   });
  
})
// }); // end pipeline
// })  // end anno query
module.exports = router

// function get_options_by_node (node) {
//   const optionsObj = {
//     id: node.node_id,
//     text: node.taxon,
//     child: 0,
//     tooltip: node.rank
//   }
//   if (node.children_ids.length > 0) {
//     optionsObj.child = 1
//     optionsObj.item = []
//   }
//   return optionsObj
// }
