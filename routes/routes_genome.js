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
router.get('/overview', function overview(req, res) {
    //console.log('in RESET-session')
    let crispr_data = JSON.parse(fs.readFileSync(path.join(CFG.PATH_TO_DATA,'homdData-Crispr.json')))
    //console.log('crispr_data:',Object.keys(crispr_data).length)
    res.render('pages/genome/overview', {
        title: 'HOMD :: Genome Overview', 
        pgname: '', // for AboutThisPage
        config: JSON.stringify(CFG),
        ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
        pgtitle: 'Genome Overview',
        crispr_size: Object.keys(crispr_data).length,
        
    })
});
router.get('/crispr', function crispr(req, res) {
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
    for (var n in seqid_list) {
        if(C.genome_lookup.hasOwnProperty(seqid_list[n])){
             send_list.push(C.genome_lookup[seqid_list[n]])
        }
    }
    
    
    
    send_list.map(function mapGidObjList (el) {
        if (el.tlength) { 
            el.tlength = helpers.format_long_numbers(el.tlength); 
        }
    })
    send_list.sort(function (a, b) {
            return helpers.compareByTwoStrings_alpha(a, b, 'genus','species');
    })
    send_list = apply_sspecies(send_list)
    res.render('pages/genome/crispr_cas', {
        title: 'HOMD :: CRISPR-Cas', 
        pgname: '', // for AboutThisPage
        config: JSON.stringify(CFG),
        ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
        pgtitle: 'CRISPR-Cas',
        crispr_data: JSON.stringify(crispr_data),
        gid_list: JSON.stringify(send_list),
        full_count: full_count,
        show: show
        
    })
});
function list_clean(item){
    //JSON.parse(item.replace('[','').replace(']','') 
    return JSON.parse(item.replace(/'/g, '"'))
}
router.get('/crispr_cas_data', function crispr_cas_data(req, res) {
    //console.log(req.query)
    let gid = req.query.gid
    let data = []
    let q = "SELECT contig,operon,operon_pos,prediction,crisprs,distances,prediction_cas,prediction_crisprs"
    q += " FROM crispr_cas where seq_id='"+gid+"'"
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
            ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
            pgtitle: 'CRISPR-Cas',
            gid: gid,
            crispr_data: JSON.stringify(data),
            
        
        })
    
    })
})
function renderGenomeTable(req, res, args) {
    //console.log('render NEW filter') 
    let alltax_list = Object.values(C.taxon_lookup)  //.filter(item => (item.status !== 'Dropped' && item.status !== 'NonOralRef'))
    let taxa_wgenomes = alltax_list.filter(item => item.genomes.length >0)
    let gcount = 0
    for(let n in alltax_list){
       gcount +=  alltax_list[n].genomes.length
    }
    //let alltax_list = Object.values(C.genome_lookup).filter(item => (item.status !== 'Dropped' && item.status !== 'NonOralRef'))
    //console.log('args',args)
    res.render('pages/genome/genometable', {
        title: 'HOMD :: Genome Table', 
        pgname: 'genome/genome_table', // for AboutThisPage
        config: JSON.stringify(CFG),
        ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
        pgtitle: 'Genome Table',
        data: JSON.stringify(args.send_list),
        filter: JSON.stringify(args.filter),
        rows_per_page: args.pd.rows_per_page,
        gcount: gcount, 
        tcount: taxa_wgenomes.length,
        phyla: JSON.stringify(get_all_phyla().sort()),
        count_txt: args.count_txt,
        taxa_wgenomes: get_taxa_wgenomes().length,
        filter_on: args.filter_on
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
function get_default_gtable_filter(){
    let defaultfilter = {
        gid:'',
        otid:'',
        phylum:'',
        text:{
            txt_srch: '',
            field: 'all',
        },
        letter: '0',
        sort_col: 'genus',
        sort_rev: 'off',
        paging:'on'
    }
    return defaultfilter
}
function get_all_phyla(){
    var phyla_obj = C.homd_taxonomy.taxa_tree_dict_map_by_rank['phylum']
    var phyla = phyla_obj.map(function mapPhylaObj2 (el) { return el.taxon; })
    return phyla
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
  //console.log('fltr',fltr)
  
  const trows = pd.trecords
  if(trows > pd.rows_per_page){
    
    //console.log('IN PD trows',trows)
    
    pd.number_of_pages = Math.ceil(trows / pd.rows_per_page)
    if (pd.page > pd.number_of_pages) { pd.page = 1 }
    if (pd.page < 1) { pd.page = pd.number_of_pages }
    helpers.print(['page_data.number_of_pages', pd.number_of_pages])
    pd.show_page = pd.page
    if (pd.show_page === 1) {
      genomeList = glist.slice(0, pd.rows_per_page) // first 200
      pd.start_count = 1
    } else {
      genomeList = glist.slice(pd.rows_per_page * (pd.show_page - 1), pd.rows_per_page * pd.show_page) // second 200
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
    req.session.gtable_filter = get_default_gtable_filter()
    req.session.gtable_filter.letter = letter
    
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
         req.session.gtable_filter.text.txt_srch = req.body.txt_srch
       }
       if(item == 'field'){
         req.session.gtable_filter.text.field = req.body.field
       }
       if(item == 'paging'){
         req.session.gtable_filter.paging = req.body.paging
       }
    }
    
}
function filter_for_phylum(glist, phy){
    var lineage_list = Object.values(C.taxon_lineage_lookup)
    var obj_lst = lineage_list.filter(item => item.phylum === phy)  //filter for phylum 
    //console.log('obj_lst',obj_lst)
    var otid_list = obj_lst.map( (el) =>{  // get list of otids with this phylum
        return el.otid
    })
    let otid_grabber = {}
    let gid_obj_list = glist.filter(item => {   // filter genome obj list for inclusion in otid list
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
    return gid_obj_list
}
function apply_gtable_filter(req, filter) {
    let big_g_list = Object.values(C.genome_lookup);
    //console.log(big_g_list[0])
    let vals
    if(req.session.gtable_filter){
       vals = req.session.gtable_filter
    }else{
        vals = get_default_gtable_filter()
    }
    //
    // txt_srch
    big_g_list = getFilteredGenomeList(big_g_list, vals.text.txt_srch, vals.text.field)
    //
    //letter
    if(vals.letter && vals.letter.match(/[A-Z]{1}/)){   // always caps
      helpers.print(['FILTER::GOT a TaxLetter: ',vals.letter])
       // COOL.... filter the whole list
      big_g_list = big_g_list.filter(item => item.genus.toUpperCase().charAt(0) === vals.letter)
    }
    //phylum
    if(vals.phylum  !== ''){
       big_g_list = filter_for_phylum(big_g_list, vals.phylum)
    }
    
    //sort_col
    if(vals.sort_rev === 'on'){
        //console.log('REV sorting by ',vals.sort_col)
         if(vals.sort_col === 'genus'){
          big_g_list.sort(function (b, a) {
            return helpers.compareByTwoStrings_alpha(a, b, 'genus','species');
          })
        }else if(vals.sort_col === 'otid' || vals.sort_col === 'ncontigs' || vals.sort_col === 'tlength'){
          big_g_list.sort(function (b, a) {
            return helpers.compareStrings_int(a[vals.sort_col], b[vals.sort_col]);
          })
        }else if(vals.sort_col === 'gc'){
          big_g_list.sort(function (b, a) {
            return helpers.compareStrings_float(a[vals.sort_col], b[vals.sort_col]);
          })
        }else{
          big_g_list.sort(function (b, a) {
            return helpers.compareStrings_alpha(a[vals.sort_col], b[vals.sort_col]);
          })
        }
        
    }else{
        //console.log('FWD sorting by ',vals.sort_col)
        if(vals.sort_col === 'genus'){
          big_g_list.sort(function (a, b) {
            return helpers.compareByTwoStrings_alpha(a, b, 'genus','species');
          })
        }else if(vals.sort_col === 'otid' || vals.sort_col === 'ncontigs' || vals.sort_col === 'tlength'){
          big_g_list.sort(function (a, b) {
            return helpers.compareStrings_int(a[vals.sort_col], b[vals.sort_col]);
          })
        }else if(vals.sort_col === 'gc'){
          big_g_list.sort(function (a, b) {
            return helpers.compareStrings_float(a[vals.sort_col], b[vals.sort_col]);
          })
        }else{
          big_g_list.sort(function (a, b) {
            return helpers.compareStrings_alpha(a[vals.sort_col], b[vals.sort_col]);
          })
        }
    }
    // format big nums
    big_g_list.map(function mapGidObjList (el) {
        if (el.tlength) { 
            el.tlength = helpers.format_long_numbers(el.tlength); 
        }
    })
    return big_g_list
}
function get_filter_on(f, type){
    // for comparison stringify
    let d,fxn
    if(type == 'annot'){
       d = get_default_annot_filter()
    }else{
       d = get_default_gtable_filter()
    }
    let obj1 = JSON.stringify(d)
    let obj2 = JSON.stringify(f)
    if(obj1 === obj2){
      return 'off'
    }else{
      return 'on'
    }
}
function apply_sspecies(lst){
   let otid,sp=''
   let subspecies = ''
   
   for(let i in lst){
      otid = lst[i].otid
      //sp = lst[i].species
      lst[i].subspecies = ''
      if(C.taxon_lineage_lookup[otid].subspecies){
        //subspecies = ' <small>['+C.taxon_lineage_lookup[otid].subspecies+']</small>'
        //lst[i].species = sp + subspecies
        lst[i].subspecies = C.taxon_lineage_lookup[otid].subspecies
      }
   }
   return lst

}
router.get('/reset_gtable', function gen_table_reset(req, res) {
   //console.log('in RESET-session')
   req.session.gtable_filter = get_default_gtable_filter()
   res.redirect('back');
});
router.get('/genome_table', function genome_table(req, res) {
    let filter, send_list, showing,ret,count_before_paging,args,count_txt
    let page_data = init_page_data()
    if(req.query.page){
       page_data.page = parseInt(req.query.page)
    }else{
       page_data.page = 1
    }
    if(req.session.gtable_filter){
        //console.log('gfiletr session')
        filter = req.session.gtable_filter
    }else{
        //console.log('gfiletr from default')
        filter = get_default_gtable_filter()
        req.session.gtable_filter = filter
    }
    
    if(req.query.otid){
       // reset gtable_filter here because we are coming from tax_table button
       // and expect to see the few genomes for this one taxon
       filter = get_default_gtable_filter()
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
       send_list = apply_gtable_filter(req, filter)
    }
    //console.log('send_list[0]',send_list[0])
    count_before_paging = send_list.length
    // Initial page = 1 for fast load
    // no paging in POST side
    let pager_txt = ''
    if(filter.paging === 'on'){
      ret = apply_pages(send_list, filter, page_data)
      send_list = ret.glist
      page_data = ret.pd
      //console.log('get init pd',page_data)
      //console.log(page_data)
      if(count_before_paging > send_list.length){
         //console.log('must add pager txt')
         pager_txt = '; [page: '+page_data.page + " (of "+page_data.number_of_pages+"p) ]"
         let next = (page_data.page + 1).toString()
         let prev = (page_data.page - 1).toString()
         pager_txt += "<a href='genome_table?page="+prev+"'> Previous Page</a>"
         pager_txt += "<==><a href='genome_table?page="+next+"'>Next Page</a>"
      }
    }
    count_txt = 'Number of Records Found: '+count_before_paging.toString()+ ' Showing: '+send_list.length.toString() + pager_txt
    // apply sub-species to species
    send_list = apply_sspecies(send_list)
    args = {filter: filter, send_list: send_list, count_txt: count_txt, pd:page_data, filter_on: get_filter_on(filter,'genome')}
    renderGenomeTable(req, res, args)

});
router.post('/genome_table', function genome_table_filter(req, res) {
    //console.log('in POST gt filter')
    //console.log(req.body)
    let filter, send_list, page_data,count_before_paging,pager_txt,ret,args,count_txt
    set_gtable_session(req)
    //console.log('gtable_session',req.session.gtable_filter)
    filter = req.session.gtable_filter
   
    send_list = apply_gtable_filter(req, filter)
    count_before_paging = send_list.length
    page_data = init_page_data()
    page_data.page=1
    pager_txt = ''
    if(filter.paging === 'on'){
       ret = apply_pages(send_list, filter, page_data)
       send_list = ret.glist
       page_data = ret.pd
       if(count_before_paging > send_list.length){
         pager_txt = '; [page: '+page_data.page + " (of "+page_data.number_of_pages+"p) ]"
         let next = (page_data.page + 1).toString()
         let prev = (page_data.page - 1).toString()
         pager_txt += "<a href='genome_table?page="+prev+"'> Previous Page</a>"
         pager_txt += "<==><a href='genome_table?page="+next+"'>Next Page</a>"
      }
    }
    count_txt = 'Number of Records Found: '+count_before_paging.toString()+ ' Showing: '+send_list.length.toString() + pager_txt
    send_list = apply_sspecies(send_list)
    args = {filter:filter, send_list: send_list, count_txt: count_txt, pd:page_data, filter_on: get_filter_on(filter,'genome')}
    renderGenomeTable(req, res, args)
     
})


router.get('/jbrowse', function jbrowse (req, res) {
//router.get('/taxTable', helpers.isLoggedIn, (req, res) => {
  helpers.accesslog(req, res)
  ////console.log('jbrowse-get')
  //let myurl = url.parse(req.url, true);
    
  const gid = req.query.gid
  let gc = 0
  if(gid){
      gc = helpers.get_gc_for_gccontent(C.genome_lookup[gid].gc)
  }
  const glist = Object.values(C.genome_lookup)
  
  glist.sort(function sortGList (a, b) {
      return helpers.compareStrings_alpha(a.genus, b.genus)
    })
  // filter out empties then map to create list of sorted strings
  const genomeList = glist.filter(item => item.genus !== '')
    .map((el) => {
      return { gid: el.gid, gc:el.gc, genus: el.genus, species: el.species, ccolct: el.ccolct }
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
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
    user: JSON.stringify(req.user || {}),
  })
})
//
router.post('/jbrowse_ajax', function jbrowseAjaxPost (req, res) {
  //console.log('AJAX JBrowse')
  helpers.print(req.body)
  // URL from old HOMD site:
  // ?data=homd/SEQF2029
  //  &tracks=DNA,prokka,ncbi
  //  &loc=SEQF2029|GL982453.1:2729587..4094422
  //  &highlight=
  //console.log(req.body);
  helpers.accesslog(req, res)
  //open(jburl)
  
  res.send(JSON.stringify({ response_data: req.body.gid }))
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
    //console.log('crispr_data:',crispr_data[gid])
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
        ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
        user: JSON.stringify(req.user || {}),
      })
  })
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
  //console.log('anno2 query '+q)
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
        ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
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
    let search_text = req.body.search_text
    let selected_gid = req.body.gid
    let rowobj,start,stop,locstart,locstop,seqacc,tmp,ssp = '',organism=''
    var re = new RegExp(search_text,"gi");
    if(C.genome_lookup[selected_gid] && C.genome_lookup[selected_gid].subspecies){
       ssp = C.genome_lookup[selected_gid].subspecies+' '
    }
    if(C.genome_lookup[selected_gid]){
        organism = C.genome_lookup[selected_gid].genus +' '+C.genome_lookup[selected_gid].species+' '+ssp+C.genome_lookup[selected_gid].ccolct
    }
    let html = "<table id='annotation-table' class='table sortable'>"
    html += '<tr>'
    html += '<th>Molecule</th>'
    html += '<th>PID</th>'
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
            
            rowobj.acc_adorned = (rowobj.acc).replace(re, "<font color='red'>"+search_text.toLowerCase()+"</font>");
            html += "<td nowrap>"+rowobj.acc_adorned+"</td>"   // molecule
            
            rowobj.pid_adorned = (rowobj.pid).replace(re, "<font color='red'>"+search_text.toLowerCase()+"</font>");
            html += "<td nowrap>"+rowobj.pid_adorned
            
            if(anno === "prokka"){ 
                seqacc = rowobj.acc.replace('_','|')
            }else{
                seqacc = selected_gid +'|'+ rowobj.acc
            }
            let jbtracks = "DNA,homd,prokka,ncbi"
            let loc = seqacc+":"+locstart.toString()+".."+locstop.toString()
            let highlight = seqacc+":"+start.toString()+".."+stop.toString()
            //console.log('XXX',rowobj.pid+"','"+db+"','"+rowobj.acc+"','"+organism+"','"+rowobj.product+"','"+selected_gid)
            html += " <a title='JBrowse/Genome Viewer' href='"+cfg.JBROWSE_URL+"/"+selected_gid+"&loc="+loc+"&highlight="+highlight+"&tracks="+jbtracks+"' target='_blank' rel='noopener noreferrer'>JB</a>"
        
            html += "</td>"   // pid (and JB)
        
            html += "<td nowrap>"+rowobj.length_na
                html += " [<a title='Nucleic Acid' href='#' onclick=\"get_NN_NA_seq('na','"+rowobj.pid+"','"+db+"','"+rowobj.acc+"','"+organism+"','"+rowobj.product+"','"+selected_gid+"')\"><b>NA</b></a>]"
            html += "</td>"   // NA length
            html += "<td nowrap>"+rowobj.length_aa
                html += " [<a title='Nucleic Acid' href='#' onclick=\"get_NN_NA_seq('aa','"+rowobj.pid+"','"+db+"','"+rowobj.acc+"','"+organism+"','"+rowobj.product+"','"+selected_gid+"')\"><b>AA</b></a>]"
            html += "</td>"   // AA length
            html += "<td nowrap>"+start+'-'+stop+"</td>"   // Range
            
            rowobj.gene_adorned = rowobj.gene.replace(re, "<font color='red'>"+search_text.toLowerCase()+"</font>");
            html += "<td nowrap>"+rowobj.gene_adorned+"</td>"   // product
            
            rowobj.product_adorned = rowobj.product.replace(re, "<font color='red'>"+search_text.toLowerCase()+"</font>");
            html += "<td>"+rowobj.product_adorned+"</td>"   // product
        
            html += "</tr>"
       
        }
        html += "</table>"
    
        res.send(html)
            
        })  // end readFile
      }
    })  // end access
            



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
                   if(C.genome_lookup[tmpgid].subspecies){
                      ssp = C.genome_lookup[tmpgid].subspecies+' '
                   }
                   let organism = C.genome_lookup[tmpgid].genus +' '+C.genome_lookup[tmpgid].species+' '+ssp+C.genome_lookup[tmpgid].ccolct
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
                ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),

                anno: anno,
                search_text: search_text,
                data: JSON.stringify(site_search_result),
                sorted_gids: JSON.stringify(data_keys),
                org_obj: JSON.stringify(org_list),
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
            txt_srch: body.txt_srch,
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

