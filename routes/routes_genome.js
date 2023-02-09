'use strict'
const express   = require('express')
var router    = express.Router()
const CFG     = require(app_root + '/config/config')
const fs        = require('fs-extra')
//const url     = require('url')
const path      = require('path')
const C       = require(app_root + '/public/constants')
const helpers   = require(app_root + '/routes/helpers/helpers')
const queries = require(app_root + '/routes/queries')
// const open = require('open')
const createIframe = require("node-iframe")
var today = new Date()
var dd = String(today.getDate()).padStart(2, '0')
var mm = String(today.getMonth() + 1).padStart(2, '0') // January is 0!
var yyyy = today.getFullYear()
today = yyyy + '-' + mm + '-' + dd
var currentTimeInSeconds=Math.floor(Date.now()/1000) // unix timestamp in seconds
//const JB = require('jbrowse2')
//app.use(createIframe)
router.get('/genome_table', function genomeTable(req, res) {
  console.log('in genometable -get')
    helpers.accesslog(req, res)
  let seqid_list;
  //let myurl = url.parse(req.url, true);
  let letter = req.query.k
  let otid = req.query.otid
  let phylum = req.query.phylum
  let count_txt, count_txt0, send_list, gid_obj_list,otid_grabber = {};
  helpers.print(['otid',otid,'phylum',phylum,'letter',letter])
  
  let pageData = {}
  pageData.page = req.query.page
  if (!req.query.page) {
    pageData.page = 1
  }
  
  var phyla_obj = C.homd_taxonomy.taxa_tree_dict_map_by_rank['phylum']
  var phyla = phyla_obj.map(function mapPhylaObj2 (el) { return el.taxon; })
  //console.log('phyla',phyla)
  let big_tax_list = Object.values(C.taxon_lookup).filter(item => (item.status !== 'Dropped' && item.status !== 'NonOralRef'))
  let taxa_wgenomes = big_tax_list.filter(item => item.genomes.length >0)
  
  let big_temp_list = Object.values(C.genome_lookup);
  
  
  if (phylum && phylum !== '0') {
    //gid_obj_list = Object.values(C.genome_lookup);
    otid = 0
    letter='all'
    var lineage_list = Object.values(C.taxon_lineage_lookup)
    var obj_lst = lineage_list.filter(item => item.phylum === phylum)  //filter for phylum 
    //console.log('obj_lst',obj_lst)
    var otid_list = obj_lst.map( (el) =>{  // get list of otids with this phylum
        return el.otid
    })
    otid_grabber = {}
    gid_obj_list = big_temp_list.filter(item => {   // filter genome obj list for inclusion in otid list
        if(otid_list.indexOf(item.otid) !== -1){
            otid_grabber[item.otid] = 1
            return true
        }
        //return otid_list.indexOf(item.otid) !== -1
    })
    //console.log('otid_grabber',otid_grabber)
    //console.log('gid_obj_list',gid_obj_list)
    // now get just the otids from the selected gids
    gid_obj_list.map( (el) =>{ return el.otid })
    let genom = 'are '+gid_obj_list.length.toString()+' genomes'
    if(gid_obj_list.length === 1){
        genom = 'is 1 genome'
    }
    let taxa = 'taxa'
    if(Object.keys(otid_grabber).length === 1){
        taxa = 'taxon'
    }
    //count_txt0 = 'Showing ' + gid_obj_list.length.toString() + ' rows from phylum: "' + phylum + '"'
    count_txt0 = 'For Phylum ' + phylum + ' there '+genom+' representing '+Object.keys(otid_grabber).length.toString()+' '+taxa+'.'
  
  
  } else if (otid && otid !== '0') {  // if otid 
    // single gid
    
    seqid_list = C.taxon_lookup[otid].genomes
    //console.log('sil',seqid_list)
    gid_obj_list = []
    for (var n in seqid_list) {
        gid_obj_list.push(C.genome_lookup[seqid_list[n]])
    }
    
    phylum=0
    letter='all'
    let genom = 'are '+gid_obj_list.length.toString()+' genomes.'
    if(gid_obj_list.length === 1){
        genom = 'is 1 genome.'
    }
    //count_txt0 = 'Showing ' + gid_obj_list.length.toString() + ' rows for TaxonID "HMT-' + otid + '"'
    count_txt0 = 'For Taxon ' + helpers.make_otid_display_name(otid) + ' there  '+genom
  } else {  // not phylum, otid
    // all gids
    phylum=0
    otid = '0'
    //gid_obj_list1 = Object.values(C.genome_lookup);
    
    if (letter && letter.match(/[A-Z]{1}/)) {   // always caps
      // COOL....
        //console.log('big_temp_list[0]')
        //console.log(big_temp_list[0])
        
        gid_obj_list = big_temp_list.filter(item => item.genus.toUpperCase().charAt(0) === letter)
    
      //count_txt0 = 'Showing ' + gid_obj_list.length.toString() + ' rows for genus starting with "' + letter + '"'
      
      count_txt0 = 'Showing ' + gid_obj_list.length.toString() +' genome(s) that start with "'+letter+'".'
    } else {
      gid_obj_list = big_temp_list
      count_txt0 = 'Showing ' + gid_obj_list.length.toString() + ' rows.'
        letter='all'
    }
  }
  
  gid_obj_list.map(function mapGidObjList (el) {
        if (el.tlength) { 
            el.tlength = helpers.format_long_numbers(el.tlength); 
        }
        
  })
  
  send_list = gid_obj_list
  
  //console.log('send_list',send_list[0])  
  // get each secid from C.genome_lookup
  //console.log('seqid_list',gid_obj_list[0])
  // send_list.sort(function (a, b) {
  // return helpers.compareStrings_alpha(a.genus, b.genus);
  //     })
    // sort by two fields
  // send_list.sort( (a, b) =>
//     b.species - a.species || a.genus.localeCompare(b.genus),
//   )
  
    send_list.sort(function (a, b) {
      return helpers.compareByTwoStrings_alpha(a,b,'genus','species');
    })
  
  count_txt = count_txt0 //+ ' <small>(Total:' + (big_temp_list.length).toString() + ')</small> '
  let genomeList = []
  console.log('p '+phylum.toString()+' L '+letter)
  if(phylum === 0 && letter === "all"){
      pageData.trecords = send_list.length
  
      if (pageData.page) {
        const trows = send_list.length
        // console.log('trows',trows)
        pageData.row_per_page = 1000
        pageData.number_of_pages = Math.ceil(trows / pageData.row_per_page)
        if (pageData.page > pageData.number_of_pages) { pageData.page = 1 }
        if (pageData.page < 1) { pageData.page = pageData.number_of_pages }
        helpers.print(['page_data.number_of_pages', pageData.number_of_pages])
        pageData.show_page = pageData.page
        if (pageData.show_page === 1) {
          genomeList = send_list.slice(0, pageData.row_per_page) // first 200
          pageData.start_count = 1
        } else {
          genomeList = send_list.slice(pageData.row_per_page * (pageData.show_page - 1), pageData.row_per_page * pageData.show_page) // second 200
          pageData.start_count = pageData.row_per_page * (pageData.show_page - 1) + 1
        }
        //console.log('start count', pageData.start_count)
      }
  }else{
    genomeList = send_list
  }
  
  res.render('pages/genome/genometable', {
    title: 'HOMD :: Genome Table', 
    pgname: 'genome/genome_table', // for AbountThisPage
    config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV, rootPath: CFG.PROCESS_DIR, jb_path:CFG.PATH_TO_JBROWSE }),
    // seqid_list: JSON.stringify(gid_obj_list),
    //data: JSON.stringify(send_list),
    data: JSON.stringify(genomeList),
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
    user: JSON.stringify(req.user || {}),
    letter: letter,
    otid: otid,
    phylum: phylum,
    
    page_data: JSON.stringify(pageData),
    
    phyla: JSON.stringify(phyla.sort()),
    count_text: count_txt,
    search_txt: 0,
    search_field:'0',
    all_genome_count: big_temp_list.length,
    taxa_wgenomes: taxa_wgenomes.length
    
  })
})
//
router.post('/search_genometable', function searchGenomeTable(req, res) {
  helpers.print(req.body)
  const searchTxt = req.body.gene_srch.toLowerCase()
  const searchField = req.body.field
  var countTxt, countTxt0;
  //let seqrch_match = req.body.match
  //let search_sub = req.body.sub
  let big_tax_list = Object.values(C.taxon_lookup).filter(item => (item.status !== 'Dropped' && item.status !== 'NonOralRef'))
  let taxa_wgenomes = big_tax_list.filter(item => item.genomes.length >0)
  
  // FIXME
  let bigGeneList = Object.values(C.genome_lookup);
  const sendList = getFilteredGenomeList(bigGeneList, searchTxt, searchField)
  let pageData = {}
  let pgtitle = 'Search TaxTable'
  var phylaObj = C.homd_taxonomy.taxa_tree_dict_map_by_rank['phylum']
  var phyla = phylaObj.map(function mapPhylaObj2 (el) { return el.taxon; })
  countTxt0 =  'Showing ' + (sendList.length).toString() + ' rows using search string: "' + req.body.gene_srch + '".'
  countTxt = countTxt0 //+ ' <small>(Total:' + (bigGeneList.length).toString() + ')</small>'
  res.render('pages/genome/genometable', {
    title: 'HOMD :: Genome Table', 
    pgname: 'genome/genome_table', // for AbountThisPage
    config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV, jb_path:CFG.PATH_TO_JBROWSE }),
    
    //seqid_list: JSON.stringify(gid_obj_list),
    data: JSON.stringify(sendList),
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
    user: JSON.stringify(req.user || {}),
    letter: 'all',  // dont us empty string: -for download fxn
    otid: '0',   // dont us empty string: -for download fxn
    phylum: 0,  // dont us empty string: -for download fxn
    phyla: JSON.stringify(phyla.sort()),
    page_data: JSON.stringify(pageData),
    count_text: countTxt,
    search_txt: searchTxt,
    search_field: searchField,
    all_genome_count: bigGeneList.length,
    taxa_wgenomes: taxa_wgenomes.length
    
  })
  
}) 


