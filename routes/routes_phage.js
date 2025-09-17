'use strict'
const express  = require('express');
let router   = express.Router();
const CFG   = require(app_root + '/config/config');
const fs       = require('fs-extra');
// const url = require('url');
const path     = require('path');
const C     = require(app_root + '/public/constants');
const helpers = require(app_root + '/routes/helpers/helpers');
const queries = require(app_root + '/routes/queries')


router.get('/phage_table', function phage_explorer(req, res) {
    console.log('in phage hello')
    let gid = req.query.gid
    console.log('in phage hello',gid)
    
    
    res.render('pages/phage/phagetable', {
        title: 'HOMD :: Phage Table',
        pgtitle: 'Human Oral/Nasal Microbial Taxa',
        pgname: 'taxon/phage_table',  //for AbountThisPage
        config: JSON.stringify(CFG),
        ver_info: JSON.stringify(C.version_information),
  })
  
})


        
module.exports = router;