'use strict'
const express = require('express');
var router = express.Router();
const passport = require('passport');
var queries    = require('../routes/queries_admin');
const helpers = require(app_root +'/routes/helpers/helpers');
const { body, validationResult } = require('express-validator');
const fs = require('fs-extra');
const async = require('async');

const path = require('path');
const C     = require(app_root + '/public/constants');
const CFG  = require(app_root + '/config/config');
const nodemailer = require("nodemailer");

let new_user = {}
/* GET User List (index) page. */


// =====================================
// LOGIN ===============================
// =====================================
// show the login form
router.get('/login', function login(req, res) {
    console.log('in login')
    if(req.user){
            req.flash('success', "You are already logged in as '"+req.user.username+"'");
            res.render('pages/user/profile', {
                title: 'HOMD :: profile',
                pgname: '', // for AbountThisPage 
                config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
                ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
                user: JSON.stringify(req.user || {})
            });
    }else{
        res.render('pages/user/login', { 
            title   : 'HOMD:login',
            pgname: '',
            config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
            ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
            user: JSON.stringify(req.user || {}),
        });
   }
});


router.post('/login',  passport.authenticate('local-login', { 
  // successRedirect: '/users/profile',
  failureRedirect: '/admin/login',   // on fail GET:login (empty form)
  failureFlash: true }), (req, res) => {  
    console.log('login failure')
     var data_dir = path.join(CFG.USER_FILES_BASE,req.user.username);
//     //str.startsWith('/metadata/file_utils')
     var redirect_to_home = [
//       '/metadata/metadata_edit_form',
//       '/metadata/metadata_file_list',
//       '/metadata/metadata_files',
//       '/metadata/metadata_upload'
     ];
    var url = req.body.return_to_url || '/admin/profile';
    if (redirect_to_home.indexOf(req.body.return_to_url) !== -1) {
      url = '/';
    }
    
    
   //  console.log(C.PROJECT_INFORMATION_BY_PID[283])
//     console.log('USER_GROUPS3')
//     console.log(C.USER_GROUPS)
//     console.log('ALL_USERS_BY_UID')
//     console.log(C.ALL_USERS_BY_UID)
    for(uid in C.ALL_USERS_BY_UID){
        if( C.ALL_USERS_BY_UID[uid].hasOwnProperty('groups') && (C.ALL_USERS_BY_UID[uid].groups).length > 0){
            for(i in C.ALL_USERS_BY_UID[uid].groups){
                var gp = C.ALL_USERS_BY_UID[uid].groups[i];
                pid_list = C.USER_GROUPS[gp]
                for(j in pid_list){
                    var pid = pid_list[j]
                    
                    //console.log('pushing uid '+uid+' to pid '+pid)
                    //console.log(C.PROJECT_INFORMATION_BY_PID[pid].permissions)
                    //console.log('pushing uid2')
                    if(C.PROJECT_INFORMATION_BY_PID.hasOwnProperty(pid) && C.PROJECT_INFORMATION_BY_PID[pid].permissions.indexOf(parseInt(uid)) == -1){
                        //console.log('2pushing uid '+uid+' to pid '+pid)
                        C.PROJECT_INFORMATION_BY_PID[pid].permissions.push(parseInt(uid))
                    }
                    
                    
                }
                
            }
        }
     
    }
    //console.log(PROJECT_INFORMATION_BY_PID)
    
    fs.ensureDir(data_dir,  err => {
        if(err) {console.log(err);} // => null
        else{
            console.log('Checking USER_FILES_BASE: '+data_dir+' Exists - yes');
            fs.chmod(data_dir, 0o777,  err => {
                if(err) {console.log(err);} // ug+rwx
                else{
                    console.log('Setting USER_FILES_BASE permissions to 0o777');
                    console.log('=== url ===:',url);
                    console.log(url);
                    
                    //console.log('USER',req.user)
                    res.redirect(url);    
                    delete req.session.returnTo;
                    req.body.return_to_url = '';
                }
            });
        }
    });
    
    
    
  }
);



