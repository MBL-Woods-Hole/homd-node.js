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
	var page = myurl.query.page
	// if( !req.session.tax_letter && !req.session.annot && !page){
// 	   page = 1
// 	} 
	var send_tax_obj = Object.values(C.taxon_lookup);
	console.log('C.taxon_lookup[9]',C.taxon_lookup[9])
	
	// FIX THIS IF SELECT DROPPED OR NONORAL
	send_tax_obj = send_tax_obj.filter(item => (item.status !== 'Dropped' && item.status !== 'NonOralRef'))
	var tcount = send_tax_obj.length  // total count of our filters
	
	var show_filters = 0
	var pgtitle = 'Taxon Table';
	var count_text = ''
	if(req.session.annot){
	  	// grab only the taxa that have genomes
	  	send_tax_obj = send_tax_obj.filter(item => item.genomes.length >0)
	  	show_filters = 0
	  	pgtitle = 'Human Microbial Taxa with Annotated Genomes'
	}else{
		show_filters = 1
		pgtitle = 'List of Human Microbial Taxa'
		var intiial_status_filter = C.tax_status_on  //['named','unnamed','phylotype','lost']  // no['dropped','nonoralref']
	
		//console.log(tax_letter)
		// filter
		send_tax_obj1 = send_tax_obj.filter(item => intiial_status_filter.indexOf(item.status.toLowerCase()) !== -1 )
		var intiial_site_filter = C.tax_sites_on  //['oral', 'nasal', 'skin', 'vaginal', 'unassigned'];
		send_tax_obj2 = send_tax_obj1.filter( function(e) {
	    if(e.sites.length > 0 && intiial_site_filter.indexOf(e.sites[0].toLowerCase()) !== -1){
	       return e
	    }
	}) 
	
		if(req.session.tax_letter){
		   // COOL....
		   send_tax_obj = send_tax_obj2.filter(item => item.genus.charAt(0) === req.session.tax_letter)
		}else{
			send_tax_obj = send_tax_obj2
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
	        //console.log(min,max,size_array)
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
   
    if(page){
	    var trows = send_tax_obj.length  //820
        console.log('trows',trows)
        var row_per_page = 200
        var number_of_pages = Math.ceil(trows/row_per_page)
    
        console.log('number_of_pages',number_of_pages)
    
        var show_page = page
        if(show_page === 1){
            var send_list = send_tax_obj.slice(0,row_per_page)  // first 200
        }else{
            var send_list = send_tax_obj.slice(row_per_page*(show_page-1),row_per_page*show_page)  // second 200
        }
        var page_form = '<br><small>On Page: '+show_page.toString()+' of '+number_of_pages.toString()+':: Change Page: ['
        for(var i=1;i<=number_of_pages;i++){
            if(parseInt(page) === i){
              page_form += i.toString()+"<input checked type='radio' name='page' value='"+i.toString()+"' onclick=\"location.href='tax_table?page="+i.toString()+"'\"> "
            }else{
              page_form += i.toString()+"<input type='radio' name='page' value='"+i.toString()+"' onclick=\"location.href='tax_table?page="+i.toString()+"'\"> "
            }
            
        }
        page_form += ']</small>'
	}else{
	    page_form = ''
	    send_list = send_tax_obj
	}
	
	//var count_text = get_count_text_n_page_form(page)
	res.render('pages/taxa/taxtable', {
		title: 'HOMD :: Taxon Table', 
		pgtitle:pgtitle,
		config : JSON.stringify({hostname:CFG.HOSTNAME,env:CFG.ENV}),
		res: JSON.stringify(send_list),
		count: Object.keys(send_list).length,
		tcount: tcount,
		//count_text:count_text,
		letter: req.session.tax_letter,
		statusfltr: JSON.stringify(C.tax_status_on) ,  // default
		sitefltr: JSON.stringify(C.tax_sites_on),  //default
		show_filters:show_filters,
		search: '',
		page_form:page_form,
		ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
	});
});

