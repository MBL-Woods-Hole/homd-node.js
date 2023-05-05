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
  
  //console.log('Session ID:',req.session.id)
  //console.log('CFG.ENV :',CFG.ENV )
  res.render('pages/home', {
    title: 'HOMD :: Human Oral Microbiome Database',
    pgname: 'home', // for AbountThisPage
    config: JSON.stringify(CFG),
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
    user: JSON.stringify(req.user || {})
    

  })
})
router.get('/taxon=(\\d+)', function taxon(req, res) {
  // sequence server
  //console.log('taxon=/.d/')
  var url = req.url;
  //console.log(url)
  let otid = url.split('=')[1]
  res.redirect('/taxa/tax_description?otid='+otid)
  
})
router.get('/idn=SEQF(\\d+.\\d)', function idn(req, res) {
  // sequence server
  //console.log('idn=SEQF')
  var url = req.url;
  //console.log(url)
  let gid = url.split('=')[1]
  res.redirect('/genome/genome_description?gid='+gid)
 
})
router.get('/get_seq=*', function jb_seq(req, res) {
  // jbrowse link to retrieve seq
  //console.log('get_seq=')
   // https://www.homd.org/get_seq=xxxxxx&type=yy
   // https://www.homd.org/get_seq=KDE71052.1&type=aa
  var url = req.url;
  //console.log(url)
  // /get_seq=KDE71052.1&type=aa
  let type,pid,sp,db,anno
  sp = url.split('&')
  type = sp[1].split('=')[1].toLowerCase() // must be aa,AA,na or NA 
  pid = sp[0].split('=')[1]
  //console.log(type,pid)
  // PROKKA pids (starting as SEQFXXX
  if(type === 'aa'){   // NCBI
      if(pid.substring(0,4) === 'SEQF'){
          db = "`PROKKA_faa`.`protein_seq`"
          anno = 'PROKKA'
       }else{
          db = "`NCBI_faa`.`protein_seq`"
          anno = 'NCBI'
       }
  }else{   //req.body.type == 'na':   // NCBI  na
      if(pid.substring(0,4) === 'SEQF'){
          db = "`PROKKA_ffn`.`ffn_seq`"
          anno = 'PROKKA'
       }else{
          db = "`NCBI_ffn`.`ffn_seq`"
          anno = 'NCBI'
       }
  }
  let q = 'SELECT seq_id, mol_id, UNCOMPRESS(seq_compressed) as seq FROM ' + db
  q += " WHERE protein_id='" + pid + "'"
  //console.log(q)
  
  const fileName = 'HOMD_'+anno+'_'+pid+'_'+type.toUpperCase()+'.fasta'
  
  TDBConn.query(q, (err, rows) => {
  //ADBConn.query(q, (err, rows) => {
    if (err) {
        console.log(err)
        res.send(err)
        return
    }
    //console.log('rows',rows)
    let sequence = '',gid,acc,show = ''
    let length = 0
    if(rows.length === 0){
        sequence += "No sequence found in database"
    }else{
       length = rows[0].seq.length
       gid = rows[0].seq_id
       acc = rows[0].mol_id
       const seqstr = (rows[0].seq).toString()
       const arr = helpers.chunkSubstr(seqstr, 100)
       sequence += arr.join('\n')
       show = ">"+gid+' | '+anno+' | Protein_id: '+pid+' | Accession: '+acc+' | length '+length.toString()+'\n'
       
    }
    show = show + sequence
    res.writeHead(200, {
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    })
    res.end(show)
  })
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

// router.post('/anno_protein_search', function anno_protein_search(req, res) {
//     console.log('in POST::anno_protein_search')
//     console.log(req.body)
//     let obj,data,gid,name,resultObj={}
//     let anno = req.body.anno
//     let search_text = req.body.search_text
//     //console.log(req.session)
//     console.log('chose:',anno,Object.values(req.session['site_search_result_'+anno]).length)
//     //console.log('sess-ncbi',req.session.site_search_result.ncbi)
//     
//     resultObj = req.session['site_search_result_'+anno]
//     
//     res.send(create_protein_table(anno, resultObj, search_text))
// })
async function selectquery(sqlquery){
    return new Promise((resolve, reject) => {
        TDBConn.query(sqlquery,(err,result)=>{
            if(err){
                reject(err);
            }
            else{
                resolve(result);
            }
        });
    });
}
router.post('/get_annotations_counts_fulltext', function get_annotations_counts_fulltext(req, res) {
    console.log('POST::get_annotations_counts')
    console.log(req.body)
    const searchText = req.body.intext
    const searchTextLower = req.body.intext.toLowerCase()
    let obj,data,gid,pid,nrows,prows,anno,pts
    let pgenome_count=0, pgene_count=0,ngenome_count=0, ngene_count=0
   // V10.1
   //https://github.com/uhop/stream-json/wiki/StreamValues
   
    //let q = queries.get_annotation_query3(searchTextLower)
    let q_ncbi = queries.get_annotation_query5(searchTextLower,'ncbi')
    let q_prokka = queries.get_annotation_query5(searchTextLower,'prokka')
    console.log(q_ncbi)
   //const jsonStream = StreamValues.withParser();
//   if(CFG.ENV === 'development'){
       Promise.all([selectquery(q_ncbi), selectquery(q_prokka)])
       .then(results => {
              nrows = results[0]
              prows = results[1]
              if(nrows.length === 0){
                  console.log('No ncbi rows')
                  req.session.site_search_result_ncbi[gid] = []
              }else{
                  for(let i in nrows){
                    //console.log(nrows[i].search_text)
                    pts = nrows[i].search_text.split('|')
                    gid = pts[0]
                    pid = pts[1]
                    if(! req.session.site_search_result_ncbi ){
                      req.session.site_search_result_ncbi = {}
                    }
                
                    if(gid in req.session.site_search_result_ncbi){
                        req.session.site_search_result_ncbi[gid].push(nrows[i].search_text)
                    }else{
                        req.session.site_search_result_ncbi[gid] = [nrows[i].search_text]
                    }
                    ngene_count += 1 
         
                   }
              }
              /////////////////////////////
              if(prows.length === 0){
               //prokka_genome_count_lookup={},prokka_gene_count=0,ncbi_genome_count_lookup={},ncbi_gene_count=0
                   console.log('prokka nothing found')
               }else{
       
                   for(let i in prows){
                    pts = prows[i].search_text.split('|')
                    gid = pts[0]
                    pid = pts[1]
                
                    if(! req.session.site_search_result_prokka ){
                     
                      req.session.site_search_result_prokka = {}
                     
                    }
                
                    if(gid in req.session.site_search_result_prokka){
                        req.session.site_search_result_prokka[gid].push(prows[i].search_text)
                    }else{
                        req.session.site_search_result_prokka[gid] = [prows[i].search_text]
                    }
                    pgene_count += 1 
         
                   }
               }
              pgenome_count = Object.keys(req.session.site_search_result_prokka).length
              ngenome_count = Object.keys(req.session.site_search_result_ncbi).length
              //pgenome_count = Object.keys(req.session.site_search_result_prokka).length
              //genome_count = Object.keys(req.session.site_search_result_ncbi).length
              //console.log(req.session.site_search_result_ncbi)
              console.log('x-ncbi',ngenome_count, ngene_count)
              console.log('x-prokka',pgenome_count, pgene_count)
                // returning to: public/js/search.js
              console.log('Returning:',ngenome_count,pgenome_count)
              res.send([pgenome_count, pgene_count, ngenome_count, ngene_count])
              
        })
        

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