//
// router.get('/jbrowse2/:id', function jbrowse2(req, res) {
//  console.log('jbrowse2/:id -get')
// })
// router.get('/jbrowse', function jbrowse (req, res) {
// //router.get('/taxTable', helpers.isLoggedIn, (req, res) => {
//   helpers.accesslog(req, res)
//   console.log('jbrowse-get')
//   //let myurl = url.parse(req.url, true);
//     
//   const gid = req.query.gid
//   let gc = 0
//   if(gid){
//       gc = helpers.get_gc_for_gccontent(C.genome_lookup[gid].gc)
//   }
//   const glist = Object.values(C.genome_lookup)
//   
//   glist.sort(function sortGList (a, b) {
//       return helpers.compareStrings_alpha(a.genus, b.genus)
//     })
//   // filter out empties then map to create list of sorted strings
//   const genomeList = glist.filter(item => item.genus !== '')
//     .map((el) => {
//       return { gid: el.gid, gc:el.gc, genus: el.genus, species: el.species, ccolct: el.ccolct }
//     })
//   res.render('pages/genome/jbrowse2_stub_iframe', {
//     title: 'HOMD :: JBrowse', 
//     pgname: 'genome/jbrowse', // for AbountThisPage
//     config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
//     gid: gid,  // default
//     gc:gc,
//     genomes: JSON.stringify(genomeList),
//     tgenomes: genomeList.length,
//     ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
//     user: JSON.stringify(req.user || {}),
//   })
// })
// //
// router.post('/jbrowse_ajax', function jbrowseAjaxPost (req, res) {
//   console.log('AJAX JBrowse')
//   helpers.print(req.body)
//   // URL from old HOMD site:
//   // ?data=homd/SEQF2029
//   //  &tracks=DNA,prokka,ncbi
//   //  &loc=SEQF2029|GL982453.1:2729587..4094422
//   //  &highlight=
//   //console.log(req.body);
//   helpers.accesslog(req, res)
//   //open(jburl)
//   
//   res.send(JSON.stringify({ response_data: req.body.gid }))
// })
//
router.get('/genome_description', function genomeDescription (req, res) {
  console.log('in genomedescription -get')
  
  //let myurl = url.parse(req.url, true);
  const gid = req.query.gid
  let data
  if(Object.prototype.hasOwnProperty.call(C.genome_lookup, gid)){
    data = C.genome_lookup[gid]
  }else{
    data = {}
  }
  //console.log(data)
  const q = queries.get_contigs(gid)
  
  let contigs = []
  // try get contigs from file:
  // ncbi only
  
  helpers.print(q)
  TDBConn.query(q, (err, rows) => {
  //ADBConn.query(q, (err, rows) => {
    if (err) {
        //console.log(err)
    }else{
        //console.log('contigs',rows)
        for(let r in rows){
           contigs.push({contig: rows[r].accession, gc: rows[r].GC})
        }
    }
    //console.log('contigs',contigs)
    //Pangenome
    // let pangenomes = {}
//     C.pangenomes.map(function(el){
//       if(el.seqids.indexOf(gid) !== -1){
//        pangenomes[el.pangenome_name] = {link: C.pangenome_base_link+'/'+el.pangenome_name, description: el.description}
//       }
//     })
		/*
	  1 Oral Taxon ID 191 
	  2 HOMD Sequence ID  SEQF1851  
	  3 HOMD Name (Genus, Species)  Propionibacterium acidifaciens  
	  4 Genome Sequence Name
	  (Name associated with genomic sequence) Acidipropionibacterium acidifaciens 
	  5 Comments on Name  NCBI Name : Propionibacterium acidifaciens  
	  6 Culture Collection Entry Number F0233 
	  7 Isolate Origin  NA  
	  8 Sequencing Status High Coverage 
	  9 NCBI Taxonomy ID  553198  
	  10  NCBI Genome BioProject ID 31003 
	  11  NCBI Genome BioSample ID  SAMN02436184  
	  12  GenBank Accession ID  ACVN00000000.2  
	  13  Genbank Assembly ID GCA_000478805.1 
	  14  Number of Contigs and Singlets  334
	  15  Combined Length (bps) 3,017,605
	  16  GC Percentage 70.36
	  17  Sequencing Center The Forsyth Institute - J. Craig Venter Institute 
	  18  ATCC Medium Number  NA  
	  19  Non-ATCC Medium NA
	  20  16S rRNA gene sequence
	  21 pangenome
	  22  Comments
	  */
  //console.log(C.genome_lookup[gid])
	  res.render('pages/genome/genomedesc', {
		title: 'HOMD :: Genome Info',
		pgname: 'genome/description', // for AbountThisPage 
		config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV, jb_path:CFG.PATH_TO_JBROWSE }),
		// taxonid: otid,
		data1: JSON.stringify(data),
		gid: gid,
		anviserver_link: C.anviserver_link,
		contigs: JSON.stringify(contigs.sort()),
		// data2: JSON.stringify(data2),
		// data3: JSON.stringify(data3),
		// data4: JSON.stringify(data4),
		ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
		user: JSON.stringify(req.user || {}),
	  })
  })
})

