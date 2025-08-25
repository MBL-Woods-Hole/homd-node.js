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
// let rs_ds = ds.get_datasets( () => {
let browseDir = require("browse-directory");
const { v4: uuidv4 } = require('uuid'); // I chose v4 ‒ you can select othersc
//const Stream = require( 'stream-json/streamers/StreamArray');
/* GET home page. */

const mysql = require('mysql'); // or use import if you use TS
const util = require('util');


router.get('/', function index(req, res) {
  
  //console.log('Session ID:',req.session.id)
  //console.log('CFG.ENV :',CFG.ENV )
  res.render('pages/home', {
    title: 'HOMD :: Human Oral Microbiome Database',
    pgname: 'home', // for AbountThisPage
    config: JSON.stringify(CFG),
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),
    
    

  })
})

// router.get('/taxon=(\\d+)', function taxon(req, res) {
//   // sequence server
//   //console.log('taxon=/.d/')
//   let url = req.url;
//   //console.log(url)
//   let otid = url.split('=')[1]
//   res.redirect('/taxa/tax_description?otid='+otid)
//   
// })
// router.get('/idn=SEQF(\\d+.\\d)', function idn(req, res) {
//   // sequence server
//   //console.log('idn=SEQF')
//   let url = req.url;
//   //console.log(url)
//   let gid = url.split('=')[1]
//   res.redirect('/genome/genome_description?gid='+gid)
//  
// })
// router.get('/get_seq=*', function jb_seq(req, res) {
//   // jbrowse link to retrieve seq
//   //console.log('get_seq=')
//    // https://www.homd.org/get_seq=xxxxxx&type=yy
//    // https://www.homd.org/get_seq=KDE71052.1&type=aa
//   let url = req.url;
//   //console.log(url)
//   // /get_seq=KDE71052.1&type=aa
//   let type,pid,sp,db,anno
//   sp = url.split('&')
//   type = sp[1].split('=')[1].toLowerCase() // must be aa,AA,na or NA 
//   pid = sp[0].split('=')[1]
//   //console.log(type,pid)
//   // PROKKA pids (starting as SEQFXXX
//   if(type === 'aa'){   // NCBI
//       if(pid.substring(0,4) === 'SEQF'){
//           db = "`PROKKA_faa`.`protein_seq`"
//           anno = 'PROKKA'
//        }else{
//           db = "`NCBI_faa`.`protein_seq`"
//           anno = 'NCBI'
//        }
//   }else{   //req.body.type == 'na':   // NCBI  na
//       if(pid.substring(0,4) === 'SEQF'){
//           db = "`PROKKA_ffn`.`ffn_seq`"
//           anno = 'PROKKA'
//        }else{
//           db = "`NCBI_ffn`.`ffn_seq`"
//           anno = 'NCBI'
//        }
//   }
//   let q = 'SELECT seq_id, mol_id, UNCOMPRESS(seq_compressed) as seq FROM ' + db
//   q += " WHERE protein_id='" + pid + "'"
//   //console.log(q)
//   
//   const fileName = 'HOMD_'+anno+'_'+pid+'_'+type.toUpperCase()+'.fasta'
//   
//   TDBConn.query(q, (err, rows) => {
//   //ADBConn.query(q, (err, rows) => {
//     if (err) {
//         console.log(err)
//         res.send(err)
//         return
//     }
//     //console.log('rows',rows)
//     let sequence = '',gid,acc,show = ''
//     let length = 0
//     if(rows.length === 0){
//         sequence += "No sequence found in database"
//     }else{
//        length = rows[0].seq.length
//        gid = rows[0].seq_id
//        acc = rows[0].mol_id
//        const seqstr = (rows[0].seq).toString()
//        const arr = helpers.chunkSubstr(seqstr, 100)
//        sequence += arr.join('\n')
//        show = ">"+gid+' | '+anno+' | Protein_id: '+pid+' | Accession: '+acc+' | length '+length.toString()+'\n'
//        
//     }
//     show = show + sequence
//     res.writeHead(200, {
//       'Content-Disposition': `attachment; filename="${fileName}"`,
//       'Content-Type': 'text/plain',
//       'Cache-Control': 'no-cache, no-store, must-revalidate',
//       'Pragma': 'no-cache',
//       'Expires': '0',
//     })
//     res.end(show)
//   })
// })




//
router.get('/poster', function poster(req, res) {
  res.render('pages/poster', {
    title: 'HOMD :: Human Oral Microbiome Database',
    pgname: '', // for AbountThisPage
    config: JSON.stringify(CFG),
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),
    

  })
})

