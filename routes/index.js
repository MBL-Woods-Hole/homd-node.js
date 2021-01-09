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
            user: req.user, 
            hostname: CFG.hostname 
        });
  });



//});

module.exports = router;