router.post('/get_16s_seq', function get16sSeqPost (req, res) {
  console.log('in get_16s_seq -post')
  
  helpers.print(req.body)
  const gid = req.body.seqid

  // express deprecated req.param(name): Use req.params, req.body, or req.query
  // See https://discuss.codecademy.com/t/whats-the-difference-between-req-params-and-req-query/405705
  // SELECT seq from db.table
  let q = queries.get_16s_rRNA_sequence_query(gid)
  helpers.print(q)
  let html
  TDBConn.query(q, (err, rows) => {
    if (err) {
      console.log(err)
      return
    }
    // console.log(rows)
    let seq = (rows[0]['16s_rRNA']).toUpperCase()
    helpers.print(['seq',seq])
    if(seq === "&LT;DIV ID=VIETDEVDIVID STYLE=&QUOT;POSITION:RELATIVE;FONT-FAMILY:ARIAL;FONT-SIZE:11PX&QUOT;&GT;&LT;/DIV&GT;"){
        html = 'No Sequence Found'
    }else{
        html = seq.replace(/&lt;/gi, '<').replace(/&gt;/gi, '>').replace(/&quot;/gi, '"').replace(/&amp;gt;/gi, '>').replace(/&amp;lt;/gi, '<')
    }
    helpers.print(['html',html])
    if (html === '') {
       html = 'No Sequence Found'
    }
    //console.log(html)
    res.send(html)
  })
})

