const express  = require('express');
var router   = express.Router();
const CFG   = require(app_root + '/config/config');
const fs       = require('fs-extra');
const url = require('url');
const path     = require('path');
const C		  = require(app_root + '/public/constants');
const helpers = require(app_root + '/routes/helpers/helpers');

router.get('/taxTable', (req, res) => {
//router.get('/taxTable', helpers.isLoggedIn, (req, res) => {
	
	console.log('in taxtable ')
	// See models/homd_taxonomy.js for C.tax_table_results
	res.render('pages/taxa/taxtable', {
		title: 'HOMD :: Taxon Table', 
		hostname: CFG.hostname,
		res: C.tax_table_results 
	});
});
router.get('/taxHierarchy', (req, res) => {
	//the json file was created from a csv of vamps taxonomy
	// using the script: taxonomy_csv2json.py in ../homd_data
	
	// use this only if use the version 5 dhtmlx tree	( w/dynamic loading)
	// using file public/data/all_silva_taxonomy.json
	res.render('pages/taxa/taxhierarchy', {
			title: 'HOMD :: Taxon Hierarchy', 
			hostname: CFG.hostname,
			data: {}
		});
		
	// use this only if use the version 7 dhtmlx tree	(non-dynamic loading)
	// fs.readFile('public/data/vamps_taxonomy.json', (err, jsondata) => {
// 		//console.log(JSON.parse(data));
// 		//let taxaData = JSON.parse(data);
// 		//console.log(student);
// 		res.render('pages/taxon/taxhierarchy', {
// 			title: 'HOMD :: Taxon Hierarchy', 
// 			hostname: CFG.hostname,
// 			data: jsondata
// 		});
// 	});
});
router.get('/taxLevel', (req, res) => {
	
	res.render('pages/taxa/taxlevel', {
		title: 'HOMD :: Taxon Level', 
		hostname: CFG.hostname,
		level: 'domain'
	});
});
//
//
router.post('/taxLevel', (req, res) => {
	
	//console.log(req.body)
	const rank = req.body.rank
	
	const tax_resp = []
	fs.readFile('public/data/taxcounts.json', (err, data) => {
    	if (err)
      		console.log(err)
    	else
			var taxdata = JSON.parse(data);
			//console.log(taxdata['Archaea;Euryarchaeota;Halobacteria'])
			//Problem family: Bacteria;Actinobacteria;Actinobacteria;Acidimicrobiales;Acidimicrobiaceae
			family = C.silva_taxonomy.taxa_tree_dict_map_by_name_n_rank['Acidimicrobiaceae_family']
			fam_pid = family.parent_id
			order1 =C.silva_taxonomy.taxa_tree_dict_map_by_id[fam_pid]
			Acidimicrobiia_klass= C.silva_taxonomy.taxa_tree_dict_map_by_name_n_rank['Acidimicrobiia_klass']
			//order = C.silva_taxonomy.taxa_tree_dict_map_by_name_n_rank[family.taxon +'_'+family.node_id]
			
			console.log(family)
			console.log(order1)
			console.log(Acidimicrobiia_klass)
			const result = C.silva_taxonomy.taxa_tree_dict_map_by_rank[rank].map(taxitem =>{
				// get lineage of taxitem
				//console.log(taxitem)
				lineage = [taxitem.taxon]
				new_search_id = taxitem.parent_id
				new_search_rank = C.RANKS[C.RANKS.indexOf(taxitem.rank)-1]
				//console.log(new_search_id,new_search_rank)
				while (new_search_id != 0){
					new_search_item = C.silva_taxonomy.taxa_tree_dict_map_by_id[new_search_id]
					//name_n_rank
					//new_search_item = new_search_parent
					lineage.unshift(new_search_item.taxon)  // adds to front of lineage array -prepends
					new_search_id = new_search_item.parent_id
				
				}
				return_obj = {}
				return_obj.item_rank = rank
				return_obj.item_taxon = lineage[lineage.length - 1]
				return_obj.parent_rank = C.RANKS[C.RANKS.indexOf(rank) - 1]
				return_obj.parent_taxon = lineage[lineage.length - 2]
				return_obj.item_count = taxdata[lineage.join(';')]
				return_obj.lineage = lineage.join(';')
				if(!return_obj.item_count){
				   //console.log(return_obj)
				   //console.log(lineage.join(';'))
				}
				tax_resp.push(return_obj)
				return return_obj
		
			})
			
			tax_resp.sort(function sortByTaxa(a, b) {
                return helpers.compareStrings_alpha(a.item_taxon, b.item_taxon);
    		});
    		//console.log(tax_resp)
			res.send(JSON.stringify(tax_resp));
	});
});
//
//

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
function get_options_by_node(node) {
  let options_obj = {
    id: node.node_id,
    text: node.rank+' '+node.taxon,
    rank: node.rank,
    child: 0,
    tooltip: node.rank,
  };
  if (node.children_ids.length > 0) {
    options_obj.child = 1;
    options_obj.item = [];
  }
  return options_obj;
}


module.exports = router;