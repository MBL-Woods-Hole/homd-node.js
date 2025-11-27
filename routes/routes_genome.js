'use strict'
import express from 'express';
let router    = express.Router()

import fs from 'fs-extra';


import path from 'path';

import C from '../public/constants.js';
import * as helpers from './helpers/helpers.js';
import * as helpers_taxa from './helpers/helpers_taxa.js';
import * as helpers_genomes from './helpers/helpers_genomes.js';
import * as queries from './queries.js';



import https from 'https';

// router.get('/overview', function overview(req, res) {
//     //console.log('in RESET-session')
//     let crispr_data = JSON.parse(fs.readFileSync(path.join(ENV.PATH_TO_DATA,'homdData-Crispr.json')))
//     //console.log('crispr_data:',Object.keys(crispr_data).length)
//     res.render('pages/genome/overview', {
//         title: 'HOMD :: Genome Overview', 
//         pgname: '', // for AboutThisPage
//         config: JSON.stringify(ENV),
//         //ver_info: JSON.stringify(C.version_information),
//         ver_info: JSON.stringify(C.version_information),
//         pgtitle: 'Genome Overview',
//         crispr_size: Object.keys(crispr_data).length,
//         
//     })
// });

function renderGenomeTable(req, res, args) {
    //console.log('render NEW filter') 
    let alltax_list = Object.values(C.taxon_lookup)  
    let taxa_wgenomes = alltax_list.filter(item => item.genomes.length >0)
    let gcount = 0
    for(let n in alltax_list){
       gcount +=  alltax_list[n].genomes.length
    }
    
    //console.log('args.send_list',args.send_list)
    res.render('pages/genome/genometable', {
        title: 'HOMD :: Genome Table', 
        pgname: 'genome/genome_table', // for AboutThisPage
        config: JSON.stringify(ENV),
        ver_info: JSON.stringify(C.version_information),
        pgtitle: 'Genome Table',
        data: JSON.stringify(args.send_list),
        filter: JSON.stringify(args.filter),
        pd: JSON.stringify(args.pd),
        gcount: gcount, 
        tcount: taxa_wgenomes.length,
        phyla: JSON.stringify(helpers_taxa.get_all_phyla().sort()),
        count_txt: args.count_txt,
        taxa_wgenomes: helpers_genomes.get_taxa_wgenomes().length,
        filter_on: args.filter_on,
        no_ncbi_annot: JSON.stringify(C.no_ncbi_genomes)
    })
}


