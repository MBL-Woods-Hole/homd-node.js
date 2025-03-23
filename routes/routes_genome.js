'use strict'
const express   = require('express')
var router    = express.Router()
const CFG     = require(app_root + '/config/config')
const fs        = require('fs-extra')
//const url     = require('url')
const path      = require('path')
const C       = require(app_root + '/public/constants')
const helpers   = require(app_root + '/routes/helpers/helpers')
const helpers_taxa   = require(app_root + '/routes/helpers/helpers_taxa')
const helpers_genomes   = require(app_root + '/routes/helpers/helpers_genomes')
const queries = require(app_root + '/routes/queries')
// const open = require('open')
const createIframe = require("node-iframe")
const https = require('https'); 

router.get('/overview', function overview(req, res) {
    //console.log('in RESET-session')
    let crispr_data = JSON.parse(fs.readFileSync(path.join(CFG.PATH_TO_DATA,'homdData-Crispr.json')))
    //console.log('crispr_data:',Object.keys(crispr_data).length)
    res.render('pages/genome/overview', {
        title: 'HOMD :: Genome Overview', 
        pgname: '', // for AboutThisPage
        config: JSON.stringify(CFG),
        ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),
        pgtitle: 'Genome Overview',
        crispr_size: Object.keys(crispr_data).length,
        
    })
});

function renderGenomeTable(req, res, args) {
    //console.log('render NEW filter') 
    let alltax_list = Object.values(C.taxon_lookup)  //.filter(item => (item.status !== 'Dropped' && item.status !== 'NonOralRef'))
    let taxa_wgenomes = alltax_list.filter(item => item.genomes.length >0)
    let gcount = 0
    for(let n in alltax_list){
       gcount +=  alltax_list[n].genomes.length
    }
    //let alltax_list = Object.values(C.genome_lookup).filter(item => (item.status !== 'Dropped' && item.status !== 'NonOralRef'))
    //console.log('args.filter_on',args.filter_on)
    res.render('pages/genome/genometable', {
        title: 'HOMD :: Genome Table', 
        pgname: 'genome/genome_table', // for AboutThisPage
        config: JSON.stringify(CFG),
        ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),
        pgtitle: 'Genome Table',
        data: JSON.stringify(args.send_list),
        filter: JSON.stringify(args.filter),
        pd: JSON.stringify(args.pd),
        gcount: gcount, 
        tcount: taxa_wgenomes.length,
        phyla: JSON.stringify(helpers_taxa.get_all_phyla().sort()),
        count_txt: args.count_txt,
        taxa_wgenomes: get_taxa_wgenomes().length,
        filter_on: args.filter_on,
        no_ncbi_annot: JSON.stringify(C.no_ncbi_annotation)
    })
}
function get_default_annot_filter(){
    let defaultfilter = {
        text:{
            txt_srch: '',
            field: 'all',
        },
        sort_col: 'molecule',
        sort_rev: 'off'
    }
    return defaultfilter
}


function get_taxa_wgenomes(){
    let alltax_list = Object.values(C.taxon_lookup).filter(item => (item.status !== 'Dropped' && item.status !== 'NonOralRef'))
    let taxa_wgenomes = alltax_list.filter(item => item.genomes.length >0)
    return taxa_wgenomes
}
function init_page_data(){
   let page_data = {}
   page_data.rows_per_page = C.PAGER_ROWS
   
   return page_data
}
function apply_pages(glist,fltr, pd){
  let genomeList
  pd.trecords = glist.length
  //console.log('fltr',fltr,pd)
  
  const trows = pd.trecords
  if(trows > pd.rows_per_page){
    
    //console.log('IN PD trows',trows)
    
    pd.number_of_pages = Math.ceil(trows / pd.rows_per_page)
    if (pd.page > pd.number_of_pages) { pd.page = 1 }
    if (pd.page < 1) { pd.page = pd.number_of_pages }
    helpers.print(['page_data.number_of_pages', pd.number_of_pages])
    pd.show_page = pd.page
    if (pd.show_page === 1) {
      
      genomeList = glist.slice(0, pd.rows_per_page) // first 500
      
      pd.start_count = 1
    } else {
    //let obj1a = glist.filter(o => o.species === 'coli');
    //console.log('coli1a',obj1a.length)
    //console.log(pd.rows_per_page * (pd.show_page - 1), pd.rows_per_page * pd.show_page)
      genomeList = glist.slice(pd.rows_per_page * (pd.show_page - 1), pd.rows_per_page * pd.show_page) // second 200
    //let obj1b = genomeList.filter(o => o.species === 'coli');
    //console.log('coli1b',obj1b.length)
      //genomeList = send_list.slice(pageData.row_per_page * (pageData.show_page - 1), pageData.row_per_page * pageData.show_page)
      pd.start_count = pd.rows_per_page * (pd.show_page - 1) + 1
    }
    //console.log('start count', pageData.start_count)
  }else{
    
    genomeList = glist
    
  }
  return {glist: genomeList, pd: pd}
}
function set_gtable_session(req) {
    
    //console.log('set sess body',req.body)
    //console.log('xsession',req.session)
    let letter = '0'
    if(req.session.gtable_filter && req.session.gtable_filter.letter){
       letter = req.session.gtable_filter.letter
    }
    req.session.gtable_filter = helpers_genomes.get_default_gtable_filter()
    req.session.gtable_filter.letter = letter
    req.session.gtable_filter.category.complete_genome = 'off'
    req.session.gtable_filter.category.scaffold = 'off'
    req.session.gtable_filter.category.contig = 'off'
    req.session.gtable_filter.category.chromosome = 'off'
    req.session.gtable_filter.category.mag = 'off'
    for( let item in req.body){
       if(item == 'letter'){
         req.session.gtable_filter.letter = req.body.letter
       }
       if(item == 'sort_col'){
         req.session.gtable_filter.sort_col = req.body.sort_col
       }
       if(item == 'sort_rev'){
         req.session.gtable_filter.sort_rev = 'on'
       }
       if(item == 'phylum'){
         req.session.gtable_filter.phylum = req.body.phylum
       }
       if(item == 'txt_srch'){
         req.session.gtable_filter.text.txt_srch = req.body.txt_srch.toLowerCase()
       }
       if(item == 'field'){
         req.session.gtable_filter.text.field = req.body.field
       }
       if(item == 'paging'){
         req.session.gtable_filter.paging = req.body.paging
       }
       // Genome Category
       if(item == 'complete_genome'){
         req.session.gtable_filter.category.complete_genome = 'on'
       }
       if(item == 'scaffold'){
         req.session.gtable_filter.category.scaffold = 'on'
       }
       if(item == 'contig'){
         req.session.gtable_filter.category.contig = 'on'
       }
       if(item == 'chromosome'){
         req.session.gtable_filter.category.chromosome = 'on'
       }
       if(item == 'mag'){
         req.session.gtable_filter.category.mag = 'on'
       }
    }
    
}
function filter_for_phylum(glist, phy){
    //console.log('phy',phy)
    //console.log('glist',glist.length)
    var lineage_list = Object.values(C.taxon_lineage_lookup)
    var obj_lst = lineage_list.filter(item => item.phylum === phy)  //filter for phylum 
    var otid_list = obj_lst.map( (el) =>{  // get list of otids with this phylum
        return el.otid
    })
    //console.log('otid_list1',otid_list.length)
    let otid_grabber = {}
    //console.log('glist1',glist[1])
    let gid_obj_list = glist.filter(item => {   // filter genome obj list for inclusion in otid list
        if(otid_list.indexOf(item.otid.toString()) !== -1){
            otid_grabber[item.otid] = 1
            return true
        }
        //return otid_list.indexOf(item.otid) !== -1
    })
    //console.log('obj_lst',obj_lst)
    //console.log('otid_grabber2',otid_list)
    //console.log('gid_obj_list',gid_obj_list)
    // now get just the otids from the selected gids
    gid_obj_list.map( (el) =>{ 
       //console.log('el',el)
       return el.otid 
    
    })
    return gid_obj_list
}