router.post('/get_NN_NA_seq', function getNNNASeqPost (req, res) {
  console.log('in get_NN_NA_seq -post')
  console.log(req.body)
  //const fieldName = 'seq_' + req.body.type  // na or aa => seq_na or seq_aa
  const pid = req.body.pid
  //const db = req.body.db.toUpperCase()
  const db_pts = req.body.db.split('_')
  
  // let q = 'SELECT ' + fieldName + ' as seq FROM ' + db + '.ORF_seq'
//   q += " WHERE PID='" + pid + "'"
  
  let db
  let gid = db_pts[1]
  if(req.body.type == 'aa'){   // NCBI
      if(db_pts[0] == 'NCBI' || db_pts[0] == 'ncbi'){
          db = "`NCBI_faa`.`protein_seq`"
       }else{
          db = "`PROKKA_faa`.`protein_seq`"
       }
     
  }else{   //req.body.type == 'na':   // NCBI  na
      if(db_pts[0] == 'NCBI' || db_pts[0] == 'ncbi'){
          db = "`NCBI_ffn`.`ffn_seq`"
       }else{
          db = "`PROKKA_ffn`.`ffn_seq`"
       }
  }
  let q = 'SELECT UNCOMPRESS(seq_compressed) as seq FROM ' + db
  q += " WHERE seq_id ='"+gid+"' and protein_id='" + pid + "'"
  console.log('anno2 query '+q)
  TDBConn.query(q, (err, rows) => {
  //ADBConn.query(q, (err, rows) => {
    if (err) {
        console.log(err)
        return
    }
    //console.log(rows)
    const seqstr = (rows[0].seq).toString()
    console.log(seqstr)
    console.log(seqstr.length)
    const arr = helpers.chunkSubstr(seqstr, 80)
    const html = arr.join('<br>')
    //html = seqstr
    res.send(html)

  })
  
})
//
router.post('/open_explorer_search', function open_explorer_search (req, res) {
    console.log('in POST:open_explorer_search')
    console.log(req.body)
    let gid = req.body.gid
    let anno = req.body.anno
    let searchtext = req.body.searchtext
    let otid='',gc=0,annoInfoObj={}
    let organism = C.genome_lookup[gid].genus +' '+C.genome_lookup[gid].species+' '+C.genome_lookup[gid].ccolct
    const allAnnosObj = Object.keys(C.annotation_lookup).map((gid) => {
       return {gid: gid, org: C.annotation_lookup[gid].prokka.organism}
    })
    allAnnosObj.sort(function sortAnnos (a, b) {
       return helpers.compareStrings_alpha(a.org, b.org)
    })
    if (Object.prototype.hasOwnProperty.call(C.genome_lookup, gid)) {
        otid = C.genome_lookup[gid].otid
        gc = helpers.get_gc_for_gccontent(C.genome_lookup[gid].gc)
    }
    if (Object.prototype.hasOwnProperty.call(C.annotation_lookup, gid) && Object.prototype.hasOwnProperty.call(C.annotation_lookup[gid], anno)) {
      annoInfoObj = C.annotation_lookup[gid][anno]
    }
    
    const renderFxn = (req, res, args) => {
        res.render('pages/genome/explorer', {
          title: 'HOMD :: ' + args.gid,
          pgname: 'genome/explorer', // for AbountThisPage 
          config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
          ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
          user: JSON.stringify(req.user || {}),
          gid: args.gid,
          otid: args.otid,
          all_annos: JSON.stringify(args.allAnnosObj),
          anno_type: args.annoType,
          page_data: JSON.stringify(args.pageData),
          organism: args.organism,
          gc: args.gc,
          src_txt: args.searchtext,
          info_data: JSON.stringify(args.annoInfoObj),
          pid_list: JSON.stringify(args.pidList),
          returnTo: '/genome/explorer?gid='+args.gid,
      
        })
     }
   //  {
//     accession: 'SEQF1595|KI535340.1',
//     GC: 47.09,
//     PID: 'SEQF1595_00099',
//     product: 'Oligopeptide-binding protein AppA',
//     length: 1746,
//     start: 104870,
//     stop: 103125,
//     len_na: 1746,
//     len_aa: 581
//   },
    let page ={
          page: 1,
          trecords: req.session.site_search_result[anno][gid].length,
          row_per_page: req.session.site_search_result[anno][gid].length,
          number_of_pages: 1,
          show_page: 1,
          start_count: 1
        }
    // console.log('req.session.site_search_resultncbi length')
//     console.log(req.session.site_search_result.ncbi[gid].length)
//     console.log('req.session.site_search_result length')
    
    let pid_list = req.session.site_search_result[anno][gid].map(el => el.pid)
    const q = queries.get_annotation_query2(gid, anno, pid_list)
    
   //  let qSelectAnno = 'SELECT o.accession, GC, PID, product,length,`start`,`stop`,length(seq_na) as len_na,length(seq_aa) as len_aa FROM `' + anno + '_meta`.`orf`'
//   qSelectAnno += ' JOIN `' + anno + '_meta`.`molecules` ON `' + anno + '_meta`.`orf`.`mol_id`=`' + anno + '_meta`.`molecules`.id'
//   qSelectAnno += " WHERE PID in ('"+pid_list.join("','")+"')"
    // NEW: takes TDB
    // let q = 'SELECT accession,  gc, protein_id, product, length_na,length_aa, `start`, `stop`'
//       q += ' FROM `'+anno.toUpperCase()+'_meta`.`orf`'
//       q += " WHERE seq_id = '"+gid+"' and protein_id in ('"+pid_list.join("','")+"')"
    
    console.log(q)
    console.log('anno query '+q)
    let tmp = []
    
    TDBConn.query(q, (err, rows) => {
    //OLD ADBConn.query(q, (err, rows) => {
      if (err) {
        req.flash('fail', 'Query Error: "'+anno+'" annotation for '+gid)

        let args = {searchtext:searchtext,gid:gid,gc:gc,otid:otid,organism:organism,allAnnosObj:allAnnosObj,annoType:anno,pageData:{},annoInfoObj:{},pidList:[]}
        renderFxn(req, res, args)
        return
      } else {
        if (rows.length === 0) {
          console.log('no rows found')
        }else{

           let args = {searchtext: searchtext,gid:gid,gc:gc,otid:otid,organism:organism,allAnnosObj:allAnnosObj,annoType:anno,pageData:page,annoInfoObj:annoInfoObj,pidList:rows}
           renderFxn(req, res, args)
				   //  res.render('pages/genome/explorer', {
			//           title: 'HOMD :: ' + gid,
			//           pgname: 'genome/explorer', // for AbountThisPage 
			//           config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
			//           ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
			//           user: JSON.stringify(req.user || {}),
			//           gid: gid,
			//           otid: otid,
			//           all_annos: JSON.stringify(allAnnosObj),
			//           anno_type: anno,
			//           page_data: JSON.stringify(page),
			//           organism: organism,
			//           gc: gc,
			//           info_data: JSON.stringify(annoInfoObj),
			//           pid_list: JSON.stringify(rows),
			//           src_txt: searchtext,
			//           returnTo: '/genome/explorer?gid='+gid,
			//       
			//         })
    
        }
     }
    })  // end Conn
})
router.get('/explorer', function explorer (req, res) {
  console.log('in explorer')
  // let myurl = url.parse(req.url, true)
  const gid = req.query.gid
  
  let anno = req.query.anno || 'ncbi'
  
  
  helpers.print(['gid:', gid,'anno:',anno])
  
  // anno == 
  let annoInfoObj = {}
  let pageData = {}
  pageData.page = req.query.page
  if (!req.query.page) {
    pageData.page = 1
  }
  let organism = 'Unknown', pidList
  //let dbChoices = []
  let otid = 0,gc = 0
  //console.log('C.genome_lookup[gid]',C.genome_lookup[gid])
 
  let args = {}
  //const renderFxn = (req, res, gid, otid, organism,  allAnnosObj, annoType, pageData, annoInfoObj, pidList) => {
  const renderFxn = (req, res, args) => {
    //console.log(pageData)
    res.render('pages/genome/explorer', {
      title: 'HOMD :: ' + args.gid,
      pgname: 'genome/explorer', // for AbountThisPage 
      config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
      ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, jb_path:CFG.PATH_TO_JBROWSE }),
      user: JSON.stringify(req.user || {}),
      gid: args.gid,
      otid: args.otid,
      all_annos: JSON.stringify(args.allAnnosObj),
      anno_type: args.annoType,
      page_data: JSON.stringify(args.pageData),
      organism: args.organism,
      gc: args.gc,
      info_data: JSON.stringify(args.annoInfoObj),
      pid_list: JSON.stringify(args.pidList),
      src_txt:'',
      returnTo: '/genome/explorer?gid='+args.gid,
      
    })
  }
  
  // req, res, gid, otid,  organism, dbChoices,  allAnnosObj, anno
  // const tmpObj = Object.keys(C.annotation_lookup) // get prokka organisms [seqid,organism]
  const allAnnosObj = Object.keys(C.annotation_lookup).map((gid) => {
    return {gid: gid, org: C.annotation_lookup[gid].prokka.organism}
  })
  allAnnosObj.sort(function sortAnnos (a, b) {
      return helpers.compareStrings_alpha(a.org, b.org)
  })
  
  if (!gid || gid.toString() === '0') {
   
    args = {gid:0,gc:gc,otid:0,organism:'',allAnnosObj:allAnnosObj,annoType:anno,pageData:{},annoInfoObj:{},pidList:[]}
    renderFxn(req, res, args)
    return
  }else {
      if (Object.prototype.hasOwnProperty.call(C.annotation_lookup, gid)) {
        organism = C.annotation_lookup[gid].prokka.organism
      }else{
        req.flash('fail', 'Genome not found: "'+gid+'"')
        
        args = {gid:0,gc:gc,otid:0,organism:'',allAnnosObj:allAnnosObj,annoType:'',pageData:{},annoInfoObj:{},pidList:[]}
        renderFxn(req, res, args)
        return
      }
  }
  
  
  if (Object.prototype.hasOwnProperty.call(C.genome_lookup, gid)) {
        otid = C.genome_lookup[gid].otid
        gc = helpers.get_gc_for_gccontent(C.genome_lookup[gid].gc)
  }
  if(gid && !anno) {
      
      args = {gid:gid,gc:gc,otid:0,organism:organism,allAnnosObj:allAnnosObj,annoType:'',pageData:{},annoInfoObj:{},pidList:[]}
      renderFxn(req, res, args)
      return
  }
 
  
  // now annotations
  if (Object.prototype.hasOwnProperty.call(C.annotation_lookup, gid) && Object.prototype.hasOwnProperty.call(C.annotation_lookup[gid], anno)) {
    annoInfoObj = C.annotation_lookup[gid][anno]
  } else {
    req.flash('fail', 'Could not find: "'+anno+'" annotation for '+gid)

    args = {gid:gid,gc:gc,otid:otid,organism:organism,allAnnosObj:allAnnosObj,annoType:anno,pageData:{},annoInfoObj:{},pidList:[]}
    renderFxn(req, res, args)
    return
  }

  //OLD DB
  const q = queries.get_annotation_query(gid, anno)
  //NEW DB
  // let q = 'SELECT accession,  gc, protein_id, product, length_na,length_aa, `start`, `stop`'
