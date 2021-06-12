const express  	= require('express');
var router   	= express.Router();
const CFG   	= require(app_root + '/config/config');
const fs       	= require('fs-extra');
const url 		= require('url');
const path     	= require('path');
const C		  	= require(app_root + '/public/constants');
const helpers 	= require(app_root + '/routes/helpers/helpers');
const queries = require(app_root + '/routes/queries')
//const open = require('open');
const createIframe = require("node-iframe");
var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();
today = yyyy + '-' + mm + '-' + dd;

//const JB = require('jbrowse2');
//app.use(createIframe);
router.get('/genome_table', function genome_table(req, res) {
	console.log('in genometable -get')
    helpers.accesslog(req, res)
	var seqid_list;
	let myurl = url.parse(req.url, true);
	let letter = myurl.query.k
	var page = myurl.query.page
	//console.log('myurl.query',myurl.query)
	
	var otid = myurl.query.otid
	var phylum = myurl.query.phylum
	console.log('otid',otid,'phylum',phylum,'letter',letter,'page',page)
	
	
	var phyla_obj = C.homd_taxonomy.taxa_tree_dict_map_by_rank['phylum']
	var phyla = phyla_obj.map(function(el){ return el.taxon; })
	
	var count_text = ''
	let temp_list = Object.values(C.genome_lookup);
	if(phylum){
	  //gid_obj_list = Object.values(C.genome_lookup);
	  otid = 0
	  show_page=0
	  letter=0
	  var lineage_list = Object.values(C.taxon_lineage_lookup)
	  var obj_lst = lineage_list.filter(item => item.phylum === phylum)  //filter for phylum 
	  var otid_list = obj_lst.map( (el) =>{  // get list of otids with this phylum
	  		return el.otid
	  })
	  gid_obj_list = temp_list.filter(item => {   // filter genome obj list for inclusion in otid list
	     	return otid_list.indexOf(item.otid) !== -1
	  })
	  count_text = 'No. of genomes found: <span class="red">'+gid_obj_list.length.toString()+'</span> From Phylum:"'+phylum+'"<br><small>(Representing '+otid_list.length+' HOMD taxons)</small>'
	  
	}else if(otid) {  // if otid 
		// single gid
		
		seqid_list = C.taxon_lookup[otid].genomes
		//console.log('sil',seqid_list)
		gid_obj_list = []
		for(n in seqid_list){
		    gid_obj_list.push(C.genome_lookup[seqid_list[n]])
		}
		
		count_text = 'No. of genomes for TaxonID "HMT-'+otid+'": <span class="red">'+gid_obj_list.length.toString()+'</span><br>'
	  //console.log('gol',gid_obj_list)
	    show_page=0
	    phylum=0
	    letter=0
	}else{  // not phylum, otid
		// all gids
		phylum=0
		otid = '0'
		//gid_obj_list1 = Object.values(C.genome_lookup);
		
		if(letter && letter.match(/[A-Z]{1}/)){
	   	// COOL....
	   		gid_obj_list = temp_list.filter(item => item.genus.charAt(0) === letter)
			count_text = 'No. of genomes starting with: '+letter+': <span class="red">'+gid_obj_list.length.toString()+'</span><br>'
		    show_page=0
		    
		}else{
			gid_obj_list = temp_list
			count_text = 'No. of genomes found: <span class="red">'+gid_obj_list.length.toString()+'</span>'
		    letter=0
		}
		
	}
	
	gid_obj_list.map(function(el){
	      if(el.tlength){ el.tlength = helpers.format_long_numbers(el.tlength); }
	})
	// Pagination
	console.log('page',page)
	if(page > 0){
        letter=0
        phylum=0
	    otid = 0
	    var trows = temp_list.length  //2087
        var row_per_page = 200
        var number_of_pages = Math.ceil(trows/row_per_page)
    
        console.log('number_of_pages',number_of_pages)
    
        var show_page = page
        if(show_page === 1){
            var send_list = temp_list.slice(0,row_per_page)  // first 200
        }else{
            var send_list = temp_list.slice(row_per_page*(show_page-1),row_per_page*show_page)  // second 200
        }
        var page_text = '<small>On page '+show_page.toString()+' of '+number_of_pages.toString()+'::  ['
        for(var i=1;i<=number_of_pages;i++){
            if(parseInt(page) === i){
              page_text += i.toString()+"<input checked type='radio' name='page' value='"+i.toString()+"' onclick=\"location.href='genome_table?page="+i.toString()+"'\"> "
            }else{
              page_text += i.toString()+"<input type='radio' name='page' value='"+i.toString()+"' onclick=\"location.href='genome_table?page="+i.toString()+"'\"> "
            }
            
        }
        page_text += ']'
        count_text += " <small>(Showing: "+send_list.length.toString()+')</small><br>'
	}else{
        show_page=0
        
        send_list = gid_obj_list
        count_text += " <small>(Showing: "+send_list.length.toString()+')</small>'
        var page_text = ''	
    }	
	// get each secid from C.genome_lookup
	//console.log('seqid_list',gid_obj_list[0])
	send_list.sort(function (a, b) {
      return helpers.compareStrings_alpha(a.genus, b.genus);
    });
	res.render('pages/genome/genometable', {
		title: 'HOMD :: Genome Table', 
		config : JSON.stringify({hostname:CFG.HOSTNAME,env:CFG.ENV}),
		
		//seqid_list: JSON.stringify(gid_obj_list),
		data: JSON.stringify(send_list),
		ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
		letter: letter,
		otid: otid,
		phylum:phylum,
		phyla: JSON.stringify(phyla),
		count_text:count_text,
		page_text:page_text,
		page:show_page,
		
	});
})
//
// router.get('/jbrowse2/:id', function jbrowse2(req, res) {
// 	console.log('jbrowse2/:id -get')
// });
router.get('/jbrowse', function jbrowse(req, res) {
//router.get('/taxTable', helpers.isLoggedIn, (req, res) => {
	helpers.accesslog(req, res)
	console.log('jbrowse-get')
	let myurl = url.parse(req.url, true);
    
    let gid = myurl.query.gid
	
	let glist = Object.values(C.genome_lookup)
	glist.sort(function (a, b) {
    	return helpers.compareStrings_alpha(a.genus, b.genus);
    });
	// filter out empties then map to create list of sorted strings
	var genome_list = glist.filter(item => item.genus !== '')
		.map( (el)=>{
			return {gid:el.gid, genus:el.genus, species:el.species, ccolct:el.ccolct}
		})
	res.render('pages/genome/jbrowse2_stub_iframe', {
		title: 'HOMD :: JBrowse', 
		config : JSON.stringify({hostname:CFG.HOSTNAME,env:CFG.ENV}),
		gid: gid,  // default
		genomes: JSON.stringify(genome_list),
		tgenomes: genome_list.length,
		ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
	});
});
//
// router.post('/jbrowse', function jbrowse_post(req, res) {
// //router.get('/taxTable', helpers.isLoggedIn, (req, res) => {
// 	helpers.accesslog(req, res)
// 	console.log('jbrowse-post')
// 	
// 	// See models/homd_taxonomy.js for C.tax_table_results
// 	console.log(req.body);
// 	var gnom = req.body.gnom_select
// 	
// 	//res.send(JSON.stringify({'static_data':gnom}));
// 	res.render('pages/genome/jbrowse2_stub_iframe', {
// 		title: 'HOMD :: JBrowse', 
// 		config : JSON.stringify({hostname:CFG.HOSTNAME,env:CFG.ENV}),
// 		gnom: gnom,  // default
// 		genomes: JSON.stringify(C.available_jbgenomes),
// 		ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
// 	});
// });
//
router.post('/jbrowse_ajax', function jbrowse_ajax_post(req, res) {
	console.log('AJAX JBrowse')
	console.log(req.body);
	// URL from old HOMD site:
// ?data=homd/SEQF2029
// 	&tracks=DNA,prokka,ncbi
// 	&loc=SEQF2029|GL982453.1:2729587..4094422
// 	&highlight=
	//console.log(req.body);
	helpers.accesslog(req, res)
	//open(jburl)
	
	res.send(JSON.stringify({'response_data':req.body.gid}));
});
//
router.get('/genome_description', function genome_description(req, res) {
	console.log('in genomedescription -get')
	helpers.accesslog(req, res)
	let myurl = url.parse(req.url, true);
	var gid = myurl.query.gid
	
		/*
	1	Oral Taxon ID	191	
	2	HOMD Sequence ID	SEQF1851	
	3	HOMD Name (Genus, Species)	Propionibacterium acidifaciens	
	4	Genome Sequence Name
	(Name associated with genomic sequence)	Acidipropionibacterium acidifaciens	
	5	Comments on Name	NCBI Name : Propionibacterium acidifaciens	
	6	Culture Collection Entry Number	F0233	
	7	Isolate Origin	NA	
	8	Sequencing Status	High Coverage	
	9	NCBI Taxonomy ID	553198	
	10	NCBI Genome BioProject ID	31003	
	11	NCBI Genome BioSample ID	SAMN02436184	
	12	GenBank Accession ID	ACVN00000000.2	
	13	Genbank Assembly ID	GCA_000478805.1	
	14	Number of Contigs and Singlets	334
	15	Combined Length (bps)	3,017,605
	16	GC Percentage	70.36
	17	Sequencing Center	The Forsyth Institute - J. Craig Venter Institute	
	18	ATCC Medium Number	NA	
	19	Non-ATCC Medium	NA
	20  16S rRNA gene sequence
	21  Comments
	*/
	//console.log(C.genome_lookup[gid])
	res.render('pages/genome/genomedesc', {
		title: 'HOMD :: Genome Info', 
		config : JSON.stringify({hostname:CFG.HOSTNAME,env:CFG.ENV}),
		//taxonid: otid,
		data1: JSON.stringify(C.genome_lookup[gid]),
		//data2: JSON.stringify(data2),
		//data3: JSON.stringify(data3),
		//data4: JSON.stringify(data4),
		ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
	});
});

