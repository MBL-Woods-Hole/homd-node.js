const express  = require('express');
var router   = express.Router();
const CFG   = require(app_root + '/config/config');
const fs       = require('fs-extra');
const url = require('url');
const path     = require('path');
const C		  = require(app_root + '/public/constants');
const helpers = require(app_root + '/routes/helpers/helpers');
const queries = require(app_root + '/routes/queries')

router.get('/', (req, res) => {
  console.log('in virome')
  helpers.accesslog(req, res)

  res.render('pages/virome/index', {
		title: 'HOMD :: Human Oral Virome Database',
		config :  JSON.stringify({hostname:CFG.HOSTNAME, env:CFG.ENV}),
		ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
		
  });
  
});

router.get('/virus_table', (req, res) => {
  console.log('in virus table')
  helpers.accesslog(req, res)

  fs.readFile(path.join(CFG.PATH_TO_DATA, C.virome_file), 'utf8', (err, data) => {
    	if (err)
      		console.log(err)
    	else{
          data = JSON.parse(data)
		  res.render('pages/virome/virometable', {
				title: 'HOMD :: Human Oral Virome Database',
				config :  JSON.stringify({hostname:CFG.HOSTNAME, env:CFG.ENV}),
				ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
				vdata:    JSON.stringify(data),
		  });
        }
  });
});
module.exports = router;