router.get('/advanced_site_search', function advanced_site_searchGETPAGE(req, res) {
  //console.log('advanced_site_searchGET')
  res.render('pages/advanced_site_search', {
    title: 'HOMD :: Human Oral Microbiome Database',
    pgname: '', // for AbountThisPage
    config: JSON.stringify(CFG),
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),
    

  })
})
// router.post('/advanced_site_search', function advanced_site_searchPOST(req, res) {
//   console.log('advanced_site_searchPOST req.body',req.body)
//   let searchTextLower = req.body.adv_search_text.toLowerCase()
//   let taxonOtidObj = {},otidLst = [],gidLst=[],ret_obj={}
//   let form_type = []
//   if(req.body.taxonomy && req.body.taxonomy == 'on'){
//       ret_obj = search_taxonomy(searchTextLower)
//       taxonOtidObj = ret_obj.taxonOtidObj
//       otidLst      = ret_obj.otidLst
//       form_type.push('taxonomy') 
//   }
//   if(req.body.genomes && req.body.genomes == 'on'){
//       gidLst = search_genomes(searchTextLower)
//       form_type.push('genomes') 
//   }
//   //console.log('gidLst',gidLst)
//   res.render('pages/advanced_search_result', {
//         title: 'HOMD :: Search Results',
//         pgname: '', // for AboutThisPage 
//         config: JSON.stringify(CFG),
//         ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),
//         
//         anno: '',
//         search_text: req.body.adv_search_text,
//         otid_list: JSON.stringify(otidLst),
//         gid_list: JSON.stringify(gidLst),
//         taxon_otid_obj: JSON.stringify(taxonOtidObj),
//         annotationList: JSON.stringify([]),
//         anno_sort_list: JSON.stringify([]),
//         annotationList2: JSON.stringify({}),
//         no_ncbi_annot: JSON.stringify(C.no_ncbi_annotation),
//         form_type: JSON.stringify(form_type)  // array
//        
//     })
//     
//  
// })
// function get_grep_rows(cmd){
//     let full_data = '',lines
//     let child = spawn("/bin/sh", ['-c',cmd], { 
//              //, (err, stdout, stderr) => {
//     })
//     child.stdout.on('data', (data) => {
//             full_data += data.toString()
//     });
// 
//     child.stderr.on('data', (data) => {
//           console.error(`child stderr:\n${data}`);
//     });
//     child.on('exit', function (code, signal) {
//            console.log('child process exited with ' +`code ${code} and signal ${signal}`);
//            
//            lines = full_data.toString().split('\n')
//            return lines
//     })
// }
function execPromise(cmd, args, max) {
    return new Promise(function(resolve, reject) {
        // spawn(cmd, function(err, stdout) {
//             if (err) return reject(err);
//             resolve(stdout);
//         });
        let data_array = [],chunk_rows=[],line_count = 0
        let bufferArray= []
        const process = spawn(cmd, args, { shell: true });  // shell:true need expand wildcard '*'
        process.stdout.on('data', (data) => {
          // Process the data received from stdout
          //console.log(`stdout: ${data}`);
          // STRATEGY:: protein_id is unique
          // grab accessions
          //console.log(`stdout: ${data}`);
          
          
          //if(data){
            chunk_rows = data.toString().split('\n')
            line_count += chunk_rows.length
            //data_array.push(data.toString())
            if(line_count > max / 5){
                bufferArray = []
                resolve(['too_long']);
            }
            //data_array.push(...chunk_rows)
            bufferArray.push(data)
          //}
        });
        process.stderr.on("data", data => {
            console.log(`stderr: ${data}`);
            reject(data)
        });
        process.on('close', function (code) { 
          // *** Process completed
          console.log('code',code)
          let dataBuffer =  Buffer.concat(bufferArray);
          let dataBufferArray = dataBuffer.toString().split('\n')
          //console.log('resolving okay',dataBufferArray[0])
          
          resolve(dataBufferArray);
        });
        process.on('error', function (err) {
          // *** Process creation failed
          reject(err);
        });
    });
}
// const utilexec = util.promisify(require('child_process').exec);
// async function runCommand(command) {
//   try {
//     const { stdout, stderr } = await utilexec(command);
//     //console.log('stdout:', stdout);
//     //console.error('stderr:', stderr);
//     return { stdout, stderr };
//   } catch (error) {
//     //console.error('exec error:', error);
//     //throw error;
//     return ['No Data'];
//   }
// }
// async function main(req, res, cmd) {
//   try {
//     //await runCommand(cmd);
//     let obj_array = [],obj,row_array
//     const rows = await runCommand(cmd);
//     //await runCommand('echo "Hello, world!"');
//     // 'prokka|GCA_030450175.1|CP073095.1||GCA_030450175.1_00170|hypothetical protein',
//     let grep_file_order =['anno','genome_id','accession','gene','protein_id','product']
//     if(rows.hasOwnProperty('stdout')){
//        row_array = rows.stdout.split('\n')
//     }else{
//        row_array = []
//     }
//      
//     for(let n in row_array){
//         if(row_array[n] != ''){
//             obj = {}
//             let pts = row_array[n].split('|')
//             for(let i in grep_file_order){
//                 obj[grep_file_order[i]] = pts[i]
//             }
//             obj_array.push(obj)
//         }
//     }
//     //console.log('rows',obj_array);
//     res.render('pages/advanced_search_result', {
//             title: 'HOMD :: Search Results',
//             pgname: '', // for AboutThisPage 
//             config: JSON.stringify(CFG),
//             ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),
//             
//             anno: req.body.adv_anno_radio,
//             search_text: req.body.search_text_anno,
//             otid_list: JSON.stringify([]),
//             gid_list: JSON.stringify([]),
//             taxon_otid_obj: JSON.stringify({}),
//             annotationList: JSON.stringify(obj_array),
//             form_type: JSON.stringify(['annotations'])
//                     
//     })
//     } finally {
//         console.log('Done');
//     }
//     
// }
router.post('/advanced_anno_orf_search', function advanced_anno_orf_searchPOST(req, res) {
    console.log('in advanced_anno_orf_search')
    console.log(req.body)
    //console.log('pidlist',req.body.pid_list)
    let anno = req.body.anno.toUpperCase()
    
    let q = "SELECT * from `"+anno+"_meta`.orf WHERE protein_id in ("+req.body.pid_list+")"
    console.log(q)
    TDBConn.query(q, (err, rows) => {
        if (err) {
            console.log(err)
            res.send(err)
            return
        }
        //console.log('rows',rows)
        res.send(JSON.stringify(rows))
        return
    })
    
    //res.send('OKAY')
})

