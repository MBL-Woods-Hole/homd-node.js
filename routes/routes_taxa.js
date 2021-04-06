const express  = require('express');
var router   = express.Router();
const CFG   = require(app_root + '/config/config');
const fs       = require('fs-extra');
const url = require('url');
const path     = require('path');
const C		  = require(app_root + '/public/constants');
const helpers = require(app_root + '/routes/helpers/helpers');

router.get('/tax_table', (req, res) => {
//router.get('/taxTable', helpers.isLoggedIn, (req, res) => {
	helpers.accesslog(req, res)
	console.log('in taxtable -get')
	helpers.show_session(req)
	let myurl = url.parse(req.url, true);
  	//console.log(myurl.query)
	req.session.tax_letter = myurl.query.k
	var intiial_status_filter = ['named','unnamed','phylotype','lost']  //['dropped','nonoralref']
	
	//console.log(tax_letter)
	// filter
	send_tax_obj = Object.values(C.taxonomy_taxonlookup);
	tcount = send_tax_obj.length
	send_tax_obj1 = send_tax_obj.filter(item => intiial_status_filter.indexOf(item.status.toLowerCase()) != -1 )
	//var intiial_site_filter = ['oral', 'nasal', 'skin', 'vaginal', 'unassigned'];
	//send_tax_obj = send_tax_obj.filter(item => intiial_site_filter.indexOf(item.site[0].toLowerCase()) != -1)
	
	if(req.session.tax_letter){
	   // COOL....
	   send_tax_obj = send_tax_obj1.filter(item => item.genus.charAt(0) == req.session.tax_letter)
	}else{
		send_tax_obj = send_tax_obj1
	}
	// table sort done via client side js library sorttable: 
	// https://www.kryogenix.org/code/browser/sorttable
    //console.log(send_tax_obj[0])
    //sort
    send_tax_obj.sort(function (a, b) {
      return helpers.compareStrings_alpha(a.genus, b.genus);
    });
	res.render('pages/taxa/taxtable', {
		title: 'HOMD :: Taxon Table', 
		hostname: CFG.hostname,
		res: JSON.stringify(send_tax_obj),
		count: Object.keys(send_tax_obj).length,
		tcount: tcount,
		letter: req.session.tax_letter,
		statusfltr: JSON.stringify(C.tax_status_on) ,  // default
		sitefltr: JSON.stringify(C.tax_sites_on),  //default
		search: '',
		rna_ver : C.rRNA_refseq_version,
		gen_ver : C.genomic_refseq_verson
	});
});
router.post('/tax_table', (req, res) => {
	helpers.accesslog(req, res)
	console.log('in taxtable -post')
	tcount = C.taxonomy_taxonlookup.length
	//helpers.show_session(req)
	console.log(req.body)
	//plus valid
	valid = req.body.valid  // WHAT IS THIS???
	// filter_status = ['named','unnamed','phylotype','lost','dropped']
// 	filter_sites = ['oral','nasal','skin','vaginal','unassigned','nonoralref']
	
	statusfilter_on =[]
	sitefilter_on  = []
	for(i in req.body){
		if(C.tax_status_all.indexOf(i) != -1){
		   statusfilter_on.push(i)
		}
		if(C.tax_sites_all.indexOf(i) != -1){
		   sitefilter_on.push(i)
		}
	}
	console.log('statusfilter_on',statusfilter_on)
	console.log('sitefilter_on',sitefilter_on)
	// letterfilter
	send_tax_obj0 = Object.values(C.taxonomy_taxonlookup);
	tcount = send_tax_obj0.length
	if(req.session.tax_letter){
	   // COOL....
	   send_tax_obj1 = send_tax_obj0.filter(item => item.genus.charAt(0) == req.session.tax_letter)
	}else{
		send_tax_obj1 = send_tax_obj0
	}
	
	send_tax_obj2 = send_tax_obj1.filter(item => sitefilter_on.indexOf(item.site[0].toLowerCase()) != -1)
	send_tax_obj3 = send_tax_obj2.filter(item => statusfilter_on.indexOf(item.status.toLowerCase()) != -1 )    
	
	//console.log('send_tax_objC',send_tax_obj)
	// use session for taxletter
	res.render('pages/taxa/taxtable', {
		title: 'HOMD :: Taxon Table', 
		hostname: CFG.hostname,
		res: JSON.stringify(send_tax_obj3),
		count: Object.keys(send_tax_obj3).length,
		tcount: tcount,
		letter: req.session.tax_letter,
		statusfltr: JSON.stringify(statusfilter_on),
		sitefltr:JSON.stringify(sitefilter_on),
		
		search: '',
		rna_ver : C.rRNA_refseq_version,
		gen_ver : C.genomic_refseq_verson
	});
});
router.get('/tax_hierarchy', (req, res) => {
	//the json file was created from a csv of vamps taxonomy
	// using the script: taxonomy_csv2json.py in ../homd_data
	helpers.accesslog(req, res)
	// use this only if use the version 5 dhtmlx tree	( w/dynamic loading)
	// using file public/data/all_silva_taxonomy.json
	//C.dhtmlxTreeData
	//console.log(C.dhtmlxTreeData)
	res.render('pages/taxa/taxhierarchy', {
			title: 'HOMD :: Taxon Hierarchy', 
			hostname: CFG.hostname,
			data: {},
			dhtmlx: JSON.stringify(C.dhtmlxTreeData),
			rna_ver : C.rRNA_refseq_version,
			gen_ver : C.genomic_refseq_verson
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
router.get('/tax_level', (req, res) => {
	helpers.accesslog(req, res)
	res.render('pages/taxa/taxlevel', {
		title: 'HOMD :: Taxon Level', 
		hostname: CFG.hostname,
		level: 'domain',
		rna_ver : C.rRNA_refseq_version,
		gen_ver : C.genomic_refseq_verson
	});
});
//
//
router.post('/taxLevel', (req, res) => {
	
	//console.log(req.body)
	var rank = req.body.rank
	helpers.accesslog(req, res)
	const tax_resp = []
	fs.readFile(path.join(CFG.PATH_TO_DATA, C.taxcounts_fn), 'utf8', (err, data) => {
    	if (err)
      		console.log(err)
    	else
			var taxdata = JSON.parse(data);
			
			const result = C.homd_taxonomy.taxa_tree_dict_map_by_rank[rank].map(taxitem =>{
				// get lineage of taxitem
				//console.log(taxitem)
				lineage = [taxitem.taxon]
				new_search_id = taxitem.parent_id
				new_search_rank = C.RANKS[C.RANKS.indexOf(taxitem.rank)-1]
				//console.log(new_search_id,new_search_rank)
				while (new_search_id != 0){
					new_search_item = C.homd_taxonomy.taxa_tree_dict_map_by_id[new_search_id]
					//name_n_rank
					//new_search_item = new_search_parent
					lineage.unshift(new_search_item.taxon)  // adds to front of lineage array -prepends
					new_search_id = new_search_item.parent_id
				
				}
				return_obj = {}
				return_obj.item_rank = rank
				if(rank='species'){
					return_obj.otid = taxitem.otid
				}
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

router.get('/tax_download', (req, res) => {
	helpers.accesslog(req, res)
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
  helpers.accesslog(req, res)
  let myurl = url.parse(req.url, true);
  let id = myurl.query.id;

  let json = {};
  json.id = id;
  json.item = [];

  if (parseInt(id) === 0){
    
   
//console.log('in parseint 0')
//console.log(C.homd_taxonomy.taxa_tree_dict_map_by_rank['phylum'])
//console.log(C.homd_taxonomy)
    C.homd_taxonomy.taxa_tree_dict_map_by_rank["domain"].map(node => {
        //console.log('node')
        let options_obj = get_options_by_node(node);
        options_obj.checked = true;
        //console.log(options_obj)
        json.item.push(options_obj);
      }
    );
  }
  else {
    const objects_w_this_parent_id = C.homd_taxonomy.taxa_tree_dict_map_by_id[id].children_ids.map(n_id => C.homd_taxonomy.taxa_tree_dict_map_by_id[n_id]);
    objects_w_this_parent_id.map(node => {
      let options_obj = get_options_by_node(node);
      options_obj.checked = false;
      json.item.push(options_obj);
    });
  }
  //console.log(json)
  json.item.sort(function sortByAlpha(a, b) {
    return helpers.compareStrings_alpha(a.text, b.text);
  });

  console.timeEnd("TIME: tax_custom_dhtmlx");

  res.json(json);
});
/////////////////////////////////
router.get('/tax_description', (req, res) => {
	let myurl = url.parse(req.url, true);
  	let otid = myurl.query.otid;
	helpers.accesslog(req, res)
	/*
	This busy page needs:
	1  otid 		type:string
	2  status
	3  reference strains vs strain info  type:array
		Why do some pages have ref and others straininfo?
	4  Tax classification  data3 type strings
	5  16S rRNA Reference Seqs
	6  Abundance
	7  Hierarchy Structure -- what is this?
	8  body site
	9  synonyms	type:array
	10 NCBI taxid
	11 PubMed, Entrez Nucleotide and Proten Searches -- links(uses genus+species)
	12 Genome Sequence  - needs genome count and otid
	13 Ref Data: General,Citations,Pheno,Cultivability,Pevalence...
	
	
	*/
	
	if( C.taxonomy_taxonlookup[otid] == undefined){
    	req.flash('TRY AGAIN')
    	res.send('That Taxon ID: ('+otid+') was not found1 - Use the Back Arrow and select another')
    	return
  	}
	var data1 = C.taxonomy_taxonlookup[otid]
	
	if(C.taxonomy_infolookup[otid] ){
	    var data2 = C.taxonomy_infolookup[otid]
	}else{
	    console.warn('Could not find info for',otid)
	    var data2 = {}
	}
	if(C.taxonomy_lineagelookup[otid] ){
	    var data3 = C.taxonomy_lineagelookup[otid]
	}else{
	    console.warn('Could not find lineage for',otid)
	    var data3 = {}
	}
	if(C.taxonomy_refslookup[otid]){
		var data4 = C.taxonomy_refslookup[otid]
	}else{
		console.warn('Could not find refs for',otid)
		var data4 = []
	}
	
	
	res.render('pages/taxa/taxdescription', {
		title: 'HOMD :: Taxon Level', 
		hostname: CFG.hostname,
		otid: otid,
		data1: JSON.stringify(data1),
		data2: JSON.stringify(data2),
		data3: JSON.stringify(data3),
		data4: JSON.stringify(data4),
		rna_ver : C.rRNA_refseq_version,
		gen_ver : C.genomic_refseq_verson
	});
});
////////////////////////////////////////////////////////////////////////////////////
function get_options_by_node(node) {
  rankname = node.rank.charAt(0).toUpperCase() + node.rank.slice(1)
  text = rankname+' '+node.taxon
  if(node.rank=='species'){
    text = "<a href='tax_description?otid="+node.otid+"'><i>"+rankname+' '+node.taxon+'</i></a>'
  }
  let options_obj = {
    id: node.node_id,
    text: text,
    rank: node.rank,
    child: 0,
    tooltip: rankname,
  };
  if (node.children_ids.length > 0) {
    options_obj.child = 1;
    options_obj.item = [];
  }
  return options_obj;
}


module.exports = router;




