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
    helpers.accesslog(req, res)
    res.render('pages/admin/login', { 
		  title: 'HOMD :: Login',
		  pgname: 'login',  //for AbountThisPage 
		  user: req.user, 
		  config : JSON.stringify({hostname:CFG.HOSTNAME,env:CFG.ENV}),
		  return_to_url: req.session.returnTo,
		  ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
    });
});

router.post('/login',
    passport.authenticate('local-login', { successRedirect: '/',
                                   failureRedirect: '/admin/login',
                                   failureFlash: true })
);

router.get('/register', (req, res) => {
    helpers.accesslog(req, res)
    res.render('pages/admin/register', { 
		  title: 'HOMD :: Signup',
		  pgname: 'signup',  //for AbountThisPage 
		  user: req.user, 
		  config : JSON.stringify({hostname:CFG.HOSTNAME,env:CFG.ENV}),
		  return_to_url: req.session.returnTo,
		  ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
    });
});

router.post('/register', passport.authenticate('local-signup', {
                successRedirect : '/', // redirect to the secure profile section
                failureRedirect : '/admin/register', // redirect back to the signup page if there is an error
                failureFlash : true         // allow flash messages
}));

router.get('/reset_password', (req, res) => {
    helpers.accesslog(req, res)
    res.render('pages/admin/reset_pasword', { 
		  title: 'HOMD :: Reset Password',
		  pgname: 'reset_password',  //for AbountThisPage 
		  user: req.user, 
		  config : JSON.stringify({hostname:CFG.HOSTNAME,env:CFG.ENV}),
		  return_to_url: req.session.returnTo,
		  ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}), 
    });
});


module.exports = router;