function get_filter_on(f, type){
    // for comparison stringify
    let d,fxn
    if(type == 'annot'){
       d = get_default_annot_filter()
    }else{
       d = helpers_genomes.get_default_gtable_filter()
    }
    let obj1 = JSON.stringify(d)
    let obj2 = JSON.stringify(f)
    if(obj1 === obj2){
      return 'off'
    }else{
      return 'on'
    }
}
function apply_species(lst){
   let otid,sp=''
   let subspecies = ''
   
   for(let i in lst){
      otid = lst[i].otid
      //sp = lst[i].species
      //console.log('otid',otid)
      lst[i].genus = C.taxon_lineage_lookup[otid].genus
      lst[i].species = C.taxon_lineage_lookup[otid].species
      lst[i].subspecies = ''
      if(C.taxon_lineage_lookup.hasOwnProperty(otid) && C.taxon_lineage_lookup[otid].subspecies){
        //subspecies = ' <small>['+C.taxon_lineage_lookup[otid].subspecies+']</small>'
        //lst[i].species = sp + subspecies
        lst[i].subspecies = C.taxon_lineage_lookup[otid].subspecies
      }
   }
   return lst

}
router.get('/reset_gtable', function gen_table_reset(req, res) {
   //console.log('in RESET-session')
   req.session.gtable_filter = helpers_genomes.get_default_gtable_filter()
   res.redirect('back');
});
router.get('/genome_table', function genome_table(req, res) {
    
    // https://www.ncbi.nlm.nih.gov/assembly/GCF_000160075.2/?shouldredirect=false
    helpers.print('In GET Genome Table')
    let filter={}, send_list, showing,ret,count_before_paging,args,count_txt
    let page_data = init_page_data()
    //console.log('page data',page_data)
    //console.log('req.query',req.query)
    if(req.query.page){
       page_data.page = parseInt(req.query.page)
       if(req.session.gtable_filter){
          filter = req.session.gtable_filter
       }else{
          filter = helpers_genomes.get_default_gtable_filter()
       }
    }else{
       page_data.page = 1
       page_data.start_count = 1
       filter = helpers_genomes.get_default_gtable_filter()
    }
    //console.log('filter',filter)
    //console.log('gfiletr from default')
    // Filter defaults to nul on initial GET
    //filter = helpers.get_default_gtable_filter()
    req.session.gtable_filter = filter
    
    
    if(req.query.otid){
    //console.log('GT GOT otid',otid)
       // reset gtable_filter here because we are coming from tax_table button
       // and expect to see the few genomes for this one taxon
       filter = helpers_genomes.get_default_gtable_filter()
       req.session.gtable_filter = filter
       if(req.session.ttable_filter){
           req.session.ttable_filter.otid = req.query.otid
       }
       //console.log('got otid '+req.query.otid)
       let seqid_list = C.taxon_lookup[req.query.otid].genomes
       //seqid_list =[ 'SEQF10000.1', 'SEQF10001.1', 'SEQF10010.1' ]
       //console.log('sil',seqid_list)
       send_list = []
       for (var n in seqid_list) {
          if(C.genome_lookup.hasOwnProperty(seqid_list[n])){
             send_list.push(C.genome_lookup[seqid_list[n]])
          }
       }
    }else{
       send_list = helpers_genomes.apply_gtable_filter(req, filter)
    }
    
    //console.log('send_list[0]',send_list[0])
    count_before_paging = send_list.length
    // Initial page = 1 for fast load
    // no paging in POST side
    let pager_txt = ''
    let space = '&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;'
    if(filter.paging === 'on'){
      ret = apply_pages(send_list, filter, page_data)
      send_list = ret.glist
      page_data = ret.pd
      //console.log('get init pd',page_data)
      //console.log(page_data)
      
      if(count_before_paging > send_list.length){
         //console.log('must add pager txt')
         pager_txt = "page: <span class='gray'>"+page_data.page + " (of "+page_data.number_of_pages+"p)</span>"+space
         let next = (page_data.page + 1).toString()
         let prev = (page_data.page - 1).toString()
         pager_txt += "<a href='genome_table?page="+prev+"'> Previous Page</a>"
         pager_txt += "<==><a href='genome_table?page="+next+"'>Next Page</a>"
         pager_txt += space+"Jump to Page: <select class='gray' onchange=\"document.location.href='genome_table?page='+this.value\" >"
         for(var i=1;i<=page_data.number_of_pages;i++){
            if(i == parseInt(page_data.page)){
              pager_txt +='<option selected value="'+i+'">pg: '+i+'</option>'
            }else{
              pager_txt +='<option value="'+i+'">pg: '+i+'</option>'
            }
         }
         pager_txt += "</select>"+space+"(<a href='genome_table?page=1'>Return to Page1</a>)"
      }
    }
    page_data.count_before_paging = count_before_paging
    //console.log('pagedata',page_data)
    if(pager_txt != ''){
        pager_txt = space+pager_txt
    }
    count_txt = 'Number of Records Found: '+page_data.count_before_paging.toString()+ space+'Showing: '+send_list.length.toString()+' rows'+ pager_txt
    // apply sub-species to species
    send_list = apply_species(send_list)
    send_list.map(function mapGidObjList (el) {
        if (el.combined_size) { 
            el.combined_size = helpers.format_long_numbers(el.combined_size); 
        }
    })
    // DONOT SORT HERE == SORT IN FILTER
    args = {filter: filter, send_list: send_list, count_txt: count_txt, pd:page_data, filter_on: get_filter_on(filter,'genome')}
    //console.log('list[0]',send_list[0])
    renderGenomeTable(req, res, args)

});
router.post('/genome_table', function genome_table_post(req, res) {
    console.log('in POST gt filter')
    //console.log(req.body)
    let filter, send_list, page_data,count_before_paging,pager_txt,ret,args,count_txt
    set_gtable_session(req)
    //console.log('gtable_session',req.session.gtable_filter)
    filter = req.session.gtable_filter
    //console.log('filter',filter)
    send_list = helpers_genomes.apply_gtable_filter(req, filter)
    // format big nums
    
    //let obj1 = send_list.filter(o => o.species === 'coli');
    //console.log('coli1',obj1.length)
    count_before_paging = send_list.length
    page_data = init_page_data()
    page_data.page=1
    pager_txt = ''
    let space = '&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;'
    if(filter.paging === 'on'){
       ret = apply_pages(send_list, filter, page_data)
       send_list = ret.glist
       page_data = ret.pd
       //console.log('pd1',page_data)
       if(count_before_paging > send_list.length){
         pager_txt = space+"page: <span class='gray'>"+page_data.page + " (of "+page_data.number_of_pages+"p)</span>"
         let next = (page_data.page + 1).toString()
         let prev = (page_data.page - 1).toString()
         pager_txt += "<a href='genome_table?page="+prev+"'> Previous Page</a>"
         pager_txt += "<==><a href='genome_table?page="+next+"'>Next Page</a>"
         pager_txt += space+"Jump to Page: <select class='gray' onchange=\"document.location.href='genome_table?page='+this.value\" >"
         for(var i=1;i<=page_data.number_of_pages;i++){
            if(i == parseInt(page_data.page)){
              pager_txt +='<option selected value="'+i+'">pg: '+i+'</option>'
            }else{
              pager_txt +='<option value="'+i+'">pg: '+i+'</option>'
            }
         }
         pager_txt += "</select>"+space+"(<a href='genome_table?page=1'>Return to Page1</a>)"
      }
    }
    
    page_data.count_before_paging = count_before_paging
    count_txt = 'Number of Records Found: '+page_data.count_before_paging.toString()+ space+'Showing: '+send_list.length.toString()+' rows'+  pager_txt
    //console.log('pd2',page_data)
    send_list = apply_species(send_list)
    send_list.map(function mapGidObjList (el) {
        if (el.combined_size) { 
            el.combined_size = helpers.format_long_numbers(el.combined_size); 
        }
    })
    
    // DON NOT SORT HERE - SORTING DONE IN FILTER
    args = {filter:filter, send_list: send_list, count_txt: count_txt, pd:page_data, filter_on: get_filter_on(filter,'genome')}
    //let obj2 = send_list.filter(o => o.species === 'coli');
    //console.log('coli2',obj2.length)
    renderGenomeTable(req, res, args)
     
})


router.get('/jbrowse', function jbrowse (req, res) {
//router.get('/taxTable', helpers.isLoggedIn, (req, res) => {
  //helpers.accesslog(req, res)
  ////console.log('jbrowse-get')
  //let myurl = url.parse(req.url, true);
    
  const gid = req.query.gid
  let gc = 0
  if(gid){
      gc = helpers_genomes.get_gc_for_gccontent(C.genome_lookup[gid].gc)
  }
  const glist = Object.values(C.genome_lookup)
  
  glist.sort(function sortGList (a, b) {
      return helpers.compareStrings_alpha(a.organism, b.organism)
    })
  // filter out empties then map to create list of sorted strings
  const genomeList = glist.filter(item => item.genus !== '')
    .map((el) => {
      return { gid: el.gid, gc:el.gc, genus: el.genus, species: el.species, strain: el.strain }
    })
  res.render('pages/genome/genome_select', {
    title: 'HOMD :: JBrowse', 
    pgname: 'genome/jbrowse', // for AboutThisPage
    config: JSON.stringify(CFG),
    gid: gid,  // default
    gc:gc,
    page_type: 'JBrowse',
    genomes: JSON.stringify(genomeList),
    tgenomes: genomeList.length,
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),
    user: JSON.stringify(req.user || {}),
  })
})
//
router.post('/jbrowse_ajax', function jbrowseAjaxPost (req, res) {
  console.log('AJAX JBrowse')
  
  // for logging
  helpers.accesslog(req, res)
  //open(jburl)
  
  res.send('Okay')
})
//
router.get('/genome_description', function genomeDescription (req, res) {
  //console.log('in genomedescription -get')
  
  //let myurl = url.parse(req.url, true);
  if(req.query.gid && req.session.gtable_filter){
      req.session.gtable_filter.gid = req.query.gid
  }
  const gid = req.query.gid
  let data
  // if(Object.prototype.hasOwnProperty.call(C.genome_lookup, gid)){
//     data = C.genome_lookup[gid]
//   }else{
//     data = {}
//   }
  //console.log('data',data)
  const q_genome = queries.get_genome(gid)
  helpers.print('In Genome_Descriptin1: '+q_genome)
  TDBConn.query(q_genome, (err, rows) => {
     if (err) {
         console.log(err)
     }else{
         if(rows.length ==0){
             return
         }
         data = rows[0]
         helpers.print(data)
         data.gid = gid
         data.otid = C.genome_lookup[gid].otid
         
         data.genus =C.taxon_lookup[data.otid].genus
         data.species =C.taxon_lookup[data.otid].species
         data.combined_size = helpers.format_long_numbers(data.combined_size)
         
         const q_contig = queries.get_contigs(gid)
         let contigs = []
         // try get contigs from file:
         // ncbi only
         //console.log('q_contig',q_contig)
         helpers.print('In Genome_Descriptin2: '+q_contig)
         TDBConn.query(q_contig, (err, rows) => {
            if (err) {
              console.log(err)
            }else{
              //console.log('contigs',rows)
              for(let r in rows){
                 contigs.push({contig: rows[r].accession, gc: rows[r].GC})
              }
            }

            // Crisper-cas
            // need to determine is CC data available for this genome(gid)
            // if dir exists  homdData-Crisper.json
            let fpath = path.join(CFG.PATH_TO_DATA,'homdData-Crispr.json')
            //console.log(fpath)
            let crispr = 0
            let crispr_data = JSON.parse(fs.readFileSync(fpath))
            if(gid in crispr_data){
                 crispr = crispr_data[gid]
            }
            console.log('contigs:',contigs)
            res.render('pages/genome/genomedesc', {
               title: 'HOMD :: Genome Info',
               pgname: 'genome/description', // for AboutThisPage 
               config: JSON.stringify(CFG),
               // taxonid: otid,
               data1: JSON.stringify(data),
               gid: gid,
               anviserver_link: C.anviserver_link,
               contigs: JSON.stringify(contigs.sort()),
               crispr: crispr,
               // data2: JSON.stringify(data2),
               // data3: JSON.stringify(data3),
               // data4: JSON.stringify(data4),
               ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),
               user: JSON.stringify(req.user || {}),
            })
       })  // end TDBConn.query(q_contig
     } // end else
  })// end TDBConn.query(q_genome)
})

