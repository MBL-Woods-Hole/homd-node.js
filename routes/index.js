"use strict"
const express = require('express');
var router = express.Router();
const fs   = require('fs-extra');
const path  = require('path');
//const helpers = require('./helpers/helpers');
//const ds = require('./load_all_datasets');
const CFG = require(app_root + '/config/config');
const C	  = require(app_root + '/public/constants');

//var rs_ds = ds.get_datasets( () => {  

  /* GET home page. */
  router.get('/', (req, res) => {
    res.render('pages/home', {
            title: 'HOMD:Home',
            hostname: CFG.hostname 
        });
  });

  router.get('/taxTable', (req, res) => {
    res.render('pages/taxon/taxtable', {
            title: 'HOMD:Taxon Table', 
            hostname: CFG.hostname 
        });
  });
  router.get('/taxHierarchy', (req, res) => {
    res.render('pages/taxon/taxhierarchy', {
            title: 'HOMD:Taxon Hierarchy', 
            hostname: CFG.hostname 
        });
  });
  router.get('/taxLevel', (req, res) => {
    res.render('pages/taxon/taxlevel', {
            title: 'HOMD:Taxon Level', 
            hostname: CFG.hostname 
        });
  });
  router.get('/taxDownload', (req, res) => {
    res.render('pages/taxon/taxdownload', {
            title: 'HOMD:Taxon Download', 
            hostname: CFG.hostname 
        });
  });
//});

module.exports = router;