//   q += ' FROM `'+anno.toUpperCase()+'_meta`.`orf`'
//   q += " WHERE seq_id = '"+gid+"'"
  
  //select GC, PID, product, length_na,length_aa, `start`, `stop` FROM `PROKKA_meta`.`orf`  WHERE seq_id = 'SEQF1595'
  
  console.log('anno query '+q)
  //OLD ADBConn.query(q, (err, rows) => {
  TDBConn.query(q, (err, rows) => {
    if (err) {
      req.flash('fail', 'Query Error: "'+anno+'" annotation for '+gid)

      args = {gid:gid,gc:gc,otid:otid,organism:organism,allAnnosObj:allAnnosObj,annoType:anno,pageData:{},annoInfoObj:annoInfoObj,pidList:[]}
      renderFxn(req, res, args)
      return
    } else {
      if (rows.length === 0) {
        console.log('no rows found')
      }
      pageData.trecords = rows.length
      if (pageData.page) {
        const trows = rows.length
        // console.log('trows',trows)
        pageData.row_per_page = 200
        pageData.number_of_pages = Math.ceil(trows / pageData.row_per_page)
        if (pageData.page > pageData.number_of_pages) { pageData.page = 1 }
        if (pageData.page < 1) { pageData.page = pageData.number_of_pages }
        helpers.print(['page_data.number_of_pages', pageData.number_of_pages])
        pageData.show_page = pageData.page
        if (pageData.show_page === 1) {
          pidList = rows.slice(0, pageData.row_per_page) // first 200
          pageData.start_count = 1
        } else {
          pidList = rows.slice(pageData.row_per_page * (pageData.show_page - 1), pageData.row_per_page * pageData.show_page) // second 200
          pageData.start_count = pageData.row_per_page * (pageData.show_page - 1) + 1
        }
        //console.log('start count', pageData.start_count)
      }
      
      args = {gid:gid,gc:gc,otid:otid,organism:organism,allAnnosObj:allAnnosObj,annoType:anno,pageData:pageData,annoInfoObj:annoInfoObj,pidList:pidList}
      renderFxn(req, res, args)
    }
  })
})
//
//
router.get('/blast_server', function genome_blast_server(req, res) {
    res.render('pages/blast/blast_server', {
        title: 'HOMD :: HOMD Blast Server',
        pgname: '', // for AbountThisPage
        config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV, blast_version: CFG.BLAST_VERSION }),
        ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
        user: JSON.stringify(req.user || {}),
        blast_type: 'genome'
      })
})