router.post('/get_16s_seq', function get16sSeqPost (req, res) {
  //console.log('in get_16s_seq -post')
  
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

router.post('/get_NN_NA_seq', function get_NN_NA_SeqPost (req, res) {
  //console.log('in get_NN_NA_seq -post')
  //console.log(req.body)
  //const fieldName = 'seq_' + req.body.type  // na or aa => seq_na or seq_aa
  const pid = req.body.pid
  //const db = req.body.db.toUpperCase()
  const db_pts = req.body.db.split('_')
  
  // let q = 'SELECT ' + fieldName + ' as seq FROM ' + db + '.ORF_seq'
//   q += " WHERE PID='" + pid + "'"
  
  let db
  let gid = req.body.gid
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
  
  const q = queries.get_NN_NA(db, gid, pid)
  helpers.print(q)
  TDBConn.query(q, (err, rows) => {
  //ADBConn.query(q, (err, rows) => {
    if (err) {
        console.log(err)
        return
    }

    //console.log('rows',rows)
    let html = ''
    let length = 0
    if(rows.length === 0){
        html += "No sequence found in database"
    }else{
       length = rows[0].seq.length
       const seqstr = (rows[0].seq).toString()
       //console.log('seqstr',seqstr)
       //console.log(seqstr.length)
       const arr = helpers.chunkSubstr(seqstr, 100)
       html += arr.join('<br>')
    //html = seqstr
    }
    
    res.send(JSON.stringify({html:html,length:length}))


  })
  
})
function render_explorer(req, res, args){
    res.render('pages/genome/explorer', {
        
        title: 'HOMD :: ' + args.gid,
        pgname: 'genome/explorer', // for AboutThisPage 
        config: JSON.stringify(CFG),
        ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),
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
        fltr: JSON.stringify(args.fltr),
        filter_on: args.filter_on
     })

}
//
router.post('/make_anno_search_table', function make_anno_search_table (req, res) {
    console.log('in POST:make_anno_search_table')
    //console.log(req.body)
    let anno_path = path.join(CFG.PATH_TO_TMP,req.session.anno_search_dirname)
    let anno = req.body.anno
    let search_text = req.body.search_text.toLowerCase()
    let selected_gid = req.body.gid
    let rowobj,start,stop,locstart,locstop,seqacc,tmp,ssp = '',organism=''
    var re = new RegExp(search_text,"gi");
    if(C.genome_lookup[selected_gid] && C.genome_lookup[selected_gid].subspecies){
       ssp = C.genome_lookup[selected_gid].subspecies+' '
    }
    if(C.genome_lookup[selected_gid]){
        organism = C.genome_lookup[selected_gid].genus +' '+C.genome_lookup[selected_gid].species+' '+ssp+C.genome_lookup[selected_gid].strain
    }
    let html = "<table id='annotation-table' class='table sortable'>"
    html += '<tr>'
    html += '<th>Molecule</th>'
    html += '<th>PID</th>'
    html += '<th class="sorttable_nosort">Genome<br>Viewer</th>'
    html += "<th class='sorttable_numeric'>NA<br><small>(Length)(Seq)</small></th>"
    html += "<th class='sorttable_numeric'>AA<br><small>(Length)(Seq)</small></th>"
    html += '<th class="sorttable_nosort">Range</th>'
    html += '<th>Gene</th><th>Gene Product</th>'
    html += '</tr>'
    
    fs.access(anno_path, function(error) {
       if (error) {
         console.log("Directory does not exist.")
         res.send('Session Expired')
         return
       } else {
         console.log("Directory exists.")
         let filepath = path.join(anno_path,anno,'data')
         
         fs.readFile(filepath, 'utf8', function readOrfSearch (err, data) {
             if (err) {
               console.log(err)
               res.send('Session Expired')
               return
             }
             //console.log('data',data)
            let data_rows = data.split('\n')
            for(let i in data_rows){
              
              let row = data_rows[i].split('|')
              //console.log('row',row)
              if(!row || row.length == 0 || row[0]==''){
                 continue
              }
              //console.log('data_rows[i]',data_rows[i])
              let line_gid = row[1]
              if(line_gid !== selected_gid){
                 continue
              }
             // prokka|SEQF3816.1|SEQF3816.1_00131|SEQF3816.1_JAGFVR010000001.1|putative M18 family aminopeptidase 2|1431|476|145027|146457
            // GENE::prokka|SEQF10010|GCA_902386295.1_00001|CABMIK010000001.1|thiC|Phosphomethylpyrimidine synthase|1302|433|598|1899
              //console.log(line_gid,'row ',row)
              rowobj = {
                anno:row[0],
                line_gid:row[1],
                pid:row[2],
                acc:row[3],
                gene:row[4],
                product:row[5],
                length_na:row[6],
                length_aa:row[7],
                start:row[8],
                stop:row[9],
                }
            if(rowobj.start[0] === "<" ){
              start = parseInt(rowobj.start.substring(1))
            }else{
              start = parseInt(rowobj.start)
            }
            if(rowobj.stop[0] === ">" ){ 
              stop = parseInt(rowobj.stop.substring(1))
            }else{ 
              stop = parseInt(rowobj.stop)
            }
     
            if(start > stop){ 
             tmp = stop 
             stop = start 
             start = tmp 
            } 
     
            locstart = start - 500 
            locstop = stop + 500 
            //size = stop - start 
     
            if(locstart < 1){ 
              locstart = 1 
            } 
            let db = anno+'_'+line_gid
            html += '<tr>'
            
            rowobj.acc_adorned = (rowobj.acc).replace(re, "<font color='red'>"+search_text+"</font>");
            html += "<td class='center' nowrap>"+rowobj.acc_adorned+"</td>"   // molecule
            
            rowobj.pid_adorned = (rowobj.pid).replace(re, "<font color='red'>"+search_text+"</font>");
            html += "<td class='center' nowrap>"+rowobj.pid_adorned
            
            if(anno === "prokka"){ 
                seqacc = rowobj.acc.replace('_','|')
            }else{
                seqacc = selected_gid +'|'+ rowobj.acc
            }
            let jbtracks = "DNA,homd,prokka,ncbi"
            let loc = seqacc+":"+locstart.toString()+".."+locstop.toString()
            let highlight = seqacc+":"+start.toString()+".."+stop.toString()
            //console.log('XXX',rowobj.pid+"','"+db+"','"+rowobj.acc+"','"+organism+"','"+rowobj.product+"','"+selected_gid)
            //html += " <a title='JBrowse/Genome Viewer' href='"+cfg.JBROWSE_URL+"/"+selected_gid+"&loc="+loc+"&highlight="+highlight+"&tracks="+jbtracks+"' target='_blank' rel='noopener noreferrer'>JB</a>"
            //html += " <a title='JBrowse/Genome Viewer' href='#' onclick=\"open_jbrowse('"+selected_gid+"','anno_table','','','"+anno+"','"+loc+"','"+highlight+"')\" >JB</a>"
            
            html += "</td>"   // pid
            
            html += "<td class='center'>" 
            html += " <a title='JBrowse/Genome Viewer' href='#' onclick=\"open_jbrowse('"+selected_gid+"','anno_table','','','"+anno+"','"+loc+"','"+highlight+"')\" >open</a>"
            html += "</td>" //  JB)
            
            
            html += "<td class='center' nowrap>"+rowobj.length_na
            html += " [<a title='Nucleic Acid' href='#' onclick=\"get_NN_NA_seq('na','"+rowobj.pid+"','"+db+"','"+rowobj.acc+"','"+organism+"','"+rowobj.product+"','"+selected_gid+"')\"><b>NA</b></a>]"
            html += "</td>"   // NA length
            html += "<td class='center' nowrap>"+rowobj.length_aa
            html += " [<a title='Nucleic Acid' href='#' onclick=\"get_NN_NA_seq('aa','"+rowobj.pid+"','"+db+"','"+rowobj.acc+"','"+organism+"','"+rowobj.product+"','"+selected_gid+"')\"><b>AA</b></a>]"
            html += "</td>"   // AA length
            html += "<td  class='center' nowrap>"+start+'-'+stop+"</td>"   // Range
            
            rowobj.gene_adorned = rowobj.gene.replace(re, "<font color='red'>"+search_text+"</font>");
            html += "<td nowrap>"+rowobj.gene_adorned+"</td>"   // product
            
            rowobj.product_adorned = rowobj.product.replace(re, "<font color='red'>"+search_text+"</font>");
            html += "<td>"+rowobj.product_adorned+"</td>"   // product
        
            html += "</tr>"
       
        }
        html += "</table>"
    
        res.send(html)
            
        })  // end readFile
      }
    })  // end access
            



})
//
router.post('/orf_search_full', function orf_search_full (req, res) {
    console.log('in POST:orf_search_full')
    //console.log(req.body)
    let site_search_result,tmpgid,ssp,data_keys
    let anno = req.body.anno
    let search_text = req.body.search_text
    let org_list = {}
    let gid='',otid = '',organism=''
    let bigdata = req.session.anno_search_full //JSON.parse(decodeURI(req.body.dataobj))
    //console.log('Parsed Data1',bigdata)
    if(anno == 'prokka'){
        site_search_result = bigdata.pdata  // by gid
    }else{
        site_search_result = bigdata.ndata   // by gid
    }
    //console.log('Parsed Data2',site_search_result)
        let tmp_data_keys = Object.keys(site_search_result)
        
        for(let k in tmp_data_keys){
            tmpgid = tmp_data_keys[k]
            org_list[tmpgid] = ''
            if(C.genome_lookup.hasOwnProperty(tmpgid)){
               ssp = ''
               if(C.genome_lookup[tmpgid].subspecies){
                  ssp = C.genome_lookup[tmpgid].subspecies+' '
               }
               let organism = C.genome_lookup[tmpgid].genus +' '+C.genome_lookup[tmpgid].species+' '+ssp+C.genome_lookup[tmpgid].strain
               org_list[tmpgid] = organism
            }
        }
//             let data_keys = Object.keys(org_list).sort(function (a, b) {
//                 return helpers.compareStrings_alpha(org_list[a], org_list[b]);
//              })
        
        //console.log('data',site_search_result)
        
        data_keys = Object.keys(site_search_result)
        res.render('pages/genome/annotation_keyword', {

            title: 'HOMD :: text search',
            pgname: 'genome/explorer', // for AboutThisPage 
            config: JSON.stringify(CFG),
            ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),

            anno: anno,
            search_text: search_text,
            data: JSON.stringify(site_search_result),
            
            sorted_gids: JSON.stringify(data_keys),
            org_obj: JSON.stringify(org_list),
            show_table:true

        })
         
    

})
router.post('/orf_search', function orf_search (req, res) {
    console.log('in POST:orf_search')
    //console.log(req.body)
    let anno = req.body.anno
    let search_text = req.body.search_text
    let org_list = {}
    let gid='',otid = '',organism=''
    if(!req.session.anno_search_dirname){
       res.send('Session Expired')
       return
    }
    let anno_path = path.join(CFG.PATH_TO_TMP,req.session.anno_search_dirname)
    let site_search_result = {}
    let tmpgid,ssp=''
    fs.access(anno_path, function(error) {
       if (error) {
         console.log("Directory does not exist.")
         res.send('Session Expired')
         return
       } else {
         console.log("Directory exists.")
         let filepath = path.join(anno_path,anno,'data')
         fs.readFile(filepath, 'utf8', function readOrfSearch (err, data) {
             if (err) {
               console.log(err)
               res.send('Session Expired')
               return
             }
            let data_rows = data.split('\n')
            for(let i in data_rows){
              
              if(!data_rows[i]){
                  continue
              }
              //console.log(data_rows[i])
              let pts = data_rows[i].split('|')
              
             // prokka|SEQF3816.1|SEQF3816.1_00131|SEQF3816.1_JAGFVR010000001.1|putative M18 family aminopeptidase 2|1431|476|145027|146457
              gid = pts[1]
              if(gid && gid in site_search_result){
                 site_search_result[gid].push(data_rows[i])
              }else if(gid){
                 site_search_result[gid]= [data_rows[i]]
              }
            }
            
            let tmp_data_keys = Object.keys(site_search_result)
            
            for(let k in tmp_data_keys){
                tmpgid = tmp_data_keys[k]
                org_list[tmpgid] = ''
                if(C.genome_lookup.hasOwnProperty(tmpgid)){
                   ssp = ''
                   if(C.genome_lookup[tmpgid].subspecies){
                      ssp = C.genome_lookup[tmpgid].subspecies+' '
                   }
                   let organism = C.genome_lookup[tmpgid].genus +' '+C.genome_lookup[tmpgid].species+' '+ssp+C.genome_lookup[tmpgid].strain
                   org_list[tmpgid] = organism
                }
            }
            let data_keys = Object.keys(org_list).sort(function (a, b) {
                return helpers.compareStrings_alpha(org_list[a], org_list[b]);
             })
            
            //console.log('data',site_search_result)
            res.render('pages/genome/annotation_keyword', {

                title: 'HOMD :: text search',
                pgname: 'genome/explorer', // for AboutThisPage 
                config: JSON.stringify(CFG),
                ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),

                anno: anno,
                search_text: search_text,
                data: JSON.stringify(site_search_result),
                sorted_gids: JSON.stringify(data_keys),
                org_obj: JSON.stringify(org_list),
                show_table:false
            })
             
         }) // end readFile
       }  // end else
     })
    

})