router.post('/get_16s_seq', function get_16s_seq_post(req, res) {
	console.log('in get_16s_seq -post')
	helpers.accesslog(req, res)
	console.log(req.body)
	var gid = req.body.seqid;

	// express deprecated req.param(name): Use req.params, req.body, or req.query
	// See https://discuss.codecademy.com/t/whats-the-difference-between-req-params-and-req-query/405705
	
	TDBConn.query(queries.get_16s_rRNA_sequence_query(gid), (err, rows) => {
		if(err){
		    console.log(err)
		    return
		}
		//console.log(rows)
		let html = rows[0]['16s_rRNA'].replace(/&lt;/gi,'<').replace(/&gt;/gi,'>').replace(/&quot;/gi,'"').replace(/&amp;gt;/gi,'>').replace(/&amp;lt;/gi,'<')
		if(html == ''){
		   html = 'No sequence found'
		}
		console.log(html)
		
		//seqstr = helpers.chunkSubstr(seqstr,80)
		//let html = seqstr.join('<br>')
		//html = seqstr
		res.send(html)
	})
	
});
router.post('/get_NN_NA_seq', function get_NN_NA_seq_post(req, res) {
	console.log('in get_NN_NA_seq -post')
	helpers.accesslog(req, res)
	console.log(req.body)
	let field_name = 'seq_'+req.body.type  // na or aa => seq_na or seq_aa
	let pid = req.body.pid
	let db = req.body.db.toUpperCase()
	//var gid = req.body.seqid;
    //q = 'SELECT UNCOMPRESS(seq_na_comp) FROM annotation.orf_sequence '
    //q += "WHERE PID='"+req.body.pid+"'"
	q = "SELECT "+field_name+" as seq FROM "+db+".ORF_seq"
    //q += " JOIN annotation.sequence on (orf_sequence.sequence_"+type+"_id = sequence.sequence_id)"
    q += " WHERE PID='"+pid+"'"
    
    console.log(q)
	
	ADBConn.query(q, (err, rows) => {
		if(err){
		    console.log(err)
		    return
		}
		//console.log(rows)
		let seqstr = rows[0]['seq']
		
		//console.log(seqstr.length)
		let arr = helpers.chunkSubstr(seqstr,80)
		let html = arr.join('<br>')
		//html = seqstr
		res.send(html)
		
		
		
		// seqstr = rows[0].seq_trim9
// 		arr = helpers.chunkSubstr(seqstr,60)
// 		html = arr.join('<br>')
// 		res.send(html)
	})
	
});
//
router.get('/annotation/:gid/:type', function annotation(req, res) {
    helpers.accesslog(req, res)
    console.log('in annotation')
    let myurl = url.parse(req.url, true);
    let gid = req.params.gid
    let anno_type = req.params.type
    let page = myurl.query.page
    if(!page){
      page=1
    }
    if(!C.annotation_lookup.hasOwnProperty(gid) || !C.annotation_lookup[gid].hasOwnProperty(anno_type)){
    	let message = "Could not find "+anno_type+" annotation for "+gid
    	res.render('pages/lost_message', {
	       title: 'HOMD :: Error', 
			config : JSON.stringify({hostname:CFG.HOSTNAME,env:CFG.ENV}),
			message:message,
			//data1: JSON.stringify(data1),
			ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
	   })
	   return	
    }
    let info_data_obj = C.annotation_lookup[gid][anno_type]
    let otid = C.genome_lookup[gid].otid
    let tmp_obj = Object.keys(C.annotation_lookup)  // get prokka organisms [seqid,organism]
    let all_annos_obj = tmp_obj.map((x) =>{
	        return [x, C.annotation_lookup[x].prokka.organism] 
	    })
    
    //annoquery = "SELECT UNCOMPRESS(seq_comp) as seq FROM annotation.genome WHERE seq_id ='"+gid+"' and annotation='"+anno_type+"' limit 2"
    //annoquery = "SELECT PID,product FROM annotation.orf_sequence WHERE gid ='"+gid+"' and annotation='"+anno_type+"' limit 2"
   
    console.log(info_data_obj)
    //var info_data_obj = {}
    
    var q = queries.get_annotation_query2(gid,anno_type)
    console.log(q)
    
    ADBConn.query(q, (err, rows) => {
		if(err){
		    console.log(err)
		}else{
		    if(rows.length == 0){
		          console.log('no rows found')
		    }
		    let trecords = rows.length
		    
			if(page){
				var trows = rows.length 
				//console.log('trows',trows)
				var row_per_page = 200
				var number_of_pages = Math.ceil(trows/row_per_page)
	            if(page > number_of_pages){page = 1}
	            if(page < 1){page = number_of_pages}
				console.log('number_of_pages',number_of_pages)
	
				var show_page = page
				if(show_page === 1){
					var send_list = rows.slice(0,row_per_page)  // first 200
					start_count = 1
				}else{
					var send_list = rows.slice(row_per_page*(show_page-1),row_per_page*show_page)  // second 200
					start_count = row_per_page*(show_page-1) + 1
				}
				console.log('start count',start_count)
				//var page_form = '<br><small>On Page: '+show_page.toString()+' of '+number_of_pages.toString()+':: Change Page: ['
				// for(var i=1;i<=number_of_pages;i++){
// 					if(parseInt(page) === i){
// 					  page_form += i.toString()+"<input checked type='radio' name='page' value='"+i.toString()+"' onclick=\"location.href='tax_table?k=all&page="+i.toString()+"'\"> "
// 					}else{
// 					  page_form += i.toString()+"<input type='radio' name='page' value='"+i.toString()+"' onclick=\"location.href='tax_table?k=all&page="+i.toString()+"'\"> "
// 					}
// 			
// 				}
// 				page_form += ']</small>'
			}
	
	
			res.render('pages/genome/annotation', {
				title: 'HOMD :: '+gid, 
				config : JSON.stringify({hostname:CFG.HOSTNAME,env:CFG.ENV}),
				ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
				gid: gid,
				otid: otid,
				trecords:trecords,
				start_count:start_count,
				show_page: show_page,
				number_of_pages: number_of_pages,
				info_data: JSON.stringify(info_data_obj),
				all_annos: JSON.stringify(all_annos_obj),
				anno_type: anno_type,
				//mole: JSON.stringify(rows),
				pid_list: JSON.stringify(send_list),
			})
	   }
    })
});