router.get('/blast', function blast_get(req, res) {
   console.log('in genome blast-GET')
   let chosen_gid = req.query.gid
   if(!chosen_gid){chosen_gid='all'}
   console.log('chosen gid=',chosen_gid)
   let sg = helpers.makeid(3).toUpperCase()
   let organism,dbChoices
   const allAnnosObj = Object.keys(C.annotation_lookup).map((gid) => {
    return {gid: gid, org: C.annotation_lookup[gid].prokka.organism}
   })
   allAnnosObj.sort(function sortAnnos (a, b) {
      return helpers.compareStrings_alpha(a.org, b.org)
   })
   //let dbChoices = C.all_genome_blastn_db_choices.nucleotide   //.nucleotide.map((x) => x); // copy array
    if(! chosen_gid || chosen_gid == 0|| chosen_gid ==='all'){
      dbChoices = C.all_genome_blastn_db_choices.nucleotide
      organism = ''
    }else{
      organism = C.annotation_lookup[chosen_gid].prokka.organism
      dbChoices = [
      {name: "This Organism's ("+organism + ") Genomic DNA", value:'org_genomes1', programs:['blastn','tblastn','tblastx'],
               filename:'fna/'+chosen_gid+'.fna'},
      {name: "This Organism's ("+organism + ") DNA of Annotated Proteins", value:'org_genomes2', programs:['blastn','tblastn','tblastx'],
               filename:'ffn/'+chosen_gid+'.ffn'}
      ]
    }
    
    res.render('pages/genome/blast', {
        title: 'HOMD :: Ribosomal Protein Tree',
        pgname: 'blast/blast', // for AbountThisPage
        config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
        ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
        user: JSON.stringify(req.user || {}),
        blastFxn: 'genome',
        organism: organism,
        gid: chosen_gid,
        spamguard: sg,
        all_annos: JSON.stringify(allAnnosObj),
        blast_prg: JSON.stringify(C.blastPrograms),
        db_choices: JSON.stringify(dbChoices),
        returnTo: '/genome/blast',
        blastmax: JSON.stringify(C.blast_max_file),
        blast_version: CFG.BLAST_VERSION,
      })
   
})
// router.post('/blast', function blast_post(req, res) {
//    console.log('in genome blast POST')
//    console.log('body',req.body)
//    const chosen_gid = req.body.gid
//    
//    const allAnnosObj = Object.keys(C.annotation_lookup).map((gid) => {
//     return {gid: gid, org: C.annotation_lookup[gid].prokka.organism}
//    })
//    allAnnosObj.sort(function sortAnnos (a, b) {
//       return helpers.compareStrings_alpha(a.org, b.org)
//    })
//    let dbChoices = C.all_genome_blastn_db_choices.nucleotide   //.nucleotide.map((x) => x); // copy array
// 
//    res.render('pages/genome/blast', {
//         title: 'HOMD :: Ribosomal Protein Tree',
//         pgname: 'blast', // for AbountThisPage
//         config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
//         ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
//         blastFxn: 'genome',
//         organism: '',
//         gid: chosen_gid,
//         all_annos: JSON.stringify(allAnnosObj),
//         blast_prg: JSON.stringify(C.blastPrograms),
//         db_choices: JSON.stringify(dbChoices),
//         returnTo: '/genome/blast',
//         blastmax: JSON.stringify(C.blast_max_file),
//       })
//    
// })
// router.post('/changeBlastGenomeDbs', function changeBlastGenomeDbs (req, res) {
//     console.log('in changeBlastGenomeDbs AJAX')
//     helpers.print(req.body)
//     let db = req.body.db
//     let gid = req.body.gid
//     let organism = '',dbChoices
//     if (Object.prototype.hasOwnProperty.call(C.annotation_lookup, gid)) {
//        organism = C.annotation_lookup[gid].prokka.organism
//      }
//     
//     let html = "<select class='dropdown' id='blastDb' name='blastDb'>"
//     if(db === 'blastn' || db === 'tblastn' || db ==='tblastx'){
//        dbChoices = C.all_genome_blastn_db_choices.nucleotide.map((x) => x)
//        if(gid != 'all'){
//            html += "<option value='fna/"+gid+".fna'>This Organism's ("+organism + ") Genomic DNA</option>"
//            html += "<option value='ffn/"+gid+".ffn'>This Organism's ("+organism + ") DNA of Annotated Proteins</option>"
//        }else{
//            html += "<option value='"+dbChoices[0].filename+"'>"+dbChoices[0].name+"</option>"
//            html += "<option value='"+dbChoices[1].filename+"'>"+dbChoices[1].name+"</option>"
//        }
//        
//     }else{  // blastp and blastx
//        dbChoices = C.all_genome_blastn_db_choices.protein.map((x) => x)
//        if(gid != 'all'){
//            html += "<option value='faa/"+gid+".faa'>This Organism's ("+organism + ") DNA of Annotated Proteins</option>"
//        }else{
//            html += "<option value='"+dbChoices[0].filename+"'>"+dbChoices[0].name+"</option>"
//        }
//     }
//     html += "</select>"
//     res.send(html)
//     
// })
// 2021-06-15  opening trees in new tab because thet take too long to open in an iframe
// which makes the main menu non functional
// These functions are used to open trees with a search for odid or genomeID
// The main menu goues through routes_homd::open_tree
router.get('/conserved_protein_tree', function conservedProteinTree (req, res) {
  
  console.log('in conserved_protein_tree')
  // let myurl = url.URL(req.url, true);
  const otid = req.query.otid
  const fullname = helpers.make_otid_display_name(otid)
  helpers.print(fullname)
  fs.readFile('public/trees/conserved_tree.svg', 'utf8', function readSVGFile1 (err, data) {
    if (err) {
      console.log(err)
    } else {
      res.render('pages/genome/conserved_protein_tree', {
        title: 'HOMD :: Conserved Protein Tree',
        pgname: 'genome/tree', // for AbountThisPage
        config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
        ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
        user: JSON.stringify(req.user || {}),
        svg_data: JSON.stringify(data),
        otid: fullname
      })
    }
  })
})
router.get('/ribosomal_protein_tree', function ribosomalProteinTree (req, res) {
  helpers.accesslog(req, res)
  console.log('in ribosomal_protein_tree')

  const otid = req.query.otid
  fs.readFile('public/trees/ribosomal_tree.svg', 'utf8', function readSVGFile2 (err, data) {
    if (err) {
      console.log(err)
    } else {
      res.render('pages/genome/ribosomal_protein_tree', {
        title: 'HOMD :: Ribosomal Protein Tree',
        pgname: 'genome/tree', // for AbountThisPage
        config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
        ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
        user: JSON.stringify(req.user || {}),
        svg_data: JSON.stringify(data),
        otid: otid
      })
    }
  })
})
router.get('/rRNA_gene_tree', function rRNAGeneTree (req, res) {
  helpers.accesslog(req, res)
  console.log('in rRNA_gene_tree')
  // const myurl = url.URL(req.url, true)
  // const myurl = new url.URL(req.url)
  const otid = req.query.otid
  helpers.print(['otid', otid])
  fs.readFile('public/trees/16S_rRNA_tree.svg', 'utf8', function readSVGFile3 (err, data) {
    if (err) {
      console.log(err)
    }
    res.render('pages/genome/rRNA_gene_tree', {
      title: 'HOMD :: rRNA Gene Tree',
      pgname: 'genome/tree', // for AbountThisPage
      config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
      ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
      user: JSON.stringify(req.user || {}),
      svg_data: JSON.stringify(data),
      otid: otid
    })
  })
})
//
//
router.get('/dld_table/:type/:letter/:phylum/:otid/:search_txt/:search_field', function dldTable (req, res) {
  helpers.accesslog(req, res)
  console.log('in download table -genome:')
  
  const type = req.params.type
  const letter = req.params.letter
  const phylum = req.params.phylum
  const otid = req.params.otid
  const searchText = req.params.search_txt
  const searchField = req.params.search_field

  helpers.print(['type', type,'letter', letter,'phylum', phylum,'otid', otid])
  // Apply filters
  const tempList = Object.values(C.genome_lookup)
  let sendList = []
  let fileFilterText = ''
  if (letter && letter.match(/[A-Z]{1}/)) { // always caps
    //console.log('in letter dnld')
    helpers.print(['MATCH Letter: ', letter])
    sendList = tempList.filter(item => item.genus.charAt(0) === letter)
    helpers.print(sendList)
    fileFilterText = "HOMD.org Genome Data::Letter Filter Applied (genus with first letter of '" + letter + "')"
  } else if (otid > 0) {
    //console.log('in otid dnld')
    const gidList = C.taxon_lookup[otid].genomes
    // console.log('sil',seqid_list)
    for (let n in gidList) {
      sendList.push(C.genome_lookup[gidList[n]])
    }
    fileFilterText = 'HOMD.org Genome Data::Oral TaxonID: HMT-' + ('000' + otid).slice(-3)
  } else if (phylum !== 0 && phylum !== '0') {
    //console.log('in phylum dnld')
    const lineageList = Object.values(C.taxon_lineage_lookup)
    const objList = lineageList.filter(item => item.phylum === phylum) // filter for phylum
    
    const otidList = objList.map((el) => { // get list of otids with this phylum
      return el.otid
    })
    helpers.print(['otid_list', otidList])
    sendList = tempList.filter(item => { // filter genome obj list for inclusion in otid list
      return otidList.indexOf(item.otid) !== -1
    })
    helpers.print(['cksend_list', sendList])
    fileFilterText = 'HOMD.org Genome Data::Phylum: ' + phylum
  } else if (searchText !== '0') {
    const bigGeneList = Object.values(C.genome_lookup)
    sendList = getFilteredGenomeList(bigGeneList, searchText, searchField)
    fileFilterText = 'HOMD.org Genome Data::Search Text: ' + searchText
  } else {
    // whole list as last resort
    //console.log('in all dnld')
    sendList = tempList
    fileFilterText = 'HOMD.org Genome Data:: All Genome Data'
  }
  const listOfGids = sendList.map(item => item.gid)
  fileFilterText = fileFilterText + ' Date: ' + today

  helpers.print(['listOfGids', listOfGids])
  // type = browser, text or excel
  const tableTsv = createTable(listOfGids, 'table', type, fileFilterText)
  if (type === 'browser') {
    res.set('Content-Type', 'text/plain') // <= important - allows tabs to display
  } else if (type === 'text') {
    res.set({ 'Content-Disposition': 'attachment; filename="HOMD_genome_table' + today + '_' + currentTimeInSeconds + '.txt"' })
  } else if (type === 'excel') {
    res.set({ 'Content-Disposition': 'attachment; filename="HOMD_genome_table' + today + '_' + currentTimeInSeconds + '.xls"' })
  } else {
    // error
    console.log('Download table format ERROR')
  }
  res.send(tableTsv)
  res.end()
})