function get_annot_table_filter(body){
   let rev = 'off'
    if (body.sort_rev && body.sort_rev == 'on'){
      rev = 'on'
    }
    let filter = {
          text:{
            txt_srch: body.txt_srch.toLowerCase(),
            field: body.field,
          },
          sort_col: body.sort_col,
          sort_rev: rev
    }
    return filter
}
function apply_annot_table_filter(rows, filter){
    //console.log(filter)
    //console.log(rows.length)
    let new_rows
    if(filter.text.txt_srch !== ''){
       new_rows = get_text_filtered_annot(rows, filter.text.txt_srch, filter.text.field)
    }else{
       new_rows = rows
    }
    if(filter.sort_rev === 'on'){
        if(filter.sort_col === 'pid'){
              new_rows.sort(function (b, a) {
                return helpers.compareStrings_alpha(a.protein_id, b.protein_id);
              })
        }else if(filter.sort_col === 'molecule'){
              new_rows.sort(function (b, a) {
                return helpers.compareStrings_alpha(a.accession, b.accession);
              })
        }else if(filter.sort_col === 'gene'){
              new_rows.sort(function (b, a) {
                return helpers.compareStrings_alpha(a.gene, b.gene);
              })
        }else if(filter.sort_col === 'product'){
              new_rows.sort(function (b, a) {
                return helpers.compareStrings_alpha(a.product, b.product);
              })
        }else if(filter.sort_col === 'na'){
              new_rows.sort(function (b, a) {
                return helpers.compareStrings_int(a.length_na, b.length_na);
              })
        }else if(filter.sort_col === 'aa'){
              new_rows.sort(function (b, a) {
                return helpers.compareStrings_int(a.length_aa, b.length_aa);
              })
        }
    }else{
        if(filter.sort_col === 'pid'){
              new_rows.sort(function (a, b) {
                return helpers.compareStrings_alpha(a.protein_id, b.protein_id);
              })
        }else if(filter.sort_col === 'molecule'){
              new_rows.sort(function (a, b) {
                return helpers.compareStrings_alpha(a.accession, b.accession);
              })
        }else if(filter.sort_col === 'gene'){
              new_rows.sort(function (a, b) {
                return helpers.compareStrings_alpha(a.gene, b.gene);
              })
        }else if(filter.sort_col === 'product'){
              new_rows.sort(function (a, b) {
                return helpers.compareStrings_alpha(a.product, b.product);
              })
        }else if(filter.sort_col === 'na'){
              new_rows.sort(function (a, b) {
                return helpers.compareStrings_int(a.length_na, b.length_na);
              })
        }else if(filter.sort_col === 'aa'){
              new_rows.sort(function (a, b) {
                return helpers.compareStrings_int(a.length_aa, b.length_aa);
              })
        }
    }
    
    return new_rows
    
}
function get_text_filtered_annot(annot_list, search_txt, search_field){

  let send_list = []
  if(search_field == 'pid'){
      send_list = annot_list.filter(item => item.protein_id.toLowerCase().includes(search_txt))
  }else if(search_field == 'product'){
      send_list = annot_list.filter(item => item.product.toLowerCase().includes(search_txt))
  }else if(search_field == 'gene'){
      send_list = annot_list.filter(item => item.gene.toLowerCase().includes(search_txt))
  }else if(search_field == 'molecule'){
      send_list = annot_list.filter(item => item.accession.toLowerCase().includes(search_txt))
  }else {
      // search all
      //send_list = send_tax_obj
      let temp_obj = {}
      var tmp_send_list = annot_list.filter(item => item.protein_id.toLowerCase().includes(search_txt))
      // for uniqueness convert to object
      for(var n in tmp_send_list){
         temp_obj[tmp_send_list[n].protein_id] = tmp_send_list[n]
      }
      
      tmp_send_list = annot_list.filter(item => item.product.toLowerCase().includes(search_txt))
      for(var n in tmp_send_list){
         temp_obj[tmp_send_list[n].protein_id] = tmp_send_list[n]
      }
      
      tmp_send_list = annot_list.filter(item => item.gene.toLowerCase().includes(search_txt))
      for(var n in tmp_send_list){
         temp_obj[tmp_send_list[n].protein_id] = tmp_send_list[n]
      }
      
      tmp_send_list = annot_list.filter(item => item.accession.toLowerCase().includes(search_txt))
      for(var n in tmp_send_list){
         temp_obj[tmp_send_list[n].protein_id] = tmp_send_list[n]
      }
      
      // now back to a list
      send_list = Object.values(temp_obj);
      
      
  }
  return send_list
} 

router.get('/reset_atable', function annot_table_reset(req, res) {
   //console.log('in RESET-session')
   //console.log(req.query)
   req.session.atable_filter = get_default_annot_filter()
   res.redirect('explorer?gid='+req.query.gid+'&anno='+req.query.anno);
});

