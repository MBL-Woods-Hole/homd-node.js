'use strict'
import express from 'express';
const router = express.Router()
import fs from 'fs-extra';

// const fs   = require('fs-extra')
import path from 'path';

import * as helpers from './helpers/helpers.js';
// const url = require('url')
// const ds = require('./load_all_datasets')
import CFG from '../config/config.js';
import C from '../public/constants.js';
import { exec, spawn } from 'child_process';
import * as queries from './queries.js';

// let timestamp = new Date() // getting current timestamp
// let rs_ds = ds.get_datasets( () => {
import browseDir from 'browse-directory';

import { v4 as uuidv4 } from 'uuid'; // I chose v4you can select othersc

//const Stream = require( 'stream-json/streamers/StreamArray');
/* GET home page. */

import mysql from 'mysql'; // or use import if you use TS

import util from 'util';


router.get('/', function index(req, res) {
  
  //console.log('Session ID:',req.session.id)
  //console.log('CFG.ENV :',CFG.ENV )
  res.render('pages/home', {
    title: 'HOMD :: Human Oral Microbiome Database',
    pgname: 'home', // for AbountThisPage
    config: JSON.stringify(CFG),
    ver_info: JSON.stringify(C.version_information),
    
    

  })
})




//
router.get('/poster', function poster(req, res) {
  res.render('pages/poster', {
    title: 'HOMD :: Human Oral Microbiome Database',
    pgname: '', // for AbountThisPage
    config: JSON.stringify(CFG),
    ver_info: JSON.stringify(C.version_information),
    

  })
})

