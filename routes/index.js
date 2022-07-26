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
// let timestamp = new Date() // getting current timestamp
// var rs_ds = ds.get_datasets( () => {
var browseDir = require("browse-directory");
const Stream = require( 'stream-json/streamers/StreamArray');
/* GET home page. */
router.get('/', function index(req, res) {
  
  console.log('Session ID:',req.session.id)
  //console.log('CFG.ENV :',CFG.ENV )
  res.render('pages/home', {
    title: 'HOMD :: Human Oral Microbiome Database',
    pgname: 'home', // for AbountThisPage
    config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
    user: JSON.stringify(req.user || {})
    

  })
})

// router.get('/homd_ftp', function index(req, res) {
//   console.log('homd_ftp')
//   let dir = req.query.dir;
//   let back,pts
//   if(!dir){
//      dir = "public/ftp"
//      back = "public/ftp"
//   }else if(dir === "public/ftp" ){  // very imprtant
//      back = "public/ftp"
//   }else{
//      pts = dir.split('/')
//      pts.pop()
//      back = pts.join('/')
//   }
//   console.log('dir',dir)
//   let hdirs = helpers.getAllDirFiles(dir)
//   //console.log('hdirs',hdirs)
//   //var tree = browseDir.browse("public/ftp");
//   // var dirFiles = browseDir.browseFiles(dir);
// //   //console.log('files',dirFiles);
// //  
// //     // Get all directories of folder "directory"
// //   var dirDirs = browseDir.browseDirs(dir);
//   //console.log('dirs',dirDirs);
//   // https://www.npmjs.com/package/browse-directory
//   
//   //browseDir.showTree(tree);
//   res.render('pages/homd_ftp', {
//     title: 'HOMD :: Human Oral Microbiome Database',
//     pgname: '', // for AbountThisPage
//     config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
//     ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
//     // tree: JSON.stringify(tree),
//     files: JSON.stringify(hdirs.files),
//     dirs: JSON.stringify(hdirs.dirs),
//     back: back,
//     current:dir
//   })
// })
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
    config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
    user: JSON.stringify(req.user || {})

  })
})
//
router.get('/poster', function poster(req, res) {
  res.render('pages/poster', {
    title: 'HOMD :: Human Oral Microbiome Database',
    pgname: '', // for AbountThisPage
    config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
    user: JSON.stringify(req.user || {})

  })
})

router.get('/oralgen', function oralgen(req, res) {
  res.render('pages/oralgen', {
    title: 'HOMD :: Human Oral Microbiome Database',
    pgname: '', // for AbountThisPage
    config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
    user: JSON.stringify(req.user || {})

  })
})
// function get_proteins_for_search(search_text, anno){
//     let proteinObj = {}, data,gid,name
//     const searchTextLower = search_text.toLowerCase()
//     const proteinid_data = require(path.join(CFG.PATH_TO_DATA, 'homdData-ProteinIDs'+anno.toUpperCase()+'Lookup.json'))
//     let pidKeysList = Object.keys(proteinid_data)
//     let protein_list = pidKeysList.filter(pid => {
//       data = proteinid_data[pid]  // an array
//       if (pid.toLowerCase().indexOf(searchTextLower) !== -1) {
//         return true;
//      }
//      for(let i in data){
//         if (data[i].gene && data[i].gene.toLowerCase().indexOf(searchTextLower) !== -1) {
//             return true;
//         }
//         if (data[i].product && data[i].product.toLowerCase().indexOf(searchTextLower) !== -1) {
//             return true;
//         }
//      }
//     
//    });
//    for(let n in protein_list){
//       let pid = protein_list[n]
//       let data = proteinid_data[pid]
//       for(let i in data){
//            gid = data[i].gid
//            name = C.genome_lookup[gid].genus +' '+C.genome_lookup[gid].species+' '+C.genome_lookup[gid].ccolct
//            
//            if(proteinObj.hasOwnProperty(gid) ){
//               proteinObj[gid].push({name:name, pid:pid, gene:data[i].gene, product:data[i].product})
//             }else{
//               proteinObj[gid] = [{name:name, pid:pid, gene:data[i].gene, product:data[i].product}]
//             }
//            
//       }
//    }
//    return proteinObj
//    
// }
function create_protein_table(anno, obj){
    let html = '',data_lst,name
    html += "<center><table>"
    html += "<center><table>"
    html += '<tr><th>SEQ-ID</th><th>Open in<br>Explorer</th><th>Genome</th><th>'+anno.toUpperCase()+'<br>ProteinID</th><th>GeneProduct</th></tr>'
    
    for(let gid in obj){
        data_lst = obj[gid]
        for(let i in data_lst){
        html += '<tr><td>'+gid+'</td>'
        html += "<td><a href='genome/explorer?gid="+gid+"&anno="+anno+"'>open</a></td>"
        html += '<td>'+data_lst[i].name+'</td>'
        html += '<td>'+data_lst[i].pid+'</td>'
        //html += '<td>'+data_lst[i].gene+'</td>'
        html += '<td>'+data_lst[i].product+'</td></tr>'
        }
    }
    html += '</table></center>'
    return html
    
    
    
   //  html += '<tr><th>SEQ-ID</th><th>Genome</th><th>hit count</th><th>Open in<br>Explorer</th></tr>'
//     
//     for(let gid in obj){
//         data_lst = obj[gid]
//         name = C.genome_lookup[gid].genus +' '+C.genome_lookup[gid].species+' '+C.genome_lookup[gid].ccolct
//               
//         //for(let i in data_lst){
//         html += '<tr><td>'+gid+'</td>'
//         
//         html += '<td>'+name+'</td>'
//         html += '<td>count</td>'
//         html += "<td><a href='genome/explorer?gid="+gid+"&anno="+anno+"'>open</a></td>"
//         // html += '<td>'+data_lst[i].pid+'</td>'
// //         html += '<td>'+data_lst[i].gene+'</td>'
// //         html += '<td>'+data_lst[i].product+'</td></tr>'
//         //}
//     }
    html += '</table></center>'
    return html

}
router.post('/anno_protein_search', function anno_search(req, res) {
    console.log(req.body)
    let obj,data,gid,name,resultObj={}
    const anno = req.body.anno
    const searchTextLower = req.body.search_text.toLowerCase()
    
    if(anno === 'prokka'){
        resultObj = req.session.site_search_result.prokka
    }else{
        resultObj = req.session.site_search_result.ncbi
    }
     
    res.send(create_protein_table(anno, resultObj))
    
})
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
  //console.log('gidObjList[0]',gidLst[0])