router.get('/phylo_phlan_tree', function phylo_phlan_tree(req, res) {
    helpers.accesslog(req, res)
    console.log('in annotation')
    let myurl = url.parse(req.url, true);
	let otid = myurl.query.otid
    res.render('pages/genome/genomic_phylo_phlan_tree', {
        title: 'HOMD :: Genome Annotation', 
		config : JSON.stringify({hostname:CFG.HOSTNAME,env:CFG.ENV}),
		ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
		otid:otid,
    
    })

});
router.get('/ribosomal_protein_tree', function ribosomal_protein_tree(req, res) {
    helpers.accesslog(req, res)
    console.log('in annotation')
    let myurl = url.parse(req.url, true);
	let otid = myurl.query.otid
    res.render('pages/genome/ribosomal_protein_tree', {
        title: 'HOMD :: Genome Annotation', 
		config : JSON.stringify({hostname:CFG.HOSTNAME,env:CFG.ENV}),
		ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
		otid:otid,
    })

});
router.get('/rRNA_gene_tree', function rRNA_gene_tree(req, res) {
    helpers.accesslog(req, res)
    console.log('in annotation')
    let myurl = url.parse(req.url, true);
	let otid = myurl.query.otid
    res.render('pages/genome/rRNA_gene_tree', {
        title: 'HOMD :: rRNA_gene_tree', 
		config : JSON.stringify({hostname:CFG.HOSTNAME,env:CFG.ENV}),
		ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
		otid:otid,
    })

});