router.post('/advanced_site_search_grep', async function advanced_site_search_annoPOST(req, res) {
    console.log('in advanced_site_search_grep')
    console.log(req.body)
    const searchText = req.body.search_text_anno_grep.toLowerCase()
    let sql_fields = ['genome_id', 'accession', 'gene', 'protein_id', 'product','length_aa','length_na','start','stop']
    let grep_fields = ['anno','genome_id','accession','protein_id','gene','product']  // MUST BE order from file
    
    let q,rows,row_array,sort_lst=[],obj2={},species,gid,otid,strain
    // if(req.body.adv_anno_radio == 'prokka'){
//         q = "SELECT "+sql_fields.join(",")+" from PROKKA_meta.orf WHERE CONCAT(protein_id, accession, gene, product) LIKE '%"+searchText+"%'"
//     }else if(req.body.adv_anno_radio == 'ncbi'){
//         q = "SELECT "+sql_fields.join(",")+" from NCBI_meta.orf WHERE CONCAT(protein_id, accession, gene, product) LIKE '%"+searchText+"%'"
//     }else{
//         console.log('ERROR')
//         return
//     }
    try{
        let datapath = path.join(CFG.PATH_TO_DATA,"homd_GREP_Search-"+req.body.adv_anno_radio_grep.toUpperCase()+"*")
        //let filename = uuidv4();  //CFG.PATH_TO_TMP
        //let filepath = path.join(CFG.PATH_TO_TMP, filename)
        let max_rows = C.grep_search_max_rows //50000
        
        let split_length = 6
        //let args = ['-ih','-m 5000','"'+searchText+'"',datapath,'>',filepath]
        let args = ['-h','-m '+(max_rows/5).toString(),'"'+searchText+'"',datapath]
        //let args = ['-h','"'+searchText+'"',datapath]
        let grep_cmd = CFG.GREP_CMD + ' ' + args.join(' ')
        console.log(grep_cmd)
        //const rows = await get_grep_rows(grep_cmd);
        const row_array = await execPromise(CFG.GREP_CMD, args, max_rows);
        //console.log('rows_lst length',row_array.length)
        
        let total_length = row_array.length - 1
        //rows = rows_lst.join('')
        if(row_array[0] == 'too_long'){
            obj2 = {'too_long':'too_long'}
        }else{
            //console.log('row_array[0]',row_array[0])
            //row_array = rows.split('\n')
            for(let n in row_array){
                if(row_array[n] != ''){
                    
                    //ncbi|gca_045159995.1|cp077160.1|kst12_00050|wyk98014.1|hypothetical protein|942|313|6825|7766
                    //prokka|gca_045159905.1|cp077181.1||gca_045159905.1_00008|hypothetical protein|1371|456|6207|7577
                    //0anno|1gid|2acc|3gene|4pid|5prod  //|6lna|7laa|8start|9stop
                    let pts = row_array[n].split('|')
                    //console.log('pts',pts)
                    if(pts.length >= split_length && ['prokka','ncbi'].indexOf(pts[0]) != -1 ){
                      //console.log('pts',pts)
                      gid = pts[1].toUpperCase()
                      //console.log('GID',gid)
                      //console.log('LOOKup',C.genome_lookup[gid])
                      if(gid && C.genome_lookup.hasOwnProperty(gid)){
                        otid = C.genome_lookup[gid]['otid']
                        strain = C.genome_lookup[gid]['strain']
                        species = C.taxon_lookup[otid]['genus'] +' '+C.taxon_lookup[otid]['species']
                      let tmp_obj = {
                          gid:gid,
                          species:species,
                          strain:strain,
                          acc:pts[2].toUpperCase(),
                          gene:pts[3].toUpperCase(),
                          pid:pts[4],
                          prod:pts[5]
                          // length_na:pts[6],
//                           length_aa:pts[7],
//                           start:pts[8],
//                           stop:pts[9]
                        }
                        //console.log('tmp_obj',tmp_obj)
                        if(obj2.hasOwnProperty(gid)){
                          obj2[gid].push(tmp_obj)
                        }else{
                          sort_lst.push({gid:gid,species:species,strain:strain})
                          obj2[gid] = [tmp_obj]
                        }
                    }
                      

                    }
                }
            }
        }
        //console.log('sort_lst1',sort_lst)
        sort_lst.sort(function (a, b) {
           return helpers.compareStrings_alpha(a.species+a.strain, b.species+b.strain);
        })
        //console.log('sort_lst2',sort_lst)
        res.render('pages/advanced_search_result', {
            title: 'HOMD :: Search Results',
            pgname: '', // for AboutThisPage 
            config: JSON.stringify(CFG),
            ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),
            
            anno: req.body.adv_anno_radio_grep,
            search_text: req.body.search_text_anno_grep,
            otid_list: JSON.stringify([]),
            gid_list: JSON.stringify([]),
            taxon_otid_obj: JSON.stringify({}),
            //annotationList: JSON.stringify(obj_array),
            annotationList2: JSON.stringify(obj2),
            anno_sort_list: JSON.stringify(sort_lst),
            total_hits: total_length,
            max:max_rows,
            form_type: JSON.stringify(['annotations']),
            no_ncbi_annot: JSON.stringify(C.no_ncbi_annotation)
                    
        })
    }
    catch(e){
          console.log("error",e);
      }
      
    return
    //console.log(q)
    //const query = util.promisify(TDBConn.query).bind(TDBConn);
//     let datapath = path.join(CFG.PATH_TO_DATA,"homd_GREP_Search-"+req.body.adv_anno_radio.toUpperCase()+"*")
//     let grep_cmd = CFG.GREP_CMD + ' -ih "'+searchText+'" '+ datapath
//     console.log(grep_cmd)
//     //const rows = await runCommand(grep_cmd);
//     const rows = await get_grep_rows(grep_cmd);
//     console.log('rows',rows)
//     //main(req, res, grep_cmd)
//     //return
//     // (async () => {
// //       try {
// //         //const rows = await query(q);
// //         //const rows = await get_grep_rows(grep_cmd)
// //         const rows = await runCommand(grep_cmd);
// //         console.log('rows',rows);
//         res.render('pages/advanced_search_result', {
//                     title: 'HOMD :: Search Results',
//                     pgname: '', // for AboutThisPage 
//                     config: JSON.stringify(CFG),
//                     ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),
//                     
//                     anno: req.body.adv_anno_radio,
//                     search_text: req.body.search_text_anno,
//                     otid_list: JSON.stringify([]),
//                     gid_list: JSON.stringify([]),
//                     taxon_otid_obj: JSON.stringify({}),
//                     annotationList: JSON.stringify(rows),
//                     form_type: JSON.stringify(['annotations'])
//                     
//         })
// //       } finally {
// //         //TDBConn.end();
// //         
// //       }
// //    })()
//    return


//     get_smooth_sql(searchText,fields)
//     console.log("After SQL2")
//     return
//     
//     let dirname = uuidv4(); // '110ec58a-a0f2-4ac4-8393-c866d813b8d1'
//     dirname = dirname+'_sql'
//     
//     console.log('POST::get_annotations_counts_sql')
//     //console.log(req.body)
//     
//     let line,phits=[], nhits=[], pdata={},ndata={},gid,ssp,organism
//     
//     let anno_path = path.join(CFG.PATH_TO_TMP, dirname)
//     fs.mkdirSync(anno_path)
//     fs.watch(anno_path, (eventType, filename) => { 
//       console.log("\nThe file", filename, "was modified!"); 
//       console.log("The type of change was:", eventType); 
//       if(filename=='prokka_data' && eventType=='rename'){
//           // read file
//           Promise.all([helpers.readFromFile(path.join(anno_path,'prokka_data'),'csv')])
//              .then(results => {
//                 console.log(results[0])
//                 
//                 res.render('pages/adv_search_result', {
//                     title: 'HOMD :: Search Results',
//                     pgname: '', // for AboutThisPage 
//                     config: JSON.stringify(CFG),
//                     ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),
//                     
//                    
//                     search_text: req.body.search_text_anno,
//                     otid_list: JSON.stringify([]),
//                     gid_list: JSON.stringify([]),
//                     taxon_otid_obj: JSON.stringify({}),
//                     annotationList: JSON.stringify(results[0]),
//                     form_type: JSON.stringify(['annotations'])
//                     
//                 })
//                 return
//     
//     
//          })
//       }
//     }); 
//     if(req.body.prokka_cb && req.body.prokka_cb == 'on'){
//       let q_prokka = "SELECT "+fields.join(",")+" from PROKKA_meta.orf WHERE CONCAT(protein_id, accession, gene, product) LIKE '%"+searchText+"%'"
//       console.log('q_prokka',q_prokka)
//       
//       let pfile_name = path.join(anno_path,'prokka_data')
//       let pstream = fs.createWriteStream(pfile_name, {flags:'a'});
//       
//       TDBConn.query(q_prokka, (err, prows) => {
//         if (err) {
//           console.log("prokka select error",err)
//           return
//         }
//         if(prows.length >0){
//             //[pgid_count, ppid_count,ngid_count, npid_count]
//             phits = prows
//             for(let n in prows){
//                 gid = prows[n].genome_id  // genomeid SEQF
//  
//                 line = 'prokka'
//                 for(let i in fields){
//                     line = line+'|'+prows[n][fields[i]]
//                 }
//                 //console.log('SQL-prows-lin')
//                 pstream.write(line + "\n");
//                 
//             }
//         }
//       })
//       
//     }
//     if(req.body.ncbi_cb && req.body.ncbi_cb == 'on'){
//         let q_ncbi = "SELECT "+fields.join(",")+" from NCBI_meta.orf WHERE CONCAT(protein_id, accession, gene, product) LIKE '%"+searchText+"%'"
//     
//         console.log('q_ncbi',q_ncbi)
//         let nfile_name = path.join(anno_path,'ncbi_data')
//     
//         let nstream = fs.createWriteStream(nfile_name, {flags:'a'});
//     
//         
//         TDBConn.query(q_ncbi, (err, nrows) => {
//            if (err) {
//              console.log("ncbi select error",err)
//              return
//            }
//            if(nrows.length >0){
//              console.log('ncbi zero length')
//              //[pgid_count, ppid_count,ngid_count, npid_count]
//              nhits = nrows
//              for(let n in nrows){
//                 gid = nrows[n].genome_id
//                 
//                 
//                 line = 'ncbi'
//                 for(let i in fields){
//                     line = line+'|'+nrows[n][fields[i]]
//                 }
//                 
//                 
//                 nstream.write(line + "\n");
//              }
//            }
//         })
//      //       let obj = {phits:phits,nhits:nhits,pdata:pdata,ndata:ndata}
// //            
// //            let sendobj = {phits:phits,nhits:nhits,dirname:dirname}
// //            //req.session.anno_search_dirname_sql = dirname
// //            
//             
// //         })
// //            
// //     })
//     }
    // have web page wait for sql results
    //https://medium.com/fullstackwebdev/a-guide-to-mysql-with-node-js-fc4f6abce33b
    //res.send('OKAY')
    // res.render('pages/adv_search_result', {
//         title: 'HOMD :: Search Results',
//         pgname: '', // for AboutThisPage 
//         config: JSON.stringify(CFG),
//         ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),
//         
//        
//         search_text: req.body.search_text_anno,
//         otid_list: JSON.stringify([]),
//         gid_list: JSON.stringify([]),
//         taxon_otid_obj: JSON.stringify({}),
//         annotationList: JSON.stringify([]),
//         form_type: JSON.stringify(['annotations'])
//         
//     })
})
// router.post('/anno_protein_search', function anno_protein_search(req, res) {
//     console.log('in POST::anno_protein_search')
//     console.log('req.body',req.body)
//     let obj,data,gid,name,resultObj={}
//     let anno = req.body.anno
//     let search_text = req.body.search_text
//     //console.log(req.session)
//     //console.log('chose:',anno,Object.values(req.session['site_search_result_'+anno]).length)
//     //console.log('sess-ncbi',req.session.site_search_result.ncbi)
//     
//     //resultObj = req.session['site_search_result_'+anno]
//     
//     res.send(create_protein_table(anno, resultObj, search_text))
// })