// =====================================
// SIGNUP ==============================
// =====================================
// show the signup form
router.get('/signup', function signup(req, res) {
        let new_user = {};
        
        // render the page and pass in any flash data if it exists
        console.log('new_user--signup');
        //console.log(new_user)
        if(req.user){
            req.flash('success', "You are already logged in as '"+req.user.username+"'");
            res.render('pages/user/profile', {
                title: 'HOMD :: profile',
                pgname: '', // for AbountThisPage 
                config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
                ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
                user: JSON.stringify(req.user || {})
            });
        }else{
            console.log('reqBODY',req.body)
            let sg = helpers.makeid(3).toUpperCase()
            res.render('pages/user/signup', { 
                title   : 'HOMD::signup',
                pgname: '',
                config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
                ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
                user: JSON.stringify(req.user || {}),
                hostname: CFG.hostname,
                spamguard: sg,
                data: JSON.stringify({})
            });
        }
});
// from https://stackoverflow.com/questions/27056195/nodejs-express-validator-with-passport
router.post('/signup',
  [
  body('email').isEmail(),
  body('password').isLength({ min: 6, max: 12 }),
  body('password_confirm').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password');
    }
    // Indicates the success of this synchronous custom validator
    return true;
  }),
  body('username').not().isEmpty().trim().isLength({ min: 5, max: 20 }).escape(),
  body('firstname').isLength({ min: 1, max: 30 }),
  body('lastname').isLength({ min: 2, max: 30 }),
  body('institution').isLength({ max: 50 }),
  ],
  function signup(req, res, next) {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('bdy',errors.array()[0])
      //return res.status(400).json({ errors: errors.array() });
      for(let i in errors.array()){
         req.flash('fail','['+errors.array()[i].param+': '+errors.array()[i].msg+': "'+errors.array()[i].value+'"] ')
      
      }
      let sg = helpers.makeid(3).toUpperCase()
      res.render('pages/user/signup', { 
                title   : 'HOMD::signup',
                pgname: '',
                config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
                ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
                user: JSON.stringify(req.user || {}),
                hostname: CFG.hostname,
                spamguard: sg,
                data: JSON.stringify(req.body)
            });
        return;
        
      
    }
    console.log('no errors')
    next();
    },
   //  User.create({
//       username: req.body.username,
//       password: req.body.password,
//     }).then(user => res.json(user));
  
  passport.authenticate('local-signup', {
      successRedirect: '/admin/profile',
      failureRedirect: '/admin/signup',
      failureFlash : true
    })
);


// =====================================
// PROFILE SECTION =====================
// =====================================
// we will want this protected so you have to be logged in to visit
// we will use route middleware to verify this (the isLoggedIn function)
router.get('/profile', helpers.isLoggedIn, function profile(req, res) {
    console.log('PROFILE')    
    
    res.render('pages/user/profile', {
          title: 'HOMD :: profile',
         pgname: '', // for AbountThisPage 
         config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
         ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
         user: JSON.stringify(req.user),
         
    });
});

// =====================================
// LOGOUT ==============================
// =====================================
router.get('/logout', function logout(req, res) {
    req.logout();
    res.redirect('/');
});


router.get('/index', [helpers.isLoggedIn, helpers.isAdmin], function admin(req, res) {
    console.log('in admin')
    
    
        //console.log(rows)
        res.render('pages/admin/index', {
         title: 'HOMD :: ADMIN',
         pgname: '', // for AbountThisPage
         config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
         ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
         user: JSON.stringify(req.user),
         
        }); 
})
//
//
//


