const express  = require('express');
var router   = express.Router();
const CFG   = require(app_root + '/config/config');
const fs       = require('fs-extra');
const url = require('url');
const path     = require('path');
const C		  = require(app_root + '/public/constants');
const helpers = require(app_root + '/routes/helpers/helpers');
const queries = require(app_root + '/routes/queries')
var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();
today = yyyy + '-' + mm + '-' + dd;
var currentTimeInSeconds=Math.floor(Date.now()/1000); //unix timestamp in seconds

router.get('/tax_table', function tax_table_get(req, res) {
	helpers.accesslog(req, res)
	console.log('in taxtable -get')
	helpers.show_session(req)
	let myurl = url.parse(req.url, true);
  	//console.log(myurl.query)
	
	let letter = myurl.query.k
	let annot = myurl.query.annot
	let reset    = myurl.query.reset
	var count_txt, count_txt0;
	var big_tax_list0 = Object.values(C.taxon_lookup);
	
	// FIX THIS IF SELECT DROPPED OR NONORAL
	big_tax_list1 = big_tax_list0.filter(item => (item.status !== 'Dropped' && item.status !== 'NonOralRef'))
	var tcount = big_tax_list1.length  // total count of our filters
	
	//var show_filters = 0
	
	var count_text = ''
	pgtitle = 'List of Human Oral Microbial Taxa'
	
	if(reset == '1'){
	    letter = 'all'
	    annot = 0
	}
	if(annot){
	  	// grab only the taxa that have genomes
	  	console.log('GOT annotations')
	  	big_tax_list2 = big_tax_list1.filter(item => item.genomes.length >0)
	  	//show_filters = 0
	  	pgtitle = 'List of Human Oral Microbial Taxa (with Annotated Genomes)'
	  	letter = 'all'
	  	count_txt0 = 'Showing '+big_tax_list2.length.toString()+' rows with annotated genomes.'
	}else if(letter && letter.match(/[A-Z]{1}/)){   // always caps
	    console.log('GOT a TaxLetter: ',letter)
		   // COOL.... filter the whole list
		big_tax_list2 = big_tax_list0.filter(item => item.genus.toUpperCase().charAt(0) === letter)
		count_txt0 = 'Showing '+big_tax_list2.length.toString()+' rows for genus starting with: "'+letter+'"'
	}else{
		
		console.log('NO to only annotations or tax letters')
		//whole list or 
		
		var intiial_status_filter = C.tax_status_on  //['named','unnamed','phylotype','lost']  // no['dropped','nonoralref']
	
		//console.log(tax_letter)
		// filter
		big_tax_list1 = big_tax_list0.filter(item => intiial_status_filter.indexOf(item.status.toLowerCase()) !== -1 )
		var intiial_site_filter = C.tax_sites_on  //['oral', 'nasal', 'skin', 'vaginal', 'unassigned'];
		//console.log('send_tax_obj1[0]',send_tax_obj1[0])
		
		big_tax_list2 = big_tax_list1.filter( function(e) {
	      //console.log(e)
	      if(e.sites.length > 0 && intiial_site_filter.indexOf(e.sites[0].toLowerCase()) !== -1){
	         return e
	      }
	    }) 
	    letter = 'all'
	    count_txt0 = 'Showing '+big_tax_list2.length.toString()+' rows.'
	    
    }
    //console.log('send_tax_obj[0]',send_tax_obj[0])
    // Here we add the genome size formatting on the fly
    big_tax_list2.map(function(el){
	      el.gsize = ''
	      //console.log(el)
	      if(el.genomes.length === 0){
	      	//console.log('g length:0')
	      	el.gsize = ''
	      }else if(el.genomes.length === 1 && el.genomes[0] in C.genome_lookup){
	        //console.log('g length:1')
	        el.gsize = helpers.format_Mbps(C.genome_lookup[el.genomes[0]].tlength).toString()
	      }else{  // More than one genome
	        //console.log('g length:>1')
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
    //console.log('send_tax_obj[0]',send_tax_obj[0])
    //sort
    big_tax_list2.sort(function (a, b) {
      return helpers.compareStrings_alpha(a.genus, b.genus);
    });
   
	send_list = big_tax_list2
	
	//var count_text = get_count_text_n_page_form(page)
	console.log(C.tax_status_on)
	count_txt = count_txt0 + ' <small>(Total:'+(big_tax_list0.length).toString()+')</small> '
	res.render('pages/taxa/taxtable', {
		title: 'HOMD :: Taxon Table', 
		pgtitle: pgtitle,
		pgname: 'taxon_table',  //for AbountThisPage
		config : JSON.stringify({hostname:CFG.HOSTNAME,env:CFG.ENV}),
		data: JSON.stringify(send_list),
		
		
		count_txt: count_txt,
		letter: letter,
		statusfltr: JSON.stringify(C.tax_status_on),  // default
		sitefltr: JSON.stringify(C.tax_sites_on),  //default
		default_filters:'1',
		//show_filters:show_filters,
		search_txt: '0',
		search_field:'0',
		ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
	});
});

router.post('/tax_table', function tax_table_post(req, res) {
	helpers.accesslog(req, res)
	console.log('in taxtable -post')
	let send_tax_obj = {}
	//helpers.show_session(req)
	console.log(req.body)
	//plus valid
	//valid = req.body.valid  // WHAT IS THIS???
	var count_txt, count_txt0;

	pgtitle = 'List of Human Microbial Taxa'
	//show_filters = 1
	let statusfilter_on =[]
	let sitefilter_on  = []
	for(i in req.body){
		if(C.tax_sites_all.indexOf(i) !== -1){
		   sitefilter_on.push(i)
		}
		if(C.tax_status_all.indexOf(i) !== -1){
		   statusfilter_on.push(i)
		}
		
	}
	console.log('statusfilter_on',statusfilter_on)
	console.log('sitefilter_on',sitefilter_on)
	// letterfilter
	// if dropped is on need to add dropped to 
	let big_tax_list = Object.values(C.taxon_lookup);
	
	if(statusfilter_on.length == C.tax_status_all.length && sitefilter_on.length == C.tax_sites_all.length){
	  // no filter -- allow all
	  send_list = big_tax_list
	}else if(statusfilter_on.length == 0){  // only items from site filter checked
	    send_list = big_tax_list.filter( function(e){
          if(e.sites.length > 0){
            for(n in e.sites){
              var site = e.sites[n].toLowerCase()  // nasal,oral
              if( sitefilter_on.indexOf(site) !== -1 )
                //nasal or oral if site item in s return only one instance
			   {
				 return e
			   }
            }
          }
          
        }) 
	}else if(sitefilter_on.length == 0){   // only items from status filter checked
	    send_list = big_tax_list.filter( function(e){
          if( statusfilter_on.indexOf(e.status.toLowerCase()) !== -1 ){
             return e
          }
        }) 
	}else{
      send_list = big_tax_list.filter( function(e){
          if(e.sites.length > 0){
            for(n in e.sites){
              var site = e.sites[n].toLowerCase()  // nasal,oral
              var status = e.status.toLowerCase()
              if(sitefilter_on.indexOf(site) !== -1 && statusfilter_on.indexOf(status) !== -1 )
              {
                 return e
              }
            }
          }  
      }) 
    }   
      
	
	send_list.sort(function (a, b) {
        return helpers.compareStrings_alpha(a.genus, b.genus);
    });
	console.log('statusfilter_on',statusfilter_on)
	// use session for taxletter
	count_txt0 =  'Showing '+(Object.keys(send_list).length).toString()+' rows using status and body site filter.'
	count_txt = count_txt0+' <small>(Total:'+(big_tax_list.length).toString()+')</small>'
	res.render('pages/taxa/taxtable', {
		title: 'HOMD :: Taxon Table', 
		pgtitle:pgtitle,
		pgname: 'taxon_table',  //for AbountThisPage
		config : JSON.stringify({hostname:CFG.HOSTNAME,env:CFG.ENV}),
		data: JSON.stringify(send_list),
		count_txt: count_txt,
		letter: 'all',
		statusfltr: JSON.stringify(statusfilter_on),
		sitefltr: JSON.stringify(sitefilter_on),
		default_filters:'0',
		//show_filters: show_filters,
		search_txt: '0',
		search_field:'0',
		
		ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
	});
});
//
router.post('/search_taxtable', function search_taxtable(req, res) {
	console.log(req.body)
	
	let search_txt = req.body.tax_srch.toLowerCase()  // already filtered for empty string and extreme length
	let search_field = req.body.field
	var count_txt, count_txt0;
	
	console.log('C.taxon_lookup[389]')
	console.log(C.taxon_lookup[389])
	// filter: all;otid;genus;species;synonyms;type_strains;(16S rRNA ID)
	//send_tax_obj = send_tax_obj.filter(item => (item.status !== 'Dropped' && item.status !== 'NonOralRef'))
	let big_tax_list = Object.values(C.taxon_lookup);  // search_field=='all'
	let send_list = get_filtered_taxon_list(big_tax_list, search_txt, search_field)
	
	
	//let count_txt = 'Total:'+(big_tax_list.length).toString()+' Showing: '+(Object.keys(send_list).length).toString()
	pgtitle = 'Search TaxTable'
	count_txt0 =  'Showing '+(send_list.length).toString()+' rows using search string: "'+req.body.tax_srch+'".'
	count_txt = count_txt0+' <small>(Total:'+(big_tax_list.length).toString()+')</small>'
	res.render('pages/taxa/taxtable', {
		title: 'HOMD :: Taxon Table', 
		pgtitle: pgtitle,
		pgname: 'taxon_table',  //for AbountThisPage
		config : JSON.stringify({hostname:CFG.HOSTNAME,env:CFG.ENV}),
		data: JSON.stringify(send_list),
		count: Object.keys(send_list).length,
		count_txt: count_txt,
		letter: 'all',
		statusfltr: JSON.stringify(C.tax_status_on),
		sitefltr:   JSON.stringify(C.tax_sites_on),
		default_filters:'1',
		//show_filters: 1,
		search_txt: search_txt,
		search_field: search_field,
		ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
	});
	
	
});
//


//
//
router.get('/tax_hierarchy', (req, res) => {
	//the json file was created from a csv of vamps taxonomy
	// using the script: taxonomy_csv2json.py in ../homd_data
	helpers.accesslog(req, res)
	
	res.render('pages/taxa/taxhierarchy', {
			title: 'HOMD :: Taxon Hierarchy',
			pgname: 'tax_hierarchy',  //for AbountThisPage 
			config : JSON.stringify({hostname:CFG.HOSTNAME,env:CFG.ENV}),
			data: {},
			dhtmlx: JSON.stringify(C.dhtmlxTreeData),
			ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
	});
});
router.get('/tax_level', function tax_level_get(req, res) {
	helpers.accesslog(req, res)
	//var oral;
    
	//req.session.tax_obj = C.homd_taxonomy
    //console.log(req.session.counts_file)
	
	res.render('pages/taxa/taxlevel', {
		title: 'HOMD :: Taxon Level', 
		pgname: 'tax_level',  //for AbountThisPage 
		config : JSON.stringify({hostname:CFG.HOSTNAME,env:CFG.ENV}),
		level: 'domain',
		//oral: oral,
		ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
	});
});
//
//
router.post('/tax_level', function tax_level_post(req, res) {
	
	//console.log(req.body)
	let rank = req.body.rank
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
				let lineage = [taxitem.taxon]
				let new_search_id = taxitem.parent_id
				let new_search_rank = C.ranks[C.ranks.indexOf(taxitem.rank)-1]
				//console.log(new_search_id,new_search_rank)
				while (new_search_id !== 0){
					let new_search_item = C.homd_taxonomy.taxa_tree_dict_map_by_id[new_search_id]

					lineage.unshift(new_search_item.taxon)  // adds to front of lineage array -prepends
					new_search_id = new_search_item.parent_id
				
				}
				let return_obj = {}
				return_obj.item_rank = rank
				
				if(rank === 'species' || rank === 'subspecies'){
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
				console.log(rank,lineage)
				if(lineage.length == C.ranks.indexOf(rank)+1){
                    let lineage_str = lineage.join(';')
                    //console.log(lineage_str)
                    if(taxdata.hasOwnProperty(lineage_str)){
						return_obj.tax_count = taxdata[lineage_str].tax_cnt
						return_obj.gne_count = taxdata[lineage_str].gcnt
						return_obj.rrna_count = taxdata[lineage_str].refcnt
						return_obj.lineage = lineage_str 
                    }else{
                        return_obj.tax_count = 0
						return_obj.gne_count = 0
						return_obj.rrna_count = 0
						return_obj.lineage = '' 
                    }
				}else{
				    return_obj.tax_count = 0
                    return_obj.gne_count = 0
                    return_obj.rrna_count = 0
                    return_obj.lineage = '' 
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
router.post('/oral_counts_toggle', function oral_counts_toggle(req, res) {
	// NO USED!!!
	var oral = req.body.oral
	helpers.accesslog(req, res)
	console.log('oral ',oral)
	
	res.send({ok:'ok'});

});
// test: choose custom taxonomy, show tree
router.get('/tax_custom_dhtmlx', function tax_custom_dhtmlx(req, res) {
  //console.time("TIME: tax_custom_dhtmlx");
  //console.log('IN tax_custom_dhtmlx')
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
            //console.log('node1',node)
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
        if(id >1000){
           //return
        }
        const objects_w_this_parent_id = C.homd_taxonomy.taxa_tree_dict_map_by_id[id].children_ids.map(n_id => C.homd_taxonomy.taxa_tree_dict_map_by_id[n_id]);
        objects_w_this_parent_id.map(node => {
          //console.log('node2',node)
          let lineage = make_lineage(node)  // [str obj]
          //console.log('lineage:',lineage)
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

  //console.timeEnd("TIME: tax_custom_dhtmlx");

  res.json(json);
});
/////////////////////////////////
router.get('/tax_description', function tax_description(req, res){
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
	var data1 = C.taxon_lookup[otid]
	//console.log('dropped',C.dropped_taxids)
	if(C.dropped_taxids.indexOf(otid) !== -1){
	   console.log(data1)
	   let message = "That is a dropped TaxonID: "+otid
	   res.render('pages/lost_message', {
	       title: 'HOMD :: Error',
	       pgname: 'lost',  //for AbountThisPage  
			config : JSON.stringify({hostname:CFG.HOSTNAME,env:CFG.ENV}),
			message:message,
			ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
	   })
	   return
	}
	if( C.taxon_lookup[otid] === undefined){
    	req.flash('TRY AGAIN')
    	res.send('That Taxon ID: ('+otid+') was not found1 - Use the Back Arrow and select another')
    	return
  	}
	
	// find list pids that are known use this taxon
	let plist = Object.values(C.phage_lookup).filter(item => (item.host_otid === otid)) 
	let pid_list = plist.map(item => item.pid)
	//console.log('pid_list',pid_list)
	if(C.taxon_info_lookup[otid] ){
	    var data2 = C.taxon_info_lookup[otid]
	}else{
	    console.warn('Could not find info for',otid)
	    var data2 = {}
	}
	if(C.taxon_lineage_lookup[otid] ){
	    var data3 = C.taxon_lineage_lookup[otid]
	    console.log(data3)
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
	// phage known to infect
	//let tmp_list = Object.values(C.phage_lookup).filter(item => item.host_otid === otid)
	//let pids = tmp_list.map()
	//console.log(data1)
	//console.log('d2',data2)
	// get_genus photos
	node = C.homd_taxonomy.taxa_tree_dict_map_by_name_n_rank[data3.species+'_species']
	//console.log('node',node)
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
		pgname: 'tax_description',  //for AbountThisPage 
		config : JSON.stringify({hostname:CFG.HOSTNAME,env:CFG.ENV}),
		otid: otid,
		pids: pid_list,
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


router.post('/get_refseq', function get_refseq(req, res) {
	console.log(req.body)
	var refseq_id = req.body.refid;

	// express deprecated req.param(name): Use req.params, req.body, or req.query
	// See https://discuss.codecademy.com/t/whats-the-difference-between-req-params-and-req-query/405705
	//FIXME There are 4 fields which do I query???
	//The 16S sequence pulled from the taxon page should be seq_trim9, which is longest.
	let q = queries.get_refseq_query(refseq_id)
	//console.log(q)
	TDBConn.query(q, (err, rows) => {
		//console.log(rows)
		let seqstr = rows[0].seq.toString()
		let arr = helpers.chunkSubstr(seqstr,80)
		let html = arr.join('<br>')
		res.send(html)
	})
});


router.get('/dld_table/:type/:letter/:sites/:stati/:search_txt/:search_field', function dld_table_get(req, res) {
//router.get('/dld_table/:type/:letter/:sites/:stati', function dld_table_get(req, res) {

	helpers.accesslog(req, res)
	console.log('in dld tax-get')
	//console.log(req.body)
	let send_list = []
	let type = req.params.type
	let letter = req.params.letter
	let sitefilter = JSON.parse(req.params.sites)
	let statusfilter = JSON.parse(req.params.stati)
    let search_txt = req.params.search_txt
	let search_field = req.params.search_field
	//console.log(type,letter,sitefilter,statusfilter,search_txt,search_field)
	// Apply filters
	let temp_list = Object.values(C.taxon_lookup);
	let file_filter_txt = ""
	if(letter && letter.match(/[A-Z]{1}/)){
	    console.log('MATCH Letter: ',letter)
	    send_list = temp_list.filter(item => item.genus.charAt(0) === letter)
	    file_filter_txt = "HOMD.org Taxon Data::Letter Filter Applied (genus with first letter of '"+letter+"')"
	}else if(search_txt !== '0'){
	    send_list = get_filtered_taxon_list(search_txt, search_field)
	    file_filter_txt = "HOMD.org Taxon Data::Search Filter Applied (Search text '"+search_txt+"')"
	//}else if(sitefilter.length > 0 ||  statusfilter.length > 0){
	}else if(statusfilter.length === 0 && sitefilter.length === 0){
	  // this is for download default table. on the downloads page
	  // you cant get here from the table itself (javascript prevents)
	  console.log('in dwnld filters==[][]')
	  send_list = temp_list
	}else{
		// apply site/status filter as last resort
		console.log('in dwnld filters')
		
		if(statusfilter.length == 0){  // only items from site filter checked
	    send_list = temp_list.filter( function(e){
          if(e.sites.length > 0){
            for(n in e.sites){
              var site = e.sites[n].toLowerCase()  // nasal,oral
              if( sitefilter.indexOf(site) !== -1 )
                //nasal or oral if site item in s return only one instance
			   {
				 return e
			   }
            }
          }
          
        }) 
	}else if(sitefilter.length == 0){   // only items from status filter checked
	    send_list = temp_list.filter( function(e){
          if( statusfilter.indexOf(e.status.toLowerCase()) !== -1 ){
             return e
          }
        }) 
	}else{
      send_list = temp_list.filter( function(e){
          if(e.sites.length > 0){
            for(n in e.sites){
              var site = e.sites[n].toLowerCase()  // nasal,oral
              var status = e.status.toLowerCase()
              if(sitefilter.indexOf(site) !== -1 && statusfilter.indexOf(status) !== -1 )
              {
                 return e
              }
            }
          }
        })
    } 
  } 
		
		
		// send_list = temp_list.filter( function(e){
// 		  //console.log('e',e)
// 		  if(e.sites.length > 0){
//             for(n in e.sites){
//               var site = e.sites[n].toLowerCase()  // nasal,oral
//               var status = e.status.toLowerCase()
//               if(sitefilter.indexOf(site) !== -1 && statusfilter.indexOf(status) !== -1 )
//               {
//                  //console.log('e',e)
//                  return e
//               }
//           
//             }
//           }  
// 		})
	file_filter_txt = "HOMD.org Taxon Data::Site/Status Filter applied" 

  	let list_of_otids = send_list.map(item => item.otid)
  	console.log('list_of_otids',list_of_otids)
	// type = browser, text or excel
	file_filter_txt = file_filter_txt+ " Date: "+today
	var table_tsv = create_table(list_of_otids,'table',type,file_filter_txt )
	if(type === 'browser'){
	    res.set('Content-Type', 'text/plain');  // <= important - allows tabs to display
	}else if(type === 'text'){
	    res.set({"Content-Disposition":"attachment; filename=\"HOMD_taxon_table"+today+'_'+currentTimeInSeconds+".txt\""});
	}else if(type === 'excel'){
	    res.set({"Content-Disposition":"attachment; filename=\"HOMD_taxon_table"+today+'_'+currentTimeInSeconds+".xls\""});
	}else{
	    // error
	    console.log('Download table format ERROR')
	}
	res.send(table_tsv)
	res.end()
});


router.get('/life', function life(req, res) {
	helpers.accesslog(req, res)
	console.log('in LIFE')
	let myurl = url.parse(req.url, true);
  	let tax_name = myurl.query.name;
  	let rank = (myurl.query.rank)
  	//console.log('rank:',rank)
	//console.log('tax_name',tax_name)
  	if(tax_name){
		tax_name = myurl.query.name.replace(/"/g,'')
	}
	var image_array =[]
	if(rank)
	   image_array = find_images(rank,'',tax_name)
	
	let taxa_list =[]
	let next_rank,title,show_ranks,rank_id,last_rank,space,childern_ids,html,taxon,genus,species,rank_display
	var lineage_list = ['']
	
	//next_rank = C.ranks[C.ranks.indexOf(rank) +1]
	
	html =''
	var cts = ''
	if(!rank){  // Cellular_Organisims
	   //taxa_list = C.homd_taxonomy.taxa_tree_dict_map_by_rank['domain'].map(a => a.taxon)
	   next_rank = 'domain'
	   
	   html += "<tr><td class='life-taxa-name'>&nbsp;Domains</td><td class='life-taxa'>"
	   
	   title = 'Domain: Archaea'
	   cts = C.taxon_counts_lookup['Archaea'].tax_cnt.toString()
 	   html += "<a title='"+title+"' href='life?rank=domain&name=\"Archaea\"'>Archaea</a> <small>("+cts+")</small>"
 	   html += " <span class='vist-taxon-page'><a href='ecology/domain/Archaea'>Ecology</a></span><br>"
       title = 'Domain: Bacteria'
       cts = C.taxon_counts_lookup['Bacteria'].tax_cnt.toString()
 	   html += "<a title='"+title+"' href='life?rank=domain&name=\"Bacteria\"'>Bacteria</a> <small>("+cts+")</small>"
 	   html += " <span class='vist-taxon-page'><a href='ecology/domain/Bacteria'>Ecology</a></span><br>"

	   html += '</td></tr>'
	   image_array =[{'name':'cellular_organisms.png','text':''}]
	}else{
		//console.log(upto)
		node = C.homd_taxonomy.taxa_tree_dict_map_by_name_n_rank[tax_name+'_'+rank]
		
		var lineage_list = make_lineage(node)  // [str obj]
	    
		rank_id = C.ranks.indexOf(rank) +2
		show_ranks = C.ranks.slice(0,rank_id)
		
		//console.log('show_ranks',show_ranks)
		last_rank = show_ranks[show_ranks.length -1]
		
		space = '&nbsp;' 
		for(i in show_ranks){
		   
		   rank_display = get_rank_display(show_ranks[i],false)
		   // let name_n_rank = tax_name+'_'+level
//    console.log(name_n_rank)
//    let node = C.homd_taxonomy.taxa_tree_dict_map_by_name_n_rank[name_n_rank]
//    let lin = make_lineage(node)
//    console.log(lin)
		   //console.log('lineage: ',lineage_list[0])
		      //var cts = get_counts(lineage_list[0])
		    //var cts = C.taxon_counts_lookup[lineage_list[0]].tax_cnt.toString()
		    //console.log('counts: ',cts)
		   if(show_ranks[i] != last_rank){  // Last row of many items
		      
		      node = C.homd_taxonomy.taxa_tree_dict_map_by_name_n_rank[lineage_list[1][show_ranks[i]]+'_'+show_ranks[i]]
			  lin = make_lineage(node)
			  cts = C.taxon_counts_lookup[lin[0]].tax_cnt.toString()
		    
		      title = rank_display+': '+lineage_list[1][show_ranks[i]]
		      html += "<tr><td class='life-taxa-name'>"+space+rank_display+"</td><td class='life-taxa'>"
			  html += "<a title='"+title+"' href='life?rank="+show_ranks[i]+"&name=\""+lineage_list[1][show_ranks[i]]+"\"'>"+lineage_list[1][show_ranks[i]]+'</a> ('+cts+')'
			  html += " <span class='vist-taxon-page'><a href='ecology/"+show_ranks[i]+"/"+lineage_list[1][show_ranks[i]]+"'>Ecology</a></span>"
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
			 
			 html += "<tr><td class='life-taxa-name'>"+space+rank_display+"</td><td class='life-taxa'>"
			 taxa_list.sort(function (a, b) {
      			return helpers.compareStrings_alpha(a, b);
    		 });
			 for(n in taxa_list){
				 //console.log('SHOW RANKS',show_ranks.length)
				 title = rank_display+': '+taxa_list[n]
				 if(rank === 'genus'){

				       childern_ids = C.homd_taxonomy.taxa_tree_dict_map_by_name_n_rank[taxa_list[n]+'_'+'species'].children_ids
				       if(childern_ids.length > 0){  // only if subspecies
				       //Bacteria;Firmicutes;Bacilli;Lactobacillales;Streptococcaceae;Streptococcus;Streptococcus oralis;
				         //console.log('childern_ids-2')
				         html += "<span class=''>"+space+"<a title='"+title+"' href='life?rank="+next_rank+"&name=\""+taxa_list[n]+"\"'>"+taxa_list[n]+'</a></span><br>'
				       }else{
				         otid = C.homd_taxonomy.taxa_tree_dict_map_by_name_n_rank[taxa_list[n]+'_'+'species'].otid
				       //console.log('otid',otid)
					     html += "<span class='blue'>"+space+'<em>'+taxa_list[n]+"</em> (<a title='"+title+"' href='tax_description?otid="+otid+"'>"+helpers.make_otid_display_name(otid)+'</a>)'
					     html += " <span class='vist-taxon-page'><a href='ecology/"+show_ranks[i]+"/"+taxa_list[n]+"'>Ecology</a></span></span><br>"
				       }
				 
				 }else{
					if(rank === 'species'){
				       //console.log('RANK==species')
				       //console.log(taxa_list[n])
				       otid = C.homd_taxonomy.taxa_tree_dict_map_by_name_n_rank[taxa_list[n]+'_'+'subspecies'].otid
				       html += "<span class=''>"+space+"<a title='"+title+"' href='tax_description?otid="+otid+"'>"+taxa_list[n]+'</a></span><br>'    
				    }else{
					   // list of not genus or species 
					   node = C.homd_taxonomy.taxa_tree_dict_map_by_name_n_rank[taxa_list[n]+'_'+next_rank]
					   lin = make_lineage(node)
					   cts = C.taxon_counts_lookup[lin[0]].tax_cnt.toString()
					   html += "<span class=''>"+space+"<a title='"+title+"' href='life?rank="+next_rank+"&name=\""+taxa_list[n]+"\"'>"+taxa_list[n]+'</a> <small>('+cts+')</small>'
					   html += " <span class='vist-taxon-page'><a href='ecology/"+show_ranks[i]+"/"+taxa_list[n]+"'>Ecology</a></span></span><br>"
				    }
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
	var page_title = 'Life'
	if(rank)
	    page_title = helpers.capitalizeFirst(rank)
	
	lineage_string = helpers.make_lineage_string_with_links(lineage_list, 'life')
	res.render('pages/taxa/life', {
			title: 'HOMD :: '+page_title, 
			pgname: 'tax_life',  //for AbountThisPage 
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
//
router.get('/ecology/:level/:name', function ecology(req, res) {
   console.log('in ecology')
   let rank = req.params.level
   let tax_name = req.params.name
   let segata_text = '',dewhirst_text='',eren_text=''
   let max = 0
   let max_obj = {}
   //let major_genera=0
   let segata_data={},dewhirst_data={},eren_data={}
   let segata_max=0,dewhirst_max=0,eren_max=0
   let eren_table='',dewhirst_table='',segata_table=''
   console.log('rank: '+rank+' name: '+tax_name)
   // TODO::should be in constants???
   let abundance_names = {
        'BM':"Buccal Mucosa (BM)",
   		"KG":"Keratinized Gingiva (KG)",
   		'HP':'Hard Palate (HP)',
   		'Throat':"Throat",
   		"PT":"Palatine Tonsils (PT)",
   		"TD":'Tongue Dorsum (TD)',
   		"Saliva":"Saliva",
   		"SupP":"Supra-gingival Plaque (SupP)",
   		"SubP":"Sub-gingival Plaque (SubP)",
   		"Stool":"Stool"
   	}
   //let segata_order = ['BM',"KG",'Hp','G1-avg','Th',"PT","TD","Sal",'G2-avg',"SupP","SubP",'G3-avg',"Stool",'G4-avg']
   let segata_order = ['BM',"KG",'HP','Throat',"PT","TD","Saliva","SupP","SubP",'Stool']
   let dewhirst_order = ['BM',"KG",'HP','TD','PT','Throat','Saliva','SupP','SubP']
   let eren_order = ['BM',"KG",'HP','TD','PT','Throat','Saliva','SupP','SubP','Stool']
   let node = C.homd_taxonomy.taxa_tree_dict_map_by_name_n_rank[tax_name+'_'+rank]
   if(!node){
      //error
   }
   genera = get_major_genera(rank, node)
   
   //console.log('genera')
   //console.log(genera)
   console.log(node)
   var children_list = []
   for(i in node.children_ids){ // must sort?? by getting list of nodes=>sort=>then create list
   		n = C.homd_taxonomy.taxa_tree_dict_map_by_id[node.children_ids[i]]
   		//children.push(helpers.clean_rank_name_for_show(n.rank)+': '+n.taxon)
   		children_list.push("<a href='/taxa/ecology/"+n.rank+"/"+n.taxon+"'>"+helpers.clean_rank_name_for_show(n.rank)+":"+n.taxon+ "</a>")
   }
   
   if(!node){
      console.log('ERROR Node')
   }
   let lineage_list = make_lineage(node)
   
   if(!lineage_list[0]){
      lineage_list[0] = ''
      console.log('ERROR Lineage')
   }else{
      // console.log('lineage')
//       console.log(lineage_list[0])
      
      //console.log(C.taxon_counts_lookup[lineage_list[0]])
      if(lineage_list[0] in C.taxon_counts_lookup){
         
         if('segata' in C.taxon_counts_lookup[lineage_list[0]] && Object.keys(C.taxon_counts_lookup[lineage_list[0]]['segata']).length != 0){
             segata_max = C.taxon_counts_lookup[lineage_list[0]]['max_segata']
             segata_data = Object.values(C.taxon_counts_lookup[lineage_list[0]]['segata'])
             segata_text += helpers.clean_rank_name_for_show(rank) +' '+tax_name+ ' is'
			 max_obj = segata_data.find(function(o){ return o.avg == segata_max})
			 segata_text = get_abundance_text(segata_max, max_obj, abundance_names, rank, tax_name)
			 segata_table = build_abundance_table('segata',segata_data,segata_order)
			 
         }
         if('dewhirst' in C.taxon_counts_lookup[lineage_list[0]] && Object.keys(C.taxon_counts_lookup[lineage_list[0]]['dewhirst']).length != 0){
             dewhirst_max = C.taxon_counts_lookup[lineage_list[0]]['max_dewhirst']
             dewhirst_data = Object.values(C.taxon_counts_lookup[lineage_list[0]]['dewhirst'])
             max_obj = dewhirst_data.find(function(o){ return o.avg == dewhirst_max})
			 dewhirst_text = get_abundance_text(dewhirst_max, max_obj, abundance_names, rank, tax_name)
             dewhirst_table = build_abundance_table('dewhirst',dewhirst_data,dewhirst_order)
         }
         if('eren' in C.taxon_counts_lookup[lineage_list[0]] && Object.keys(C.taxon_counts_lookup[lineage_list[0]]['eren']).length != 0){
             eren_max = C.taxon_counts_lookup[lineage_list[0]]['max_eren']
             eren_data = Object.values(C.taxon_counts_lookup[lineage_list[0]]['eren'])
             max_obj = eren_data.find(function(o){ return o.avg == eren_max})
			 eren_text = get_abundance_text(eren_max, max_obj, abundance_names, rank, tax_name)
			 eren_table = build_abundance_table('eren',eren_data,eren_order)
         }
         
      }
   }
   
   
  
   
   //console.log('max',max)
   //console.log('max_obj',max_obj)
//    console.log('segata data:')
//    console.log(segata_data)
//    
//    console.log('eren_data')
//     console.log(eren_data)
// 	console.log('dewhirst_data')
// 	console.log(dewhirst_data)
   //lineage_string = lineage_list[0].split(';').join('; ')
   lineage_string = helpers.make_lineage_string_with_links(lineage_list, 'ecology')
   // sort genera list 
   genera.sort(function sortByTaxa(a, b) {
                return helpers.compareStrings_alpha(a.taxon, b.taxon);
    });
   res.render('pages/taxa/ecology', {
			title: 'HOMD ::'+rank+'::'+tax_name,
			pgname: 'ecology',  //for AbountThisPage  
			config : JSON.stringify({hostname:CFG.HOSTNAME,env:CFG.ENV}),
			tax_name: tax_name,
			//headline: 'Life: Cellular Organisms',
			lineage: lineage_string,
			rank: rank,
			max: JSON.stringify({'segata':segata_max,'dewhirst':dewhirst_max,'eren':eren_max}),
			
			genera: JSON.stringify(genera),
			children: JSON.stringify(children_list),
			segata_text: segata_text,
			dewhirst_text: dewhirst_text,
			eren_text: eren_text,
			segata_table: segata_table,
			dewhirst_table: dewhirst_table,
			eren_table: eren_table,
			segata_order: JSON.stringify(segata_order),
			segata: JSON.stringify(segata_data),
			dewhirst: JSON.stringify(dewhirst_data),
			eren: JSON.stringify(eren_data),
			ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
		});
});
//


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
     }else if(rank === 'subspecies'){
        display_name = 'Subspecies/Clade'
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


////////////
function make_lineage(node){
    //console.log('in lineage-node',node)
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
    }else if(node.rank==='klass' || node.rank==='class'){
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
        //console.log('species1',node)
        let gn = tax_obj[node.parent_id]
        //console.log('genus1',gn)
        let fn = tax_obj[gn.parent_id]
        //console.log('family1',fn)
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
    }else if(node.rank==='subspecies'){
        let sn = tax_obj[node.parent_id]
        let gn = tax_obj[sn.parent_id]
        let fn = tax_obj[gn.parent_id]
        let on = tax_obj[fn.parent_id]
        let kn = tax_obj[on.parent_id]
        let pn = tax_obj[kn.parent_id]
        let dn = tax_obj[pn.parent_id]
        lineage = dn.taxon+';'+pn.taxon+';'+kn.taxon+';'+ on.taxon+';'+ fn.taxon+';'+ gn.taxon+';'+ sn.taxon+';'+ node.taxon
        lineage_obj.domain = tax_obj[pn.parent_id].taxon
        lineage_obj.phylum = tax_obj[kn.parent_id].taxon
        lineage_obj.klass = tax_obj[on.parent_id].taxon
        lineage_obj.order = tax_obj[fn.parent_id].taxon
        lineage_obj.family = tax_obj[gn.parent_id].taxon
        
        lineage_obj.genus = tax_obj[sn.parent_id].taxon
        lineage_obj.species = tax_obj[node.parent_id].taxon
        lineage_obj.subspecies = node.taxon
    }
    //console.log('line',lineage)
    return [lineage,lineage_obj]
}
////
function get_options_by_node(node) {
  //console.log(node)
  
  var rankname = node.rank.charAt(0).toUpperCase() + node.rank.slice(1)
  if(rankname == 'Klass')
      rankname = 'Class'
  var text = rankname+' '+node.taxon
  if(node.rank ==='species' && node.children_ids.length ===0){
    text = "<a href='tax_description?otid="+node.otid+"'><i>"+rankname+' '+node.taxon+'</i></a>'
  }
  if(node.rank ==='subspecies'){
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
    
    let txt = "[<span class='red-text'>"+C.taxon_counts_lookup[lineage].tax_cnt.toString()+'</span>' 
            + ", <span class='green-text'>"+C.taxon_counts_lookup[lineage].gcnt.toString()+'</span>'
            +", <span class='blue-text'>"+C.taxon_counts_lookup[lineage].refcnt.toString()+'</span>]';
        
    return txt
}
/////////////////////////////////////////
function create_table(otids, source, type, head_txt) {
    let txt = head_txt+'\n'
    if(source === 'table'){
        var obj1 = C.taxon_lookup
        var obj2 = C.taxon_lineage_lookup
        var obj3 = C.taxon_info_lookup 
        var headers_row = ["HMT_ID","Domain","Phylum","Class","Order","Family","Genus","Species","Status","Body_site","Warning","Type_strain","16S_rRNA","Clone_count","Clone_%","Clone_rank","Synonyms","NCBI_taxon_id","NCBI_pubmed_count","NCBI_nucleotide_count","NCBI_protein_count","Genome_ID","General_info","Cultivability","Phenotypic_characteristics","Prevalence","Disease","References"]
        
        txt +=  headers_row.join('\t')
        var o1,o2,o3
        for(n in otids){
           
            let otid = otids[n].toString()
            o1 = obj1[otid]
             //console.log('otid',otid)
             
            if(otid in obj2){
               o2 = obj2[otid]
            }else{
               o2 = {'domain':'','phylum':'','klass':'','order':'','family':'','genus':'','species':''}
            }
            if(otid in obj3){
               o3 = obj3[otid]
            }else{
               o3 = {'general':'','culta':'','pheno':'','prev':'','disease':''}
            }
        
        
               //console.log(o2)
               var r = [("000" + otid).slice(-3),o2.domain,o2.phylum,o2.klass,o2.order,o2.family,o2.genus,o2.species,o1.status,o1.site,o1.warning,o1.type_strain,,,,,o1.synonyms,o1.ncbi_taxid,,,,o1.genomes,o3.general,o3.culta,o3.pheno,o3.prev,o3.disease,,]
               var row = r.join('\t')
               txt += '\n'+row
            
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
        
 function get_filtered_taxon_list(big_tax_list, search_txt, search_field){

	
	if(search_field == 'taxid'){
	    send_list = big_tax_list.filter(item => item.otid.toLowerCase().includes(search_txt))
	}else if(search_field == 'genus'){
	    send_list = big_tax_list.filter(item => item.genus.toLowerCase().includes(search_txt))
	}else if(search_field == 'species'){
	    send_list = big_tax_list.filter(item => item.species.toLowerCase().includes(search_txt))
	}else if(search_field == 'synonym'){
	    send_list = big_tax_list.filter( function(e) {
	       for(n in e.synonyms){
	          if(e.synonyms[n].toLowerCase().includes(search_txt)){
	             return e
	          }
	       }
	    })    
	    
	}else if(search_field == 'type_strain'){
	    send_list = big_tax_list.filter( function(e) {
	       for(n in e.type_strains){
	          if(e.type_strains[n].toLowerCase().includes(search_txt)){
	             return e
	          }
	       }
	    })
	}else{
	    // search all
	    //send_list = send_tax_obj
	    let temp_obj = {}
	    var tmp_send_list = big_tax_list.filter(item => item.otid.toLowerCase().includes(search_txt))
	    // for uniqueness convert to object
	    for(n in tmp_send_list){
	       temp_obj[tmp_send_list[n].otid] = tmp_send_list[n]
	    }
	    
	    tmp_send_list = big_tax_list.filter(item => item.genus.toLowerCase().includes(search_txt))
	    for(n in tmp_send_list){
	       temp_obj[tmp_send_list[n].otid] = tmp_send_list[n]
	    }
	    
	    tmp_send_list = big_tax_list.filter(item => item.species.toLowerCase().includes(search_txt))
	    for(n in tmp_send_list){
	       temp_obj[tmp_send_list[n].otid] = tmp_send_list[n]
	    }
	    
	    tmp_send_list = big_tax_list.filter( function(e) {
	       for(n in e.synonyms){
	          if(e.synonyms[n].toLowerCase().includes(search_txt)){
	             return e
	          }
	       }
	    })    
	    for(n in tmp_send_list){
	       temp_obj[tmp_send_list[n].otid] = tmp_send_list[n]
	    }
	    
	    tmp_send_list = big_tax_list.filter( function(e) {
	       for(n in e.type_strains){
	          if(e.type_strains[n].toLowerCase().includes(search_txt)){
	             return e
	          }
	       }
	    })
	    for(n in tmp_send_list){
	       temp_obj[tmp_send_list[n].otid] = tmp_send_list[n]
	    }
	    
	    // now back to a list
	    send_list = Object.values(temp_obj);
	    
	    
	}
	return send_list
}	
//
// function reorder_for_graphing(segata, segata_order){
//    //segata_order is a list ['BM,'td'...]
//    // segata is a list of objects {loci: 'G1-avg', avg: '0', stdev: '0'}
//    var ret_list = []
//    for(n in segata_order){
//       var item = segata_order[n]
//       for(i in segata){
//           if(segata[i].loci == item){
//              ret_list.push(segata[i])
//           }
//       }
//    
//    }
//    return ret_list
// 
// 
// }
function get_abundance_text(max, max_obj, names, rank, tax_name){
    //console.log('max_obj2')
    //console.log(max_obj)
    var text = helpers.clean_rank_name_for_show(rank)
    if(rank=='species'){
       text += ': <b><i>'+tax_name+ '</i></b> is '
    }else{
       text += ': <b>'+tax_name+ '</b> is '
    }
    
    if(max > 1){
		   text += ' an abundant'
		}else if(max > 0.1 && max <=1){
		   text += ' a moderately abundant'
		}else{  // smaller than 0.1
		   text += ' a low-abundance'
		}
	 text += ' member of the healthy oral microbiome. It reaches its highest relative abundance '
	 if(max_obj.site in names){
		text += ' in the '+names[max_obj.site]
		if(max_obj.site == 'Saliva'){
		   text += ' suggesting that its site of greatest abundance has not yet been identified.'
		}else if(max_obj.site == 'HP'){
	
		}else if(max_obj.site == 'SubP'){
	
		}
	
	 }else{
		text += ' across all oral locations.'
	 }
	 return text
}	
function build_abundance_table(cite, data, order){
    //console.log('data')
    //console.log(data)
    var html = '<table><thead><tr><td></td>'
    for(n in order){
        html += '<th>'+order[n]+'</th>'
    }
    html += '</tr></thead><tbody>'
    // segata, dewhirst, eren
    html += '<tr><th>Avg</th>'
    for(n in data){
        html += '<td>'+data[n].avg+'</td>'
    }
    // segata, dewhirst
    if(['segata','dewhirst'].indexOf(cite) != -1){
      html += '<tr><th>Stdev</th>'
      for(n in data){
        html += '<td>'+data[n].stdev+'</td>'
      }
    }
    // dewhirst, eren
    if(['dewhirst','eren'].indexOf(cite) != -1){
      html += '<tr><th>Prev</th>'
      for(n in data){
        html += '<td>'+data[n].prev+'</td>'
      }
    }
    html += '</tbody></table>'
    
    return html
}   
//
function get_major_genera(rank, node) {
	var genera = []
	if(['phylum','klass','order'].indexOf(rank) != -1){
      // find major genera per Jessica (hand curated)
      // or abundance >1% at some site
      // find all genera under tax_name the get the counts
      // how to find all genera from node?

      for(n in node.children_ids){
        let new_node1 = C.homd_taxonomy.taxa_tree_dict_map_by_id[node.children_ids[n]]  // klass ,order or family
        for(m in new_node1.children_ids){
          let new_node2 = C.homd_taxonomy.taxa_tree_dict_map_by_id[new_node1.children_ids[m]]  // order, family or genus
          if(new_node2.rank == 'genus'){
            //stop you're done
            //counts = C.taxon_counts_lookup[make_lineage(new_node2)[0]]
            genera.push(new_node2)
          }else{
            for(p in new_node2.children_ids){
              let new_node3 = C.homd_taxonomy.taxa_tree_dict_map_by_id[new_node2.children_ids[p]] // family or genus
              if(new_node3.rank == 'genus'){
                //stop you're done
                //counts = C.taxon_counts_lookup[make_lineage(new_node3)[0]]
                genera.push(new_node3)
              }else{
                for(q in new_node3.children_ids){
                  let new_node4 = C.homd_taxonomy.taxa_tree_dict_map_by_id[new_node3.children_ids[q]] // must be genus
                  //console.log('make_lineage(new_node4)')
                  //console.log(make_lineage(new_node4)[0])
                  //counts = C.taxon_counts_lookup[make_lineage(new_node4)[0]].tax_cnt
                  //console.log('counts', counts)
                  genera.push(new_node4)
                }
              }
            } 
          }
        }
      }
      //major_genera=1
   }
   // the counts here are not abundance
   // here get majors
   // phylum/Actinobacteria from jessica
   // Actinomyces, Corynebacterium, Cutibacterium, Propionibacterium, Rothia, Schaalia.
   

   return genera
}


module.exports = router;




