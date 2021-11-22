'use strict'
const express  = require('express');
var router   = express.Router();
const CFG   = require(app_root + '/config/config');
const fs       = require('fs-extra');
// const url = require('url');
const path     = require('path');
const C     = require(app_root + '/public/constants');
const helpers = require(app_root + '/routes/helpers/helpers');
const queries = require(app_root + '/routes/queries')
var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();
today = yyyy + '-' + mm + '-' + dd;
var currentTimeInSeconds=Math.floor(Date.now()/1000); //unix timestamp in seconds

router.get('/index', function index(req, res) {
  console.log('in help')
    
    res.render('pages/help/index', {
        title: 'HOMD :: Help Pages',
        pgname: 'Help Index', // for AboutThisPage
        config:  JSON.stringify({hostname:CFG.HOSTNAME, env:CFG.ENV}),
        ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),

    })
  
})
router.get('/strains', function index(req, res) {
  console.log('in help')
  res.render('pages/help/strains', {
        title: 'HOMD :: Help Pages',
        pgname: 'Help Index', // for AboutThisPage
        config:  JSON.stringify({hostname:CFG.HOSTNAME, env:CFG.ENV}),
        ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
    })
})
router.get('/description', function index(req, res) {
  console.log('in help')
  res.render('pages/help/description', {
        title: 'HOMD :: Help Pages',
        pgname: 'Help Index', // for AboutThisPage
        config:  JSON.stringify({hostname:CFG.HOSTNAME, env:CFG.ENV}),
        ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
    })
})
router.get('/cite', function index(req, res) {
  console.log('in help')
  res.render('pages/help/cite', {
        title: 'HOMD :: Help Pages',
        pgname: 'Help Index', // for AboutThisPage
        config:  JSON.stringify({hostname:CFG.HOSTNAME, env:CFG.ENV}),
        ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
    })
})  
router.get('/team', function index(req, res) {
  console.log('in help')
  res.render('pages/help/team', {
        title: 'HOMD :: Help Pages',
        pgname: 'Help Index', // for AboutThisPage
        config:  JSON.stringify({hostname:CFG.HOSTNAME, env:CFG.ENV}),
        ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
    })
})  
router.get('/contact', function index(req, res) {
  console.log('in help')
  res.render('pages/help/contact', {
        title: 'HOMD :: Help Pages',
        pgname: 'Help Index', // for AboutThisPage
        config:  JSON.stringify({hostname:CFG.HOSTNAME, env:CFG.ENV}),
        ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
    })
})
router.get('/mailing', function index(req, res) {
  console.log('in help')
  res.render('pages/help/mailing', {
        title: 'HOMD :: Help Pages',
        pgname: 'Help Index', // for AboutThisPage
        config:  JSON.stringify({hostname:CFG.HOSTNAME, env:CFG.ENV}),
        ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
    })
})
router.get('/announcement', function index(req, res) {
  console.log('in help')
  res.render('pages/help/announcement', {
        title: 'HOMD :: Help Pages',
        pgname: 'Help Index', // for AboutThisPage
        config:  JSON.stringify({hostname:CFG.HOSTNAME, env:CFG.ENV}),
        ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
    })
})
router.get('/refseq_version', function index(req, res) {
  console.log('in help')
  res.render('pages/help/refseq_version', {
        title: 'HOMD :: Help Pages',
        pgname: 'Help Index', // for AboutThisPage
        config:  JSON.stringify({hostname:CFG.HOSTNAME, env:CFG.ENV}),
        ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
    })
})
router.get('/genome_version', function index(req, res) {
  console.log('in help')
  res.render('pages/help/genome_version', {
        title: 'HOMD :: Help Pages',
        pgname: 'Help Index', // for AboutThisPage
        config:  JSON.stringify({hostname:CFG.HOSTNAME, env:CFG.ENV}),
        ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
    })
})
router.get('/database_update', function index(req, res) {
  console.log('in help')
  res.render('pages/help/database_update', {
        title: 'HOMD :: Help Pages',
        pgname: 'Help Index', // for AboutThisPage
        config:  JSON.stringify({hostname:CFG.HOSTNAME, env:CFG.ENV}),
        ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
    })
})


module.exports = router;