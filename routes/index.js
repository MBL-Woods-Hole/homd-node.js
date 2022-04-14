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

/* GET home page. */
router.get('/', function index(req, res) {
  
  console.log('Session ID:',req.session.id)
  console.log('CFG.ENV :',CFG.ENV )
  res.render('pages/home_tc', {
    title: 'HOMD :: Human Oral Microbiome Database',
    pgname: 'home', // for AbountThisPage
    config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version })

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
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version })

  })
})
//
router.get('/poster', function poster(req, res) {
  res.render('pages/poster', {
    title: 'HOMD :: Human Oral Microbiome Database',
    pgname: '', // for AbountThisPage
    config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version })

  })
})

router.get('/oralgen', function oralgen(req, res) {
  res.render('pages/oralgen', {
    title: 'HOMD :: Human Oral Microbiome Database',
    pgname: '', // for AbountThisPage
    config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version })

  })
})

router.post('/site_search', function site_search(req, res) {
  helpers.accesslog(req, res)
  console.log('in index.js POST -Search')
  console.log(req.body)
  /*
    Taxonomy DB - genus;species
        TaxObjects:strain,refseqID,OTID
    Genome DB   - genus;species
        GeneObjects: SeqID
    Phage DB - host Genus;Species
        PhageObjects:
    Help Pages
    NCBI Genome Annot
    Prokka Genome Annot
  */
  
  
  
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


  // OTID Metadata
  const allOtidObjList = Object.values(C.taxon_lookup)
  const otidkeylist = Object.keys(allOtidObjList[0])
  const otidObjList = allOtidObjList.filter(function (el) {
    for (let n in otidkeylist) {
      //console.log( 'el[otidkeylist[n]]',el[otidkeylist[n]] )
      if (Array.isArray(el[otidkeylist[n]])) {
        // we're missing any arrays
      } else {
        
        //helpers.print(['el',el])
        
        if ( Object.prototype.hasOwnProperty.call(el, otidkeylist[n]) && el[otidkeylist[n]].toString().toLowerCase().includes(searchTextLower)) {
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
      contigObj_list.push({contig:contig_list[n], gids:C.contig_lookup[contig_list[n]]})
  }
  
  // search help pages
  // let dir = path.join(process.cwd(), 'public', 'static_help_files' )

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
      

      res.render('pages/search_result', {
        title: 'HOMD :: Site Search',
        pgname: '', // for AbountThisPage
        config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
        ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
        search_text: searchText,
        otid_list: JSON.stringify(otidLst),
        gid_list: JSON.stringify(gidLst),
        taxon_otid_obj: JSON.stringify(taxonOtidObj),
        help_pages: JSON.stringify(helpLst),
        contig_list:JSON.stringify(contigObj_list),
        phage_id_list: JSON.stringify(phageIdLst) // phageIDs
      })
   });
  
})

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
