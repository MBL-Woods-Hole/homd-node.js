'use strict'
const express = require('express')
const router = express.Router()

// const fs   = require('fs-extra')
// const path  = require('path')
const helpers = require('./helpers/helpers')
// const url = require('url')
// const ds = require('./load_all_datasets')
const CFG = require(app_root + '/config/config')
const C = require(app_root + '/public/constants')
// let timestamp = new Date() // getting current timestamp
// var rs_ds = ds.get_datasets( () => {

/* GET home page. */
router.get('/', (req, res) => {
  console.log('req.session')
  console.log(req.session)
  res.render('pages/home', {
    title: 'HOMD :: Human Oral Microbiome Database',
    pgname: 'home', // for AbountThisPage
    config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version })

  })
})

router.get('/download', (req, res) => {
  // renders the overall downlads page
  res.render('pages/download', {
    title: 'HOMD :: Human Oral Microbiome Database',
    pgname: 'download', // for AbountThisPage
    config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version })

  })
})
//
router.get('/poster', (req, res) => {
  res.render('pages/poster', {
    title: 'HOMD :: Human Oral Microbiome Database',
    pgname: 'poster', // for AbountThisPage
    config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version })

  })
})

router.get('/oralgen', (req, res) => {
  res.render('pages/oralgen', {
    title: 'HOMD :: Human Oral Microbiome Database',
    pgname: 'oralgen', // for AbountThisPage
    config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version })

  })
})

router.post('/site_search', (req, res) => {
  helpers.accesslog(req, res)
  console.log('in POST -Search')
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

  // Genome  Metadata
  const allGidObjList = Object.values(C.genome_lookup)
  // let gid_lst = Object.keys(C.genome_lookup).filter(item => ((item.toLowerCase()+'').includes(searchTextLower)))
  const gidKeyList = Object.keys(allGidObjList[0])
  const gidObjList = allGidObjList.filter(function (el) {
    for (const n in gidKeyList) {
      if (Array.isArray(el[gidKeyList[n]])) {
        // we're missing any arrays
      } else {
        if ((el[gidKeyList[n]]).toLowerCase().includes(searchTextLower)) {
          return el.gid
        }
      }
    }
  })

  const gidLst = gidObjList.map(e => e.gid)

  // OTID Metadata
  const allOtidObjList = Object.values(C.taxon_lookup)
  const otidkeylist = Object.keys(allOtidObjList[0])
  const otidObjList = allOtidObjList.filter(function (el) {
    for (const n in otidkeylist) {
      // console.log( el[otidkeylist[n]] )
      if (Array.isArray(el[otidkeylist[n]])) {
        // we're missing any arrays
      } else {
        if ((el[otidkeylist[n]]).toLowerCase().includes(searchTextLower)) {
          return el.otid
        }
      }
    }
  })

  const otidLst = otidObjList.map(e => e.otid)

  // lets search the taxonomy names
  // Bacterial Taxonomy Names
  console.log(Object.keys(C.taxon_counts_lookup)[0])
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
  for (const n in taxonOtidList) {
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
    for (const n in pidKeyList) {
      // console.log(pidkeylist[n]+'-'+searchTextLower)
      if (Array.isArray(el[pidKeyList[n]])) {
        // we're missing any arrays
        // return 0
      } else {
        if ((el[pidKeyList[n]]).toLowerCase().includes(searchTextLower)) {
          return el.pid
        }
        // return 0
      }
    }
  })
  // console.log(pidObjList)
  const phageIdLst = pidObjList.map(e => e.pid)

  res.render('pages/search_result', {
    title: 'HOMD :: Site Search',
    pgname: 'site_search_result', // for AbountThisPage
    config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
    search_text: searchText,

    otid_list: JSON.stringify(otidLst),
    gid_list: JSON.stringify(gidLst),
    taxon_otid_obj: JSON.stringify(taxonOtidObj),
    // help_pages: JSON.stringify(lst),
    phage_id_list: JSON.stringify(phageIdLst) // phageIDs
  })
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