router.get('/update_account_info', [helpers.isLoggedIn], function update_account_info(req, res) {
     console.log(req.user)
     if(req.user){
        res.render('pages/user/update_account_info', {
         title: 'HOMD :: ADMIN',
         pgname: '', // for AbountThisPage
         config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
         ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
         user: JSON.stringify(req.user),
       }); 
    } 
})
//
router.post('/update_account_info', [
      helpers.isLoggedIn,
      body('firstname').isLength({ min: 1, max: 30 }),
      body('lastname').isLength({ min: 2, max: 30 }),
      body('institution').isLength({ max: 50 }),
      body('email').isEmail()
      ], 
      function update_account_info(req, res, next) {
        //console.log('xxxx',req.user)
        //console.log('yyyyy',req.body)
         
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('bdy',errors.array()[0])
            //return res.status(400).json({ errors: errors.array() });
            for(let i in errors.array()){
              req.flash('fail','['+errors.array()[i].param+': '+errors.array()[i].msg+': "'+errors.array()[i].value+'"] ')
            }
            res.render('pages/user/update_account_info', {
                title: 'HOMD :: ADMIN',
                pgname: '', // for AbountThisPage
                config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
                ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
                user: JSON.stringify(req.user),
            })
   
   
        }else{

            let new_info = {
              user_id:     req.body.user_id,  // from page form hidden
              // check req.body.user_id === req.user.user_id  ???
              username:    req.user.username,
              email:       req.body.email,
              institution: req.body.institution,
              first_name:  req.body.firstname,
              last_name:   req.body.lastname,
              active:      req.user.active,
              security_level: req.user.security_level,
              sign_in_count: req.user.sign_in_count
            }
            TDBConn.query(queries.update_user_info(req.body.user_id, new_info), (err, rows, fields) => {
                if(err){ console.log(err);return }
                    req.flash('success','Update Success')
                    res.render('pages/user/profile', {
                    title: 'HOMD :: ADMIN',
                    pgname: '', // for AbountThisPage
                    config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
                    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
                    user: JSON.stringify(new_info),
                })
                return;
            });
        }
        console.log('no errors')
})
//
router.get('/view_users_admin', [helpers.isLoggedIn, helpers.isAdmin], function view_users_admin(req, res) {
     console.log(req.user)
     TDBConn.query(queries.get_all_users(), (err, rows, fields) => {
        if(err){ console.log(err);return }
        res.render('pages/admin/view_users', {
         title: 'HOMD :: ADMIN',
         pgname: '', // for AbountThisPage
         config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
         ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
         user: JSON.stringify(req.user),
         users: JSON.stringify(rows)
       });
       }); 
    
})
//
router.get('/create_user_admin', [helpers.isLoggedIn, helpers.isAdmin], function create_user_admin(req, res) {
     console.log(req.user)
     
        res.render('pages/admin/create_user', {
         title: 'HOMD :: ADMIN',
         pgname: '', // for AbountThisPage
         config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
         ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
         user: JSON.stringify(req.user),
       }); 
    
})
router.post('/create_user_admin', 
     [helpers.isLoggedIn, 
     helpers.isAdmin,
     body('email').isEmail(),
     body('password').isLength({ min: 6, max: 12 }),
     body('password_confirm').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password');
    }
    // Indicates the success of this synchronous custom validator
    return true;
     }),
     body('username').not().isEmpty().trim().isLength({ min: 5, max: 20 }).escape(),
     body('firstname').isLength({ min: 1, max: 30 }),
     body('lastname').isLength({ min: 2, max: 30 }),
     body('institution').isLength({ max: 50 }),
     ], 
     function create_user_admin(req, res) {
        console.log('in POST create_user_admin')
        const errors = validationResult(req);
        if (errors.isEmpty()) {
			let newUserMysql            = {};
			newUserMysql.username       = req.body.username;
			newUserMysql.password       = req.body.password;  /// Password is HASHed in queries_admin
			newUserMysql.firstname      = req.body.firstname;
			newUserMysql.lastname       = req.body.lastname;
			newUserMysql.email          = req.body.email;
			newUserMysql.institution    = req.body.institution;
			newUserMysql.security_level = 50;  //reg user
			TDBConn.query(queries.insert_new_user(newUserMysql), (err, rows, fields) => {
				if(err){ console.log(err);return }
				req.flash('success','Created new user '+req.body.username)
				res.render('pages/admin/create_user', {
				 title: 'HOMD :: ADMIN',
				 pgname: '', // for AbountThisPage
				 config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
				 ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
				 user: JSON.stringify(req.user),
			   });
		   }); 
       
       }else{
            console.log('err',errors.array()[0])
            for(let i in errors.array()){
              req.flash('fail','['+errors.array()[i].param+': '+errors.array()[i].msg+': "'+errors.array()[i].value+'"] ')
            }
            res.render('pages/admin/create_user', {
			 title: 'HOMD :: ADMIN',
			 pgname: '', // for AbountThisPage
			 config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
			 ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
			 user: JSON.stringify(req.user),
		    });
       }
    
})
//
router.get('/reset_pw_admin', [helpers.isLoggedIn, helpers.isAdmin], function reset_pw_admin(req, res) {
     console.log(req.user)
     TDBConn.query(queries.get_all_users(), (err, rows, fields) => {
        if(err){ console.log(err);return }
        res.render('pages/admin/reset_pw_admin', {
         title: 'HOMD :: ADMIN',
         pgname: '', // for AbountThisPage
         config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
         ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
         user: JSON.stringify(req.user),
         users: JSON.stringify(rows),
       });
       }); 
     
})
router.post('/reset_pw_admin', 
     [helpers.isLoggedIn, 
     helpers.isAdmin,
     body('new_pw').isLength({ min: 6, max: 12 }),
     ], 
     function reset_pw_admin(req, res) {
        console.log('req.body',req.body)
     
        const errors = validationResult(req);
        if (errors.isEmpty()) {
           // back to admin page?
           req.flash('success','Update pw Success')
           TDBConn.query(queries.update_user_pw_admin(req.body.user_id, req.body.new_pw), (err, rows, fields) => {
				if(err){ console.log(err);return }
				res.render('pages/admin/index', {
				 title: 'HOMD :: ADMIN',
				 pgname: '', // for AbountThisPage
				 config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
				 ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
				 user: JSON.stringify(req.user),
			    });
           });
        }else{
           // show pw errors on update page
           req.flash('fail','['+errors.array()[0].param+': '+errors.array()[0].msg+': "'+errors.array()[0].value+'"] ')
           TDBConn.query(queries.get_all_users(), (err, rows, fields) => {
           if(err){ console.log(err);return }
           res.render('pages/admin/reset_pw_admin', {
			 title: 'HOMD :: ADMIN',
			 pgname: '', // for AbountThisPage
			 config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
			 ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
			 user: JSON.stringify(req.user),
			 users: JSON.stringify(rows),
		   });
		   });
        }
     
})
//
router.get('/email_check', [helpers.isLoggedIn, helpers.isAdmin], (req, res) => {

    console.log('checking email');
    
    main().catch(console.error);
    
    res.render('pages/admin/admin', {
         title: 'HOMD :: ADMIN',
         pgname: '', // for AbountThisPage
         config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
         ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
         user: JSON.stringify(req.user || {}),
    });  

})