// router.post('/advanced_site_search_sql', function get_annotations_counts_sql(req, res) {
//     
//     //let dirname = uuidv4(); // '110ec58a-a0f2-4ac4-8393-c866d813b8d1'
//     //dirname = dirname+'_sql'
//     
//     console.log('POST::advanced_site_search_sql',req.body)
//     const query = util.promisify(TDBConn.query).bind(TDBConn);
//     //console.log(req.body)
//     let limit = 50000
//     const searchText = req.body.search_text_anno_sql.toLowerCase()
//     let q,row_obj ={}
//     let sql_fields = ['genome_id', 'accession', 'gene', 'protein_id', 'product','length_aa','length_na','start','stop']
//     if(req.body.adv_anno_radio_sql == 'prokka'){
//         q = "SELECT "+sql_fields.join(",")+" from PROKKA_meta.orf WHERE CONCAT(protein_id, accession, gene, product) LIKE '%"+searchText+"%' LIMIT "+limit
//     }else if(req.body.adv_anno_radio_sql == 'ncbi'){
//         q = "SELECT "+sql_fields.join(",")+" from NCBI_meta.orf WHERE CONCAT(protein_id, accession, gene, product) LIKE '%"+searchText+"%' LIMIT "+limit
//     }else{
//         console.log('ERROR',q)
//         return
//     }
//     (async () => {
//        try {
//         const rows = await query(q);
//         console.log(rows,rows.length)
//         if(rows.length >= limit){
//             row_obj = {'too_long':'too_long'}
//         }else{
//            row_obj =rows
//         }
//         //console.log('rows',rows,rows.length);
//         res.render('pages/advanced_search_result', {
//                     title: 'HOMD :: Search Results',
//                     pgname: '', // for AboutThisPage 
//                     config: JSON.stringify(CFG),
//                     ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),
//                     
//                     anno: req.body.adv_anno_radio_sql,
//                     search_text: req.body.search_text_anno_sql,
//                     otid_list: JSON.stringify([]),
//                     gid_list: JSON.stringify([]),
//                     taxon_otid_obj: JSON.stringify({}),
//                     annotationList: JSON.stringify(row_obj),
//                     form_type: JSON.stringify(['annotations']),
//                     max:limit,
//                     
//         })
//       } finally {
//         //TDBConn.end();
//         
//       }
//    })()
// })
// router.post('/get_annotations_counts_grepZZZ', function get_annotations_counts_grep(req, res) {
//     console.log('POST::get_annotations_counts_grep')
//     //console.log(req.body)
//     
// 
//     let dirname = uuidv4(); // '110ec58a-a0f2-4ac4-8393-c866d813b8d1'
//     dirname = dirname+'_grep'
//     //req.setTimeout(240000);
//     //const searchText = req.body.intext
//     const searchText = req.body.intext
// 
//     let anno //= req.body.anno_type  // ncbi or prokka
//     let acc,pid,gid,prod,organism=''
//     let pgid_count=0, ppid_count=0,ngid_count=0, npid_count=0
// 
//    
//        let prokka_gid_lookup = {}, ncbi_gid_lookup = {}
//        
//        let full_data = '',orfrow,datapath
//        //https://github.com/uhop/stream-json/wiki/StreamValues
//        datapath = path.join(CFG.PATH_TO_DATA,"homd_GREP_Search*")  //homd_ORFSearch*
//        
//        let grep_cmd = CFG.GREP_CMD + ' -ih "'+searchText+'" '+ datapath  //homd_ORFSearch*
// 
//         console.log('grep_cmd1',grep_cmd)
//         let anno_path = path.join(CFG.PATH_TO_TMP,dirname)
//         let panno_path = path.join(CFG.PATH_TO_TMP,dirname,'prokka')
//         let nanno_path = path.join(CFG.PATH_TO_TMP,dirname,'ncbi')
//         fs.mkdirSync(anno_path)
//         fs.mkdirSync(panno_path)
//         fs.mkdirSync(nanno_path)
//         let pfile_name = path.join(panno_path,'data')
//         let nfile_name = path.join(nanno_path,'data')
//         let pstream = fs.createWriteStream(pfile_name, {flags:'a'});
//         let nstream = fs.createWriteStream(nfile_name, {flags:'a'});
//         
//         let child = spawn("/bin/sh", ['-c',grep_cmd], { 
//             //, (err, stdout, stderr) => {
//         }) 
//     
//         child.stdout.on('data', (data) => {
//             full_data += data.toString()
//         });
// 
//         child.stderr.on('data', (data) => {
//           console.error(`child stderr:\n${data}`);
//         });
//     
//         child.on('exit', function (code, signal) {
//           console.log('child process exited with ' +`code ${code} and signal ${signal}`);
//           
//           let lines = full_data.toString().split('\n')
//           for(let i in lines){
//                let line = lines[i].trim()
//                
//                let pts = line.split('|')
//                //if(pts.length === 9 && parseInt(pts[pts.length -1]) ){
//                //console.log('line',line)
//                //if(pts.length === 9){
//                    anno = pts[0]
//                    gid = pts[1]
//                    
//                    if(lines[i].substring(0,4) === 'ncbi'){
//                         //let fname_path = path.join(anno_path,'ncbi_'+gid)
//                           nstream.write(line + "\n");
//                           ncbi_gid_lookup[gid]=1
//                           npid_count += 1
//                    }else if(lines[i].substring(0,6) === 'prokka'){
//                         
//                         pstream.write(line + "\n");
//                         prokka_gid_lookup[gid]=1
//                         ppid_count += 1
//                         
//                    }else{
//                        //console.log('-i',line)
//                        //pass for now
//                    }
//                 //}else{
//                    //console.log('remainder',line)
//                 //}
//           }
//           
//           
//           
//           pstream.end();
//           nstream.end();
//           if(code === 0){
// 
//              //console.log(full_data)
//         
// 
//             //pgid_count = Object.keys(req.session.site_search_result_prokka).length // genome_count
//             //ngid_count = Object.keys(req.session.site_search_result_ncbi).length // genome_count
//             pgid_count = Object.keys(prokka_gid_lookup).length
//             ngid_count = Object.keys(ncbi_gid_lookup).length
//             //console.log('prokka_gid_lookup.length',pgid_count)
//             //console.log('ncbi_gid_lookup.length',ngid_count)
//             //let size = Buffer.byteLength(JSON.stringify(req.session))
//             //console.log('req.session size(KB):',size/1024)
//             // on dev  req.session size(KB): 38827.2841796875  == 38 MB   tranposase
//             // req.session size(KB): 278541.3876953125 == 278 MB  family
// 
//             //console.log(ar,ar.length)
//             //console.log(gid_count, pid_count)
//             req.session.anno_search_dirname_grep = dirname
//             
//             //console.log('counts',pgid_count, ppid_count,ngid_count, npid_count)
//             res.send(JSON.stringify([pgid_count, ppid_count,ngid_count, npid_count]))
//           }else{  //end if code ==0
//              console.log('nothing found')
//              res.send(JSON.stringify([0,0,0,0]))
//           }
//         });
// 
// })