router.post('/annotation_filter', function annotation_filter (req, res) {
    //console.log('IN annotation_filter')
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
    const glist = Object.values(C.genome_lookup)
    glist.sort(function sortGList (a, b) {
      return helpers.compareStrings_alpha(a.genus, b.genus)
    })
    // filter out empties then map to create list of sorted strings
    const allAnnosObj = glist.filter(item => item.genus !== '')
      .map((el) => {
      return { gid: el.gid, org: el.genus+' '+el.species+' '+el.ccolct }
    })
    
    let pageData = {}
    pageData.page = req.query.page
    if (!req.query.page) {
      pageData.page = 1
    }
    let atable_filter = get_annot_table_filter(req.body)
    req.session.atable_filter = atable_filter
    const q = queries.get_annotation_query(gid, req.body.anno)
    console.log(q)
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
router.get('/explorer', function explorer (req, res) {
  //console.log('in explorer')
  // let myurl = url.parse(req.url, true)
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
      return helpers.compareStrings_alpha(a.genus, b.genus)
    })
  // filter out empties then map to create list of sorted strings
  const allAnnosObj = glist.filter(item => item.genus !== '')
    .map((el) => {
      
      //return { gid: el.gid, org: el.organism }
      return { gid: el.gid, org: el.genus+' '+el.species+' '+el.ccolct }
    })
  
  if (!gid || gid.toString() === '0') {
   
    args = {fltr:{},filter_on:'off',gid:0,gc:gc,otid:0,organism:'',allAnnosObj:allAnnosObj,annoType:anno,pageData:{},annoInfoObj:{},pidList:[]}
    render_explorer(req, res, args)
    return
  }else {
      if (Object.prototype.hasOwnProperty.call(C.annotation_lookup, gid)) {
        organism = C.annotation_lookup[gid].prokka.organism
      }else{
        req.flash('fail', 'Genome not found: "'+gid+'"')
        
        args = {fltr:{},filter_on:'off',gid:0,gc:gc,otid:0,organism:'',allAnnosObj:allAnnosObj,annoType:'',pageData:{},annoInfoObj:{},pidList:[]}
        render_explorer(req, res, args)
        return
      }
  }
  
  
  if (Object.prototype.hasOwnProperty.call(C.genome_lookup, gid)) {
        otid = C.genome_lookup[gid].otid
        gc = helpers.get_gc_for_gccontent(C.genome_lookup[gid].gc)
  }
  if(gid && !anno) {
      
      args = {fltr:{},filter_on:'off',gid:gid,gc:gc,otid:0,organism:organism,allAnnosObj:allAnnosObj,annoType:'',pageData:{},annoInfoObj:{},pidList:[]}
      render_explorer(req, res, args)
      return
  }
 
  
  // NOW ANNOTATIONS
  if (Object.prototype.hasOwnProperty.call(C.annotation_lookup, gid) && Object.prototype.hasOwnProperty.call(C.annotation_lookup[gid], anno)) {
    annoInfoObj = C.annotation_lookup[gid][anno]
  } else {
    req.flash('fail', 'Could not find: "'+anno+'" annotation for '+gid)

    args = {fltr:{},filter_on:'off',gid:gid,gc:gc,otid:otid,organism:organism,allAnnosObj:allAnnosObj,annoType:anno,pageData:{},annoInfoObj:{},pidList:[]}
    render_explorer(req, res, args)
    return
  }

  //OLD DB
  const q = queries.get_annotation_query(gid, anno)
  console.log(q)
  //NEW DB
  
  if(req.session.atable_filter){
        atable_filter = req.session.atable_filter
    }else{
        atable_filter = get_default_annot_filter()
        req.session.atable_filter = atable_filter
    }
  //console.log('anno query '+q)
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
        ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
        user: JSON.stringify(req.user || {}),
        blast_type: 'genome'
      })
})
router.get('/blast_per_genome', function blast_per_genome(req, res) {
   //router.get('/taxTable', helpers.isLoggedIn, (req, res) => {
  helpers.accesslog(req, res)
  //console.log('blast_per_genome')
  //let myurl = url.parse(req.url, true);
    
  const gid = req.query.gid
  let gc = 0
  if(gid){
      gc = helpers.get_gc_for_gccontent(C.genome_lookup[gid].gc)
  }
  const glist = Object.values(C.genome_lookup)
  
  glist.sort(function sortGList (a, b) {
      return helpers.compareStrings_alpha(a.genus, b.genus)
    })
  // filter out empties then map to create list of sorted strings
  const genomeList = glist.filter(item => item.genus !== '')
    .map((el) => {
      return { gid: el.gid, gc:el.gc, genus: el.genus, species: el.species, ccolct: el.ccolct }
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
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
    user: JSON.stringify(req.user || {}),
  })
})