router.get('/pangenome_list', [helpers.isLoggedIn, helpers.isAdmin], (req, res) => {

    console.log('pangenome_list-get');
    
    let d = helpers.getAllDirFiles(path.join(CFG.PATH_TO_ANVISERVER,'pangenomes'))
    console.log(d.dirs)
    res.render('pages/admin/pangenome_list', {
         title: 'HOMD :: ADMIN',
         pgname: '', // for AbountThisPage
         config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
         ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
         user: JSON.stringify(req.user || {}),
         pglist: JSON.stringify(d.dirs),
    });  

})
router.post('/anvio_pangenome', [helpers.isLoggedIn, helpers.isAdmin], (req, res) => {

    console.log('anvio_pangenome-post');
    
    let pan_file = path.join(CFG.PATH_TO_ANVISERVER,'pangenomes',req.body.pg,'PAN.db')
    let genome_file = path.join(CFG.PATH_TO_ANVISERVER,'pangenomes',req.body.pg,'GENOMES.db')
    let pan_cmd = path.join(CFG.PATH_TO_ANVISERVER,'anvio','bin','anvi-display-panAV.py')
    let args = ['-p',pan_file,'-g',genome_file,'-I',CFG.ANVIO_URL,'-P',8001]
    console.log(genome_file)
    console.log(pan_cmd + ' ' + args.join(' '))
    //https://www.digitalocean.com/community/tutorials/how-to-launch-child-processes-in-node-js
    const { spawn } = require('child_process');

    const child = spawn(pan_cmd, args, {env: {'PATH': CFG.PATH,'PYTHONPATH':CFG.PYTHONPATH}});
    
    child.stdout.on('data', data => {
      console.log(`stdout:\n${data}`);
    });

    child.stderr.on('data', data => {
      console.error(`stderr: ${data}`);
    });
    child.on('error', (error) => {
      console.error(`error: ${error.message}`);
    });

    child.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
    });
    let d = helpers.getAllDirFiles(path.join(CFG.PATH_TO_ANVISERVER,'pangenomes'))
    //console.log(d)
    res.render('pages/admin/pangenome_list', {
         title: 'HOMD :: ADMIN',
         pgname: '', // for AbountThisPage
         config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
         ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
         user: JSON.stringify(req.user || {}),
         pglist: JSON.stringify(d.dirs),
    });  

})


module.exports = router;

// async..await is not allowed in global scope, must use a wrapper
async function main() {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Fred Foo 👻" <foo@example.com>', // sender address
    //to: "bar@example.com, baz@example.com", // list of receivers
    //to:'zeketheturtle@gmail.com',
    subject: "Hello ✔", // Subject line
    text: "Hello world?", // plain text body
    html: "<b>Hello world?</b>", // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

//main().catch(console.error);

