const express  = require('express');
var router   = express.Router();
const passport = require('passport');
//const helpers  = require(app_root + '/routes/helpers/helpers');
//const queries  = require(app_root + '/routes/queries_admin');
const CFG   = require(app_root + '/config/config');
const fs       = require('fs-extra');
const path     = require('path');
//const spawn    = require('child_process').spawn;
//const multer   = require('multer');
//const url       = require('url');
const C		  = require(app_root + '/public/constants');

router.get('/login', (req, res) => {
    res.render('pages/admin/login', { 
                      title: 'HOMD :: Login',
                      user: req.user, 
                      hostname: CFG.hostname,
                      return_to_url: req.session.returnTo 
    });
});

router.post('/login',
    passport.authenticate('local-login', { successRedirect: '/',
                                   failureRedirect: '/admin/login',
                                   failureFlash: true })
);

router.get('/register', (req, res) => {
    res.render('pages/admin/register', { 
                      title: 'HOMD :: Signup',
                      user: req.user, 
                      hostname: CFG.hostname,
                      return_to_url: req.session.returnTo 
    });
});


router.get('/reset_password', (req, res) => {
    res.render('pages/admin/reset_pasword', { 
                      title: 'HOMD :: Reset Password',
                      user: req.user, 
                      hostname: CFG.hostname,
                      return_to_url: req.session.returnTo 
    });
});


module.exports = router;