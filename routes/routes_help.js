const express  = require('express');
var router   = express.Router();
const CFG   = require(app_root + '/config/config');
//const fs       = require('fs-extra');
const path     = require('path');

//const C		  = require(app_root + '/public/constants');

router.get('/stub', (req, res) => {
    res.render('pages/help/stub', { 
                      title: "HOMD ::",
                      user: req.user, 
                      hostname: CFG.hostname,
                      
    });
});

router.get('/user_guide', (req, res) => {
    res.render('pages/help/user_guide', { 
                      title: "HOMD :: User's Guide",
                      user: req.user, 
                      hostname: CFG.hostname,
                      
    });
});

router.get('/home-page', (req, res) => {
    res.render('pages/help/home-page', { 
                      title: "HOMD :: User's Guide:home-page",
                      user: req.user, 
                      hostname: CFG.hostname,
                      
    });
});
module.exports = router;


