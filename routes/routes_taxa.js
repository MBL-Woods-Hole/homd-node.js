const express  = require('express');
var router   = express.Router();
const CFG   = require(app_root + '/config/config');
const fs       = require('fs-extra');
const url = require('url');
const path     = require('path');
const C		  = require(app_root + '/public/constants');
const helpers = require(app_root + '/routes/helpers/helpers');
const queries = require(app_root + '/routes/queries')


router.get('/tax_table', (req, res) => {
//router.get('/taxTable', helpers.isLoggedIn, (req, res) => {
	helpers.accesslog(req, res)
	console.log('in taxtable -get')
	helpers.show_session(req)
	let myurl = url.parse(req.url, true);
  	//console.log(myurl.query)
	req.session.tax_letter = myurl.query.k
	req.session.annot = myurl.query.annot
	send_tax_obj = Object.values(C.taxon_lookup);
	tcount = send_tax_obj.length  // total count of our filters
	var show_filters = 0
	var pgtitle = 'Taxon Table';
	if(req.session.annot){
	  	send_tax_obj = send_tax_obj.filter(item => item.genomes.length >0)
	  	show_filters = 0
	  	pgtitle = 'Human Microbial Taxa with Annotated Genomes'
	}else{
		show_filters = 1
		pgtitle = 'List of Human Microbial Taxa'
		var intiial_status_filter = ['named','unnamed','phylotype','lost']  //['dropped','nonoralref']
	
		//console.log(tax_letter)
		// filter
		send_tax_obj1 = send_tax_obj.filter(item => intiial_status_filter.indexOf(item.status.toLowerCase()) !== -1 )
		//var intiial_site_filter = ['oral', 'nasal', 'skin', 'vaginal', 'unassigned'];
		//send_tax_obj = send_tax_obj.filter(item => intiial_site_filter.indexOf(item.site[0].toLowerCase()) !== -1)
	
		if(req.session.tax_letter){
		   // COOL....
		   send_tax_obj = send_tax_obj1.filter(item => item.genus.charAt(0) === req.session.tax_letter)
		}else{
			send_tax_obj = send_tax_obj1
		}
		// table sort done via client side js library sorttable: 
		// https://www.kryogenix.org/code/browser/sorttable
		//console.log(send_tax_obj[0])
    }
    
    // Here we add the genome size formatting on the fly
    send_tax_obj.map(function(el){
	      el.gsize = ''
	      //console.log(el)
	      if(el.genomes.length === 0){
	      	el.gsize = ''
	      }else if(el.genomes.length === 1 && el.genomes[0] in C.genome_lookup){
	        el.gsize = helpers.format_Mbps(C.genome_lookup[el.genomes[0]].tlength).toString()
	      }else{  // More than one genome
	        var size_array = el.genomes.map( (x) =>{
	          if(x in C.genome_lookup && C.genome_lookup[x].tlength !== 0){
	            return C.genome_lookup[x].tlength 
	          }
	        })
	        var min = Math.min.apply(Math, size_array.filter(Boolean))  // this removes 'falsy' from array
	        var max = Math.max.apply(Math, size_array.filter(Boolean))
	        console.log(min,max,size_array)
	        if(min === max){
	        	el.gsize = helpers.format_Mbps(min)
	        }else{
	        	el.gsize = helpers.format_Mbps(min)+' - '+helpers.format_Mbps(max)
	        }
	      }
	})
    console.log(send_tax_obj[0])
    //sort
    send_tax_obj.sort(function (a, b) {
      return helpers.compareStrings_alpha(a.genus, b.genus);
    });
	res.render('pages/taxa/taxtable', {
		title: 'HOMD :: Taxon Table', 
		pgtitle:pgtitle,
		config : JSON.stringify({hostname:CFG.HOSTNAME,env:CFG.ENV}),
		res: JSON.stringify(send_tax_obj),
		count: Object.keys(send_tax_obj).length,
		tcount: tcount,
		letter: req.session.tax_letter,
		statusfltr: JSON.stringify(C.tax_status_on) ,  // default
		sitefltr: JSON.stringify(C.tax_sites_on),  //default
		show_filters:show_filters,
		search: '',
		ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
	});
});
router.post('/tax_table', (req, res) => {
	helpers.accesslog(req, res)
	console.log('in taxtable -post')
	tcount = C.taxon_lookup.length
	//helpers.show_session(req)
	console.log(req.body)
	//plus valid
	valid = req.body.valid  // WHAT IS THIS???
	// filter_status = ['named','unnamed','phylotype','lost','dropped']
// 	filter_sites = ['oral','nasal','skin','vaginal','unassigned','nonoralref']
	pgtitle = 'List of Human Microbial Taxa'
	show_filters = 1
	statusfilter_on =[]
	sitefilter_on  = []
	for(i in req.body){
		if(C.tax_status_all.indexOf(i) !== -1){
		   statusfilter_on.push(i)
		}
		if(C.tax_sites_all.indexOf(i) !== -1){
		   sitefilter_on.push(i)
		}
	}
	console.log('statusfilter_on',statusfilter_on)
	console.log('sitefilter_on',sitefilter_on)
	// letterfilter
	send_tax_obj0 = Object.values(C.taxon_lookup);
	tcount = send_tax_obj0.length
	if(req.session.tax_letter){
	   // COOL....
	   send_tax_obj1 = send_tax_obj0.filter(item => item.genus.charAt(0) === req.session.tax_letter)
	}else{
		send_tax_obj1 = send_tax_obj0
	}
	
	// error if site is empty list
	//throw new error
	send_tax_obj2 = send_tax_obj1.filter(item => sitefilter_on.indexOf(item.site[0].toLowerCase()) !== -1)
	
	send_tax_obj3 = send_tax_obj2.filter(item => statusfilter_on.indexOf(item.status.toLowerCase()) !== -1 )    
	
	//console.log('send_tax_objC',send_tax_obj)
	// use session for taxletter
	res.render('pages/taxa/taxtable', {
		title: 'HOMD :: Taxon Table', 
		pgtitle:pgtitle,
		config : JSON.stringify({hostname:CFG.HOSTNAME,env:CFG.ENV}),
		res: JSON.stringify(send_tax_obj3),
		count: Object.keys(send_tax_obj3).length,
		tcount: tcount,
		letter: req.session.tax_letter,
		statusfltr: JSON.stringify(statusfilter_on),
		sitefltr:JSON.stringify(sitefilter_on),
		show_filters:show_filters,
		search: '',
		ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
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
			config : JSON.stringify({hostname:CFG.HOSTNAME,env:CFG.ENV}),
			data: {},
			dhtmlx: JSON.stringify(C.dhtmlxTreeData),
			ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
		});
		
	
});
router.get('/tax_level', (req, res) => {
	helpers.accesslog(req, res)
	var oral;
	// if(req.session.counts_file === C.nonoral_taxcounts_fn){
// 		req.session.counts_file = C.oral_taxcounts_fn 
// 		req.session.tax_obj = C.oral_homd_taxonomy
// 		oral=0
// 	}else{
// 		req.session.counts_file = C.nonoral_taxcounts_fn  // default
// 		req.session.tax_obj = C.nonoral_homd_taxonomy
// 		oral=1
// 	}
    req.session.counts_file = C.taxcounts_fn  // default
	req.session.tax_obj = C.homd_taxonomy
    console.log(req.session.counts_file)
	
	res.render('pages/taxa/taxlevel', {
		title: 'HOMD :: Taxon Level', 
		config : JSON.stringify({hostname:CFG.HOSTNAME,env:CFG.ENV}),
		level: 'domain',
		oral: oral,
		ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
	});
});
//
//
router.post('/taxLevel', (req, res) => {
	
	//console.log(req.body)
	var rank = req.body.rank
	helpers.accesslog(req, res)
	const tax_resp = []
	fs.readFile(path.join(CFG.PATH_TO_DATA, req.session.counts_file), 'utf8', (err, data) => {
    	if (err)
      		console.log(err)
    	else
			var taxdata = JSON.parse(data);
			
			const result = req.session.tax_obj.taxa_tree_dict_map_by_rank[rank].map(taxitem =>{
				// get lineage of taxitem
				//console.log(taxitem)
				lineage = [taxitem.taxon]
				new_search_id = taxitem.parent_id
				new_search_rank = C.ranks[C.ranks.indexOf(taxitem.rank)-1]
				//console.log(new_search_id,new_search_rank)
				while (new_search_id !== 0){
					new_search_item = req.session.tax_obj.taxa_tree_dict_map_by_id[new_search_id]

					lineage.unshift(new_search_item.taxon)  // adds to front of lineage array -prepends
					new_search_id = new_search_item.parent_id
				
				}
				return_obj = {}
				return_obj.item_rank = rank
				
				if(rank === 'species'){
					return_obj.otid = taxitem.otid
					console.log('species')
					// here we 'fix' the species to exclude the genus so that
					// the whole lineage can be used as an index for the counts
					genus = lineage[lineage.length - 2]
					species = lineage[lineage.length - 1]
					new_sp = species.replace(genus,'')
					lineage[lineage.length - 1] = new_sp.trim()
					
				}
				return_obj.item_taxon = lineage[lineage.length - 1]
				return_obj.parent_rank = C.ranks[C.ranks.indexOf(rank) - 1]
				return_obj.parent_taxon = lineage[lineage.length - 2]
				
				return_obj.tax_count = taxdata[lineage.join(';')].tax_cnt
				return_obj.gne_count = taxdata[lineage.join(';')].gcnt
				return_obj.rrna_count = taxdata[lineage.join(';')].refcnt
				
				return_obj.lineage = lineage.join(';')
				
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
router.post('/oral_counts_toggle', (req, res) => {
	var oral = req.body.oral
	helpers.accesslog(req, res)
	console.log('oral ',oral)
	// if(oral === 'false'){
// 		req.session.counts_file = C.nonoral_taxcounts_fn  // default
// 	}else{
// 		req.session.counts_file = C.oral_taxcounts_fn  
// 	}
	req.session.counts_file = C.taxcounts_fn  
	res.send({ok:'ok'});

});
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
//     
   //  console.log(C.nonoral_homd_taxonomy.taxa_tree_dict_map_by_rank["domain"])
//     console.log(C.nonoral_homd_taxonomy.taxa_tree_dict_map_by_id["954"])
//     console.log(C.nonoral_homd_taxonomy.taxa_tree_dict_map_by_id["955"])
//     console.log(C.nonoral_homd_taxonomy.taxa_tree_dict_map_by_id["956"])
//     console.log(C.nonoral_homd_taxonomy.taxa_tree_dict_map_by_id["957"])
//     console.log(C.nonoral_homd_taxonomy.taxa_tree_dict_map_by_id["958"])
    //console.log(C.homd_taxonomy.taxa_tree_dict_map_by_id["7"])
    
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
	
	if( C.taxon_lookup[otid] === undefined){
    	req.flash('TRY AGAIN')
    	res.send('That Taxon ID: ('+otid+') was not found1 - Use the Back Arrow and select another')
    	return
  	}
	var data1 = C.taxon_lookup[otid]
	
	if(C.taxon_info_lookup[otid] ){
	    var data2 = C.taxon_info_lookup[otid]
	}else{
	    console.warn('Could not find info for',otid)
	    var data2 = {}
	}
	if(C.taxon_lineage_lookup[otid] ){
	    var data3 = C.taxon_lineage_lookup[otid]
	}else{
	    console.warn('Could not find lineage for',otid)
	    var data3 = {}
	}
	if(C.taxon_references_lookup[otid]){
		var data4 = C.taxon_references_lookup[otid]
	}else{
		console.warn('Could not find references for',otid)
		var data4 = []
	}
	if(C.refseq_lookup[otid]){
		var data5 = C.refseq_lookup[otid]
	}else{
		console.warn('Could not find refseqs for',otid)
		var data5 = []
	}
	console.log(data2.general)
	res.render('pages/taxa/taxdesc', {
		title: 'HOMD :: Taxon Info', 
		config : JSON.stringify({hostname:CFG.HOSTNAME,env:CFG.ENV}),
		otid: otid,
		data1: JSON.stringify(data1),
		data2: JSON.stringify(data2),
		data3: JSON.stringify(data3),
		data4: JSON.stringify(data4),
		data5: JSON.stringify(data5),
		ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
	});
});


router.post('/get_refseq', (req, res) => {
	console.log(req.body)
	var refseq_id = req.body.refid;

	// express deprecated req.param(name): Use req.params, req.body, or req.query
	// See https://discuss.codecademy.com/t/whats-the-difference-between-req-params-and-req-query/405705
	//FIXME There are 4 fields which do I query???
	TDBConn.query(queries.get_refseq_query(refseq_id), (err, rows) => {
		seqstr = rows[0].seq_trim28
		arr = helpers.chunkSubstr(seqstr,60)
		html = arr.join('<br>')
		res.send(html)
	})
});

router.get('/tax_download', (req, res) => {
	helpers.accesslog(req, res)
	res.render('pages/taxa/taxdownload', {
		title: 'HOMD :: Tax Download', 
		config : JSON.stringify({hostname:CFG.HOSTNAME,env:CFG.ENV}), 
		ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
	});
});
router.get('/dld_ttable', (req, res) => {
	helpers.accesslog(req, res)
	console.log(req.body)
	let myurl = url.parse(req.url, true);
  	let type = myurl.query.type;
	// type = browser text or excel
	var table_tsv = create_table('ttable','browser')
	if(type === 'browser'){
	    res.set('Content-Type', 'text/plain');  // <= important - allows tabs to display
	}else if(type === 'text'){
	    res.set({"Content-Disposition":"attachment; filename=\"HOMD_taxon_table.txt\""});
	}else if(type === 'excel'){
	    res.set({"Content-Disposition":"attachment; filename=\"HOMD_taxon_table.xls\""});
	}else{
	    // error
	    console.log('Download table format ERROR')
	}
	res.send(table_tsv)
	res.end()
});

// router.post('/dld_ttable', (req, res) => {
// 	helpers.accesslog(req, res)
// 	console.log(req.body)
// 	// req.body.type = text or excel <= for download
// 	// maybe use res.download
// 	res.set({"Content-Disposition":"attachment; filename=\"req.params.name\""});
// 	res.send('okay done');
// 	
// 	//res.send('ok')
// 	
// });

////////////////////////////////////////////////////////////////////////////////////
function get_options_by_node(node) {
  rankname = node.rank.charAt(0).toUpperCase() + node.rank.slice(1)
  text = rankname+' '+node.taxon
  if(node.rank ==='species'){
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

function create_table(source, type) {

    if(source === 'ttable' && type === 'browser'){
        obj1 = C.taxon_lookup
        obj2 = C.taxon_lineage_lookup
        obj3 = C.taxon_info_lookup 
        var headers_row = ["HMT_ID","Domain","Phylum","Class","Order","Family","Genus","Species","Status","Body_site","Warning","Type_strain","16S_rRNA","Clone_count","Clone_%","Clone_rank","Synonyms","NCBI_taxon_id","NCBI_pubmed_count","NCBI_nucleotide_count","NCBI_protein_count","Genome_ID","General_info","Cultivability","Phenotypic_characteristics","Prevalence","Disease","References"]
        
        txt =  headers_row.join('\t')
        
        for(otid in obj1){
            if(otid in obj2 && otid in obj3){
               o1 = obj1[otid]
               o2 = obj2[otid]
               o3 = obj3[otid]
            
               //console.log(o2)
               var r = [("000" + otid).slice(-3),o2.domain,o2.phylum,o2.klass,o2.order,o2.family,o2.genus,o2.species,o1.status,o1.site,o1.warning,o1.type_strain,,,,,o1.synonyms,o1.ncbi_taxid,,,,o1.genomes,o3.general,o3.culta,o3.pheno,o3.prev,o3.disease,,]
               row = r.join('\t')
               txt += '\n'+row
            }
        }
    }   
    //console.log(txt)
    return txt
}        
        
        
        
   


module.exports = router;