router.post('/explorer', function explorer_post (req, res) {
    //console.log('IN explorer_post')
    //console.log(req.body)
    let pidList
    let gid = req.body.gid
    let anno = req.body.anno
    let organism = C.annotation_lookup[gid].prokka.organism
    let gc = ''
    let otid = ''
    if (Object.prototype.hasOwnProperty.call(C.genome_lookup, gid)) {
        otid = C.genome_lookup[gid].otid
        gc = helpers.get_gc_for_gccontent(C.genome_lookup[gid].gc)
    }
    let annoInfoObj = C.annotation_lookup[gid][anno]
    annoInfoObj.bases = C.genome_lookup[gid].combined_size
    const glist = Object.values(C.genome_lookup)
    glist.sort(function sortGList (a, b) {
      return helpers.compareStrings_alpha(a.genus, b.genus)
    })
    // filter out empties then map to create list of sorted strings
    const allAnnosObj = glist.filter(item => item.genus !== '')
      .map((el) => {
      return { gid: el.gid, org: el.genus+' '+el.species+' '+el.strain }
    })
    
    let pageData = {}
    pageData.page = req.query.page
    if (!req.query.page) {
      pageData.page = 1
    }
    let atable_filter = get_annot_table_filter(req.body)
    req.session.atable_filter = atable_filter
    const q = queries.get_annotation_query(gid, req.body.anno)
    console.log('get_annotation_query-post',q)
    TDBConn.query(q, (err, rows) => {
    if (err) {
      req.flash('fail', 'Query Error: "'+anno+'" annotation for '+gid)
      args = {fltr:{},filter_on: 'off',gid:gid,gc:gc,otid:otid,organism:organism,allAnnosObj:allAnnosObj,annoType:anno,pageData:{},annoInfoObj:annoInfoObj,pidList:[]}
      render_explorer(req, res, args)
      return
    } else {
      if (rows.length === 0) {
        console.log('no rows found')
      }
      let filtered_rows = apply_annot_table_filter(rows, atable_filter)
      
      pageData.trecords = filtered_rows.length
      if(filtered_rows.length < C.PAGER_ROWS){
         pidList = filtered_rows
      }else{
          if (pageData.page) {
            const trows = filtered_rows.length
            // console.log('trows',trows)
            pageData.row_per_page = C.PAGER_ROWS
            pageData.number_of_pages = Math.ceil(trows / pageData.row_per_page)
            if (pageData.page > pageData.number_of_pages) { pageData.page = 1 }
            if (pageData.page < 1) { pageData.page = pageData.number_of_pages }
            helpers.print(['page_data.number_of_pages', pageData.number_of_pages])
            pageData.show_page = pageData.page
            if (pageData.show_page === 1) {
              pidList = filtered_rows.slice(0, pageData.row_per_page) // first 200
              pageData.start_count = 1
            } else {
              pidList = filtered_rows.slice(pageData.row_per_page * (pageData.show_page - 1), pageData.row_per_page * pageData.show_page) // second 200
              pageData.start_count = pageData.row_per_page * (pageData.show_page - 1) + 1
            }
            //console.log('start count', pageData.start_count)
          }
      }
      //console.log('pidlist',pidList)
      const args = {
            gid: gid,
            gc:             gc,
            otid:           otid,
            organism:       organism,
            allAnnosObj:    allAnnosObj,
            annoType:       anno,
            pageData:       pageData,
            annoInfoObj:    annoInfoObj,
            pidList:        pidList,
            fltr:  atable_filter,
            filter_on: get_filter_on(atable_filter,'annot')
      }
            
      render_explorer(req, res, args)
    }
  })
    
})
router.get('/explorer', function explorer_get (req, res) {
  //console.log('in explorerGET')
  //console.log(C.annotation_lookup)
  // let myurl = url.parse(req.url, true)
  helpers.accesslog(req, res)

  const gid = req.query.gid
  if(gid && req.session.gtable_filter){
      //console.log('got otid for ttable')
      req.session.gtable_filter.gid = gid
  }
  let otid = 0,gc = 0
  let anno = req.query.anno || 'ncbi'
  
  
  helpers.print(['gid:', gid,'anno:',anno])
  
  // anno == 
  let atable_filter
  let annoInfoObj = {}
  let pageData = {}
  pageData.page = req.query.page
  if (!req.query.page) {
    pageData.page = 1
  }
  let organism = 'Unknown', pidList
  //let dbChoices = []

 
  let args = {}
  
  const glist = Object.values(C.genome_lookup)
  
  glist.sort(function sortGList (a, b) {
      return helpers.compareStrings_alpha(a.organism, b.organism)
    })
  // filter out empties then map to create list of sorted strings
  const allAnnosObj = glist.filter(item => item.organism !== '')
    .map((el) => {
      
      //return { gid: el.gid, org: el.organism }
      return { gid: el.gid, org: el.organism+' '+el.strain }
    })
  
  if (!gid || gid.toString() === '0' || !C.genome_lookup.hasOwnProperty(gid)) {
   
    args = {fltr:{},filter_on:'off',gid:0,gc:gc,otid:0,organism:'',allAnnosObj:allAnnosObj,annoType:anno,pageData:{},annoInfoObj:{},pidList:[]}
    render_explorer(req, res, args)
    return
  }else {
      if (Object.prototype.hasOwnProperty.call(C.annotation_lookup, gid)) {
        //organism = C.annotation_lookup[gid].prokka.organism
        organism = C.genome_lookup[gid].organism
      }else{
        req.flash('fail', 'Genome not found: "'+gid+'"')
        //console.log('no anno1')
        args = {fltr:{},filter_on:'off',gid:0,gc:gc,otid:0,organism:'',allAnnosObj:allAnnosObj,annoType:'',pageData:{},annoInfoObj:{},pidList:[]}
        render_explorer(req, res, args)
        return
      }
  }
  
  
  if (Object.prototype.hasOwnProperty.call(C.genome_lookup, gid)) {
        otid = C.genome_lookup[gid].otid
        //gc = helpers.get_gc_for_gccontent(C.genome_lookup[gid].gc)
        gc = C.genome_lookup[gid].gc
  }
  if(gid && !anno) {
      //console.log('no anno2')
      args = {fltr:{},filter_on:'off',gid:gid,gc:gc,otid:0,organism:organism,allAnnosObj:allAnnosObj,annoType:'',pageData:{},annoInfoObj:{},pidList:[]}
      render_explorer(req, res, args)
      return
  }
 
  
  // NOW ANNOTATIONS
  //console.log('C.annotation_lookup',C.annotation_lookup)
  // localhost http://0.0.0.0:3001/genome/explorer?gid=SEQF4098&anno=ncbi
  if (Object.prototype.hasOwnProperty.call(C.annotation_lookup, gid) && Object.prototype.hasOwnProperty.call(C.annotation_lookup[gid], anno)) {
    annoInfoObj = C.annotation_lookup[gid][anno]
    annoInfoObj.bases = C.genome_lookup[gid].combined_size
  } else {
    req.flash('fail', 'Could not find: "'+anno+'" annotation for '+gid)

    args = {fltr:{},filter_on:'off',gid:gid,gc:gc,otid:otid,organism:organism,allAnnosObj:allAnnosObj,annoType:anno,pageData:{},annoInfoObj:{},pidList:[]}
    render_explorer(req, res, args)
    return
  }

  //OLD DB
  const q = queries.get_annotation_query(gid, anno)
  console.log('get_annotation_query-GET',q)
  //NEW DB
  
  if(req.session.atable_filter){
        atable_filter = req.session.atable_filter
    }else{
        atable_filter = get_default_annot_filter()
        req.session.atable_filter = atable_filter
    }
  helpers.print('explorer::anno query: '+q)
  // local host:  explorer?gid=SEQF4098.1&anno=ncbi
  TDBConn.query(q, (err, rows) => {
    if (err) {
      req.flash('fail', 'Query Error: "'+anno+'" annotation for '+gid)

      args = {fltr:{},filter_on:'off',gid:gid,gc:gc,otid:otid,organism:organism,allAnnosObj:allAnnosObj,annoType:anno,pageData:{},annoInfoObj:annoInfoObj,pidList:[]}
      render_explorer(req, res, args)
      return
    }
      if (rows.length === 0) {
        console.log('no rows found')
      }
      let filtered_rows = apply_annot_table_filter(rows, atable_filter)
      pageData.trecords = rows.length
      if (pageData.page) {
        const trows = rows.length
        // console.log('trows',trows)
        pageData.row_per_page = C.PAGER_ROWS
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
      if(req.session.atable_filter){
        //console.log('filetr session')
        atable_filter = req.session.atable_filter
      }else{
        //console.log('filetr from default')
        atable_filter = get_default_annot_filter()
        req.session.atable_filter = atable_filter
      }
      //console.log('atable_filter',atable_filter)
      //console.log('default',get_default_annot_filter())
      //console.log('annoInfoObj',annoInfoObj)
      args = {
            gid: gid,
            
            gc:             gc,
            otid:           otid,
            organism:       organism,
            allAnnosObj:    allAnnosObj,
            annoType:       anno,
            pageData:       pageData,
            annoInfoObj:    annoInfoObj,
            pidList:        pidList,
            fltr:  atable_filter,
            filter_on: get_filter_on(atable_filter,'annot')
            }
            
      render_explorer(req, res, args)

  })
})

//
//
router.get('/blast_server', function genome_blast_server(req, res) {
    res.render('pages/blast/blast_server', {
        title: 'HOMD :: HOMD Blast Server',
        pgname: '', // for AboutThisPage
        config: JSON.stringify(CFG),
        ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),
        user: JSON.stringify(req.user || {}),
        blast_type: 'genome'
      })
})
router.get('/blast_per_genome', function blast_per_genome(req, res) {
   //router.get('/taxTable', helpers.isLoggedIn, (req, res) => {
  //helpers.accesslog(req, res)
  //console.log('blast_per_genome')
  //let myurl = url.parse(req.url, true);
    
  const gid = req.query.gid
  let gc = 0
  if(gid){
      gc = helpers.get_gc_for_gccontent(C.genome_lookup[gid].gc)
  }
  const glist = Object.values(C.genome_lookup)
  
  glist.sort(function sortGList (a, b) {
      return helpers.compareStrings_alpha(a.organism, b.organism)
    })
  // filter out empties then map to create list of sorted strings
  const genomeList = glist.filter(item => item.genus !== '')
    .map((el) => {
      
      return { gid: el.gid, gc:el.gc, organism: el.organism }
    })
  
  res.render('pages/genome/genome_select', {
    title: 'HOMD :: BLAST', 
    pgname: 'genome/BLAST', // for AboutThisPage
    config: JSON.stringify(CFG),
    gid: gid,  // default
    gc: gc,
    page_type: 'BLAST',
    genomes: JSON.stringify(genomeList),
    tgenomes: genomeList.length,
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),
    user: JSON.stringify(req.user || {}),
  })
})

router.get('/blast_sserver', function blast_sserver(req, res){
   //console.log(req.query)
   //helpers.accesslog(req, res)
   let db_type = req.query.type
   let page_title = ''
   if(db_type == 'refseq'){
     page_title = 'BLAST: RefSeq Databases'
   }else{
     page_title = 'Genomic BLAST: All-Genomes Databases'
   }
   console.log('BLAST SequenceServer','Type:',db_type,'IP:',req.ip)
   // res.render('pages/genome/blast_server_no_iframe', {
//     title: 'HOMD :: BLAST', 
//     pgname: 'blast/pagehelp', // for AboutThisPage
//     config: JSON.stringify(CFG),
//     ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),
//     user: JSON.stringify(req.user || {}),
//     gid: '',
//     annotation: '',
//     organism: '',
//     db_type: db_type,
//     ptitle: page_title,
//   })
  
   res.render('pages/genome/blast_server_iframe', {
    title: 'HOMD :: BLAST', 
    pgname: 'blast/pagehelp', // for AboutThisPage
    config: JSON.stringify(CFG),
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),
    user: JSON.stringify(req.user || {}),
    gid: '',
    annotation: '',
    organism: '',
    db_type: db_type,
    ptitle: page_title,
    no_ncbi_blast: JSON.stringify([])
  })
})