router.get('/blast_sserver', function blast_sserver(req, res){
   //console.log(req.query)
   let db_type = req.query.type
   let page_title = ''
   if(db_type == 'refseq'){
     page_title = 'BLAST: RefSeq Databases'
   }else{
     page_title = 'Genomic BLAST: All-Genomes Databases'
   }
   helpers.accesslog(req, res)
   res.render('pages/genome/blast_server_iframe', {
    title: 'HOMD :: BLAST', 
    pgname: 'blast/pagehelp', // for AboutThisPage
    config: JSON.stringify(CFG),
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
    user: JSON.stringify(req.user || {}),
    gid: '',
    annotation: '',
    organism: '',
    db_type: db_type,
    ptitle: page_title,
  })
})

router.post('/blast_ss_single', function blast_ss_single(req, res){
  //console.log('IN POST blast_ss_single')
  //console.log(req.body)
  
  //console.log(CFG.BLAST_URL_BASE)
  let organism = C.genome_lookup[req.body.gid].organism +' '+C.genome_lookup[req.body.gid].ccolct 
  //console.log(C.genome_lookup[req.body.gid])
  if(req.session.gtable_filter){
        req.session.gtable_filter.gid = req.body.gid
    } 
    
  let page_title = 'Genomic BLAST: '+organism +' ('+req.body.gid+')'
  if(req.body.annotation){
     page_title = '['+req.body.annotation.toUpperCase() +'] '+ page_title
  }
  helpers.accesslog(req, res)
  res.render('pages/genome/blast_server_iframe', {
    title: 'HOMD :: BLAST', 
    pgname: 'blast/pagehelp', // for AboutThisPage
    config: JSON.stringify(CFG),
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
    user: JSON.stringify(req.user || {}),
    gid: req.body.gid,
    annotation: req.body.annotation,
    organism: organism,
    ptitle: page_title,
    db_type: ''
  })
   
})
router.post('/blast_single_test', function(req, res){
  //console.log('IN POST blast_single_test')
  //console.log(req.body)
   res.render('pages/genome/test_blast_single', {
    title: 'HOMD :: BLAST', 
    pgname: 'genome/BLAST', // for AboutThisPage
    config: JSON.stringify(CFG),
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
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
  //console.log('blast_test')
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
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
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
//         pgname: 'blast', // for AboutThisPage
//         config: JSON.stringify(CFG),
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
  
  //console.log('in conserved_protein_tree')
  // let myurl = url.URL(req.url, true);
  const otid = req.query.otid
  const fullname = helpers.make_otid_display_name(otid)
  helpers.print(fullname)
  // https://www.homd.org/ftp/phylogenetic_trees/genome/V10.1/eHOMD_Genomic_PhyloPhlAn_Tree.svg
  let filepath = CFG.FTP_TREE_URL_LOCAL +'/eHOMD_Genomic_PhyloPhlAn_Tree.svg'
  
  
  //fs.readFile('public/trees/conserved_tree.svg', 'utf8', function readSVGFile1 (err, data) {
  fs.readFile(filepath, 'utf8', function readSVGFile1 (err, data) {
    if (err) {
      console.log(err)
    } else {
      res.render('pages/genome/conserved_protein_tree', {
        title: 'HOMD :: Conserved Protein Tree',
        pgname: 'genome/tree', // for AboutThisPage
        config: JSON.stringify(CFG),
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
  //console.log('in ribosomal_protein_tree')

  const otid = req.query.otid
  // https://www.homd.org/ftp/phylogenetic_trees/genome/V10.1/eHOMD_Ribosomal_Protein_Tree.svg
  let filepath = CFG.FTP_TREE_URL_LOCAL +'/eHOMD_Ribosomal_Protein_Tree.svg'
  //fs.readFile('public/trees/ribosomal_tree.svg', 'utf8', function readSVGFile2 (err, data) {
  fs.readFile(filepath, 'utf8', function readSVGFile2 (err, data) {
    if (err) {
      console.log(err)
    } else {
      res.render('pages/genome/ribosomal_protein_tree', {
        title: 'HOMD :: Ribosomal Protein Tree',
        pgname: 'genome/tree', // for AboutThisPage
        config: JSON.stringify(CFG),
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
  //console.log('in rRNA_gene_tree')
  // const myurl = url.URL(req.url, true)
  // const myurl = new url.URL(req.url)
  const otid = req.query.otid
  helpers.print(['otid', otid])
  // https://www.homd.org/ftp/phylogenetic_trees/genome/V10.1/eHOMD_16S_rRNA_Tree_V10.1.svg
  let filepath = CFG.FTP_TREE_URL_LOCAL +'/eHOMD_16S_rRNA_Tree.svg'
  //fs.readFile('public/trees/16S_rRNA_tree.svg', 'utf8', function readSVGFile3 (err, data) {
  fs.readFile(filepath, 'utf8', function readSVGFile3 (err, data) {
    if (err) {
      console.log(err)
    }
    res.render('pages/genome/rRNA_gene_tree', {
      title: 'HOMD :: rRNA Gene Tree',
      pgname: 'genome/tree', // for AboutThisPage
      config: JSON.stringify(CFG),
      ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
      user: JSON.stringify(req.user || {}),
      svg_data: JSON.stringify(data),
      otid: otid
    })
  })
})
//
//
router.get('/dld_table_all/:type', function dldTableAll (req, res) {
    const type = req.params.type
    let fileFilterText = 'HOMD.org Genome Data:: All Genome Data'
    const sendList = Object.values(C.genome_lookup)
    const listOfGids = sendList.map(item => item.gid)
    fileFilterText = fileFilterText + ' Date: ' + today
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
router.get('/dld_table/:type', function dldTable (req, res) {
  helpers.accesslog(req, res)
  //console.log('in download table -genome:')
  
  const type = req.params.type
  const letter = req.session.gtable_filter.letter
  const phylum = req.session.gtable_filter.phylum
  const otid = req.session.gtable_filter.otid
  const searchText = req.session.gtable_filter.text.txt_srch
  const searchField = req.session.gtable_filter.text.field

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
  } else if (otid !== '') {
    //console.log('in otid dnld')
    const gidList = C.taxon_lookup[otid].genomes
    // console.log('sil',seqid_list)
    for (let n in gidList) {
      sendList.push(C.genome_lookup[gidList[n]])
    }
    fileFilterText = 'HOMD.org Genome Data::Oral TaxonID: HMT-' + ('000' + otid).slice(-3)
  } else if (phylum !== '') {
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
  } else if (searchText !== '') {
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

  //helpers.print(['listOfGids', listOfGids])
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
  } else if (searchField === 'ccolct') {
    sendList = gidObjList.filter(item => item.ccolct.toLowerCase().includes(searchText))
 } else if (searchField === 'organism') {
    sendList = gidObjList.filter(item => item.organism.toLowerCase().includes(searchText))
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
    // organism
    tmpSendList = gidObjList.filter(item => item.organism.toLowerCase().includes(searchText))
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
// function parse_blast_db_info(hit_data,ext,path){
// //  Database: ftp/faa/SEQF1595.faa
// //   1,842 sequences; 605,679 total residues
// // 
// //  Date: Feb 7, 2022 11:14 PM   Longest sequence: 4,231 residues
// // 
// //  BLASTDB Version: 4
// // 
// //  Volumes:
// //   /Users/avoorhis/programming/blast-db-alt/faa/SEQF1595.faa
// 
//     let lines,line,tmp
//     let hit = {
//        path: path,
//        ext: ext,
//        mol_type: '',
//        name: '',
//        seqs: '',
//        bps: '',
//        date: '',
//        db_version: ''
//     }
//     if(ext === 'faa'){
//        hit.mol_type = 'protein'
//     }else{
//       hit.mol_type = 'nucleotide'
//     }
//     lines = hit_data.split('\n')
//     
//     for(let l in lines){
//        line = lines[l].trim()
//        if(line.substring(0,8) === "Database"){
//            hit.name = line.split(':')[1].trim()
//        }
//        if(line.indexOf('sequences;') != -1){
//            tmp = line.split('sequences;')
//            hit.seqs = tmp[0].trim().replace(/,/g,'')
//            hit.bps = tmp[1].trim().split(' ')[0].replace(/,/g,'')
//        }
//        if(line.substring(0,4) === "Date"){
//            hit.date = line.split('\t')[0].split(':')[1].trim()
//        }
//        if(line.substring(0,15) === "BLASTDB Version"){
//            hit.db_version = line.split(':')[1].trim()
//        }
//     } 
//     
//     
//     return hit
//     
// }
function get_blast_db_info(gid){
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
           // run = spawn('/Users/avoorhis/.sequenceserver/ncbi-blast-2.12.0+/bin/blastdbcmd',['-db',filepath,'-info'])
//            run.stdout.on("data", data => {
//                 //console.log(`stdout: ${data}`);
//                 full_data += data
//             });
// 
//             run.stderr.on("data", data => {
//                 console.log(`stderr: ${data}`);
//                 
//             });
// 
//             run.on('error', (error) => {
//                 console.log(`error: ${error.message}`);
//             });
// 
//             run.on("close", code => {
//                 console.log(`child process exited with code ${code}`);
//                 if(code == 0){
//                   hit = parse_blast_db_info(full_data.toString(), exts[e], paths[p])
//                   
//                   console.log('hit',exts[e],hit)
//                 }
//             });
       }
    }
    const responses = Promise.all(promises)
      .then(results => {
      
      return results
    })
    //console.log('info',info)
    //blastdbcmd -recursive -list #{config[:database_dir]} -list_outfmt "%f %t  %p  %n  %l  %d  %v"
       //  %f means the BLAST database absolute file name path
//         %t means the BLAST database title
//          %p means the BLAST database molecule type
//          %n means the number of sequences in the BLAST database
//          
//          %l means the number of bases/residues in th
//e BLAST database
//          %d means the date of last update of the BLAST database
//          %v means the BLAST database format version 

    
    
}
module.exports = router
