const express  = require('express');
var router   = express.Router();
const CFG   = require(app_root + '/config/config');
const fs       = require('fs-extra');
const url = require('url');
const path     = require('path');
const C		  = require(app_root + '/public/constants');
const helpers = require(app_root + '/routes/helpers/helpers');

router.get('/stub', (req, res) => {
    res.render('pages/help/stub', {title:'stub'});
    helpers.accesslog(req, res)
});

router.get('/user_guide', (req, res) => {
    helpers.accesslog(req, res)
    res.render('pages/help/user_guide', { 
		  title: "HOMD :: User's Guide",
		  user: req.user, 
		  config : JSON.stringify({hostname:CFG.HOSTNAME,env:CFG.ENV}),
		  ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
                      
    });
});

router.get('/template', (req, res) => {
    // the url should always be formed: /help/template?page=name
    console.log('')
    helpers.accesslog(req, res)
    console.log('in template')
    console.log(req.session)
    const parsed_url = url.parse(req.url, true);
    //console.log('page= '+parsed_url.query.page)
    var info_content, menu_item;
    // reload and nav_bar-link: how to differentiate?
    // via sessions???
    // a reload will use session info
    // link will use link info
    // new==1 then resen session??
    if(parsed_url.query.new && parsed_url.query.new == '1'){
      console.log('got new==1')
      delete req.session.page
      delete req.session.menu
    }
    if(req.session.menu && req.session.page){  // reload ONLY
//        	console.log('RELOAD')
     	menu_item = req.session.menu
     	info_content = req.session.page

     }else{									// navbar
		info_content = parsed_url.query.page
    	menu_item = parsed_url.query.menu
     }
    
    if(info_content == undefined || info_content == ''){
    	res.render('pages/help/stub', {title:'stub'});
    }else{
    res.render('pages/help/help_pages', { 
		  title: "HOMD :: User's Guide: "+info_content,
		  page: info_content,  // this will open the menu
		  menu: menu_item,
		  user: req.user, 
		  config : JSON.stringify({hostname:CFG.HOSTNAME,env:CFG.ENV}),
		  ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
                      
    });
    }
});

router.post('/ajax', function(req, res){
    console.log('')
    console.log('in ajax-on server')
    //console.log('req.body');
    console.log(req.body);
    helpers.accesslog(req, res)
    
    var file;
    var id = req.body.id;  //.split('--')
    var tmp = id.split('--')
    if(req.body.set_session == true){
      req.session.menu = tmp[0]
	  req.session.page = tmp[1]
    }else{
      delete req.session.page
      delete req.session.menu
    }
    file = path.join(process.cwd(), 'public', 'static_help_files', tmp[1] +'.ejs' )
    
    
    console.log(file)
    var static_data = {}
    static_data.menu = tmp[0]
    static_data.page = tmp[1]
    fs.readFile(file, "utf8", (err,data) => {
    
    	if(err){
    		console.log('No file found -- does not validate -1!!')
            req.flash('NO TEXT/FILE FOUND')
            data = 'No HelpFile Found-2'
    	}
    	//console.log(data)
    	static_data.data = data
    	res.send(JSON.stringify(static_data));
    	
    });
    
});


module.exports = router;