router.post('/tax_table', (req, res) => {
	helpers.accesslog(req, res)
	console.log('in taxtable -post')
	
	//helpers.show_session(req)
	console.log(req.body)
	//plus valid
	valid = req.body.valid  // WHAT IS THIS???
	

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
	send_tax_obj = send_tax_obj0.filter(item => (item.status !== 'Dropped' && item.status !== 'NonOralRef'))
	var tcount = send_tax_obj.length
	if(req.session.tax_letter){
	   // COOL....
	   send_tax_obj1 = send_tax_obj.filter(item => item.genus.charAt(0) === req.session.tax_letter)
	}else{
		send_tax_obj1 = send_tax_obj
	}
	
	// error if site is empty list
	//throw new error
	//send_tax_obj2 = send_tax_obj1.filter( item => sitefilter_on.indexOf(item.sites[0].toLowerCase()) !== -1)
	send_tax_obj2 = send_tax_obj1.filter( function(e) {
	    if(e.sites.length > 0 && sitefilter_on.indexOf(e.sites[0].toLowerCase()) !== -1){
	    //if(e.sites.length > 0){
	      //sitefilter_on.indexOf(e.sites[0].toLowerCase()) !== -1
	      return e
	    }else{
	    }
	}) 
	
	
	send_tax_obj3 = send_tax_obj2.filter(item => statusfilter_on.indexOf(item.status.toLowerCase()) !== -1 )    
	send_tax_obj3.sort(function (a, b) {
      return helpers.compareStrings_alpha(a.genus, b.genus);
    });
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
		page_form:'',
		ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
	});
});
router.get('/tax_hierarchy', (req, res) => {
	//the json file was created from a csv of vamps taxonomy
	// using the script: taxonomy_csv2json.py in ../homd_data
	helpers.accesslog(req, res)
	
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
	//var oral;
    req.session.counts_file = C.taxcounts_fn  // default
	req.session.tax_obj = C.homd_taxonomy
    console.log(req.session.counts_file)
	
	res.render('pages/taxa/taxlevel', {
		title: 'HOMD :: Taxon Level', 
		config : JSON.stringify({hostname:CFG.HOSTNAME,env:CFG.ENV}),
		level: 'domain',
		//oral: oral,
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
					// console.log('species')
// 					// here we 'fix' the species to exclude the genus so that
// 					// the whole lineage can be used as an index for the counts
// 					genus = lineage[lineage.length - 2]
// 					species = lineage[lineage.length - 1]
// 					new_sp = species.replace(genus,'')
// 					lineage[lineage.length - 1] = new_sp.trim()
					
				}
				return_obj.item_taxon = lineage[lineage.length - 1]
				return_obj.parent_rank = C.ranks[C.ranks.indexOf(rank) - 1]
				return_obj.parent_taxon = lineage[lineage.length - 2]
				console.log(lineage)
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
            //console.log(node)
            let lineage = make_lineage(node)  // [str obj]
            cts = get_counts(lineage[0])
            //console.log(node)
            
            let options_obj = get_options_by_node(node);
            options_obj.text = options_obj.text + ' '+cts
            options_obj.checked = true;
            //console.log(options_obj)
            json.item.push(options_obj);
          }
        );
  }else {
        const objects_w_this_parent_id = C.homd_taxonomy.taxa_tree_dict_map_by_id[id].children_ids.map(n_id => C.homd_taxonomy.taxa_tree_dict_map_by_id[n_id]);
        objects_w_this_parent_id.map(node => {
          let lineage = make_lineage(node)  // [str obj]
          cts = get_counts(lineage[0])
          let options_obj = get_options_by_node(node);
          options_obj.text = options_obj.text + ' '+cts
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
	//console.log(data1)
	//console.log(data5)
	// get_genus photos
	node = C.homd_taxonomy.taxa_tree_dict_map_by_name_n_rank[data3.species+'_species']
	var lineage_list = make_lineage(node)  // [str obj]
	var image_array = find_images('species',otid,data3.species)
	//console.log('genus',data3.genus)
	//console.log('imgs',image_array)
	//console.log('regex1',lineage_list[0].replace(/.*(;)/,'<em>'))+'</em>'
	//console.log('regex2',lineage_list[0].split(';').pop())
	//console.log('regex3',lineage_list[0].split(';').slice(0,-1).join('; ') +'; <em>'+lineage_list[0].split(';').pop()+'</em>')
	lineage_string = lineage_list[0].split(';').slice(0,-1).join('; ') +'; <em>'+lineage_list[0].split(';').pop()+'</em>'
	res.render('pages/taxa/taxdesc', {
		title: 'HOMD :: Taxon Info', 
		config : JSON.stringify({hostname:CFG.HOSTNAME,env:CFG.ENV}),
		otid: otid,
		image_array:JSON.stringify(image_array),
		data1: JSON.stringify(data1),
		data2: JSON.stringify(data2),
		data3: JSON.stringify(data3),
		data4: JSON.stringify(data4),
		data5: JSON.stringify(data5),
		lineage: lineage_string,
		ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
	});
});


router.post('/get_refseq', (req, res) => {
	console.log(req.body)
	var refseq_id = req.body.refid;

	// express deprecated req.param(name): Use req.params, req.body, or req.query
	// See https://discuss.codecademy.com/t/whats-the-difference-between-req-params-and-req-query/405705
	//FIXME There are 4 fields which do I query???
	//The 16S sequence pulled from the taxon page should be seq_trim9, which is longest.
	TDBConn.query(queries.get_refseq_query(refseq_id), (err, rows) => {
		seqstr = rows[0].seq_trim9
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
router.get('/dld_table', (req, res) => {
	helpers.accesslog(req, res)
	console.log(req.body)
	let myurl = url.parse(req.url, true);
  	let type = myurl.query.type;
	// type = browser text or excel
	var table_tsv = create_table('table','browser')
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

// router.get('/domain/:name', (req, res) => {
// 	helpers.accesslog(req, res)
// 	console.log(req.body)
// 	
//   	console.log(req.params.name)
// 	res.render('pages/taxa/domain', {
// 			title: 'HOMD :: Domain', 
// 			config : JSON.stringify({hostname:CFG.HOSTNAME,env:CFG.ENV}),
// 			data: {},
// 			tax_name: req.params.name,
// 			rank:'Domain',
// 			ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
// 		});
// 	
// });
// router.get('/phylum/:name', (req, res) => {
// 	helpers.accesslog(req, res)
// 	console.log(req.body)
// 	
//   	console.log(req.params.name)
// 	res.render('pages/taxa/phylum', {
// 			title: 'HOMD :: Phylum', 
// 			config : JSON.stringify({hostname:CFG.HOSTNAME,env:CFG.ENV}),
// 			data: {},
// 			tax_name: req.params.name,
// 			rank:'Phylum',
// 			ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
// 		});
// 	
// });
// router.get('/class/:name', (req, res) => {
// 	helpers.accesslog(req, res)
// 	console.log(req.body)
// 	
//   	console.log(req.params.name)
// 	res.render('pages/taxa/class', {
// 			title: 'HOMD :: Class', 
// 			config : JSON.stringify({hostname:CFG.HOSTNAME,env:CFG.ENV}),
// 			data: {},
// 			tax_name: req.params.name,
// 			rank:'Class',
// 			ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
// 		});
// 	
// });
// router.get('/order/:name', (req, res) => {
// 	helpers.accesslog(req, res)
// 	console.log(req.body)
// 	
//   	console.log(req.params.name)
// 	res.render('pages/taxa/order', {
// 			title: 'HOMD :: Order', 
// 			config : JSON.stringify({hostname:CFG.HOSTNAME,env:CFG.ENV}),
// 			data: {},
// 			tax_name: req.params.name,
// 			rank:'Order',
// 			ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
// 		});
// 	
// });
// router.get('/family/:name', (req, res) => {
// 	helpers.accesslog(req, res)
// 	console.log(req.body)
// 	
//   	console.log(req.params.name)
// 	res.render('pages/taxa/family', {
// 			title: 'HOMD :: Family', 
// 			config : JSON.stringify({hostname:CFG.HOSTNAME,env:CFG.ENV}),
// 			data: {},
// 			tax_name: req.params.name,
// 			rank:'Family',
// 			ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
// 		});
// 	
// });
// router.get('/genus/:name', (req, res) => {
// 	helpers.accesslog(req, res)
// 	console.log(req.body)
// 	
//   	console.log(req.params.name)
// 	res.render('pages/taxa/genus', {
// 			title: 'HOMD :: Genus', 
// 			config : JSON.stringify({hostname:CFG.HOSTNAME,env:CFG.ENV}),
// 			data: {},
// 			tax_name: req.params.name,
// 			rank:'Genus',
// 			ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
// 		});
// 	
// });
// router.get('/species/:name', (req, res) => {
// 	helpers.accesslog(req, res)
// 	console.log(req.body)
// 	
//   	console.log(req.params.name)
// 	res.render('pages/taxa/species', {
// 			title: 'HOMD :: Species', 
// 			config : JSON.stringify({hostname:CFG.HOSTNAME,env:CFG.ENV}),
// 			data: {},
// 			tax_name: req.params.name,
// 			rank:'Species',
// 			ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
// 		});
// 	
// });
router.get('/life', (req, res) => {
	helpers.accesslog(req, res)
	console.log('in LIFE')
	let myurl = url.parse(req.url, true);
  	let tax_name = myurl.query.name;
  	let rank = (myurl.query.rank)
  	console.log('rank',rank)
	console.log('tax_name',tax_name)
  	if(tax_name){
		tax_name = myurl.query.name.replace(/"/g,'')
	}
	var image_array =[]
	if(rank)
	   image_array = find_images(rank,'',tax_name)
	
	let taxa_list =[]
	let next_rank,show_ranks,rank_id,last_rank,space,childern_ids,html,taxon,genus,species,rank_display
	var lineage_list = ['']
	
	//next_rank = C.ranks[C.ranks.indexOf(rank) +1]
	
	html =''
	if(!rank){
	   taxa_list = C.homd_taxonomy.taxa_tree_dict_map_by_rank['domain'].map(a => a.taxon)
	   next_rank = 'domain'
	   html += '<tr><td>&nbsp;Domains</td><td>'
	   for(n in taxa_list){
		      html += "<a title='"+taxa_list[n]+"' href='life?rank="+next_rank+"&name=\""+taxa_list[n]+"\"'>"+taxa_list[n]+'</a><br>'
	   }
	   html += '</td></tr>'
	}else{
		//console.log(upto)
		node = C.homd_taxonomy.taxa_tree_dict_map_by_name_n_rank[tax_name+'_'+rank]
		var lineage_list = make_lineage(node)  // [str obj]
		//var lineage = make_lineage_obj(rank,tax_name)
		// what should lineage looklike??
		// {domain:'bacteria',phylum:'firmicutes'}
		//console.log('string_lineage:',lineage_list[0])
	    //console.log('lineage OBJ1',lineage_list[1])
	    //console.log('string_OBj2:',lineage)
	    
		rank_id = C.ranks.indexOf(rank) +2
		show_ranks = C.ranks.slice(0,rank_id)
		
		//console.log('show_ranks',show_ranks)
		last_rank = show_ranks[show_ranks.length -1]
		
		
		space = '&nbsp;' 
		for(i in show_ranks){
		   
		   rank_display = get_rank_display(show_ranks[i],false)
		   if(show_ranks[i] != last_rank){  // Last row
		      
		      html += '<tr><td>'+space+rank_display+'</td><td>'
			  html += "<a title='"+lineage_list[1][show_ranks[i]]+"' href='life?rank="+show_ranks[i]+"&name=\""+lineage_list[1][show_ranks[i]]+"\"'>"+lineage_list[1][show_ranks[i]]+'</a><br>'
			  html += '</td></tr>'
		   }else{  // Gather rows before the last row
		     
			 next_rank = C.ranks[C.ranks.indexOf(rank) +1]
			 childern_ids = C.homd_taxonomy.taxa_tree_dict_map_by_name_n_rank[tax_name+'_'+rank].children_ids
			 
			 for(n in childern_ids){
			   taxon = C.homd_taxonomy.taxa_tree_dict_map_by_id[childern_ids[n]].taxon
			   taxa_list.push(taxon)
			 }
			 var use_plural = false;
			 if(taxa_list.length > 1){
			    use_plural = true;
			 }
			 rank_display = get_rank_display(show_ranks[i],use_plural)
			 //console.log('rank_displayx',rank_display)
			 
			 html += '<tr><td>'+space+rank_display+'</td><td>'
			 for(n in taxa_list){
				 if(rank === 'genus'){
				    otid = C.homd_taxonomy.taxa_tree_dict_map_by_name_n_rank[taxa_list[n]+'_'+'species'].otid
				    //console.log('otid',otid)
					html += space+'<em>'+taxa_list[n]+"</em> (<a title='"+taxa_list[n]+"' href='tax_description?otid="+otid+"'>Taxon-ID: "+otid+'</a>)<br>'
				 }else{
					html += space+"<a title='"+taxa_list[n]+"' href='life?rank="+next_rank+"&name=\""+taxa_list[n]+"\"'>"+taxa_list[n]+'</a><br>'
				 }
			 }
			 html += '</td></tr>'
		  }
		  space += '&nbsp;'
		}

	}
	
	//console.log('regex1',lineage_list[0].replace(/.*(;)/,'<em>'))+'</em>'
	//console.log('regex2',lineage_list[0].split(';').pop())
	//console.log('regex3',lineage_list[0].split(';').slice(0,-1).join('; ') +'; <em>'+lineage_list[0].split(';').pop()+'</em>')
	var title = 'Life'
	if(rank)
	    title = helpers.capitalizeFirst(rank)
	
	lineage_string = lineage_list[0].split(';').join('; ')
	res.render('pages/taxa/life', {
			title: 'HOMD :: '+title, 
			config : JSON.stringify({hostname:CFG.HOSTNAME,env:CFG.ENV}),
			data: {},
			tax_name: tax_name,
			//headline: 'Life: Cellular Organisms',
			rank: rank,
			taxa_list: JSON.stringify(taxa_list),
			image_array:JSON.stringify(image_array),
			html: html,
			lineage:lineage_string,
			ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
		});
	
});
////////////////////////////////////////////////////////////////////////////////////
/////////////////////// FUNCTIONS //////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
function get_rank_display(rank,use_plural){
   var display_name = 'not_working'
   if(use_plural){
     if(rank === 'domain'){
     	display_name = 'Domains'
     }else if(rank === 'phylum'){
     	display_name = 'Phyla'
     }else if(rank === 'klass'){
     	display_name = 'Classes'
     }else if(rank === 'order'){
     	display_name = 'Orders'
     }else if(rank === 'family'){
     	display_name = 'Families'
     }else if(rank === 'genus'){
     	display_name = 'Genuses'
     }else if(rank === 'species'){
        display_name = 'Species'
     }
   }else{
   	if(rank === 'klass'){
       display_name = 'Class'
     
     }else{
        display_name = helpers.capitalizeFirst(rank)
     }
   }
   
   return display_name
    
}
// function make_lineage_obj(rank, name){
//     let lineage = {}
//     lineage[rank] = name
//     let newname,newrank
// 	let parent_id = C.homd_taxonomy.taxa_tree_dict_map_by_name_n_rank[name+'_'+rank].parent_id
// 	//phylum
// 	if(parent_id){
// 		parent_node = C.homd_taxonomy.taxa_tree_dict_map_by_id[parent_id]
// 		//console.log(parent_node)
// 		newname = parent_node.taxon
// 		newrank = parent_node.rank
// 		lineage[newrank] = newname
// 		parent_id = C.homd_taxonomy.taxa_tree_dict_map_by_name_n_rank[newname+'_'+newrank].parent_id
// 		//klass
// 		if(parent_id){
// 			parent_node = C.homd_taxonomy.taxa_tree_dict_map_by_id[parent_id]
// 			//console.log(parent_node)
// 			newname = parent_node.taxon
// 			newrank = parent_node.rank
// 			lineage[newrank] = newname
// 			parent_id = C.homd_taxonomy.taxa_tree_dict_map_by_name_n_rank[newname+'_'+newrank].parent_id
// 			//order
// 			if(parent_id){
// 				parent_node = C.homd_taxonomy.taxa_tree_dict_map_by_id[parent_id]
// 				//console.log(parent_node)
// 				newname = parent_node.taxon
// 				newrank = parent_node.rank
// 				lineage[newrank] = newname
// 				parent_id = C.homd_taxonomy.taxa_tree_dict_map_by_name_n_rank[newname+'_'+newrank].parent_id
// 				//family
// 				if(parent_id){
// 					parent_node = C.homd_taxonomy.taxa_tree_dict_map_by_id[parent_id]
// 					//console.log(parent_node)
// 					newname = parent_node.taxon
// 					newrank = parent_node.rank
// 					lineage[newrank] = newname
// 					parent_id = C.homd_taxonomy.taxa_tree_dict_map_by_name_n_rank[newname+'_'+newrank].parent_id
// 					//genus
// 					if(parent_id){
// 						parent_node = C.homd_taxonomy.taxa_tree_dict_map_by_id[parent_id]
// 						//console.log(parent_node)
// 						newname = parent_node.taxon
// 						newrank = parent_node.rank
// 						lineage[newrank] = newname
// 						parent_id = C.homd_taxonomy.taxa_tree_dict_map_by_name_n_rank[newname+'_'+newrank].parent_id
// 						//species
// 						if(parent_id){
// 							parent_node = C.homd_taxonomy.taxa_tree_dict_map_by_id[parent_id]
// 							//console.log(parent_node)
// 							newname = parent_node.taxon
// 							newrank = parent_node.rank
// 							lineage[newrank] = newname
// 							
// 						}
// 					}
// 				}
// 			}
// 		}
// 	}
// 		 
// 	return lineage
// }
// 



////////////
function make_lineage(node){
    console.log(node)
    let lineage =''
    let lineage_obj = {}
    let tax_obj = C.homd_taxonomy.taxa_tree_dict_map_by_id
    if(node.parent_id===0){
        lineage = node.taxon
        lineage_obj.domain = node.taxon
    }else if(node.rank==='phylum'){
        let dn = C.homd_taxonomy.taxa_tree_dict_map_by_id[node.parent_id]
        lineage = dn.taxon+';'+node.taxon
        lineage_obj.domain = dn.taxon
        lineage_obj.phylum = node.taxon
    }else if(node.rank==='klass'){
        let pn = tax_obj[node.parent_id]
        let dn = tax_obj[pn.parent_id]
        lineage = dn.taxon+';'+pn.taxon+';'+node.taxon
        lineage_obj.domain = tax_obj[pn.parent_id].taxon
        lineage_obj.phylum = tax_obj[node.parent_id].taxon
        lineage_obj.klass = node.taxon
    }else if(node.rank==='order'){
        let kn = tax_obj[node.parent_id]
        let pn = tax_obj[kn.parent_id]
        let dn = tax_obj[pn.parent_id]
        lineage = dn.taxon+';'+pn.taxon+';'+kn.taxon+';'+ node.taxon
        lineage_obj.domain = tax_obj[pn.parent_id].taxon
        lineage_obj.phylum = tax_obj[kn.parent_id].taxon
        lineage_obj.klass = tax_obj[node.parent_id].taxon
        lineage_obj.order = node.taxon
    }else if(node.rank==='family'){
        let on = tax_obj[node.parent_id]
        let kn = tax_obj[on.parent_id]
        let pn = tax_obj[kn.parent_id]
        let dn = tax_obj[pn.parent_id]
        lineage = dn.taxon+';'+pn.taxon+';'+kn.taxon+';'+ on.taxon+';'+   node.taxon
        lineage_obj.domain = tax_obj[pn.parent_id].taxon
        lineage_obj.phylum = tax_obj[kn.parent_id].taxon
        lineage_obj.klass = tax_obj[on.parent_id].taxon
        lineage_obj.order = tax_obj[node.parent_id].taxon
        lineage_obj.family = node.taxon
    }else if(node.rank==='genus'){
        let fn = tax_obj[node.parent_id]
        let on = tax_obj[fn.parent_id]
        let kn = tax_obj[on.parent_id]
        let pn = tax_obj[kn.parent_id]
        let dn = tax_obj[pn.parent_id]
        lineage = dn.taxon+';'+pn.taxon+';'+kn.taxon+';'+ on.taxon+';'+ fn.taxon+';'+  node.taxon
        lineage_obj.domain = tax_obj[pn.parent_id].taxon
        lineage_obj.phylum = tax_obj[kn.parent_id].taxon
        lineage_obj.klass = tax_obj[on.parent_id].taxon
        lineage_obj.order = tax_obj[fn.parent_id].taxon
        lineage_obj.family = tax_obj[node.parent_id].taxon
        lineage_obj.genus = node.taxon
    }else if(node.rank==='species'){
        let gn = tax_obj[node.parent_id]
        let fn = tax_obj[gn.parent_id]
        let on = tax_obj[fn.parent_id]
        let kn = tax_obj[on.parent_id]
        let pn = tax_obj[kn.parent_id]
        let dn = tax_obj[pn.parent_id]
        lineage = dn.taxon+';'+pn.taxon+';'+kn.taxon+';'+ on.taxon+';'+ fn.taxon+';'+ gn.taxon+';'+ node.taxon
        lineage_obj.domain = tax_obj[pn.parent_id].taxon
        lineage_obj.phylum = tax_obj[kn.parent_id].taxon
        lineage_obj.klass = tax_obj[on.parent_id].taxon
        lineage_obj.order = tax_obj[fn.parent_id].taxon
        lineage_obj.family = tax_obj[gn.parent_id].taxon
        lineage_obj.genus = tax_obj[node.parent_id].taxon
        lineage_obj.species = node.taxon
    }
    //console.log('line',lineage)
    return [lineage,lineage_obj]
}
////
function get_options_by_node(node) {
  
  var rankname = node.rank.charAt(0).toUpperCase() + node.rank.slice(1)
  var text = rankname+' '+node.taxon
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
//
//
//

function get_counts(lineage){
    console.log('lineage',lineage)
    
    let txt = '['+C.taxon_counts_lookup[lineage].tax_cnt.toString() + ', '+C.taxon_counts_lookup[lineage].gcnt.toString()+', '+C.taxon_counts_lookup[lineage].refcnt.toString()+']'
        
    return txt
}
/////////////////////////////////////////
function create_table(source, type) {

    if(source === 'table' && type === 'browser'){
        var obj1 = C.taxon_lookup
        var obj2 = C.taxon_lineage_lookup
        var obj3 = C.taxon_info_lookup 
        var headers_row = ["HMT_ID","Domain","Phylum","Class","Order","Family","Genus","Species","Status","Body_site","Warning","Type_strain","16S_rRNA","Clone_count","Clone_%","Clone_rank","Synonyms","NCBI_taxon_id","NCBI_pubmed_count","NCBI_nucleotide_count","NCBI_protein_count","Genome_ID","General_info","Cultivability","Phenotypic_characteristics","Prevalence","Disease","References"]
        
        var txt =  headers_row.join('\t')
        
        for(otid in obj1){
            if(otid in obj2 && otid in obj3){
               var o1 = obj1[otid]
               var o2 = obj2[otid]
               var o3 = obj3[otid]
            
               //console.log(o2)
               var r = [("000" + otid).slice(-3),o2.domain,o2.phylum,o2.klass,o2.order,o2.family,o2.genus,o2.species,o1.status,o1.site,o1.warning,o1.type_strain,,,,,o1.synonyms,o1.ncbi_taxid,,,,o1.genomes,o3.general,o3.culta,o3.pheno,o3.prev,o3.disease,,]
               var row = r.join('\t')
               txt += '\n'+row
            }
        }
    }   
    //console.log(txt)
    return txt
}        
 //
function find_images(rank, otid, tax_name) {

	var image_list = []
	var ext = 'png'
	// for photos NO Spaces = join w/ underscore
	var tname,fname1_prefix,fname2_prefix,fname3_prefix,fname4_prefix
	if(otid){
	    console.log('looking for otid image: HMT'+otid+'(1-4).png')
	    fname1_prefix = 'HMT/HMT'+otid+'-1' // look for .jpg .jpeg png
		fname2_prefix = 'HMT/HMT'+otid+'-2' // or '-2.jpeg'
		fname3_prefix = 'HMT/HMT'+otid+'-3' // or '-3.jpeg'
		fname4_prefix = 'HMT/HMT'+otid+'-4' // or '-3.jpeg'
	}else{  // rank and not otid
	    tname = tax_name.replace(/ /g,'_')  // mostly for species 
	    fname1_prefix = rank+'/'+tname+'-1' // look for .jpg .jpeg png
	    fname2_prefix = rank+'/'+tname+'-2' // or '-2.jpeg'
	    fname3_prefix = rank+'/'+tname+'-3' // or '-3.jpeg'
	    fname4_prefix = rank+'/'+tname+'-4' // or '-3.jpeg'
	} 
 
	try {
	  if (fs.existsSync(path.join(CFG.PATH_TO_IMAGES,fname1_prefix+'.'+ext))) {
		//console.log('adding1',fname1_prefix)
		image_list.push({"name":fname1_prefix+'.'+ext,"text":"text of photo-1"})
	  
	  }else{
	  	//console.log('no find1',path.join(CFG.PATH_TO_IMAGES,rank,fname1_prefix+'.'+ext))
	  }
	  
	  if (fs.existsSync(path.join(CFG.PATH_TO_IMAGES,fname2_prefix+'.'+ext))) {
		//console.log('adding2',fname2_prefix)
		image_list.push({"name":fname2_prefix+'.'+ext,"text":"text of photo-2"})
	  }else{
		  //console.log('no find2',path.join(CFG.PATH_TO_IMAGES,rank,fname2_prefix))
	  }
	 
	  if (fs.existsSync(path.join(CFG.PATH_TO_IMAGES,fname3_prefix+'.'+ext))) {
		//console.log('adding',fname3_prefix+'.'+ext)
		image_list.push({"name":fname3_prefix+'.'+ext,"text":"text of photo-3"})
	  }else{
		  //console.log('no find3',path.join(CFG.PATH_TO_IMAGES,rank,fname3_prefix))
	  }
	  
	 if (fs.existsSync(path.join(CFG.PATH_TO_IMAGES,fname4_prefix+'.'+ext))) {
		//console.log('adding',fname4_prefix+'.'+ext)
		image_list.push({"name":fname4_prefix+'.'+ext,"text":"text of photo-4"})
	  }else{
		  //console.log('no find4',path.join(CFG.PATH_TO_IMAGES,rank,fname4_prefix))
	  }
	  
	} catch(err) {
	  console.error(err)
	}
	
	//console.log('im-arry',image_list)
	return image_list
}      
        
        
   


module.exports = router;