// /////////////////////////////
// ////////////////////////////
function createTable (gids, source, type, startText) {
  let txt = startText + '\n'
  if (source === 'table') {
    const headersRow = ['Genome-ID', 'Oral_Taxon-ID', 'Genus', 'Species', 'Status', 'No. Contigs', 'Sequencing Center', 'Total Length', 'Oral Pathogen', 'Culture Collection', 'GC %', 'NCBI Genome-ID', 'NCBI BioProject-ID', 'NCBI BioSample-ID', 'Isolate Origin', 'atcc_mn', 'non_atcc_mn', 'Genbank Acc no.', 'Genbank Assembly', '16S rRNA', '16S rRNA Comment', 'flag_id']
    txt += headersRow.join('\t')

    for (let n in gids) {
      const gid = gids[n]
      const obj = C.genome_lookup[gid]
      // per FDewhirst: species needs to be unencumbered of genus for this table
      let species = obj.species.replace(obj.genus,'').trim()
      const r = [gid, obj.otid, obj.genus, species, obj.status, obj.ncontigs, obj.submitter, obj.tlength, obj.oral_path, obj.ccolct, obj.gc, obj.ncbi_genomeid, obj.ncbi_bpid, obj.ncbi_bsid, obj.io, obj.atcc_mn, obj.non_atcc_mn, obj.gb_acc, obj.gb_asmbly, obj['16s_rrna'], obj['16s_rrna_comment'], obj.flag]
      txt += '\n' + r.join('\t')
    }
  }
  // console.log(txt)
  return txt
}