function get_filter_on(f, type){
    // for comparison stringify
    let d,fxn
    if(type === 'annot'){
       d = helpers_genomes.get_default_annot_filter()
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

router.get('/reset_gtable', function gen_table_reset(req, res) {
   //console.log('in RESET-session')
   req.session.gtable_filter = helpers_genomes.get_default_gtable_filter()
   res.redirect('genome_table');
});
router.get('/genome_table', function genome_table(req, res) {
    
    // https://www.ncbi.nlm.nih.gov/assembly/GCF_000160075.2/?shouldredirect=false
    helpers.print('In GET Genome Table')
    let filter={}, send_list, showing,ret_obj,count_before_paging,args,count_txt
    let page_data = helpers_genomes.init_page_data()
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
    
    let filter_on = 'off'
    if(req.query.otid){ 
       
       //console.log('GT GOT otid',otid)
       // reset gtable_filter here because we are coming from tax_table button
       // and expect to see the few genomes for this one taxon
       filter = helpers_genomes.get_default_gtable_filter()
       filter.otid = req.query.otid
       //console.log('XXXfilter',filter)
       req.session.gtable_filter = filter
       if(req.session.ttable_filter){
           req.session.ttable_filter.otid = req.query.otid
       }
       //console.log('got otid '+req.query.otid)
       let seqid_list = C.taxon_lookup[req.query.otid].genomes
       //seqid_list =[ 'SEQF10000.1', 'SEQF10001.1', 'SEQF10010.1' ]
       //console.log('sil',seqid_list)
       send_list = []
       for (let n in seqid_list) {
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
      ret_obj = helpers_genomes.on_paging(send_list, filter, page_data)
      send_list = ret_obj.send_list
      page_data = ret_obj.page_data
      pager_txt = ret_obj.pager_txt
    }
    page_data.count_before_paging = count_before_paging
    //console.log('pagedata',page_data)
    if(pager_txt !== ''){
        pager_txt = space+pager_txt
    }
    count_txt = 'Number of Records Found: '+page_data.count_before_paging.toString()
    count_txt += space+'Showing: '+send_list.length.toString()
    count_txt += ' rows'+ pager_txt
    // apply sub-species to species
    send_list = helpers_genomes.apply_species(send_list)
    send_list.map(function mapGidObjList (el) {
        if (el.combined_size) { 
            el.combined_size = helpers.format_long_numbers(el.combined_size); 
        }
    })
    // DONOT SORT HERE === SORT IN FILTER
    if(req.query.otid){
       filter_on = 'on'
    }else{
       filter_on = get_filter_on(filter,'genome')
    }
    args = {filter: filter, send_list: send_list, count_txt: count_txt, pd:page_data, filter_on: filter_on}
    //console.log('list[0]',send_list[0])
    renderGenomeTable(req, res, args)

});
router.post('/genome_table', function genome_table_post(req, res) {
    console.log('in POST genome_table')
    //console.log('req.body',req.body)
    let filter, send_list, page_data,count_before_paging,pager_txt,ret_obj,args,count_txt
    helpers_genomes.set_gtable_session(req)
    //console.log('gtable_session',req.session.gtable_filter)
    filter = req.session.gtable_filter
    //console.log('filter',filter)
    send_list = helpers_genomes.apply_gtable_filter(req, filter)
    // format big nums
    
    //let obj1 = send_list.filter(o => o.species === 'coli');
    //console.log('coli1',obj1.length)
    count_before_paging = send_list.length
    page_data = helpers_genomes.init_page_data()
    page_data.page=1
    pager_txt = ''
    let space = '&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;'
    if(filter.paging === 'on'){
       ret_obj = helpers_genomes.on_paging(send_list, filter, page_data)
       send_list = ret_obj.send_list
       page_data = ret_obj.page_data
       pager_txt = ret_obj.pager_txt
    }
    if(pager_txt !== ''){
        pager_txt = space+pager_txt
    }
    page_data.count_before_paging = count_before_paging
    count_txt = 'Number of Records Found: '+page_data.count_before_paging.toString()
    count_txt += space+'Showing: '+send_list.length.toString()
    count_txt += ' rows'+ pager_txt
    //console.log('pd2',page_data)
    send_list = helpers_genomes.apply_species(send_list)
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
  
  glist.sort((a, b) =>{
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
    config: JSON.stringify(ENV),
    gid: gid,  // default
    gc:gc,
    page_type: 'JBrowse',
    genomes: JSON.stringify(genomeList),
    tgenomes: genomeList.length,
    ver_info: JSON.stringify(C.version_information),
    
  })
})
//
router.post('/jbrowse_ajax', function jbrowseAjaxPost (req, res) {
  console.log('AJAX JBrowse')
  
  // for logging
  //console.log('req.ip',req.ip)
  helpers.accesslog(req, res)
  //open(jburl)
  
  res.send('Okay')
})
//
router.get('/genome_description', async function Description (req, res) {
    //console.log('in genomedescription -get')
  
    //let myurl = url.parse(req.url, true);
    if(req.query.gid && req.session.gtable_filter){
      req.session.gtable_filter.gid = req.query.gid
    }
    const gid = req.query.gid
    let data,conn

    //console.log('data',data)
    const q_genome = queries.get_genome(gid)
    const q_contig = queries.get_contigs(gid)
    helpers.print('In Genome_Descriptin1: '+q_genome)
    
    try {
        conn = await global.TDBConn();
        const [rows1] = await conn.execute(q_genome);
        if(rows1.length ==0){
             return
        }
        //kludge for pangenomes
        let pangenomes = []
        if(rows1.length >1){  // means there are more than one pangenome
         for(let n in rows1){
            pangenomes.push(rows1[n].pangenome) 
         }
        }else{
         pangenomes.push(rows1[0].pangenome)
        }
        data = rows1[0]
        delete data.pangenome
        data.pangenomes = pangenomes
        helpers.print(data)
        data.gid = gid
        data.otid = C.genome_lookup[gid].otid
        
        data.genus =C.taxon_lookup[data.otid].genus
        data.species =C.taxon_lookup[data.otid].species
        data.combined_size = helpers.format_long_numbers(data.combined_size)
        let contigs = []
        // try get contigs from file:
        // ncbi only
        //console.log('q_contig',q_contig)
        helpers.print('In Genome_Descriptin2: '+q_contig)
        const [rows2] = await conn.execute(q_contig);
        for(let r in rows2){
            contigs.push({contig: rows2[r].accession, gc: rows2[r].GC})
        }
        let fpath = path.join(ENV.PATH_TO_DATA,'homdData-Crispr.json')
        //console.log(fpath)
        let crispr = 0
        let crispr_data = JSON.parse(fs.readFileSync(fpath))
        if(gid in crispr_data){
             crispr = crispr_data[gid]
        }
        let n = data.GTDB_taxonomy.lastIndexOf(';')
        data.GTDB_taxonomy = data.GTDB_taxonomy.substring(0, n+1) + "<br>" + data.GTDB_taxonomy.substring(n+1) 
        //console.log('GTDB_taxonomy',data.GTDB_taxonomy)
        let checkm_status_obj = helpers_genomes.get_checkm_status(data)
        
        //console.log('checkM status',checkm_status_obj)
        res.render('pages/genome/genomedesc', {
           title: 'HOMD :: Genome',
           pgname: 'genome/description', // for AboutThisPage 
           config: JSON.stringify(ENV),
           // taxonid: otid,
           data1: JSON.stringify(data),
           checkm: JSON.stringify(checkm_status_obj),
           gid: gid,
           contigs: JSON.stringify(contigs.sort()),
           crispr: crispr,
           // data2: JSON.stringify(data2),
           // data3: JSON.stringify(data3),
           // data4: JSON.stringify(data4),
           ver_info: JSON.stringify(C.version_information),
        })
        //res.send('okay')
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching data');
    } finally {
        if (conn) conn.release(); // Release the connection back to the pool
    }
    return

})
router.post('/get_contig_seq', async function get_contig_seq (req, res) {
    helpers.print(req.body)
    const gid = req.body.gid.trim()
    const mid = req.body.mid.trim()
    const contig = req.body.contig.trim()
    let q = queries.get_contig(gid,contig)
    // test genome:one contig only::GCA_000019425.1 
    console.log('CONTIG query',q)
    let html='',length = 0,conn
    try {
        conn = await global.TDBConn();
        const [rows] = await conn.execute(q);
        if(rows.length === 0){
           html += "No sequence found in database"
        }else{
           length = rows[0].seq.toString().length
           const seqstr = (rows[0].seq).toString()
           //console.log('seqstr',seqstr)
           //console.log(seqstr.length)
           const arr = helpers.chunkSubstr(seqstr, 100)
           //console.log('arr[0]',arr[0])
           html += arr.join('<br>')
           //html = seqstr
        }
        //console.log('html:',html.substring(0,8))
        res.send(JSON.stringify({html:html,length:length}))
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching data');
    } finally {
        if (conn) conn.release(); // Release the connection back to the pool
    }
    return
})


router.post('/get_AA_NA_seq', async function get_AA_NA_SeqPost (req, res) {
    console.log('in get_AA_NA_seq -post')
    //console.log(req.body)
    //const fieldName = 'seq_' + req.body.type  // na or aa => seq_na or seq_aa
    const pid = req.body.pid
    //const db = req.body.db.toUpperCase()
    const db_pts = req.body.db.split('_')
    
    let db,q,conn
    let gid = req.body.gid
    
    if(req.body.type === 'aa'){   // NCBI
      if(db_pts[0] === 'NCBI' || db_pts[0] === 'ncbi'){
          db = "`NCBI`.`faa`"
          q = queries.get_AA_NA(db, gid, pid)
       }else if(db_pts[0] === 'bakta'){
          db = "`BAKTA_faa`.`protein_seq`"
          q = queries.get_bakta_AA(db, gid, pid)
       }else{
          db = "`PROKKA`.`faa`"
          q = queries.get_AA_NA(db, gid, pid)
       }
     
    }else{   //req.body.type === 'na':   // NCBI  na
      if(db_pts[0] === 'NCBI' || db_pts[0] === 'ncbi'){
          db = "`NCBI`.`ffn`"
          q = queries.get_AA_NA(db, gid, pid)
       }else{
          db = "`PROKKA`.`ffn`"
          q = queries.get_AA_NA(db, gid, pid)
       }
    }
    try {
        conn = await global.TDBConn();
        const [rows] = await conn.execute(q);
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


    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching data');
    } finally {
        if (conn) conn.release(); // Release the connection back to the pool
    }
    return
  
})
function render_explorer(req, res, args){
    res.render('pages/genome/explorer', {
        
        title: 'HOMD :: Genome Explorer',
        pgname: 'genome/explorer', // for AboutThisPage 
        config: JSON.stringify(ENV),
        ver_info: JSON.stringify(C.version_information),
        
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
        filter_on: args.filter_on,
        no_ncbi_annot: JSON.stringify(C.no_ncbi_genomes)
     })

}
//
router.post('/make_anno_search_table', function make_anno_search_table (req, res) {
    console.log('in POST:make_anno_search_table')
    //console.log(req.body)
    let anno_path = path.join(ENV.PATH_TO_TMP,req.body.dirname)
    
    let anno = req.body.anno
    let search_text = req.body.search_text.toLowerCase()
    let selected_gid = req.body.gid
    let rowobj,start,stop,locstart,locstop,seqacc,tmp,ssp = '',organism=''
    let re = new RegExp(search_text,"gi");
    if(C.genome_lookup[selected_gid] && C.genome_lookup[selected_gid].subspecies){
       ssp = C.genome_lookup[selected_gid].subspecies+' '
    }
    if(C.genome_lookup[selected_gid]){
        organism = C.genome_lookup[selected_gid].genus +' '+C.genome_lookup[selected_gid].species+' '+ssp+C.genome_lookup[selected_gid].strain
    }
    let html = "<table id='annotation-table' class='table sortable'>"
    html += '<tr>'
    html += '<th>Molecule</th>'
    html += '<th>Protein-ID</th>'
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
         let filepath = path.join(anno_path,anno+'_data')
         
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
              if(!row || row.length === 0 || row[0]==''){
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
                acc:row[2],
                gene:row[3],
                pid:row[4],
                product:row[5],
                length_aa:row[6],
                length_na:row[7],
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
            
            
            seqacc = rowobj.acc
            
            
            let loc = seqacc+":"+locstart.toString()+".."+locstop.toString()
            let highlight = seqacc+":"+start.toString()+".."+stop.toString()
            //console.log('XXX',rowobj.pid+"','"+db+"','"+rowobj.acc+"','"+organism+"','"+rowobj.product+"','"+selected_gid)
            //html += " <a title='JBrowse/Genome Viewer' href='"+ENV.JBROWSE_URL+"/"+selected_gid+"&loc="+loc+"&highlight="+highlight+"&tracks="+jbtracks+"' target='_blank' rel='noopener noreferrer'>JB</a>"
            //html += " <a title='JBrowse/Genome Viewer' href='#' onclick=\"open_jbrowse('"+selected_gid+"','anno_table','','','"+anno+"','"+loc+"','"+highlight+"')\" >JB</a>"
            //console.log('JB',rowobj.line_gid,'loc',loc,'hl',highlight)
            html += "</td>"   // pid
            
            html += "<td class='center'>" 
            html += " <a title='JBrowse/Genome Viewer' href='#' onclick=\"open_jbrowse('"+rowobj.line_gid+"','anno_table','','','"+anno+"','"+loc+"','"+highlight+"')\" >open</a>"
            html += "</td>" //  JB)
            
            
            html += "<td class='center' nowrap>"+rowobj.length_na
            html += " [<a title='Nucleic Acid' href='#' onclick=\"get_AA_NA_seq('na','"+rowobj.pid+"','"+db+"','"+rowobj.acc+"','"+organism+"','"+rowobj.product+"','"+selected_gid+"')\"><b>NA</b></a>]"
            html += "</td>"   // NA length
            html += "<td class='center' nowrap>"+rowobj.length_aa
            html += " [<a title='Nucleic Acid' href='#' onclick=\"get_AA_NA_seq('aa','"+rowobj.pid+"','"+db+"','"+rowobj.acc+"','"+organism+"','"+rowobj.product+"','"+selected_gid+"')\"><b>AA</b></a>]"
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
router.post('/orf_search_sql', function orf_search_full (req, res) {
    console.log('in POST:orf_search_sql')
    //console.log(req.body)
    let site_search_result={},tmpgid,ssp,data_keys,obj
    let anno = req.body.anno
    let search_text = req.body.search_text
    let dirname = req.body.dirname
    let anno_path = path.join(ENV.PATH_TO_TMP,dirname)
    
    
    let org_list = {}
    let gid='',otid = '',organism=''
    //let bigdata = req.session.anno_search_full //JSON.parse(decodeURI(req.body.dataobj))
    //console.log('req.session',req.session)
    //console.log('Parsed Data1',bigdata)
    fs.access(anno_path, function(error) {
       if (error) {
         console.log("Directory does not exist.")
         res.send('Session Expired')
         return
       } else {
         console.log("Directory exists.")
         let filepath = path.join(anno_path,anno+'_data')
         fs.readFile(filepath, 'utf8', function readSQLOrfSearch (err, data) {
            if (err) {
               console.log(err)
               res.send('Session Expired')
               return
             }
             
            let data_rows = data.split('\n')
            //console.log('data_rows[10]',data_rows[10])
            for(let i in data_rows){
                if(!data_rows[i]){
                  continue
                }
                //console.log('data_rows[i]',data_rows[i])
                
                let pts = data_rows[i].split('|')
                //console.log('pts',pts)
                //ncbi|GCA_030450175.1|CP073095.1|J8246_11660|WKE52990.1|hypothetical protein|286|861|2438500|2439360
                //ncbi|genome_id|accession|gene|protein_id|product|length_aa|length_na|start|stop
                gid = pts[1]
                
                //console.log('gid',gid)
                obj = {accession:pts[2],gene:pts[3],protein_id:pts[4],product:pts[5],length_aa:pts[6],length_na:pts[7],start:pts[8],stop:pts[9]}
                if(gid && gid in site_search_result){
                    site_search_result[gid].push(obj)
                }else{
                    site_search_result[gid]= [obj]
                }
            }
            let tmp_data_keys = Object.keys(site_search_result)
            //console.log('tmp_data_keys',tmp_data_keys)
            for(let k in tmp_data_keys){
                    tmpgid = tmp_data_keys[k]
                    org_list[tmpgid] = ''
                    if(C.genome_lookup.hasOwnProperty(tmpgid)){
                       let organism = C.genome_lookup[tmpgid].organism+' '+C.genome_lookup[tmpgid].strain
                       org_list[tmpgid] = organism
                    }
            }
            
            let data_keys = Object.keys(org_list).sort((a, b) =>{
                return helpers.compareStrings_alpha(org_list[a], org_list[b]);
            })
            
            //console.log('data_keys[0]',data_keys[0])
            //console.log('site_search_result[data_keys[0]]',site_search_result[data_keys[0]])
            res.render('pages/genome/annotation_keyword', {

                title: 'HOMD :: Search',
                pgname: 'genome/explorer', // for AboutThisPage 
                config: JSON.stringify(ENV),
                ver_info: JSON.stringify(C.version_information),
                dirname: dirname,
                anno: anno,
                search_text: search_text,
                data: JSON.stringify(site_search_result),
                sorted_gids: JSON.stringify(data_keys),
                org_obj: JSON.stringify(org_list),
                show_table:false
            })
        })  //end fs.readfile
        
        }  //end else
        })  //end fs.access
    


})
router.post('/orf_search', function orf_search (req, res) {
    // From GREP Search
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
    let anno_path = path.join(ENV.PATH_TO_TMP,req.session.anno_search_dirname)
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
              //ncbi|GCA_900105505.1|FNRU01000001.1|SAMN04488531_0007|SEB28551.1|hypothetical protein
              //ncbi|genome_id|accession|gene|protein_id|product
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
            let data_keys = Object.keys(org_list).sort((a, b) =>{
                return helpers.compareStrings_alpha(org_list[a], org_list[b]);
             })
            
            //console.log('data',site_search_result)
            res.render('pages/genome/annotation_keyword', {

                title: 'HOMD :: Search',
                pgname: 'genome/explorer', // for AboutThisPage 
                config: JSON.stringify(ENV),
                ver_info: JSON.stringify(C.version_information),

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
    if (body.sort_rev && body.sort_rev === 'on'){
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
              new_rows.sort((b, a) =>{
                return helpers.compareStrings_alpha(a.protein_id, b.protein_id);
              })
        }else if(filter.sort_col === 'molecule'){
              new_rows.sort((b, a) => {
                return helpers.compareStrings_alpha(a.accession, b.accession);
              })
        }else if(filter.sort_col === 'gene'){
              new_rows.sort((b, a) => {
                return helpers.compareStrings_alpha(a.gene, b.gene);
              })
        }else if(filter.sort_col === 'product'){
              new_rows.sort((b, a) =>  {
                return helpers.compareStrings_alpha(a.product, b.product);
              })
        }else if(filter.sort_col === 'na'){
              new_rows.sort((b, a) => {
                return helpers.compareStrings_int(a.length_na, b.length_na);
              })
        }else if(filter.sort_col === 'aa'){
              new_rows.sort((b, a) => {
                return helpers.compareStrings_int(a.length_aa, b.length_aa);
              })
        }
    }else{
        if(filter.sort_col === 'pid'){
              new_rows.sort((a, b) => {
                return helpers.compareStrings_alpha(a.protein_id, b.protein_id);
              })
        }else if(filter.sort_col === 'molecule'){
              new_rows.sort((a, b) => {
                return helpers.compareStrings_alpha(a.accession, b.accession);
              })
        }else if(filter.sort_col === 'gene'){
              new_rows.sort((a, b) => {
                return helpers.compareStrings_alpha(a.gene, b.gene);
              })
        }else if(filter.sort_col === 'product'){
              new_rows.sort((a, b) => {
                return helpers.compareStrings_alpha(a.product, b.product);
              })
        }else if(filter.sort_col === 'na'){
              new_rows.sort((a, b) => {
                return helpers.compareStrings_int(a.length_na, b.length_na);
              })
        }else if(filter.sort_col === 'aa'){
              new_rows.sort((a, b) => {
                return helpers.compareStrings_int(a.length_aa, b.length_aa);
              })
        }
    }
    
    return new_rows
    
}
function get_text_filtered_annot(annot_list, search_txt, search_field){

  let send_list = []
  if(search_field === 'pid'){
      send_list = annot_list.filter(item => item.protein_id.toLowerCase().includes(search_txt))
  }else if(search_field === 'product'){
      send_list = annot_list.filter(item => item.product.toLowerCase().includes(search_txt))
  }else if(search_field === 'gene'){
      send_list = annot_list.filter(item => item.gene.toLowerCase().includes(search_txt))
  }else if(search_field === 'molecule'){
      send_list = annot_list.filter(item => item.accession.toLowerCase().includes(search_txt))
  }else {
      // search all
      //send_list = send_tax_obj
      let temp_obj = {}
      let tmp_send_list = annot_list.filter(item => item.protein_id.toLowerCase().includes(search_txt))
      // for uniqueness convert to object
      for(let n in tmp_send_list){
         temp_obj[tmp_send_list[n].protein_id] = tmp_send_list[n]
      }
      
      tmp_send_list = annot_list.filter(item => item.product.toLowerCase().includes(search_txt))
      for(let n in tmp_send_list){
         temp_obj[tmp_send_list[n].protein_id] = tmp_send_list[n]
      }
      
      tmp_send_list = annot_list.filter(item => item.gene.toLowerCase().includes(search_txt))
      for(let n in tmp_send_list){
         temp_obj[tmp_send_list[n].protein_id] = tmp_send_list[n]
      }
      
      tmp_send_list = annot_list.filter(item => item.accession.toLowerCase().includes(search_txt))
      for(let n in tmp_send_list){
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
   req.session.atable_filter = helpers_genomes.get_default_annot_filter()
   res.redirect('explorer?gid='+req.query.gid+'&anno='+req.query.anno);
});

router.post('/explorer', async function explorer_post (req, res) {
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
    annoInfoObj.contigs = C.genome_lookup[gid].contigs
    const glist = Object.values(C.genome_lookup)
    //console.log(glist)
    glist.sort((a, b) =>{
      return helpers.compareStrings_alpha(a.organism, b.organism)
    })
    // filter out empties then map to create list of sorted strings
    const allAnnosObj = glist.filter(item => item.organism !== '')
      .map((el) => {
      return { gid: el.gid, org: el.organism+' '+el.strain }
    })
    
    let conn,pageData = {}
    pageData.page = req.query.page
    if (!req.query.page) {
      pageData.page = 1
    }
    let atable_filter = get_annot_table_filter(req.body)
    req.session.atable_filter = atable_filter
    const q = queries.get_annotation_query(gid, req.body.anno)
    console.log('get_annotation_query-post',q)
    try {
        conn = await global.TDBConn();
        const [rows] = await conn.execute(q);

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
    
    } catch (error) {
        console.error(error);
        args = {fltr:{},filter_on: 'off',gid:gid,gc:gc,otid:otid,organism:organism,allAnnosObj:allAnnosObj,annoType:anno,pageData:{},annoInfoObj:annoInfoObj,pidList:[]}
        render_explorer(req, res, args)
    } finally {
        if (conn) conn.release(); // Release the connection back to the pool
    }
    
})
router.get('/explorer', async function explorer_get (req, res) {
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
  
    // anno === 
    let atable_filter
    let annoInfoObj = {}
    let pageData = {}
    pageData.page = req.query.page
    if (!req.query.page) {
    pageData.page = 1
    }
    let organism = 'Unknown', pidList
    //let dbChoices = []
    
    
    let conn,args = {}
    
    const glist = Object.values(C.genome_lookup)
    
    glist.sort((a, b) =>{
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
    annoInfoObj.contigs = C.genome_lookup[gid].contigs
    } else {
    
    
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
        atable_filter = helpers_genomes.get_default_annot_filter()
        req.session.atable_filter = atable_filter
    }
    helpers.print('explorer::anno query: '+q)
    // local host:  explorer?gid=SEQF4098.1&anno=ncbi
    try {
        conn = await global.TDBConn();
        const [rows] = await conn.execute(q);
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
        atable_filter = helpers_genomes.get_default_annot_filter()
        req.session.atable_filter = atable_filter
        }
        //console.log('atable_filter',atable_filter)
        //console.log('default',helpers_genomes.get_default_annot_filter())
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

    } catch (error) {
        console.error(error);
        args = {fltr:{},filter_on:'off',gid:gid,gc:gc,otid:otid,organism:organism,allAnnosObj:allAnnosObj,annoType:anno,pageData:{},annoInfoObj:annoInfoObj,pidList:[]}
        render_explorer(req, res, args)
    } finally {
        if (conn) conn.release(); // Release the connection back to the pool
    }
    return
})

//
//
// router.get('/blast_server', function genome_blast_server(req, res) {
//     res.render('pages/blast/blast_server', {
//         title: 'HOMD :: Blast Server',
//         pgname: '', // for AboutThisPage
//         config: JSON.stringify(ENV),
//         ver_info: JSON.stringify(C.version_information),
//         
//         blast_type: 'genome'
//       })
// })
router.get('/blast_select_genome', function blast_select_genome(req, res) {
   //router.get('/taxTable', helpers.isLoggedIn, (req, res) => {
  //helpers.accesslog(req, res)
  //console.log('blast_select_genome')
  //let myurl = url.parse(req.url, true);
    
  const gid = req.query.gid
  let gc = 0
  if(gid){
      gc = helpers.get_gc_for_gccontent(C.genome_lookup[gid].gc)
  }
  const glist = Object.values(C.genome_lookup)
  
  glist.sort((a, b) =>{
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
    config: JSON.stringify(ENV),
    gid: gid,  // default
    gc: gc,
    page_type: 'BLAST',
    genomes: JSON.stringify(genomeList),
    tgenomes: genomeList.length,
    ver_info: JSON.stringify(C.version_information),
    
  })
})

// router.get('/blast_sserver', function blast_sserver(req, res){
//    //console.log(req.query)
//    //helpers.accesslog(req, res)
//    let db_type = req.query.type
//    let page_title = ''
//    if(db_type === 'refseq'){
//      page_title = 'BLAST: RefSeq Databases'
//    }else{
//      page_title = 'Genomic BLAST: All-Genomes Databases'
//    }
//    console.log('BLAST SequenceServer','Type:',db_type,'IP:',req.ip)
//    // res.render('pages/genome/blast_server_no_iframe', {
// //     title: 'HOMD :: BLAST', 
// //     pgname: 'blast/pagehelp', // for AboutThisPage
// //     config: JSON.stringify(ENV),
// //     ver_info: JSON.stringify(C.version_information),
// //     
// //     gid: '',
// //     annotation: '',
// //     organism: '',
// //     db_type: db_type,
// //     ptitle: page_title,
// //   })
//   
//    res.render('pages/genome/blast_server_iframe', {
//     title: 'HOMD :: BLAST', 
//     pgname: 'blast/pagehelp', // for AboutThisPage
//     config: JSON.stringify(ENV),
//     ver_info: JSON.stringify(C.version_information),
//     
//     gid: '',
//     annotation: '',
//     organism: '',
//     db_type: db_type,
//     ptitle: page_title,
//     no_ncbi_blast: JSON.stringify([])
//   })
// })

router.post('/blast_ss_single', function blast_ss_single(req, res){
  console.log('IN POST blast_ss_single')
  //console.log(req.body)
  let gid = req.body.gid
  //console.log(ENV.BLAST_URL_BASE)
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
  //console.log('SingleBLASTURL: '+ENV.BLAST_URL_BASE+'/genome_blast_single_'+req.body.annotation+'/?gid='+gid)
 //  res.render('pages/genome/blast_server_iframe', {
//     title: 'HOMD :: BLAST', 
//     pgname: 'blast/pagehelp', // for AboutThisPage
//     config: JSON.stringify(ENV),
//     ver_info: JSON.stringify(C.version_information),
//     
//     gid: req.body.gid,
//     annotation: req.body.annotation,
//     organism: organism,
//     ptitle: page_title,
//     db_type: '',
//     no_ncbi_blast: JSON.stringify(C.no_ncbi_blast_dbs)
//   })
  
  let url = ''
  if(req.body.annotation === 'ncbi'){
      url = ENV.BLAST_URL_BASE+'/genome_blast_single_ncbi/?gid='+req.body.gid
  }else{
      url = ENV.BLAST_URL_BASE+'/genome_blast_single_prokka/?gid='+req.body.gid
  }
  res.redirect(url)

  
   
})



// router.post('/blast_single', function blast_single(req, res) {
//     //console.log(req.body)
//     // 'prokka|fna|SEQF1595.2|/Users/avoorhis/programming/blast-db-alt/fna/SEQF1595.2.fna'
//     let blast_db_parts = req.body.blastdb.split('|')
//     let anno    = blast_db_parts[0]
//     let ext     = blast_db_parts[1]
//     let gid     = blast_db_parts[2]
//     let db_path = blast_db_parts[3]
//     
//     // localhost:4567  or 0.0.0.
//     // production:  192.168.1.60:4569  for the SS-single
//     // How to fire submit on form from another host.server
//     let connect = require('connect');
//     //let http = require('http');
// 
//     let app2 = connect();
//     app2.listen(4567, '0.0.0.0', function() {
//        console.log('Listening to port:  ' + 4567);
//     });
// 
// 
// })
// router.get('/blast_server_one', function blast_test(req, res) {
//   console.log('blast_test')
//   let gid = req.query.gid
//   const { spawn } = require("child_process");
//   let info = {}, filepath
//   info[gid] = []
//     let dataPromises = []
//     let exts = ['faa', 'ffn', 'fna']
//     let paths = [ENV.BLAST_DB_PATH_GENOME_NCBI, ENV.BLAST_DB_PATH_GENOME_PROKKA,'/Users/avoorhis/programming/blast-db-alt']
//     for(let p in paths){
//        for(let e in exts){
//            filepath = path.join(paths[p], exts[e], gid+'.'+exts[e]) 
//            console.log(filepath)
//            
//            dataPromises.push(helpers.readFromblastDb(filepath, gid, exts[e]))
//       }
//   }
//   Promise.all(dataPromises).then(result => {
//     //this code will be called in future after all readCSV Promises call resolve(..)
//     //console.log('info-results',result)
//     let data = []
//     for(let n in result){
//        if(typeof result[n] !== 'string'){
//           if(result[n].path.includes('ncbi')){
//              result[n].anno = 'ncbi'
//           }else{
//              result[n].anno = 'prokka'
//           }
//           data.push(result[n])
//        }
//     }
//     //console.log('data-results',data)
//     res.render('pages/genome/blast_one_genome', {
//     title: 'HOMD :: BLAST', 
//     pgname: '', // for AboutThisPage
//     config: JSON.stringify(ENV),
//     gid: gid,  // default
//     org: C.genome_lookup[gid].organism,
//     ver_info: JSON.stringify(C.version_information),
//     
//     data: JSON.stringify(data)
//     }) 
//   
//   })
//   
//   
  
//})
// router.get('/genome_blast_no_iframe', function genome_blast_no_iframe(req, res) {
//   console.log('in genome_blast_no_iframe')
//   console.log(req.query)
//      //console.log(req.query)
//    //helpers.accesslog(req, res)
//    let url = ENV.BLAST_URL_BASE+'/genome_blast/'
//    let db_type = req.query.type
//    let page_title = ''
//    if(db_type === 'refseq'){
//      page_title = 'BLAST: RefSeq Databases'
//    }else{
//      page_title = 'Genomic BLAST: All-Genomes Databases'
//    }
//    console.log('BLAST SequenceServer','Type:',db_type,'IP:',req.ip)
//    
//    res.render('pages/genome/blast_server_no_iframe', {
//     title: 'HOMD :: BLAST', 
//     pgname: 'blast/pagehelp', // for AboutThisPage
//     config: JSON.stringify(ENV),
//     ver_info: JSON.stringify(C.version_information),
//     
//     gid: '',
//     annotation: '',
//     url:url,
//     organism: '',
//     db_type: db_type,
//     ptitle: page_title,
//   })
// })
// router.get('/blast', function blast_get(req, res) {
//    //console.log('in genome blast-GET')
//    let chosen_gid = req.query.gid
//    if(!chosen_gid){chosen_gid='all'}
//    //console.log('chosen gid=',chosen_gid)
//    let sg = helpers.makeid(3).toUpperCase()
//    let organism,dbChoices
//    const allAnnosObj = Object.keys(C.annotation_lookup).map((gid) => {
//     return {gid: gid, org: C.annotation_lookup[gid].prokka.organism}
//    })
//    
//    allAnnosObj.sort((a, b) =>{
//       return helpers.compareStrings_alpha(a.org, b.org)
//    })
//    //let dbChoices = C.all_genome_blastn_db_choices.nucleotide   //.nucleotide.map((x) => x); // copy array
//     if(! chosen_gid || chosen_gid === 0|| chosen_gid ==='all' || !C.annotation_lookup.hasOwnProperty(chosen_gid)){
//       
//       organism   = allAnnosObj[0].org
//       chosen_gid = allAnnosObj[0].gid
//           dbChoices = [
//           {name: "This Organism's ("+organism + ") Genomic DNA", value:'org_genomes1', programs:['blastn','tblastn','tblastx'],
//                    filename:'fna/'+chosen_gid+'.fna'},
//           {name: "This Organism's ("+organism + ") DNA of Annotated Proteins", value:'org_genomes2', programs:['blastn','tblastn','tblastx'],
//                    filename:'ffn/'+chosen_gid+'.ffn'}
//           ]
//     }else{
//       
//         organism = C.annotation_lookup[chosen_gid].prokka.organism
//         dbChoices = [
//           {name: "This Organism's ("+organism + ") Genomic DNA", value:'org_genomes1', programs:['blastn','tblastn','tblastx'],
//                    filename:'fna/'+chosen_gid+'.fna'},
//           {name: "This Organism's ("+organism + ") DNA of Annotated Proteins", value:'org_genomes2', programs:['blastn','tblastn','tblastx'],
//                    filename:'ffn/'+chosen_gid+'.ffn'}
//           ]
//         
//     }
//     
//     res.render('pages/genome/blast', {
//         title: 'HOMD :: BLAST',
//         pgname: 'blast/blast', // for AboutThisPage
//         config: JSON.stringify(ENV),
//         ver_info: JSON.stringify(C.version_information),
//         
//         blastFxn: 'genome',
//         organism: organism,
//         gid: chosen_gid,
//         spamguard: sg,
//         all_annos: JSON.stringify(allAnnosObj),
//         blast_prg: JSON.stringify(C.blastPrograms),
//         db_choices: JSON.stringify(dbChoices),
//         returnTo: '/genome/blast',
//         blastmax: JSON.stringify(C.blast_max_file),
//         blast_version: ENV.BLAST_VERSION,
//       })
//    
// })

// 2021-06-15  opening trees in new tab because thet take too long to open in an iframe
// which makes the main menu non functional
// These functions are used to open trees with a search for odid or genomeID
// The main menu goues through routes_homd::open_tree
router.get('/conserved_protein_tree', function conservedProteinTree (req, res) {
  console.log('in conserved_protein_tree (Genomic Tree)')
  // let myurl = url.URL(req.url, true);
  //const http = require('http'); 
  let otid,findme = 'DEFAULTxxxxFINDMExxxxxxxxxx'  // will be either gid OR otid (other is 'undefined')
  if(req.query.otid){
    otid = req.query.otid
    findme = helpers.make_otid_display_name(otid)
  }else if(req.query.gid){
    findme = req.query.gid
  }
  
  //const fullname = helpers.make_otid_display_name(otid)
  
  // Actual: https://www.homd.org/ftp/phylogenetic_trees/genome/current/eHOMD_Genomic_PhyloPhlAn_Tree.svg
  //https://homd.org/ftp/phylogenetic_trees/genome/V11.02/HOMD_Genomic_PhyloPhlAn_Tree_V11.02.svg
  // Copied to puplic/trees/eHOMD_Genomic_PhyloPhlAn_Tree.svg
  
  //let url = 'https://homd.org'+ENV.CP_TREE_PATH//'/ftp/phylogenetic_trees/genome/V11.0/HOMD_Genomic_PhyloPhlAn_Tree_V11.0.svg'
  let filepath
  if(ENV.ENV ==="localhost"){
      filepath = '/Users/avoorhis/programming/homd-node.js/public/trees/eHOMD_Genomic_PhyloPhlAn_Tree.svg'
  }else{
      filepath = ENV.FILEPATH_TO_FTP + ENV.CP_TREE_PATH
  }
  console.log(filepath,findme)
  
  fs.readFile(filepath, 'utf8', (err, data) => {
          if (err) {
            console.error('Error reading file:', err);
            return;
          }
          //console.log('File content:', data);
          if(ENV.ENV === "localhost"){
             data = "<center><H1 style='color:red;'>LOCALHOST</H1></center>"+data
          }
          //console.log('data',data); 
         res.render('pages/genome/conserved_protein_tree', {
           title: 'HOMD :: Conserved Protein Tree',
           pgname: 'genome/tree', // for AboutThisPage
           config: JSON.stringify(ENV),
           ver_info: JSON.stringify(C.version_information),
           svg_data: JSON.stringify(data),
           target: findme
         }); 
  });
  
  // https.get(url, (response) => { 
//      let data = ''; 
//  
//      response.on('data', (chunk) => { 
//         console.log('chunk',chunk.toString())
//         data += chunk; 
//      }); 
//      //console.log(data)
//      response.on('end', () => { 
//         
//         //console.log('data',data); 
//          res.render('pages/genome/conserved_protein_tree', {
//            title: 'HOMD :: Conserved Protein Tree',
//            pgname: 'genome/tree', // for AboutThisPage
//            config: JSON.stringify(ENV),
//            ver_info: JSON.stringify(C.version_information),
//            
//            svg_data: JSON.stringify(data),
//            target: findme
//          }); 
//      });
//   }).on('error', (error) => { 
//     console.error(`Error fetching data: ${error.message}`); 
//   }); 
  
  

})
router.get('/ribosomal_protein_tree', function ribosomalProteinTree (req, res) {
  
  //console.log('in ribosomal_protein_tree')

  let otid,findme = 'DEFAULTxxxxFINDMExxxxxxxxxx'  // will be either gid OR otid (other is 'undefined')
  if(req.query.otid){
    otid = req.query.otid
    findme = helpers.make_otid_display_name(otid)
  }else if(req.query.gid){
    findme = req.query.gid
  }
  // Actual:: https://www.homd.org/ftp/phylogenetic_trees/genome/current/eHOMD_Ribosomal_Protein_Tree.svg
  // Copied to public/trees/eHOMD_Ribosomal_Protein_Tree.svg
  //let filepath = ENV.FTP_TREE_URL_LOCAL +'/'+'eHOMD_Ribosomal_Protein_Tree.svg'
  //let filepath = ENV.FTP_TREE_URL +'/genome/current/'+'eHOMD_Ribosomal_Protein_Tree.svg'
  //let filepath = ENV.FTP_TREE_URL +'/ribosomal_protein_tree/HOMD_Ribosomal_Protein_Tree_V11.0.svg'
  //let filepath = ENV.HOMD_URL_BASE+ENV.RP_TREE_PATH  //'/ftp/phylogenetic_trees/ribosomal_protein_tree/HOMD_Ribosomal_Protein_Tree_V11.0.svg'
  let filepath
  if(ENV.ENV ==="localhost"){
      filepath = '/Users/avoorhis/programming/homd-node.js/public/trees/eHOMD_Ribosomal_Protein_Tree.svg'
  }else{
      filepath = ENV.FILEPATH_TO_FTP + ENV.RP_TREE_PATH
  }
  fs.readFile(filepath, 'utf8', (err, data) => {
          if (err) {
            console.error('Error reading file:', err);
            return;
          }
          //console.log('File content:', data);
          if(ENV.ENV === "localhost"){
             data = "<center><H1 style='color:red;'>LOCALHOST</H1></center>"+data
          }
          res.render('pages/genome/ribosomal_protein_tree', {
           title: 'HOMD :: Ribosomal Protein Tree',
           pgname: 'genome/tree', // for AboutThisPage
           config: JSON.stringify(ENV),
           ver_info: JSON.stringify(C.version_information),
           
           svg_data: JSON.stringify(data),
           target: findme
         }); 
         
    });
  // https.get(filepath, (response) => { 
//      let data = ''; 
//  
//      response.on('data', (chunk) => { 
//         data += chunk; 
//      }); 
//  
//      response.on('end', () => { 
//         
//         //console.log('data',data); 
//          res.render('pages/genome/ribosomal_protein_tree', {
//            title: 'HOMD :: Ribosomal Protein Tree',
//            pgname: 'genome/tree', // for AboutThisPage
//            config: JSON.stringify(ENV),
//            ver_info: JSON.stringify(C.version_information),
//            
//            svg_data: JSON.stringify(data),
//            target: findme
//          }); 
//      });
//   }).on('error', (error) => { 
//     console.error(`Error fetching data: ${error.message}`); 
//   }); 
  
  
})
router.get('/rRNA_gene_tree', function rRNAGeneTree (req, res) {
  
  //console.log('in rRNA_gene_tree')
  // const myurl = url.URL(req.url, true)
  // const myurl = new url.URL(req.url)
  let otid,findme = 'DEFAULTxxxxFINDMExxxxxxxxxx'  // will be either gid OR otid (other is 'undefined')
  if(req.query.otid){
    otid = req.query.otid
    findme = helpers.make_otid_display_name(otid)
  }else if(req.query.gid){
    findme = req.query.gid
  }
  let filepath
  //let filepath = ENV.HOMD_URL_BASE+ENV.GENE_TREE_PATH   //"/ftp/phylogenetic_trees/refseq/V16.0/HOMD_16S_rRNA_RefSeq_Tree_V16.0.svg"
  if(ENV.ENV ==="localhost"){
      filepath = '/Users/avoorhis/programming/homd-node.js/public/trees/eHOMD_16S_rRNA_Tree.svg'
  }else{
      filepath = ENV.FILEPATH_TO_FTP + ENV.GENE_TREE_PATH
  }
  
  fs.readFile(filepath, 'utf8', (err, data) => {
          if (err) {
            console.error('Error reading file:', err);
            return;
          }
          //console.log('File content:', data);
          if(ENV.ENV === "localhost"){
             data = "<center><H1 style='color:red;'>LOCALHOST</H1></center>"+data
          }
        res.render('pages/genome/rRNA_gene_tree', {
           title: 'HOMD :: rRNA Gene Tree',
           pgname: 'genome/tree', // for AboutThisPage
           config: JSON.stringify(ENV),
           ver_info: JSON.stringify(C.version_information),
           
           svg_data: JSON.stringify(data),
           target: findme
         })
    })
  
  
  // https.get(filepath, (response) => { 
//      let data = ''; 
//  
//      response.on('data', (chunk) => { 
//         data += chunk; 
//      }); 
//  
//      response.on('end', () => { 
//         
//         //console.log('data',data); 
//          res.render('pages/genome/rRNA_gene_tree', {
//            title: 'HOMD :: rRNA Gene Tree',
//            pgname: 'genome/tree', // for AboutThisPage
//            config: JSON.stringify(ENV),
//            ver_info: JSON.stringify(C.version_information),
//            
//            svg_data: JSON.stringify(data),
//            target: findme
//          })
//      });
//   }).on('error', (error) => { 
//     console.error(`Error fetching data: ${error.message}`); 
//   }); 
  
  
//   fs.readFile(filepath, 'utf8', function readSVGFile3 (err, data) {
//     if (err) {
//       console.log(err)
//     }
//     res.render('pages/genome/rRNA_gene_tree', {
//       title: 'HOMD :: rRNA Gene Tree',
//       pgname: 'genome/tree', // for AboutThisPage
//       config: JSON.stringify(ENV),
//       ver_info: JSON.stringify(C.version_information),
//       
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
    let paths = [ENV.BLAST_DB_PATH_GENOME_NCBI, ENV.BLAST_DB_PATH_GENOME_PROKKA,'/Users/avoorhis/programming/blast-db-alt']
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
router.get('/anvio_pangenomes', async function anvio_pangenomes(req, res){
    let q = queries.get_all_pangenomes_query()
    
    let conn
    try {
        conn = await global.TDBConn();
        const [rows] = await conn.execute(q);
   
        if(!rows){
          rows = []
        }
        
        res.render('pages/genome/anvio_selection', {
        title: 'HOMD :: Pangenomes', 
        pgname: '', // for AboutThisPage
        config: JSON.stringify(ENV),
        ver_info: JSON.stringify(C.version_information),
        
        //pangenomes: JSON.stringify(C.pangenomes)
        pangenomes: JSON.stringify(rows),
        files:[]
        
        })
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching data');
    } finally {
        if (conn) conn.release(); // Release the connection back to the pool
    }
    return
})
//
router.post('/anvio_pangenomes', async function anvio_pangenomes_POST(req, res){
    console.log('in POST anvio selection')
    let search_term = req.body.val
    let q = queries.get_all_pangenomes_query()
    //let send_rows = []
    let conn,html = ""
    let html_rows = ""
    let html_head = "<table border='1'>"
    let counter = 0
    html_head += "<tr>"
    html_head += "<td nowrap><strong>Pangenome Name</strong><br><small>(Link opens pangenome in Anvi`o)</small></td>"
    html_head += "<td><strong>HOMD Genome Version</strong></td>"
    html_head += "<td><strong>Interactive</strong></td>"
    html_head += "<td><strong>Image</strong></td>"
    html_head += "<td><strong>Description</strong></td>"
    html_head += "</tr>"
    try {
        conn = await global.TDBConn();
        const [rows] = await conn.execute(q);
        for(let i in rows){
            //console.log(rows[i])
            if(rows[i].pangenome_name.includes(search_term)){
                //send_rows.push(rows[i])
                html_rows += "<tr><td nowrap>"+rows[i].pangenome_name+"</td>"
                html_rows += "<td nowrap class='center'>"+rows[i].homd_genome_version+"</td>"
                html_rows += "<td nowrap><small><a href='anvio?pg="+rows[i].pangenome_name+"' target='_blank' class='pg'>Open Anvi'o</a></small></td>"
                html_rows += "<td nowrap><small><a href='pangenome_image?pg="+ rows[i].pangenome_name+"&ext=svg' target='_blank'>Open SVG</a></small></td>"
                html_rows += "<td>"+rows[i].description+"</td>"
                html_rows += "</tr>"
                counter += 1
            }
            
        }
        html += "Pangenome Count: <b>"+counter.toString() +"</b> (filtered)"
        html += html_head
        html += html_rows
        html += "</table>"
        res.send(html)
        //console.log(send_rows,send_rows.length)
        

    
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching data');
    } finally {
        if (conn) conn.release(); // Release the connection back to the pool
    }
    return
})


router.get('/anvio', (req, res) => {
    console.log('In anvio')
    
    //helpers.accesslog(req, res)
    
    let pg = req.query.pg
    
    console.log('Selected Pangenome:',pg)
    //let port = anvio_ports()
    //let default_open_ports = [8080,8081,8082,8083,8084,8085] 
    //let port = default_open_ports[Math.floor(Math.random() * default_open_ports.length)]
    // https://anvio.homd.org/anvio
    //let url = ENV.ANVIO_URL + '?pg=' + pg
    
    // localhost:::   http://localhost:3010
    // Dev      :::   https://anvio.homd.org/anvio
    //let url = "http://localhost:3010/anvio?port="+port.toString()+'&pg='+pg
    // if(ENV.DBHOST === 'localhost'){
//         url = "http://localhost:3010?pg="+pg
//     }else{
//         url = "https://anvio.homd.org/anvio?pg="+pg
//     }
    res.render('pages/genome/anvi_server', {
    //res.render('pages/genome/anvi_server_iframe', {
        title: 'HOMD :: Pangenomes', 
        pgname: '', // for AboutThisPage
        config: JSON.stringify(ENV),
        ver_info: JSON.stringify(C.version_information),
        
        pangenome: pg,
        
        })
});
router.get('/pangenome_image', async function pangenome_image(req, res) {
    console.log(req.query)
    let conn,otid,pg,ext,filepath
    // if otid is present get filename from db
    if(req.query.otid){
        //otid = req.query.otid
        // else pg and extension must be present
        let q = "SELECT filename from pangenome_files WHERE otid='"+req.query.otid+"'"
        console.log(q)
        //console.log(q)
        try {
            conn = await global.TDBConn();
            const [rows] = await conn.execute(q);
       
           
            //console.log(rows)
            if(rows.length === 0){
               res.send('File not found');
            }else{
              filepath = ENV.PATH_TO_STATIC_DOWNLOADS + "/pangenomes/pdf/HMT_"+req.query.otid+"/"+rows[0].filename
              res.sendFile(filepath);
            }
        } catch (error) {
            console.error(error);
            res.status(500).send('Error fetching data');
        } finally {
            if (conn) conn.release(); // Release the connection back to the pool
        }
    return
    }else{
       // get directly from files system using ext and pg name
       ext = req.query.ext
       pg = req.query.pg
       filepath = ENV.PATH_TO_STATIC_DOWNLOADS + "/pangenomes/"+ext+'/'+req.query.pg+'.'+ext
       console.log('fpath',filepath)
       res.sendFile(filepath)
    }
})
//
router.get('/oralgen', function oralgen(req, res) {
  res.render('pages/genome/oralgen', {
    title: 'HOMD :: ORALGEN',
    pgname: '', // for AbountThisPage
    config: JSON.stringify(ENV),
    ver_info: JSON.stringify(C.version_information),

  })
})
//////////////////
router.get('/peptide_table', async function peptide_table_get(req, res) {
    
    const q = queries.get_peptide()
    let conn,pid,gid,prod,genome,temp,pep,otid,org,mol,stop,start,tmp,pepid,size,jb_link,study_id
    try {
        conn = await global.TDBConn();
        const [rows] = await conn.execute(q);
    
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
          config: JSON.stringify(ENV),
          ver_info: JSON.stringify(C.version_information),
          
          data: JSON.stringify(send_list),
          row_count:send_list.length,
          search_text:''
        })
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching data');
    } finally {
        if (conn) conn.release(); // Release the connection back to the pool
    }
    return

})
router.post('/peptide_table', async function peptide_table_post(req, res) {
    console.log('req.body',req.body)
    let search_text = req.body.txt_srch.toLowerCase()
    let big_p_list //= Object.values(C.genome_lookup);
    const q = queries.get_peptide()
    
    let conn,pid,gid,prod,genome,temp,pep,otid,hmt,org,mol,pepid,size,jb_link,study_id
    console.log(q)
    try {
        conn = await global.TDBConn();
        const [rows] = await conn.execute(q);
    
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
            temp = {study_id:study_id,pid:pid,product:prod,gid:gid,mol:mol,organism:org,otid:otid,peptide_id:pepid,peptide:pep,jb_link:jb_link}
             
             full_send_list.push(temp)
           //}
        }
       // will search all === PID,HMT,Organism,Peptide,Product
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
       res.render('pages/genome/protein_peptide', {
          title: 'HOMD :: Human Oral Microbiome Database',
          pgname: '', // for AbountThisPage
          pgtitle: 'Protein Peptide Table',
          config: JSON.stringify(ENV),
          ver_info: JSON.stringify(C.version_information),
          
          data: JSON.stringify(send_list),
          row_count:send_list.length,
          search_text:req.body.txt_srch
       })
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching data');
    } finally {
        if (conn) conn.release(); // Release the connection back to the pool
    }
    
    
})
//
//
router.get('/peptide_table2', async function peptide_table2_get(req, res) {
 
    
    const q = queries.get_peptide2()

    let conn,gid,otid,org,prot_count,pep_count,temp,studies,studies_ary,study_id,study_collector,row,row_collector
    console.log(q)
    try {
        conn = await global.TDBConn();
        const [rows] = await conn.execute(q);

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
           
       }
       let send_list = full_send_list
       
       res.render('pages/genome/protein_peptide2', {
          title: 'HOMD :: Human Oral Microbiome Database',
          pgname: '', // for AbountThisPage
          pgtitle: 'Protein Peptide Table',
          config: JSON.stringify(ENV),
          ver_info: JSON.stringify(C.version_information),
          
          data: JSON.stringify(send_list),
          row_count:send_list.length,
          search_text:''
          
       })
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching data');
    } finally {
        if (conn) conn.release(); // Release the connection back to the pool
    }
    return
})
router.post('/peptide_table2', async function peptide_table2_post(req, res) {
    const q = queries.get_peptide2()

    let search_text = req.body.txt_srch.toLowerCase()
    let conn,gid,otid,hmt,org,prot_count,pep_count,temp,studies,studies_ary,study_id,study_collector,row,row_collector
    console.log(q)
    try {
        conn = await global.TDBConn();
        const [rows] = await conn.execute(q);
    
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
          config: JSON.stringify(ENV),
          ver_info: JSON.stringify(C.version_information),
          
          data: JSON.stringify(send_list),
          row_count:send_list.length,
          search_text:req.body.txt_srch
          
       })
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching data');
    } finally {
        if (conn) conn.release(); // Release the connection back to the pool
    }
    return
})
router.get('/peptide_table3', async function protein_peptide(req, res) {
    console.log(req.query)
    let gid = req.query.gid
    
    const q = queries.get_peptide3(gid)
    let temp,pid,otid,org,prod,pep,start,stop,mol,study_name,study,peptide_id,jb_link
    let locstart,locstop,size,seqacc,loc,highlight
    console.log(q)
    try {
        conn = await global.TDBConn();
        const [rows] = await conn.execute(q);
    
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
           
        send_list.push(temp)
           
         
       }
       
       
       res.render('pages/genome/protein_peptide3', {
          title: 'HOMD :: Human Oral Microbiome Database',
          pgname: '', // for AbountThisPage
          pgtitle: 'Protein Peptide Table',
          config: JSON.stringify(ENV),
          ver_info: JSON.stringify(C.version_information),
          
          data: JSON.stringify(send_list),
          row_count:send_list.length,
          //stud:JSON.stringify(studies_ary),
          org:org,
          gid:gid,
          otid:otid
          
       })
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching data');
    } finally {
        if (conn) conn.release(); // Release the connection back to the pool
    }
    return
})
router.get('/amr_table', function amr(req, res) {
    let gid
    let organism,strain,otid,contigs,length,tmp={}
    let genome_lookup = {}
    let sort_list=[]
    for(let gid in C.amr_lookup){
        organism = C.genome_lookup[gid].organism
        strain = C.genome_lookup[gid].strain
        otid = C.genome_lookup[gid].otid
        contigs = C.genome_lookup[gid].contigs
        length = C.genome_lookup[gid].combined_size
        tmp = {organism:organism,strain:strain,otid:otid,contigs:contigs,length:length,hit_count:C.amr_lookup[gid]}
        //merge objects:
        genome_lookup[gid] = tmp;
        sort_list.push({gid:gid, org:organism})
    }
    //console.log(genome_lookup)
    let full_count = Object.keys(genome_lookup).length
    //console.log(genome_lookup['GCA_000009645.1'])
       
    sort_list.sort((a, b) => {
        return helpers.compareStrings_alpha(a.org, b.org);
    })
    res.render('pages/genome/amr_table', {
            title: 'HOMD :: AMR Table',
            pgtitle: 'AMR Genomes',
            pgname: '',  //for AbountThisPage
            config: JSON.stringify(ENV),
            ver_info: JSON.stringify(C.version_information),
            data: JSON.stringify(genome_lookup),
            full_count: full_count,
            gid_list: JSON.stringify(sort_list),
    })
})
//
//
router.post('/amr_ajax', async function phage_ajax(req, res){
    console.log('in POST amr_ajax')
    let gid = req.body.gid
    let q = 'SELECT homd.amr.protein_id,element_symbol,element_name,scope,type,subtype,class,'
    q += "subclass,method,target_length,ref_seq_length,pct_cov_of_ref,pct_ident_to_ref,align_length,closest_ref_acc, "
    q += "closest_ref_name,hmm_acc,hmm_description,accession,start,stop"
    q += " FROM homd.amr"
    q += " JOIN PROKKA.orf using(protein_id)"
    q += " WHERE homd.amr.genome_id='"+gid+"'"
    console.log(q)
    let hmt = helpers.make_otid_display_name(C.genome_lookup[gid].otid)
    let org = C.genome_lookup[gid].organism
    let strain = C.genome_lookup[gid].strain
    let start,stop,tmp,locstart,locstop,seqacc,loc,highlight
    let html_rows = "<div id='amr-sub-table-div'>"+gid+'; '+hmt+'; '+org+' ('+strain+')'
    html_rows += "<a href='#' onclick=close_sub_table() style='float:right;margin-right:100px;'>Close</a>"
    html_rows += "<table id='amr-sub-table' class='table table-condensed'>"
    html_rows += "<tr>"
    html_rows += " <th>Protein-ID</th><th>Genome Viewer</th><th>Element Symbol</th><th>Element Name</th><th>Scope</th><th>Type</th><th>Subtype</th><th>Class</th>"
    html_rows += " <th>Subclass</th><th>Method</th><th>Target Length</th><th>Ref Seq Length</th><th>Ref Coverage %</th><th>Ref Identity %</th>"
    html_rows += " <th>Alignment Length</th><th>Closest Ref Acc</th><th>Closest Ref name</th><th>HMM Acc</th><th>HMM Description</th>"
    html_rows += "</tr>"
    try {
        conn = await global.TDBConn();
        const [rows] = await conn.execute(q);


        for(let i in rows){
            //console.log(rows[i])
            
                //send_rows.push(rows[i])
                html_rows += "<tr>"
                html_rows += "<td nowrap>"+rows[i].protein_id+"</td>"
                start = rows[i].start
                stop  = rows[i].stop
                if(start[0] === "<" ){
                    start = parseInt(start.substring(1))
                }else{ 
                    start = parseInt(start) 
                } 
                if(stop[0] === ">" ){ 
                    stop = parseInt(stop.substring(1))
                }else{ 
                    stop = parseInt(stop)
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
                seqacc = rows[i].accession.replace('_','|')
                loc = seqacc+":"+locstart.toString()+".."+locstop.toString() 
                highlight = seqacc+":"+start.toString()+".."+stop.toString() 
                
                html_rows += "<td><a href='#' onclick=\"open_jbrowse('"+gid+"','amr','','','','"+loc+"','"+highlight+"')\">open"
                html_rows += ' <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-up-right-square" viewBox="0 0 16 16">'
                html_rows += '  <path fill-rule="evenodd" d="M15 2a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1zM0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm5.854 8.803a.5.5 0 1 1-.708-.707L9.243 6H6.475a.5.5 0 1 1 0-1h3.975a.5.5 0 0 1 .5.5v3.975a.5.5 0 1 1-1 0V6.707z"/>'
                html_rows += " </svg>"
                html_rows += " </a>"
                html_rows += "</td>"

                html_rows += "<td nowrap class=''>"+rows[i].element_symbol+"</td>"
                html_rows += "<td nowrap class=''>"+rows[i].element_name+"</td>"
                html_rows += "<td nowrap class='center'>"+rows[i].scope+"</td>"
                html_rows += "<td nowrap class='center'>"+rows[i].type+"</td>"
                html_rows += "<td nowrap class='center'>"+rows[i].subtype+"</td>"
                html_rows += "<td nowrap class='center'>"+rows[i].class+"</td>"
                html_rows += "<td nowrap class='center'>"+rows[i].subclass+"</td>"
                html_rows += "<td nowrap class='center'>"+rows[i].method+"</td>"
                html_rows += "<td nowrap class='center'>"+rows[i].target_length+"</td>"
                html_rows += "<td nowrap class='center'>"+rows[i].ref_seq_length+"</td>"
                html_rows += "<td nowrap class='center'>"+rows[i].pct_cov_of_ref+"</td>"
                html_rows += "<td nowrap class='center'>"+rows[i].pct_ident_to_ref+"</td>"
                html_rows += "<td nowrap class='center'>"+rows[i].align_length+"</td>"
                html_rows += "<td nowrap class='center'>"+rows[i].closest_ref_acc+"</td>"
                html_rows += "<td nowrap class=''>"+rows[i].closest_ref_name+"</td>"
                html_rows += "<td nowrap class='center'>"+rows[i].hmm_acc+"</td>"
                html_rows += "<td nowrap class=''>"+rows[i].hmm_description+"</td>"
                
                html_rows += "</tr>"
                //counter += 1
        }
        
        html_rows += "</table></div>"
        res.send(html_rows)
        //console.log(send_rows,send_rows.length)
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching data');
    } finally {
        if (conn) conn.release(); // Release the connection back to the pool
    }
    return
    
})
router.get('/crispr_table', function crispr(req, res) {
    // grab HMT,species,strain,contigs,length for each gid
    //let q = "SELECT genome_id,contig,operon,operon_pos,prediction,crisprs,distances,prediction_cas,prediction_crisprs"
    //q += " FROM crispr_cas"
    let genome_lookup = {}
    let show =''
    if(req.query.show){
        show = req.query.show  // a, na or all
    }
    let gid,organism,strain,otid,contigs,length
    let contig,tmp
    //operon,operon_pos,crisprs,prediction,prediction_crisprs,distances,prediction_cas,prediction_cripsrs
    let sort_list=[]
    for(let gid in C.crispr_lookup){
        organism = C.genome_lookup[gid].organism
        strain = C.genome_lookup[gid].strain
        otid = C.genome_lookup[gid].otid
        contigs = C.genome_lookup[gid].contigs
        length = C.genome_lookup[gid].combined_size
        tmp = {organism:organism,strain:strain,otid:otid,contigs:contigs,length:length,hit_count:C.crispr_lookup[gid]}
        //merge objects:
        genome_lookup[gid] = tmp;
        sort_list.push({gid:gid, org:organism})
    }
    
   
    let full_count = Object.keys(genome_lookup).length
    //console.log(genome_lookup['GCA_027474905.1'].crispr)
       
    sort_list.sort((a, b) => {
        return helpers.compareStrings_alpha(a.org, b.org);
    })
    res.render('pages/genome/crispr_cas', {
        title: 'HOMD :: CRISPR-Cas', 
        pgname: '', // for AboutThisPage
        config: JSON.stringify(ENV),
        ver_info: JSON.stringify(C.version_information),
        pgtitle: 'CRISPR-Cas',
        crispr_data: JSON.stringify(genome_lookup),
        full_count: full_count,
        show: show,
        gid_list: JSON.stringify(sort_list),
    })
    
    
})

function list_clean(item){
    //JSON.parse(item.replace('[','').replace(']','') 
    return JSON.parse(item.replace(/'/g, '"'))
}
router.post('/crispr_ajax', async function crispr_ajax(req, res) {
    // page -2
    //console.log(req.query)
    let gid = req.body.gid
    let p1,p2,loc,highlight,opos
    //console.log('crispr_ajax',gid)
    const q = queries.get_crispr_cas_data(gid)
    console.log(q)
    try {
        conn = await global.TDBConn();
        const [rows] = await conn.execute(q);

        //console.log('rows',rows)
        let hmt = helpers.make_otid_display_name(C.genome_lookup[gid].otid)
        let org = C.genome_lookup[gid].organism
        let strain = C.genome_lookup[gid].strain
        let html_rows = "<div id='crispr-sub-table-div'>"+gid+'; '+hmt+'; '+org+' ('+strain+')'
        html_rows += "<a href='#' onclick=close_sub_table() style='float:right;margin-right:100px;'>Close</a>"
        html_rows += "<table id='crispr-sub-table' class='table table-condensed'>"
        html_rows += "<tr>"
        html_rows += "<th class='col1'>Contig</th>"
        html_rows += "<th class='col9'>Genome<br>Viewer</th>"
        html_rows += "<th class='col1'>Operon</th>"
        html_rows += "<th class=''>Operon<br>Position</th>"
        html_rows += "<th class='col9'>Prediction</th>"
        html_rows += "<th class='col1'>CRISPRs</th>"
        html_rows += "<th class='col9'>Distances</th>"
        html_rows += "<th class='col6'>Prediction<br>Cas</th>"
        html_rows += "<th class='col9'>Prediction<br>CRISPRs</th>"
        
        html_rows += "</tr>"
        for(let r in rows){
            html_rows += "<tr>"
            html_rows += "<td nowrap>"+rows[r].contig+"</td>"
            
            if(rows[r].prediction_cas == "Ambiguous"){
                html_rows += "<td><small>Ambig</small></td>"
            }else{
                opos = list_clean(rows[r].operon_pos)
                p1 = opos[0] //.substring(1,pos[0].length)
                p2 = opos[1]  //.substring(0,pos[1].length-1)
                //console.log('rows[r].operon_pos',opos)
                //console.log('p1p2',p1,p2)
                loc = rows[r].contig+":"+(parseInt(p1)-500).toString()+".."+(parseInt(p2)+500).toString()
                highlight = rows[r].contig+":"+p1+".."+p2
                //console.log('loc',loc)
                //console.log('hl',highlight)
                html_rows += "<td class='center'><a title='JBrowse/Genome Viewer' href='#' onclick=\"open_jbrowse('"+gid+"','crispr','','','','"+loc+"','"+highlight+"')\">open"
                html_rows += '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-up-right-square" viewBox="0 0 16 16">'
                html_rows += '<path fill-rule="evenodd" d="M15 2a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1zM0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm5.854 8.803a.5.5 0 1 1-.708-.707L9.243 6H6.475a.5.5 0 1 1 0-1h3.975a.5.5 0 0 1 .5.5v3.975a.5.5 0 1 1-1 0V6.707z"/>'
                html_rows += "</svg>"
                html_rows += "</a> </td>"
            }
                    
            html_rows += "<td nowrap>"+rows[r].operon+"</td>"
           //console.log('operon',obj.operon)
            html_rows += "<td nowrap>"+ opos +"</td>"
           //console.log('pos',rows[r].operon_pos)
           
           html_rows += "<td nowrap>"+rows[r].prediction+"</td>"
           html_rows += "<td nowrap>"+list_clean(rows[r].crisprs)+"</td>"
           html_rows += "<td nowrap>"+list_clean(rows[r].distances)+"</td>"
           html_rows += "<td nowrap>"+rows[r].prediction_cas+"</td>"
           html_rows += "<td nowrap>"+list_clean(rows[r].prediction_crisprs)+"</td>"
           
           
           html_rows += "</tr>"
        }
        html_rows += "</table></div>"
        res.send(html_rows)

    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching data');
    } finally {
        if (conn) conn.release(); // Release the connection back to the pool
    }
    return
})

export default router;