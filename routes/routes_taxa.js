const express  = require('express');
var router   = express.Router();
const CFG   = require(app_root + '/config/config');
const fs       = require('fs-extra');
const url = require('url');
const path     = require('path');
const C		  = require(app_root + '/public/constants');

router.get('/taxTable', (req, res) => {
//router.get('/taxTable', helpers.isLoggedIn, (req, res) => {
	
	//console.log(C.tax_table_results)
	// See models/homd_taxonomy.js for C.tax_table_results
	res.render('pages/taxon/taxtable', {
		title: 'HOMD :: Taxon Table', 
		hostname: CFG.hostname,
		res: C.tax_table_results 
	});
});
router.get('/taxHierarchy', (req, res) => {
	//the json file was created from a csv of vamps taxonomy
	// using the script: taxonomy_csv2json.py in ../homd_data
	fs.readFile('public/data/vamps_taxonomy.json', (err, data) => {
		console.log(JSON.parse(data));
		//let taxaData = JSON.parse(data);
		//console.log(student);
		res.render('pages/taxon/taxhierarchy', {
			title: 'HOMD :: Taxon Hierarchy', 
			hostname: CFG.hostname,
			data: data
		});
	});
});
router.get('/taxLevel', (req, res) => {
	res.render('pages/taxon/taxlevel', {
		title: 'HOMD :: Taxon Level', 
		hostname: CFG.hostname 
	});
});
router.get('/taxDownload', (req, res) => {
	res.render('pages/taxon/taxdownload', {
		title: 'HOMD :: Taxon Download', 
		hostname: CFG.hostname 
	});
});
//});

// test: choose custom taxonomy, show tree
router.get('/tax_custom_dhtmlx', (req, res) => {
  console.time("TIME: tax_custom_dhtmlx");
  console.log('IN tax_custom_dhtmlx')
  let myurl = url.parse(req.url, true);
  let id = myurl.query.id;

  let json = {};
  json.id = id;
  json.item = [];

  if (parseInt(id) === 0){
    /*
        return json for collapsed tree: 'domain' only
            json = {"id":"0","item":[
                {"id":"1","text":"Bacteria","tooltip":"domain","checked":true,"child":"1","item":[]},
                {"id":"214","text":"Archaea","tooltip":"domain","checked":true,"child":"1","item":[]},
                {"id":"338","text":"Unknown","tooltip":"domain","checked":true,"child":"1","item":[]},
                {"id":"353","text":"Organelle","tooltip":"domain","checked":true,"child":"1","item":[]}
                ]
            }
    */

    C.silva_taxonomy.taxa_tree_dict_map_by_rank["domain"].map(node => {
        let options_obj = get_options_by_node(node);
        options_obj.checked = true;
        json.item.push(options_obj);
      }
    );
  }
  else {
    const objects_w_this_parent_id = C.silva_taxonomy.taxa_tree_dict_map_by_id[id].children_ids.map(n_id => C.silva_taxonomy.taxa_tree_dict_map_by_id[n_id]);
    objects_w_this_parent_id.map(node => {
      let options_obj = get_options_by_node(node);
      options_obj.checked = false;
      json.item.push(options_obj);
    });
  }
  json.item.sort(function sortByAlpha(a, b) {
    return helpers.compareStrings_alpha(a.text, b.text);
  });

  console.timeEnd("TIME: tax_custom_dhtmlx");

  res.json(json);
});
//


module.exports = router;