router.get('/dld_table/:type/:letter/:page/:phylum/:otid', function dld_table(req, res) {
	helpers.accesslog(req, res)
	console.log('in download table')
	let type = req.params.type
	let letter = req.params.letter
	let page = req.params.page;
	let phylum = req.params.phylum
	let otid = req.params.otid
    console.log('type',type)
  	console.log('letter',letter)
  	console.log('page',page)
  	console.log('phylum',phylum)
  	console.log('otid',otid)
  	// Apply filters
	let temp_list = Object.values(C.genome_lookup);
	let send_list =[];
	let file_filter_txt = '';
	if(page > 0){
	    console.log('in page dnld')
	    var trows = temp_list.length  //820
        var row_per_page = 200
        var number_of_pages = Math.ceil(trows/row_per_page)
        if(page === 1){
            send_list = temp_list.slice(0,row_per_page)  // first 200
        }else{
            send_list = temp_list.slice(row_per_page*(page-1),row_per_page*page)  // second 200
        }
        file_filter_txt = "HOMD.org Genome Data::Page Filter Applied (this is page #"+page+" of "+number_of_pages+")"
	}else if(letter && letter.match(/[A-Z]{1}/)){  //ck
	    console.log('in letter dnld')
	    console.log('MATCH Letter: ',letter)
	    send_list = temp_list.filter(item => item.genus.charAt(0) === letter)
	    console.log(send_list)
	    file_filter_txt = "HOMD.org Genome Data::Letter Filter Applied (genus with first letter of '"+letter+"')"
	}else if(otid > 0){  //ck
	    console.log('in otid dnld')
	    gid_list = C.taxon_lookup[otid].genomes
		//console.log('sil',seqid_list)
		for(n in gid_list){
		    send_list.push(C.genome_lookup[gid_list[n]])
		}
		file_filter_txt = "HOMD.org Genome Data::Oral TaxonID: HMT-"+("000" + otid).slice(-3);
	}else if(phylum != 0){
	    console.log('in phylum dnld')
	    var lineage_list = Object.values(C.taxon_lineage_lookup)
	    var obj_lst = lineage_list.filter(item => item.phylum === phylum)  //filter for phylum 
	    console.log(obj_lst)
	    var otid_list = obj_lst.map( (el) =>{  // get list of otids with this phylum
	  		return el.otid
	    })
	    console.log('otid_list',otid_list)
	    send_list = temp_list.filter(item => {   // filter genome obj list for inclusion in otid list
	     	return otid_list.indexOf(item.otid) !== -1
	    })
	    console.log('cksend_list',send_list)
	    file_filter_txt = "HOMD.org Genome Data::Phylum: "+phylum
	}else{
		// whole list as last resort
		console.log('in all dnld')
		send_list = temp_list
		file_filter_txt = "HOMD.org Genome Data:: All Genome Data"
	}
  	let list_of_gids = send_list.map(item => item.gid)
	file_filter_txt = file_filter_txt+ " Date: "+today
  	
  	
  	
	console.log('list_of_gids',list_of_gids)
	// type = browser, text or excel
	var table_tsv = create_table(list_of_gids,'table',type, file_filter_txt)
	if(type === 'browser'){
	    res.set('Content-Type', 'text/plain');  // <= important - allows tabs to display
	}else if(type === 'text'){
	    res.set({"Content-Disposition":"attachment; filename=\"HOMD_genome_table"+today+".txt\""});
	}else if(type === 'excel'){
	    res.set({"Content-Disposition":"attachment; filename=\"HOMD_genome_table"+today+".xls\""});
	}else{
	    // error
	    console.log('Download table format ERROR')
	}
	res.send(table_tsv)
	res.end()
});