router.post('/blast_ss_single', function blast_ss_single(req, res){
  console.log('IN POST blast_ss_single')
  //console.log(req.body)
  let gid = req.body.gid
  //console.log(CFG.BLAST_URL_BASE)
  let organism = C.genome_lookup[gid].organism +' '+C.genome_lookup[gid].strain 
  //console.log(C.genome_lookup[req.body.gid])
  if(req.session.gtable_filter){
        req.session.gtable_filter.gid = gid
    } 
    
  let page_title = 'Genomic BLAST: '+organism +' ('+gid+')'
  if(req.body.annotation){
     page_title = '['+req.body.annotation.toUpperCase() +'] '+ page_title
  }
  
  //console.log('BLAST SequenceServer','Type:SingleGenome',gid,'IP:',req.ip)
  //console.log('SingleBLASTURL: '+CFG.BLAST_URL_BASE+'/genome_blast_single_'+req.body.annotation+'/?gid='+gid)
  res.render('pages/genome/blast_server_iframe', {
    title: 'HOMD :: BLAST', 
    pgname: 'blast/pagehelp', // for AboutThisPage
    config: JSON.stringify(CFG),
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),
    user: JSON.stringify(req.user || {}),
    gid: req.body.gid,
    annotation: req.body.annotation,
    organism: organism,
    ptitle: page_title,
    db_type: '',
    no_ncbi_blast: JSON.stringify(C.no_ncbi_blast_dbs)
  })
  
   
})
router.post('/blast_single_test', function(req, res){
  //console.log('IN POST blast_single_test')
  //console.log(req.body)
   res.render('pages/genome/test_blast_single', {
    title: 'HOMD :: BLAST', 
    pgname: 'genome/BLAST', // for AboutThisPage
    config: JSON.stringify(CFG),
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),
    user: JSON.stringify(req.user || {}),
  })
})
router.post('/blast_single', function blast_single(req, res) {
    //console.log(req.body)
    // 'prokka|fna|SEQF1595.2|/Users/avoorhis/programming/blast-db-alt/fna/SEQF1595.2.fna'
    let blast_db_parts = req.body.blastdb.split('|')
    let anno    = blast_db_parts[0]
    let ext     = blast_db_parts[1]
    let gid     = blast_db_parts[2]
    let db_path = blast_db_parts[3]
    
    // localhost:4567  or 0.0.0.
    // production:  192.168.1.60:4569  for the SS-single
    // How to fire submit on form from another host.server
    var connect = require('connect');
    //var http = require('http');

    var app2 = connect();
    app2.listen(4567, '0.0.0.0', function() {
       console.log('Listening to port:  ' + 4567);
    });


})
router.get('/blast_server_one', function blast_test(req, res) {
  console.log('blast_test')
  let gid = req.query.gid
  const { spawn } = require("child_process");
  let info = {}, filepath
  info[gid] = []
    let dataPromises = []
    let exts = ['faa', 'ffn', 'fna']
    let paths = [CFG.BLAST_DB_PATH_GENOME_NCBI, CFG.BLAST_DB_PATH_GENOME_PROKKA,'/Users/avoorhis/programming/blast-db-alt']
    for(let p in paths){
       for(let e in exts){
           filepath = path.join(paths[p], exts[e], gid+'.'+exts[e]) 
           console.log(filepath)
           
           dataPromises.push(helpers.readFromblastDb(filepath, gid, exts[e]))
      }
  }
  Promise.all(dataPromises).then(result => {
    //this code will be called in future after all readCSV Promises call resolve(..)
    //console.log('info-results',result)
    let data = []
    for(let n in result){
       if(typeof result[n] !== 'string'){
          if(result[n].path.includes('ncbi')){
             result[n].anno = 'ncbi'
          }else{
             result[n].anno = 'prokka'
          }
          data.push(result[n])
       }
    }
    //console.log('data-results',data)
    res.render('pages/genome/blast_one_genome', {
    title: 'HOMD :: BLAST', 
    pgname: '', // for AboutThisPage
    config: JSON.stringify(CFG),
    gid: gid,  // default
    org: C.genome_lookup[gid].organism,
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),
    user: JSON.stringify(req.user || {}),
    data: JSON.stringify(data)
    }) 
  
  })
  
  
  
  
  
  
  
})
router.get('/genome_blast', function blast_get(req, res) {
  console.log('in genome_blast')
  console.log(req.query)
})
router.get('/blast', function blast_get(req, res) {
   //console.log('in genome blast-GET')
   let chosen_gid = req.query.gid
   if(!chosen_gid){chosen_gid='all'}
   //console.log('chosen gid=',chosen_gid)
   let sg = helpers.makeid(3).toUpperCase()
   let organism,dbChoices
   const allAnnosObj = Object.keys(C.annotation_lookup).map((gid) => {
    return {gid: gid, org: C.annotation_lookup[gid].prokka.organism}
   })
   
   allAnnosObj.sort(function sortAnnos (a, b) {
      return helpers.compareStrings_alpha(a.org, b.org)
   })
   //let dbChoices = C.all_genome_blastn_db_choices.nucleotide   //.nucleotide.map((x) => x); // copy array
    if(! chosen_gid || chosen_gid == 0|| chosen_gid ==='all' || !C.annotation_lookup.hasOwnProperty(chosen_gid)){
      
      organism   = allAnnosObj[0].org
      chosen_gid = allAnnosObj[0].gid
          dbChoices = [
          {name: "This Organism's ("+organism + ") Genomic DNA", value:'org_genomes1', programs:['blastn','tblastn','tblastx'],
                   filename:'fna/'+chosen_gid+'.fna'},
          {name: "This Organism's ("+organism + ") DNA of Annotated Proteins", value:'org_genomes2', programs:['blastn','tblastn','tblastx'],
                   filename:'ffn/'+chosen_gid+'.ffn'}
          ]
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
        title: 'HOMD :: BLAST',
        pgname: 'blast/blast', // for AboutThisPage
        config: JSON.stringify(CFG),
        ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),
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

// 2021-06-15  opening trees in new tab because thet take too long to open in an iframe
// which makes the main menu non functional
// These functions are used to open trees with a search for odid or genomeID
// The main menu goues through routes_homd::open_tree
router.get('/conserved_protein_tree', function conservedProteinTree (req, res) {
  //console.log('in conserved_protein_tree')
  // let myurl = url.URL(req.url, true);
  const otid = req.query.otid
  const fullname = helpers.make_otid_display_name(otid)
  helpers.print(fullname)
  // Actual: https://www.homd.org/ftp/phylogenetic_trees/genome/current/eHOMD_Genomic_PhyloPhlAn_Tree.svg
  // Copied to puplic/trees/eHOMD_Genomic_PhyloPhlAn_Tree.svg
  
  //let filepath = CFG.FTP_TREE_URL +'/genome/V11.0/HOMD_Genomic_PhyloPhlAn_Tree_V11.0.svg'
  let filepath = CFG.HOMD_URL_BASE +'/ftp/phylogenetic_trees/genome/V11.0/HOMD_Genomic_PhyloPhlAn_Tree_V11.0.svg'
  https.get(filepath, (response) => { 
     let data = ''; 
 
     response.on('data', (chunk) => { 
        data += chunk; 
     }); 
 
     response.on('end', () => { 
        
        //console.log('data',data); 
         res.render('pages/genome/conserved_protein_tree', {
           title: 'HOMD :: Conserved Protein Tree',
           pgname: 'genome/tree', // for AboutThisPage
           config: JSON.stringify(CFG),
           ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),
           user: JSON.stringify(req.user || {}),
           svg_data: JSON.stringify(data),
           otid: fullname
         }); 
     });
  }).on('error', (error) => { 
    console.error(`Error fetching data: ${error.message}`); 
  }); 
  
  
//   fs.readFile(filepath, 'utf8', function readSVGFile1 (err, data) {
//     if (err) {
//       console.log(err)
//     } else {
//       res.render('pages/genome/conserved_protein_tree', {
//         title: 'HOMD :: Conserved Protein Tree',
//         pgname: 'genome/tree', // for AboutThisPage
//         config: JSON.stringify(CFG),
//         ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),
//         user: JSON.stringify(req.user || {}),
//         svg_data: JSON.stringify(data),
//         otid: fullname
//       })
//     }
//   })
})
router.get('/ribosomal_protein_tree', function ribosomalProteinTree (req, res) {
  
  //console.log('in ribosomal_protein_tree')

  const otid = req.query.otid
  // Actual:: https://www.homd.org/ftp/phylogenetic_trees/genome/current/eHOMD_Ribosomal_Protein_Tree.svg
  // Copied to public/trees/eHOMD_Ribosomal_Protein_Tree.svg
  //let filepath = CFG.FTP_TREE_URL_LOCAL +'/'+'eHOMD_Ribosomal_Protein_Tree.svg'
  //let filepath = CFG.FTP_TREE_URL +'/genome/current/'+'eHOMD_Ribosomal_Protein_Tree.svg'
  //let filepath = CFG.FTP_TREE_URL +'/ribosomal_protein_tree/HOMD_Ribosomal_Protein_Tree_V11.0.svg'
  let filepath = CFG.HOMD_URL_BASE +'/ftp/phylogenetic_trees/ribosomal_protein_tree/HOMD_Ribosomal_Protein_Tree_V11.0.svg'
  https.get(filepath, (response) => { 
     let data = ''; 
 
     response.on('data', (chunk) => { 
        data += chunk; 
     }); 
 
     response.on('end', () => { 
        
        //console.log('data',data); 
         res.render('pages/genome/ribosomal_protein_tree', {
           title: 'HOMD :: Ribosomal Protein Tree',
           pgname: 'genome/tree', // for AboutThisPage
           config: JSON.stringify(CFG),
           ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),
           user: JSON.stringify(req.user || {}),
           svg_data: JSON.stringify(data),
           otid: otid
         }); 
     });
  }).on('error', (error) => { 
    console.error(`Error fetching data: ${error.message}`); 
  }); 
  
  
  
  
  
//   fs.readFile(filepath, 'utf8', function readSVGFile2 (err, data) {
//     if (err) {
//       console.log(err)
//     } else {
//       res.render('pages/genome/ribosomal_protein_tree', {
//         title: 'HOMD :: Ribosomal Protein Tree',
//         pgname: 'genome/tree', // for AboutThisPage
//         config: JSON.stringify(CFG),
//         ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),
//         user: JSON.stringify(req.user || {}),
//         svg_data: JSON.stringify(data),
//         otid: otid
//       })
//     }
//   })
})
router.get('/rRNA_gene_tree', function rRNAGeneTree (req, res) {
  
  //console.log('in rRNA_gene_tree')
  // const myurl = url.URL(req.url, true)
  // const myurl = new url.URL(req.url)
  const otid = req.query.otid
  helpers.print(['otid', otid])
  // https://www.homd.org/ftp/phylogenetic_trees/genome/current/eHOMD_16S_rRNA_Tree.svg
  //let filepath = CFG.FTP_TREE_URL_LOCAL +'/'+'eHOMD_16S_rRNA_Tree.svg'
  //let filepath = CFG.FTP_TREE_URL +'/genome/current/'+'eHOMD_16S_rRNA_Tree.svg'
  //let filepath = CFG.HOMD_URL_BASE +'/ftp/phylogenetic_trees/ribosomal_protein_tree/HOMD_Ribosomal_Protein_Tree_V11.0.svg'
  let filepath = CFG.HOMD_URL_BASE +"/ftp/phylogenetic_trees/refseq/V16.0/HOMD_16S_rRNA_RefSeq_Tree_V16.0.svg"
  https.get(filepath, (response) => { 
     let data = ''; 
 
     response.on('data', (chunk) => { 
        data += chunk; 
     }); 
 
     response.on('end', () => { 
        
        //console.log('data',data); 
         res.render('pages/genome/rRNA_gene_tree', {
           title: 'HOMD :: rRNA Gene Tree',
           pgname: 'genome/tree', // for AboutThisPage
           config: JSON.stringify(CFG),
           ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),
           user: JSON.stringify(req.user || {}),
           svg_data: JSON.stringify(data),
           otid: otid
         })
     });
  }).on('error', (error) => { 
    console.error(`Error fetching data: ${error.message}`); 
  }); 
  
  
//   fs.readFile(filepath, 'utf8', function readSVGFile3 (err, data) {
//     if (err) {
//       console.log(err)
//     }
//     res.render('pages/genome/rRNA_gene_tree', {
//       title: 'HOMD :: rRNA Gene Tree',
//       pgname: 'genome/tree', // for AboutThisPage
//       config: JSON.stringify(CFG),
//       ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),
//       user: JSON.stringify(req.user || {}),
//       svg_data: JSON.stringify(data),
//       otid: otid
//     })
//   })
})
//