////////// ANNOTATED GENES ////////////////////////////////////////////////////////////////////////////////
   // Search Annotated ProteinIDs
   
   
   
   
   let obj,data,gid,name='',anno
   let prokka_genome_count=0,prokka_gene_count=0,ncbi_genome_count=0,ncbi_gene_count=0
   //https://github.com/uhop/stream-json/wiki/StreamValues
   let q = "SELECT  anno,gid,PID, product from protein_search WHERE("
    q += " product like '%"+searchTextLower+"%'" 
    //q += " OR gene like '%"+searchTextLower+"%'"
    q += " OR PID like '%"+searchTextLower+"%')"
    //q += " AND anno='"+anno+"'"
    //q += " GROUP BY anno"
   if(CFG.ENV == 'productionX'){
      q = "select 'a','b','c','d' from otid_prime limit 0"
   }
   console.log(q)
   //const jsonStream = StreamValues.withParser();
//   if(CFG.ENV === 'development'){
   TDBConn.query(q, (err, rows) => {
    if (err) {
        console.log(err)
        return
    }
    console.log('rows')
    console.log(rows)
    req.session.site_search_result = {}
    req.session.site_search_result.prokka = {}
    req.session.site_search_result.ncbi = {}
    if(rows.length === 0){
       //prokka_genome_count_lookup={},prokka_gene_count=0,ncbi_genome_count_lookup={},ncbi_gene_count=0
    }else{
       
       for(let i in rows){
         gid = rows[i].gid
         anno = rows[i].anno
         if(gid in C.genome_lookup){
            name = C.genome_lookup[gid].genus +' '+C.genome_lookup[gid].species+' '+C.genome_lookup[gid].ccolct
         }
         if( anno === 'prokka'){
            if(gid in req.session.site_search_result.prokka){
              req.session.site_search_result.prokka[gid].push({name:name, pid:rows[i].PID, product:rows[i].product})
            }else{
              req.session.site_search_result.prokka[gid] = [{name:name, pid:rows[i].PID, product:rows[i].product}]
            }
            
            prokka_gene_count += 1 
         }else if(anno === 'ncbi'){
            if(gid in req.session.site_search_result.ncbi){
              req.session.site_search_result.ncbi[gid].push({name:name, pid:rows[i].PID, product:rows[i].product})
            }else{
              req.session.site_search_result.ncbi[gid] = [{name:name, pid:rows[i].PID, product:rows[i].product}]
            }
            
            ncbi_gene_count +=1
         }
       }
    }
    prokka_genome_count = Object.keys(req.session.site_search_result.prokka).length
    ncbi_genome_count = Object.keys(req.session.site_search_result.ncbi).length
    //console.log(seqstr.length)
    

 
   //const proteinid_PROKKAdata = require(path.join(CFG.PATH_TO_DATA, 'homdData-ProteinIDsPROKKALookup.json'))
   //const proteinid_NCBIdata   = require(path.join(CFG.PATH_TO_DATA, 'homdData-ProteinIDsNCBILookup.json'))
   //let prokka_file = path.join(CFG.PATH_TO_DATA, 'homdData-ProteinIDsPROKKALookup.json')
   //let ncbi_file   = path.join(CFG.PATH_TO_DATA, 'homdData-ProteinIDsNCBILookup.json')
//    let protein_file   = path.join(CFG.PATH_TO_DATA, 'homdData-ProteinIDsLookup.json')
//    const pipeline = fs.createReadStream(protein_file).pipe(Stream.withParser());
//    //let objectCounter = 0;
//    pipeline.on('data', data => {
//        
//        //gid = data.gid,gene,pid,product
//       obj = data.value
//       
// //        console.log(obj)
//        if(obj.pid.toLowerCase().indexOf(searchTextLower) !== -1
//           || obj.gid.toLowerCase().indexOf(searchTextLower) !== -1
//           || (obj.gene && obj.gene.toLowerCase().indexOf(searchTextLower) !== -1)
//           || obj.product.toLowerCase().indexOf(searchTextLower) !== -1
//        ){
//            //console.log(obj)
//            if(obj.anno === 'ncbi'){
//                //console.log('ncbi')
//                ++ncbi_gene_count
//                if(ncbi_genome_count_lookup.hasOwnProperty(obj.gid)){
//                    ncbi_genome_count_lookup[obj.gid] +=1
//                 }else{
//                    ncbi_genome_count_lookup[obj.gid] =1
//                 }
//            }else{
//                //console.log('prokka')
//                ++prokka_gene_count
//                if(prokka_genome_count_lookup.hasOwnProperty(obj.gid)){
//                    prokka_genome_count_lookup[obj.gid] +=1
//                 }else{
//                    prokka_genome_count_lookup[obj.gid] =1
//                 }
//            }
//        }
//     });
//    
//    // fs.createReadStream(prokka_file).pipe(jsonStream.input);
// //    jsonStream.on('data', ({key, value}) => {
// //        console.log(key, value);
// //    });
//    pipeline.on('end', () => {
//         console.log('All Done');
//         console.log('prokka_gene_count')
//         console.log(prokka_gene_count)
//         console.log('prokka_genome_count')
//         console.log(Object.keys(prokka_genome_count_lookup).length)
//         console.log('ncbi_gene_count')
//         console.log(ncbi_gene_count)
//         console.log('ncbi_genome_count')
//         console.log(Object.keys(ncbi_genome_count_lookup).length)
//         
//   })
//} 

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
  if(Object.keys(add_genome_to_otid).length > 0){
      for(let otid in add_genome_to_otid){
          otidLst.push({otid: otid, species: '<i>'+add_genome_to_otid[otid]+'</i>'})
      }
  }
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
  const allPhageObjList = Object.values(C.phage_lookup)
  // let gid_lst = Object.keys(C.genome_lookup).filter(item => ((item.toLowerCase()+'').includes(searchTextLower)))
  // console.log(allPhageObjList[0])
  const pidKeyList = Object.keys(allPhageObjList[0])
  const pidObjList = allPhageObjList.filter(function (el) {
    for (let n in pidKeyList) {
      // console.log(pidkeylist[n]+'-'+searchTextLower)
      if (Array.isArray(el[pidKeyList[n]])) {
        // we're missing any arrays
        // return 0
      } else {
        if ((el[pidKeyList[n]]).toString().toLowerCase().includes(searchTextLower)) {
          return el.pid
        }
        // return 0
      }
    }
  })
  // console.log(pidObjList)
  
  const phageIdLst = pidObjList.map(e => e.pid)
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
      if(CFG.ENV == 'productionX'){
          prokka_genome_count=0
          prokka_gene_count=0
          ncbi_genome_count=0
          ncbi_gene_count=0
      }

      res.render('pages/search_result', {
        title: 'HOMD :: Site Search',
        pgname: '', // for AbountThisPage
        config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
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
        phage_id_list: JSON.stringify(phageIdLst) // phageIDs
      })
   });
  
})
// }); // end pipeline
 })  // end anno query
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