router.post('/search_genometable', function search_genometable(req, res) {
	console.log(req.body)
	let search_txt = req.body.tax_srch
	let search_field = req.body.field
	let seqrch_match = req.body.match
	let search_sub = req.body.sub
	// FIXME
	gid_obj_list1 = Object.values(C.genome_lookup);
	//send_list = send_tax_obj.filter(item => (item.status !== 'Dropped' && item.status !== 'NonOralRef'))
	//let tcount = send_tax_obj.length  // total count of our filters
	pgtitle = 'Search TaxTable'
	var phyla_obj = C.homd_taxonomy.taxa_tree_dict_map_by_rank['phylum']
	var phyla = phyla_obj.map(function(el){ return el.taxon; })
	res.render('pages/genome/genometable', {
		title: 'HOMD :: Genome Table', 
		config : JSON.stringify({hostname:CFG.HOSTNAME,env:CFG.ENV}),
		
		//seqid_list: JSON.stringify(gid_obj_list),
		data: JSON.stringify(gid_obj_list1),
		ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
		letter: '',
		otid: '',
		phylum: '',
		phyla: JSON.stringify(phyla),
		
		count_text:'',
		page_text:'',
		page:1,
		
	});
	
})
//
//
router.get('/blast', function blast(req, res) {
	console.log('in BLAST')
	let myurl = url.parse(req.url, true);
	let gid = myurl.query.gid
	console.log('gid',gid)
	let tmp_obj = Object.keys(C.annotation_lookup)  // get prokka organisms [seqid,organism]
    let all_annos_obj = tmp_obj.map((x) =>{
	        return [x, C.annotation_lookup[x].prokka.organism] 
	})
	res.render('pages/genome/blast', {
		title: 'HOMD :: Genome BLAST', 
		config : JSON.stringify({hostname:CFG.HOSTNAME,env:CFG.ENV}),
		ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
		all_annos: JSON.stringify(all_annos_obj),
		gid: gid,
		
	});
})
///////////////////////////////
//////////////////////////////
function create_table(gids, source, type, start_txt) {
    let txt = start_txt+'\n'
    if(source === 'table'){
       
        var headers_row = ["Genome-ID","Oral_Taxon-ID","Genus","Species","Status","No. Contigs","Sequencing Center","Total Length","Oral Pathogen","Culture Collection","GC %","NCBI Taxon-ID","NCBI BioProject-ID","NCBI BioSample-ID","Isolate Origin","atcc_mn","non_atcc_mn","Genbank Acc no.","Genbank Assembly","16S rRNA","16S rRNA Comment","flag_id"]
        
        txt +=  headers_row.join('\t')
        
        for(n in gids){
            gid = gids[n]
            obj = C.genome_lookup[gid]
               
            
               //console.log(o2)
               var r = [gid, obj.otid, obj.genus, obj.species, obj.status, obj.ncontigs, obj.seq_center, obj.tlength, obj.oral_path, obj.ccolct, obj.gc,obj.ncbi_taxid,obj.ncbi_bpid,obj.ncbi_bsid,obj.io,obj.atcc_mn,obj.non_atcc_mn,obj.gb_acc,obj.gb_asmbly,obj['16s_rrna'],obj['16s_rrna_comment'],obj.flag]
               row = r.join('\t')
               txt += '\n'+row
            
        }
    }   
    //console.log(txt)
    return txt
}        
        
        
        
module.exports = router;