router.get('/advanced_site_search', function advanced_site_searchGETPAGE(req, res) {
  //console.log('advanced_site_searchGET')
  res.render('pages/advanced_site_search', {
    title: 'HOMD :: Human Oral Microbiome Database',
    pgname: '', // for AbountThisPage
    config: JSON.stringify(CFG),
    ver_info: JSON.stringify(C.version_information),
    

  })
})


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
            if(line_count > max){
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

router.post('/advanced_anno_orf_search', function advanced_anno_orf_searchPOST(req, res) {
    console.log('in advanced_anno_orf_search RESULTS')
    console.log(req.body)
    //console.log('pidlist',req.body.pid_list)
    let anno = req.body.anno.toUpperCase()
    let q
    if(anno =='BAKTA'){
        q = "SELECT core_contig_acc as acc,core_ID as pid,core_start as start,core_end as stop,bakta_Product as product,bakta_Gene as gene,bakta_Length as laa,'0' as lna from `BAKTA`.orf WHERE core_ID in ("+req.body.pid_list+")"
    }else{
        q = "SELECT accession as acc,protein_id as pid,start,stop,product,gene,length_aa as laa,length_na as lna from `"+anno+"`.orf WHERE protein_id in ("+req.body.pid_list+")"
    }
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
//
router.post('/advanced_site_search_phage_grep', async function advanced_site_search_phagePOST(req, res) {
    console.log('in advanced_site_search_phage_grep')
    console.log(req.body)
    const searchText = req.body.search_text_phage_grep.toLowerCase()
    //let sql_fields = ['genome_id', 'accession', 'gene', 'protein_id', 'product','length_aa','length_na','start','stop']
    //let grep_fields = ['predictor','genome_id','accession']  // MUST BE order from file
    
    let rows,row_array,sort_lst=[],obj2={},species,gid,otid,strain,fields,contig,predictor
    let search_id,lookup={},gid_collector={},gid_count = {},all_phage_search_ids_lookup = []
    
    try{
        let datapath = path.join(CFG.PATH_TO_SEARCH,"homd_GREP_PHAGE*")
        //let filename = uuidv4();  //CFG.PATH_TO_TMP
        //let filepath = path.join(CFG.PATH_TO_TMP, filename)
        let max_rows = C.grep_search_max_rows //50000
        
        let split_length = 6
        //let args = ['-ih','-m 5000','"'+searchText+'"',datapath,'>',filepath]
        let args = ['-h','-m '+(max_rows).toString(),'"'+searchText+'"',datapath]
        //let args = ['-h','"'+searchText+'"',datapath]
        let grep_cmd = CFG.GREP_CMD + ' ' + args.join(' ')
        console.log(grep_cmd)
        //const rows = await get_grep_rows(grep_cmd);
        const row_array = await execPromise(CFG.GREP_CMD, args, max_rows);
        console.log('rows_lst length',row_array.length)
        
        let total_length = row_array.length - 1
        console.log('total_length',total_length)
        //rows = rows_lst.join('')
        if(total_length == 0){
        
        }
        if(row_array[0] == 'too_long'){
            obj2 = {'too_long':'too_long'}
        }else{
            //console.log('row_array[0]',row_array[0])
            //row_array = rows.split('\n')
            for(let n in row_array){
                if(row_array[n] != ''){
                    
                    let pts = row_array[n].split('|')
                    //console.log('pts',pts)
                    let pts_clean = []
                    for(let n in pts){
                        //pts_clean.push(decodeURIComponent(pts[n].replace("5'", "5").replace("3'", "3").replace(",", ";").replace("2'", "2").replace("n'", "n")))
                        //console.log('pts[n]',pts[n])
                        //pts_clean.push(decodeURIComponent(pts[n].replace(/[']+/g, "").replace(",", ";").replace("%", "pct")))
                        pts_clean.push(decodeURIComponent(encodeURIComponent(pts[n])))
                        //console.log(decodeURIComponent(pts[n].replace(/[']+/g, "").replace(",", ";")))
                    }
                    //console.log('pts',pts)
                    if(['genomad','cenote'].indexOf(pts[1]) != -1 ){
                      //console.log('pts',pts)
                      search_id = pts[0]
                      all_phage_search_ids_lookup[search_id] = 1  // for downloads
                      predictor = pts[1]
                      gid = pts[2].toUpperCase()
                      gid_count[gid] = 1
                      contig = pts[3].toUpperCase()
                      if(gid && C.genome_lookup.hasOwnProperty(gid)){
                        otid = C.genome_lookup[gid]['otid']
                        strain = C.genome_lookup[gid]['strain']
                        species = C.taxon_lookup[otid]['genus'] +' '+C.taxon_lookup[otid]['species']
                      }
                      if(!gid_collector.hasOwnProperty(gid)){
                        gid_collector[gid] = {species:species,strain:strain,otid:otid}
                      }
                      
                      if(gid in lookup){
                          if(contig in lookup[gid]){
                            if(predictor in lookup[gid][contig]){
                               lookup[gid][contig][predictor].push(pts_clean)
                            }else{
                               lookup[gid][contig][predictor] = []
                               lookup[gid][contig][predictor].push(pts_clean)
                            }
                          }else{
                             lookup[gid][contig] = {}
                             lookup[gid][contig][predictor] = []
                             lookup[gid][contig][predictor].push(pts_clean)
                          }
                      }else{
                        lookup[gid] = {}
                        lookup[gid][contig] = {}
                        lookup[gid][contig][predictor] = []
                        lookup[gid][contig][predictor].push(pts_clean)
                        
                      }
                      
                      
 
                    }
                }
            }
        }
        //console.log('lookup',lookup['GCA_000008065.1']['AE017198.1'].bakta)
        //console.log(gid_collector)
        let sendlist=[]
        for(gid in lookup){
            for(contig in lookup[gid]){
                for(predictor in lookup[gid][contig]){
                    sendlist.push({hitlist:lookup[gid][contig][predictor],gid:gid,contig:contig,predictor:predictor,species:gid_collector[gid].species,strain:gid_collector[gid].strain})
                }
            }
        }
        

        //console.log('sendlist',sendlist)
        sendlist.sort(function (a, b) {
           //console.log('a',a)
           return helpers.compareStrings_alpha(a.species, b.species);
        })
       //console.log('sort_lst2',Object.keys(all_phage_search_ids_lookup))
        res.render('pages/advanced_search_result', {
            title: 'HOMD :: Search Results',
            pgname: '', // for AboutThisPage 
            config: JSON.stringify(CFG),
            ver_info: JSON.stringify(C.version_information),
            
            anno: '',
            search_text: req.body.search_text_phage_grep,
            otid_list: JSON.stringify([]),
            gid_list: JSON.stringify([]),
            taxon_otid_obj: JSON.stringify({}),
            //annotationList: JSON.stringify(obj_array),
            annotationList2: JSON.stringify({}),
            anno_sort_list: JSON.stringify([]),
            
            phageList: JSON.stringify(obj2),  // only if too long
            phage_sort_list: JSON.stringify(sendlist),
            phage_lookup: JSON.stringify(lookup),
            phage_id_list: JSON.stringify(Object.keys(all_phage_search_ids_lookup)),
            
            gid_count: Object.keys(gid_count).length,
            total_hits: total_length,
            max: helpers.format_long_numbers(max_rows),
            form_type: JSON.stringify(['phage']),
            no_ncbi_annot: JSON.stringify(C.no_ncbi_genomes)
                    
        })
    }
    catch(e){
          console.log("error",e);
      }
      
    return




})
router.post('/open_phage_sequence', function submit_phage_data(req, res) {
   console.log('in open_phage_sequence')
   console.log(req.body)
   let html = '',contig,length,gid,predictor,species='',strain='',otid
   let q = "SELECT genome_id,contig,predictor,seq_length,UNCOMPRESS(seq_compressed) as seq from phage_search WHERE search_id = '"+req.body.search_id+"'"
    console.log(q)
    TDBConn.query(q, (err, rows) => {
        if (err) {
            console.log(err)
            res.send(err)
            return
        }
        //console.log('rows',rows)
        if(rows.length === 0){
            html += "No sequence found in database"
        }else{
            predictor = rows[0].predictor
            gid = rows[0].genome_id
            if(gid && C.genome_lookup.hasOwnProperty(gid)){
                otid = C.genome_lookup[gid]['otid']
                strain = C.genome_lookup[gid]['strain']
                species = C.taxon_lookup[otid]['genus'] +' '+C.taxon_lookup[otid]['species']
              }
            contig = rows[0].contig
            length = rows[0].seq_length
            const seqstr = (rows[0].seq).toString()
            const arr = helpers.chunkSubstr(seqstr, 100)
            html += arr.join('<br>')
        }
        res.send(JSON.stringify({html:html,length:length,gid:gid,contig:contig,org:species+' ('+strain+')',predictor:predictor}))
        return
    })
})
//
router.post('/show_all_phage_hits', function show_all_phage_hits(req, res) {
   console.log('in show_all_phage_hits')
   let all = JSON.parse(req.body.big_list)
   let hit_ids = [],hl
   for(let n in all){
       hl = all[n].hitlist
       for(let m in hl){
          hit_ids.push(hl[m][0])
       }
   }
   //console.log(hit_ids)
   let q = queries.get_phage_from_ids_noseqs(hit_ids)
   console.log(q)
   TDBConn.query(q, (err, rows) => {
        if (err) {
            console.log(err)
            res.send(err)
            return
        }
        //console.log('rows',rows)
        
        res.render('pages/phage/all_hits_result', {
            title: 'HOMD :: Search Results',
            pgname: '', // for AboutThisPage 
            config: JSON.stringify(CFG),
            ver_info: JSON.stringify(C.version_information),
            //hits_list: req.body.big_list,
            searchtxt: req.body.search_text,
            numhits: req.body.total_hits,
            sqldata: JSON.stringify(rows)
            
        })
    })
   
})
router.post('/submit_phage_data', function submit_phage_data(req, res) {
   console.log('in submit_phage_data')
   console.log(req.body)
   
   let q = "SELECT * from phage_search WHERE search_id = '"+req.body.search_id+"'"
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
})
router.post('/advanced_site_search_anno_grep', async function advanced_site_search_annoPOST(req, res) {
    console.log('in advanced_site_search_grep')
    // anno now includes prokka, ncbi and bakta
    console.log(req.body)
    const searchText = req.body.search_text_anno_grep.toLowerCase()
    let sql_fields = ['genome_id', 'accession', 'gene', 'protein_id', 'product','length_aa','length_na','start','stop']
    let grep_fields = ['anno','genome_id','accession','protein_id','gene','product']  // MUST BE order from file
    
    let q,rows,row_array,sort_lst=[],obj2={},species,gid,otid,strain,gid_count = {},pid,prod
    let tmp_obj = {}
    
    try{
        let datapath = path.join(CFG.PATH_TO_SEARCH,"homd_GREP_Search-"+req.body.adv_anno_radio_grep.toUpperCase()+"*")
        //let filename = uuidv4();  //CFG.PATH_TO_TMP
        //let filepath = path.join(CFG.PATH_TO_TMP, filename)
        let max_rows = C.grep_search_max_rows //see constants.js 50000
        
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
                    if(pts.length >= split_length && ['prokka','ncbi','bakta'].indexOf(pts[0]) != -1 ){
                      //console.log('pts',pts)
                      if(pts[0] == 'bakta'){
                         let id_pts = pts[1].split('_')
                         gid = (id_pts[0]+'_'+id_pts[1]).toUpperCase()
                         pid = pts[1]
                         prod = pts[4]
                      }else{
                        gid = pts[1].toUpperCase()
                        pid = pts[4]
                        prod = pts[5]
                      }
                      gid_count[gid] = 1
                      //console.log('LOOKup',C.genome_lookup[gid])
                      
                    tmp_obj = {
                          gid:gid,
                          species:'=>Genome Not Found in db<=',
                          strain:'',
                          acc:pts[2].toUpperCase(),
                          gene:pts[3].toUpperCase(),
                          pid:pid,
                          prod:prod
                        
                    }
                    if(gid && C.genome_lookup.hasOwnProperty(gid)){
                      //if(gid){
                        otid = C.genome_lookup[gid]['otid']
                        strain = C.genome_lookup[gid]['strain']
                        species = C.taxon_lookup[otid]['genus'] +' '+C.taxon_lookup[otid]['species']
                        tmp_obj.species = species
                        tmp_obj.strain = strain
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
        //console.log('sort_lst1',sort_lst)
        sort_lst.sort(function (a, b) {
           return helpers.compareStrings_alpha(a.species+a.strain, b.species+b.strain);
        })
        //console.log('sort_lst2',sort_lst)
        res.render('pages/advanced_search_result', {
            title: 'HOMD :: Search Results',
            pgname: '', // for AboutThisPage 
            config: JSON.stringify(CFG),
            ver_info: JSON.stringify(C.version_information),
            
            anno: req.body.adv_anno_radio_grep,
            search_text: req.body.search_text_anno_grep,
            otid_list: JSON.stringify([]),
            gid_list: JSON.stringify([]),
            taxon_otid_obj: JSON.stringify({}),
            //annotationList: JSON.stringify(obj_array),
            
            annotationList2: JSON.stringify(obj2),
            anno_sort_list: JSON.stringify(sort_lst),
            
            phageList: JSON.stringify({}),
            phage_sort_list: JSON.stringify([]),
            phage_lookup: JSON.stringify({}),
            phage_id_list: JSON.stringify([]),
            
            gid_count: Object.keys(gid_count).length,
            total_hits: total_length,
            max: helpers.format_long_numbers(max_rows),
            form_type: JSON.stringify(['annotations']),
            no_ncbi_annot: JSON.stringify(C.no_ncbi_genomes)
                    
        })
    }
    catch(e){
          console.log("error",e);
      }
      
    return




})





//
//  Global Site Search
//
router.post('/basic_site_search', function basic_site_search(req, res) {
  
  console.log('in basic index.js POST -Search')
  console.log(req.body)
  const searchText = req.body.adv_search_text
  const searchTextLower = req.body.adv_search_text.toLowerCase()
  let taxonOtidObj = {},otidLst = [],refseqObj={},gidLst=[],ret_obj={}
  let form_type = []
  if(req.body.taxonomy && req.body.taxonomy == 'on'){
      ret_obj = search_taxonomy(searchTextLower)
      taxonOtidObj = ret_obj.taxonOtidObj
      otidLst      = ret_obj.otidLst
      refseqObj    = ret_obj.refseqObj
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
        ver_info: JSON.stringify(C.version_information),
        
        search_text: searchText,
        otid_list: JSON.stringify(otidLst),
        refseq_obj: JSON.stringify(refseqObj),
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
         pototid = parseInt(text_string.slice(3).replace('-','').replace('_',''))  // Starts the slice at index 3
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
          //console.log( 'el',el )
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
      
      
      
      const otidMetaLst = otidObjList.map(e => ({otid:e.otid, species: '<i>'+e.genus+' '+e.species+'</i>'}))
      
      //console.log('otidMetaLst',otidMetaLst[0])
      otidMetaLst.sort(function (a, b) {
           return helpers.compareStrings_alpha(a.species, b.species);
      })
      

      // RefSeq
      // add to OTID Metadata
      //console.log(C.refseq_lookup)
      const allRefSeqObjList = Object.values(C.refseq_lookup)
      
    // '998': [
//         { refseq_id: 'HMT-998_16S005908', species: 'Victivallis lenta' },
//         { refseq_id: 'HMT-998_16S005921', species: 'Victivallis lenta' },
//         { refseq_id: 'HMT-998_16S005935', species: 'Victivallis lenta' }
//       ]

      let refseqObj = {}
      allRefSeqObjList.filter((el) => {
         //console.log('el',el)
         for(let n in el){
             if(el[n].refseq_id.toLowerCase().includes(text_string)){
                 //console.log('el',el[n].refseq_id.toLowerCase())
                 let hmt = el[n].refseq_id.split('_')[0]
                 let otid = hmt.split('-')[1]
                 if(!refseqObj.hasOwnProperty(hmt)){
                    refseqObj[hmt] = { otid:otid,hmt:hmt,species:el[n].species, refseq_id:el[n].refseq_id }
                 }
                 
             }
         }
      })
      
      //console.log('in refseq search',refseqObj)
      
    return {'taxonOtidObj':taxonOtidObj,'otidLst':otidMetaLst,'refseqObj':refseqObj}
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
export default router;