//

function get_blast_db_info(gid){
    console.log('in get_blast_db_info')
    let info = {},run,filepath,hit
    const { spawn } = require("child_process");
    // get & check paths to six genome databases: 
    //gid = 'SEQF1595'
    info[gid] = []
    let promises = []
    let exts = ['faa', 'ffn', 'fna']
    let paths = [CFG.BLAST_DB_PATH_GENOME_NCBI, CFG.BLAST_DB_PATH_GENOME_PROKKA,'/Users/avoorhis/programming/blast-db-alt']
    for(let p in paths){
       for(let e in exts){
           filepath = path.join(paths[p], exts[e], gid+'.'+exts[e]) 
           //console.log(filepath)
           let full_data = ''
           promises.push(helpers.readFromblastDb(filepath, gid, exts[e]))

       }
    }
    const responses = Promise.all(promises)
      .then(results => {
      
      return results
    })
}
//
router.get('/anvio-server', function anvio_server(req, res){
   //console.log(req.query)
   // docker exec','anvio','anvi-display-pan','-P',port,'-p',pg+'/PAN.db','-g',pg+'/GENOMES.db'
   
   res.render('pages/genome/anvio_selection', {
    title: 'HOMD :: Anvio', 
    pgname: '', // for AboutThisPage
    config: JSON.stringify(CFG),
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),
    user: JSON.stringify(req.user || {}),
    pangenomes: JSON.stringify(C.pangenomes)
    
  })
})
//
router.post('/anvio_post', (req, res) => {
    console.log('In anvio_post',req.body)
    
    helpers.accesslog(req, res)
    
    let pg = req.body.pg
    if(!pg){
        pg = 'Veillonella_HMT780'
    }
    console.log('Selected Pangenome:',pg)
    //let port = anvio_ports()
    //let default_open_ports = [8080,8081,8082,8083,8084,8085] 
    //let port = default_open_ports[Math.floor(Math.random() * default_open_ports.length)]
    
    let url = CFG.ANVIO_URL + '?pg=' + pg
    // localhost:::   http://localhost:3010
    // Dev      :::   https://anvio.homd.org/anvio
    //let url = "http://localhost:3010/anvio?port="+port.toString()+'&pg='+pg
    // if(CFG.DBHOST == 'localhost'){
//         url = "http://localhost:3010?pg="+pg
//     }else{
//         url = "https://anvio.homd.org/anvio?pg="+pg
//     }
    return res.send(url)
});
// router.post('/anvio_post2', (req, res) => {
//     console.log('In anvio_post2',req.body)
//     
//     //helpers.accesslog(req, res)
//     
//     let pg = req.body.pg
//     if(!pg){
//         pg = 'Veillonella_HMT780'
//     }
//     console.log('Selected Pangenome:',pg)
//     //let port = anvio_ports()
//     //let default_open_ports = [8080,8081,8082,8083,8084,8085] 
//     //let port = default_open_ports[Math.floor(Math.random() * default_open_ports.length)]
//     // https://anvio.homd.org/anvio
//     //let url = CFG.ANVIO_URL + '?pg=' + pg
//     let url = 'https://bioinformatics.forsyth.org/anvio' + '?pg=' + pg
//     console.log('trying',url)
//     // localhost:::   http://localhost:3010
//     // Dev      :::   https://anvio.homd.org/anvio
//     //let url = "http://localhost:3010/anvio?port="+port.toString()+'&pg='+pg
//     // if(CFG.DBHOST == 'localhost'){
// //         url = "http://localhost:3010?pg="+pg
// //     }else{
// //         url = "https://anvio.homd.org/anvio?pg="+pg
// //     }
//     return res.send(url)
// });