//
//  Global Site Search
//
router.post('/basic_site_search', function basic_site_search(req, res) {
  
  console.log('in basic index.js POST -Search')
  console.log(req.body)
  const searchText = req.body.adv_search_text
  const searchTextLower = req.body.adv_search_text.toLowerCase()
  let taxonOtidObj = {},otidLst = [],gidLst=[],ret_obj={}
  let form_type = []
  if(req.body.taxonomy && req.body.taxonomy == 'on'){
      ret_obj = search_taxonomy(searchTextLower)
      taxonOtidObj = ret_obj.taxonOtidObj
      otidLst      = ret_obj.otidLst
      form_type.push('taxonomy') 
  }
  if(req.body.genomes && req.body.genomes == 'on'){
      gidLst = search_genomes(searchTextLower)
      form_type.push('genomes') 
  }
////////////// TAXON NAMES ////////////////////////////////////////////////////////////////////////////
  //let taxonOtidObj = search_taxonomy(searchTextLower, 'names')
  
  
///////////// OTIDs /////////////////////////////////////////////////////////////////////////////
   //let otidLst = search_taxonomy(searchTextLower, 'otids')
   
///////////// GENOMES ////////////////////////////////////////////////////////////////////////////////
  
  //console.log('gidObjList',gidObjList)

///////////// CONTIGS /////////////////////////////////////////////////////////////////////////////

  
  let contigObj_list = search_contigs(searchTextLower)
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
  const grep_cmd = CFG.GREP_CMD + " -liR "+help_trunk + " -e '" + helpers.addslashes(searchText) + "'" 

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
      //req.session.site_search_result_prokka = {}
      //req.session.site_search_result_ncbi = {}
      //console.log('st',searchText)
      res.render('pages/basic_search_result', {
        title: 'HOMD :: Site Search',
        pgname: '', // for AbountThisPage
        config: JSON.stringify(CFG),
        ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),
        
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
function search_taxonomy(text_string){
   // type is names or otids
  // lets search the taxonomy names
  // Bacterial Taxonomy Names
  //helpers.print(Object.keys(C.taxon_counts_lookup)[0])
  
  
      const taxonList = Object.values(C.taxon_lineage_lookup).filter(function (e) {
        if (Object.keys(e).length !== 0) {
          // console.log(e)
          if (e.domain.toLowerCase().includes(text_string) ||
            e.phylum.toLowerCase().includes(text_string) ||
            e.klass.toLowerCase().includes(text_string) ||
            e.order.toLowerCase().includes(text_string) ||
            e.family.toLowerCase().includes(text_string) ||
            e.genus.toLowerCase().includes(text_string) ||
            e.species.toLowerCase().includes(text_string) ||
            e.subspecies.toLowerCase().includes(text_string)) {
            return e
          }
        }
        //
      })
      //  Now get the otids
      let pototid,taxonOtidObj = {}
      // must find: HMT-389, HMT_389, HMT389 as well as 389
      if(text_string.slice(0, 3) === 'hmt'){       // check first 3 chars
         pototid = text_string.slice(3).replace('-','').replace('_','')  // Starts the slice at index 3
         //pototid = parseInt(text_string.slice(-3))  // get last 3 chars
      }else{
         pototid = parseInt(text_string)
      }
      if(pototid && pototid in C.taxon_lookup){
         if(C.dropped_taxids.indexOf(pototid.toString()) != -1){
            taxonOtidObj[pototid] = 'This taxon has been dropped from HOMD.'
         }else{
            //console.log('got OTID int',text_string)
            taxonOtidObj[pototid] = C.taxon_lineage_lookup[pototid].domain
            taxonOtidObj[pototid] += ';' + C.taxon_lineage_lookup[pototid].phylum
            taxonOtidObj[pototid] += ';' + C.taxon_lineage_lookup[pototid].klass
            taxonOtidObj[pototid] += ';' + C.taxon_lineage_lookup[pototid].order
            taxonOtidObj[pototid] += ';' + C.taxon_lineage_lookup[pototid].family
            taxonOtidObj[pototid] += ';' + C.taxon_lineage_lookup[pototid].genus
            taxonOtidObj[pototid] += ';' + C.taxon_lineage_lookup[pototid].species
            taxonOtidObj[pototid] += ';' + C.taxon_lineage_lookup[pototid].subspecies
         }
      }
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
        //if (C.taxon_lineage_lookup[otid].subspecies !== '') {
          taxonOtidObj[otid] += ';' + C.taxon_lineage_lookup[otid].subspecies
        
      }
      
      
    
      // OTID Metadata
      const allOtidObjList = Object.values(C.taxon_lookup)
      const otidKeyList = Object.keys(allOtidObjList[0])
      //helpers.print(['allOtidObjList[0]',allOtidObjList[0]]) // site is undefined
      let otidObjList = allOtidObjList.filter(function (el) {
        for (let n in otidKeyList) {
          //console.log( 'el[otidKeyList[n]]',el[otidKeyList[n]] )
          if (Array.isArray(el[otidKeyList[n]]) && el[otidKeyList[n]].length > 0) {
            // we're catching any arrays: rrna_sequences, synonyms, sites, pangenomes, type_strains, ref_strains
              //console.log('el',el)
              if(el[otidKeyList[n]][0] && el[otidKeyList[n]].findIndex(element => element.toLowerCase().includes(text_string)) !== -1){
                  return el.otid
              }
    
          } else {
            
            //helpers.print(['el',el])
            
            if ( Object.prototype.hasOwnProperty.call(el, otidKeyList[n]) 
                 && el[otidKeyList[n]]
                 && el[otidKeyList[n]].toString().toLowerCase().includes(text_string)) {
              return el.otid
            }
           
          }
        }
      })
      
      const otidLst = otidObjList.map(e => ({otid:e.otid, species: '<i>'+e.genus+' '+e.species+'</i>'}))
      //console.log('otidLst',otidLst[0])
      otidLst.sort(function (a, b) {
           return helpers.compareStrings_alpha(a.species, b.species);
      })
      
    return {'taxonOtidObj':taxonOtidObj,'otidLst':otidLst}
}
function search_genomes(text_string){
  //let add_genome_to_otid = {}
  // Genome  Metadata
  const allGidObjList = Object.values(C.genome_lookup)
  // let gid_lst = Object.keys(C.genome_lookup).filter(item => ((item.toLowerCase()+'').includes(searchTextLower)))
  const gidKeyList = Object.keys(allGidObjList[0])
  const gidObjList = allGidObjList.filter(function (el) {
  
    for (let n in gidKeyList) {
      if (Array.isArray(el[gidKeyList[n]])) {
        // we're missing any arrays
      } else {
        if ( Object.prototype.hasOwnProperty.call(el, gidKeyList[n]) && (el[gidKeyList[n]]).toString().toLowerCase().includes(text_string)) {
          //add_genome_to_otid[el.otid] = el.organism
          el.species = C.taxon_lookup[el.otid].species
          el.genus = C.taxon_lookup[el.otid].genus
          
          return el.gid
        }
      }
    }
  })
  //helpers.print(['gidObjList[0]',gidObjList[0]])
  let gidLst = gidObjList.map(e => ({gid: e.gid, strain:e.strain, otid:e.otid, species: '<i>'+e.genus+' '+e.species+'</i>'}))
  //helpers.print(gidLst)
  gidLst.sort(function (a, b) {
       //console.log('a',a)
       return helpers.compareStrings_alpha(a.species, b.species);
  })
  return gidLst
}

function search_contigs(text_string){
  // search contigs
  let contigObj_list = []
  //console.log('C.contig_lookup',C.contig_lookup )
  let all_contigs = Object.keys(C.contig_lookup)
  const contig_list = all_contigs.filter(el => {
    if (el.toLowerCase().indexOf(text_string) !== -1) {
        return true;
    }
  });
  for(let n in contig_list){
      
      contigObj_list.push({contig:contig_list[n], gids: C.contig_lookup[contig_list[n]]})
  }
  return contigObj_list
}
// }); // end pipeline
// })  // end anno query
module.exports = router