//
function getFilteredGenomeList (gidObjList, searchText, searchField) {
  let sendList, tmpSendList
  const tempObj = {}
  if (searchField === 'taxid') {
    sendList = gidObjList.filter(item => item.otid.toLowerCase().includes(searchText))
  } else if (searchField === 'seqid') {
    sendList = gidObjList.filter(item => item.gid.toLowerCase().includes(searchText))
  } else if (searchField === 'genus') {
    sendList = gidObjList.filter(item => item.genus.toLowerCase().includes(searchText))
  } else if (searchField === 'species') {
    sendList = gidObjList.filter(item => item.species.toLowerCase().includes(searchText))
  } else if (searchField === 'ccolct') {
    sendList = gidObjList.filter(item => item.ccolct.toLowerCase().includes(searchText))
  } else if (searchField === 'io') {
    sendList = gidObjList.filter(item => item.io.toLowerCase().includes(searchText))
  } else if (searchField === 'status') {
    sendList = gidObjList.filter(item => item.status.toLowerCase().includes(searchText))
  } else if (searchField === 'submitter') {
    sendList = gidObjList.filter(item => item.submitter.toLowerCase().includes(searchText))
  }  else if (searchField === 'seq_center') {
    sendList = gidObjList.filter(item => item.seq_center.toLowerCase().includes(searchText))
  } else {
     // gid
    tmpSendList = gidObjList.filter(item => item.gid.toLowerCase().includes(searchText))
    for (let n in tmpSendList) {
      tempObj[tmpSendList[n].gid] = tmpSendList[n]
    }
    //otid
    tmpSendList = gidObjList.filter(item => item.otid.toLowerCase().includes(searchText))
    // for uniqueness convert to object::otid THIS is WRONG: Must be gid
    for (let n in tmpSendList) {
      tempObj[tmpSendList[n].gid] = tmpSendList[n]
    }
    
    
		tmpSendList = gidObjList.filter(item => item.genus.toLowerCase().includes(searchText))
		// for uniqueness convert to object::gid
		for (let n in tmpSendList) {
		  tempObj[tmpSendList[n].gid] = tmpSendList[n]
		}
		// species
		tmpSendList = gidObjList.filter(item => item.species.toLowerCase().includes(searchText))
		// for uniqueness convert to object::gid
		for (let n in tmpSendList) {
		  tempObj[tmpSendList[n].gid] = tmpSendList[n]
		}
    
    // culture collection
    tmpSendList = gidObjList.filter(item => item.ccolct.toLowerCase().includes(searchText))
    // for uniqueness convert to object::gid
    for (let n in tmpSendList) {
      tempObj[tmpSendList[n].gid] = tmpSendList[n]
    }
    // isolation origin
    tmpSendList = gidObjList.filter(item => item.io.toLowerCase().includes(searchText))
    // for uniqueness convert to object::gid
    for (let n in tmpSendList) {
      tempObj[tmpSendList[n].gid] = tmpSendList[n]
    }
    // seq status
    tmpSendList = gidObjList.filter(item => item.status.toLowerCase().includes(searchText))
    // for uniqueness convert to object::gid
    for (let n in tmpSendList) {
      tempObj[tmpSendList[n].gid] = tmpSendList[n]
    }
    // submitter
    if(gidObjList[0].hasOwnProperty('submitter')){
      tmpSendList = gidObjList.filter(item => item.submitter.toLowerCase().includes(searchText))
    }else{
      tmpSendList = gidObjList.filter(item => item.seq_center.toLowerCase().includes(searchText))
    }
    // for uniqueness convert to object::gid
    for (let n in tmpSendList) {
      tempObj[tmpSendList[n].gid] = tmpSendList[n]
    }
    // now back to a list
    sendList = Object.values(tempObj)
  }
  return sendList
}

module.exports = router