//
router.get('/oralgen', function oralgen(req, res) {
  res.render('pages/genome/oralgen', {
    title: 'HOMD :: Human Oral Microbiome Database',
    pgname: '', // for AbountThisPage
    config: JSON.stringify(CFG),
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),
    user: JSON.stringify(req.user || {})

  })
})
//////////////////
router.get('/peptide_table', function peptide_table_get(req, res) {
    
    const q = queries.get_peptide()
    let pid,gid,prod,genome,temp,pep,otid,org,mol,stop,start,tmp,pepid,size,jb_link,study_id
    //console.log(q)
    TDBConn.query(q, (err, rows) => {
       if (err) {
          console.log("protein_peptide select error-GET",err)
          return
       }
       //console.log('1')
       let send_list = []
       for(let r in rows){
           pid = rows[r].protein_accession
           prod = rows[r].product
           pep = rows[r].peptide
           pepid = rows[r].peptide_id
           gid = pid.split('_')[0]
           otid = rows[r].otid
           org = rows[r].organism
           mol = rows[r].molecule
           jb_link = rows[r].jb_link
           study_id = rows[r].study_id

         
           //if(C.genome_lookup.hasOwnProperty(gid)){
             //genome = C.genome_lookup[gid]
             //console.log('genome',genome)
             temp = {study_id:study_id,pid:pid,product:prod,gid:gid,mol:mol,organism:org,otid:otid,peptide_id:pepid,peptide:pep,jb_link:jb_link}
             //temp = {gc:genome.gc,study_id:study_id,pid:pid,product:prod,gid:gid,mol:mol,organism:org,otid:otid,genus:genome.genus,species:genome.species,strain:genome.strain,peptide_id:pepid,peptide:pep,jb_link:jb_link}
             //console.log('temp',temp)
             //console.log(C.genome_lookup[gid])
             send_list.push(temp)
           //}
       }
       //console.log(send_list[0])
       res.render('pages/genome/protein_peptide', {
          title: 'HOMD :: Human Oral Microbiome Database',
          pgname: '', // for AbountThisPage
          pgtitle: 'Protein Peptide Table',
          config: JSON.stringify(CFG),
          ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),
          user: JSON.stringify(req.user || {}),
          data: JSON.stringify(send_list),
          row_count:send_list.length,
          search_text:''
       })
    })
})
router.post('/peptide_table', function peptide_table_post(req, res) {
    console.log('req.body',req.body)
    let search_text = req.body.txt_srch.toLowerCase()
    let big_p_list //= Object.values(C.genome_lookup);
    const q = queries.get_peptide()
    
    let pid,gid,prod,genome,temp,pep,otid,hmt,org,mol,pepid,size,jb_link,study_id
    console.log(q)
    TDBConn.query(q, (err, rows) => {
       if (err) {
          console.log("protein_peptide select error-POST",err)
          return
       }
       let full_send_list = []
       for(let r in rows){
           pid = rows[r].protein_accession
           prod = rows[r].product
           pep = rows[r].peptide
           pepid = rows[r].peptide_id
           gid = pid.split('_')[0]
           
           otid = rows[r].otid
           hmt = helpers.make_otid_display_name(otid)
           org = rows[r].organism
           mol = rows[r].molecule
           jb_link = rows[r].jb_link
           study_id = rows[r].study_id
           //console.log('jblink',jb_link)

           //if(C.genome_lookup.hasOwnProperty(gid)){
        //genome = C.genome_lookup[gid]
             //console.log('genome',genome) 

        //temp = {pid:pid,product:prod,mol:mol,gid:gid,organism:org,otid:otid,hmt:hmt,genus:genome.genus,species:genome.species,strain:genome.strain,peptide:pep,unique:rows[r].unique,length:rows[r].length,start:rows[r].start,stop:rows[r].end,loc:loc,hlite:highlight}
          //temp = {pid:pid,study_id:study_id,product:prod,mol:mol,gid:gid,organism:org,otid:otid,hmt:hmt,genus:genome.genus,species:genome.species,strain:genome.strain,peptide:pep,peptide_id:pepid,jb_link:jb_link}
           temp = {study_id:study_id,pid:pid,product:prod,gid:gid,mol:mol,organism:org,otid:otid,peptide_id:pepid,peptide:pep,jb_link:jb_link}
             
             full_send_list.push(temp)
           //}
       }
       // will search all == PID,HMT,Organism,Peptide,Product
       let send_list = full_send_list
       if(search_text){
          console.log('searching',search_text)
          send_list = full_send_list.filter( function(item){
               return item.organism.toLowerCase().includes(search_text) ||
                  item.product.toLowerCase().includes(search_text)      ||
                  item.peptide.toLowerCase().includes(search_text)      ||
                  item.pid.toLowerCase().includes(search_text)          ||
                  item.hmt.toLowerCase().includes(search_text)
           })
       }
       // let send_list = full_send_list.filter(
//            item => item.organism.toLowerCase().includes(search_text) ||
//            item => item.product.toLowerCase().includes(search_text) ||
//            item => item.peptide.toLowerCase().includes(search_text)
//        )
       
       res.render('pages/genome/protein_peptide', {
          title: 'HOMD :: Human Oral Microbiome Database',
          pgname: '', // for AbountThisPage
          pgtitle: 'Protein Peptide Table',
          config: JSON.stringify(CFG),
          ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),
          user: JSON.stringify(req.user || {}),
          data: JSON.stringify(send_list),
          row_count:send_list.length,
          search_text:req.body.txt_srch
       })
    })
    
    
})
//
//
router.get('/peptide_table2', function peptide_table2_get(req, res) {
 
    
    const q = queries.get_peptide2()

    let gid,otid,org,prot_count,pep_count,temp,studies,studies_ary,study_id,study_collector,row,row_collector
    console.log(q)
    TDBConn.query(q, (err, rows) => {
       if (err) {
          console.log("protein_peptide select error-GET",err)
          return
       }
       //console.log('1')
       let full_send_list = []
       let org_list = []
       study_collector = {}
       row_collector= {}
       for(let r in rows){
           
           gid = rows[r].seq_id
           
           study_id = rows[r].study_id
           if(!study_collector.hasOwnProperty(gid)){
                study_collector[gid] = [rows[r].study_id]
           }else{
                study_collector[gid].push(rows[r].study_id) 
           }
           row_collector[gid] = rows[r]
        }
        for(gid in row_collector){
           
           ///gid = rows[r].seq_id
           studies = study_collector[gid].join(',')
           row = row_collector[gid]
           //console.log('row',row)
           //temp = {gid:rows[r].seq_id, otid:rows[r].otid, org:rows[r].organism, prot_count:rows[r].protein_count,pep_count:rows[r].peptide_count,studies:studies}
           temp = {gid:gid, otid:row.otid, org:row.organism, prot_count:row.protein_count,pep_count:row.peptide_count,studies:studies}
           
           full_send_list.push(temp)
           // if(C.genome_lookup.hasOwnProperty(gid)){
//              genome = C.genome_lookup[gid]
//              console.log('genome',genome)
//              temp = {gc:genome.gc,pid:pid,product:prod,gid:gid,mol:mol,organism:org,otid:otid,genus:genome.genus,species:genome.species,strain:genome.strain,peptide:pep,unique:rows[r].unique,length:rows[r].length,start:rows[r].start,stop:rows[r].end}
//              console.log('temp',temp)
//              //console.log(C.genome_lookup[gid])
//              send_list.push(temp)
//            }
       }
       let send_list = full_send_list
       
       res.render('pages/genome/protein_peptide2', {
          title: 'HOMD :: Human Oral Microbiome Database',
          pgname: '', // for AbountThisPage
          pgtitle: 'Protein Peptide Table',
          config: JSON.stringify(CFG),
          ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),
          user: JSON.stringify(req.user || {}),
          data: JSON.stringify(send_list),
          row_count:send_list.length,
          search_text:''
          
       })
    })
})
router.post('/peptide_table2', function peptide_table2_post(req, res) {
    const q = queries.get_peptide2()
//     SELECT organism as org,protein_accession as pid,peptide_id,molecule as mol,genomes.otid,product,peptide,jb_link,protein_peptide.study_id,study_name 
// FROM protein_peptide 
// JOIN protein_peptide_counts using (seq_id) 
// JOIN genomes using (seq_id) 
// JOIN protein_peptide_counts_study using (protein_peptide_counts_id) 
// JOIN protein_peptide_studies on (protein_peptide_counts_study.study_id=protein_peptide_studies.study_id) 
// where seq_id='SEQF9928.1'
    let search_text = req.body.txt_srch.toLowerCase()
    let gid,otid,hmt,org,prot_count,pep_count,temp,studies,studies_ary,study_id,study_collector,row,row_collector
    console.log(q)
    TDBConn.query(q, (err, rows) => {
       if (err) {
          console.log("protein_peptide select error-GET",err)
          return
       }
       //console.log('1')
       let full_send_list = []
       let org_list = []
       study_collector = {}
       row_collector= {}
       for(let r in rows){
           
           gid = rows[r].seq_id
           study_id = rows[r].study_id
           if(!study_collector.hasOwnProperty(gid)){
                study_collector[gid] = [rows[r].study_id]
           }else{
                study_collector[gid].push(rows[r].study_id) 
           }
           row_collector[gid] = rows[r]
        }
        for(gid in row_collector){
           
           ///gid = rows[r].seq_id
           studies = study_collector[gid].join(',')
           
           row = row_collector[gid]
           hmt = helpers.make_otid_display_name(row.otid)
           //console.log('row',row)
           //temp = {gid:rows[r].seq_id, otid:rows[r].otid, org:rows[r].organism, prot_count:rows[r].protein_count,pep_count:rows[r].peptide_count,studies:studies}
           temp = {gid:gid, otid:row.otid, hmt:hmt,org:row.organism, prot_count:row.protein_count,pep_count:row.peptide_count,studies:studies}
           
           full_send_list.push(temp)
           // if(C.genome_lookup.hasOwnProperty(gid)){
//              genome = C.genome_lookup[gid]
//              console.log('genome',genome)
//              temp = {gc:genome.gc,pid:pid,product:prod,gid:gid,mol:mol,organism:org,otid:otid,genus:genome.genus,species:genome.species,strain:genome.strain,peptide:pep,unique:rows[r].unique,length:rows[r].length,start:rows[r].start,stop:rows[r].end}
//              console.log('temp',temp)
//              //console.log(C.genome_lookup[gid])
//              send_list.push(temp)
//            }
       }
       let send_list = full_send_list
       if(search_text){
          console.log('searching',search_text)
          send_list = full_send_list.filter( function(item){
               return item.org.toLowerCase().includes(search_text) ||
                  item.gid.toLowerCase().includes(search_text)          ||
                  item.hmt.toLowerCase().includes(search_text)
           })
       }
       res.render('pages/genome/protein_peptide2', {
          title: 'HOMD :: Human Oral Microbiome Database',
          pgname: '', // for AbountThisPage
          pgtitle: 'Protein Peptide Table',
          config: JSON.stringify(CFG),
          ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),
          user: JSON.stringify(req.user || {}),
          data: JSON.stringify(send_list),
          row_count:send_list.length,
          search_text:req.body.txt_srch
          
       })
    })
})
router.get('/peptide_table3', function protein_peptide(req, res) {
    console.log(req.query)
    let gid = req.query.gid
    
    const q = queries.get_peptide3(gid)
    let temp,pid,otid,org,prod,pep,start,stop,mol,study_name,study,peptide_id,jb_link
    let locstart,locstop,size,seqacc,loc,highlight
    console.log(q)
    TDBConn.query(q, (err, rows) => {
       if (err) {
          console.log("protein_peptide select error-GET",err)
          return
       }
       //console.log('1')
       let send_list = []
       
       for(let r in rows){
           temp = {}
           study = rows[r].study_id
           study_name = rows[r].study_name
           pid = rows[r].pid
           prod = rows[r].product
           pep = rows[r].peptide
           //start = rows[r].start
           //stop = rows[r].end
           org = rows[r].org
           otid = rows[r].otid
           mol = rows[r].mol
           peptide_id = rows[r].peptide_id
           jb_link = rows[r].jb_link
           
           /////////////////////////////////////////
           
         //temp = {study:study,study_name:study_name,otid:otid, mol:mol, pid:pid, prod:prod, pep:pep, start:start, stop:stop,loc:loc,hlite:highlight}
         temp = {study:study,study_name:study_name,otid:otid, mol:mol, pid:pid, prod:prod, pep:pep, jb_link:jb_link,peptide_id:peptide_id}
//       
//                
//            }
           
        send_list.push(temp)
           
         
       }
       
       
       res.render('pages/genome/protein_peptide3', {
          title: 'HOMD :: Human Oral Microbiome Database',
          pgname: '', // for AbountThisPage
          pgtitle: 'Protein Peptide Table',
          config: JSON.stringify(CFG),
          ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),
          user: JSON.stringify(req.user || {}),
          data: JSON.stringify(send_list),
          row_count:send_list.length,
          //stud:JSON.stringify(studies_ary),
          org:org,
          gid:gid,
          otid:otid
          
       })
    })
})
router.get('/crispr', function crispr(req, res) {
    // page-1
    //console.log('in crispr')
    //console.log('req.query',req.query)
    let show =''
    if(req.query.show){
        show = req.query.show  // a, na or all
    }
    let crispr_data = JSON.parse(fs.readFileSync(path.join(CFG.PATH_TO_DATA,'homdData-Crispr.json')))
    let seqid_list = Object.keys(crispr_data)
    let full_count = seqid_list.length
    // filter ambiguous vs non-ambiguous
    if(show && show === 'a'){
        seqid_list = seqid_list.filter(item => crispr_data[item] === 'A')
    }else if(show && show === 'na'){
        seqid_list = seqid_list.filter(item => crispr_data[item] !== 'A')
    }
    
    let send_list = []
    //for (var n in seqid_list) {
        //if(C.genome_lookup.hasOwnProperty(seqid_list[n])){
        //     send_list.push(C.genome_lookup[seqid_list[n]])
        //}
    //}
    
    console.log('crispr-cas',seqid_list)
    let q = "SELECT seq_id as gid,tlength,otid,organism,ncontigs FROM genomes WHERE seq_id in ("
    for(let k in seqid_list){
        q = q + "'"+seqid_list[k] + "',"
    }
    q = q.slice(0, -1) +')'
    TDBConn.query(q, (err, rows) => {
       if (err) {
          console.log("Crispr-cas V10 Genomes-GET",err)
          return
       }
       for(let p in rows){
           console.log('row',rows[p])
           send_list.push(rows[p])
       }
    
    // send_list.map(function mapGidObjList (el) {
//         if (el.combined_size) { 
//             el.combined_size = helpers.format_long_numbers(el.combined_size); 
//         }
//     })
     send_list.sort(function (a, b) {
            return helpers.compareStrings_alpha(a.organism, b.organism);
      })
      // send_list.sort(function (a, b) {
//             return helpers.compareByTwoStrings_alpha(a, b, 'organism','organism');
//       })
      //send_list = apply_species(send_list)
      res.render('pages/genome/crispr_cas', {
        title: 'HOMD :: CRISPR-Cas', 
        pgname: '', // for AboutThisPage
        config: JSON.stringify(CFG),
        ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),
        pgtitle: 'CRISPR-Cas',
        crispr_data: JSON.stringify(crispr_data),
        gid_list: JSON.stringify(send_list),
        full_count: full_count,
        show: show
        
      })
      })
});
function list_clean(item){
    //JSON.parse(item.replace('[','').replace(']','') 
    return JSON.parse(item.replace(/'/g, '"'))
}
router.get('/crispr_cas_data', function crispr_cas_data(req, res) {
    // page -2
    //console.log(req.query)
    let gid = req.query.gid
    let data = []
    console.log('crispr_cas_data',gid)
    const q = queries.get_crispr_cas_data(gid)
    
    TDBConn.query(q, (err, rows) => {
        if(err){
           console.log(err)
           return
        }
        //console.log('rows',rows)
        for(let r in rows){
           let obj = {}
           obj.contig = rows[r].contig
           obj.operon = rows[r].operon
           //console.log('operon',obj.operon)
           //let pos = rows[r].operon_pos.split(', ')   //'[17903, 26228]',
           obj.operon_pos = list_clean(rows[r].operon_pos)
           //console.log('pos',pos)
           obj.op_pos1 =obj.operon_pos[0] //.substring(1,pos[0].length)
           obj.op_pos2 =obj.operon_pos[1]  //.substring(0,pos[1].length-1)
           obj.prediction = rows[r].prediction
           //obj.crisprs = rows[r].crisprs
           //console.log('crisprs',rows[r].crisprs, typeof rows[r].crisprs)
           obj.crisprs = list_clean(rows[r].crisprs)
           //obj.distances = rows[r].distances
           obj.distances = list_clean(rows[r].distances)
           obj.prediction_cas = rows[r].prediction_cas
           //obj.prediction_crisprs = rows[r].prediction_crisprs
           obj.prediction_crisprs = list_clean(rows[r].prediction_crisprs)
           //console.log(obj)
           data.push(obj)
        }
        
        
        res.render('pages/genome/crispr_cas_data', {
            title: 'HOMD :: CRISPR-Cas', 
            pgname: '', // for AboutThisPage
            config: JSON.stringify(CFG),
            ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),
            pgtitle: 'CRISPR-Cas',
            gid: gid,
            crispr_data: JSON.stringify(data),
            
        
        })
    
    })
})
module.exports = router
