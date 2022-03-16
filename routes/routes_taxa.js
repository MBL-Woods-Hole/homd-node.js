'use strict'
const express  = require('express');
var router   = express.Router();
const CFG   = require(app_root + '/config/config');
const fs       = require('fs-extra');
// const url = require('url');
const path     = require('path');
const C     = require(app_root + '/public/constants');
const helpers = require(app_root + '/routes/helpers/helpers');
const queries = require(app_root + '/routes/queries')
var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();
today = yyyy + '-' + mm + '-' + dd;
var currentTimeInSeconds=Math.floor(Date.now()/1000); //unix timestamp in seconds

router.get('/tax_table', function tax_table_get(req, res) {
  
  helpers.print('in taxtable -get')
  helpers.show_session(req)
  
  let letter = req.query.k
  let annot = req.query.annot
  let reset    = req.query.reset
  let count_txt, count_txt0;
  let big_tax_list0 = Object.values(C.taxon_lookup);
  console.log('count',big_tax_list0.length)
  let big_tax_list1,big_tax_list2,send_list,pgtitle
  // FIX THIS IF SELECT DROPPED OR NONORAL
  big_tax_list1 = big_tax_list0.filter(item => (item.status !== 'Dropped' && item.status !== 'NonOralRef'))
  let tcount = big_tax_list1.length  // total count of our filters
  console.log('count2',big_tax_list1.length)
  //var show_filters = 0
  
  let count_text = ''
  pgtitle = 'List of Human Oral Microbial Taxa'
  
  if(reset == '1'){
      letter = 'all'
      annot = undefined // not '0' or '1'
  }
  if(annot === '1'){
      // grab only the taxa that have genomes
      helpers.print('GOT annotations')
      big_tax_list2 = big_tax_list1.filter(item => item.genomes.length >0)
      //show_filters = 0
      pgtitle = 'List of Human Oral Microbial Taxa (with Annotated Genomes)'
      letter = 'all'
      count_txt0 = 'Showing '+big_tax_list2.length.toString()+' rows with annotated genomes.'
  }else if(annot === '0') {
      // grab only the taxa that have NO genomes
      helpers.print('GOT no annotations')
      big_tax_list2 = big_tax_list1.filter(item => item.genomes.length == 0)
      //show_filters = 0
      pgtitle = 'List of Human Oral Microbial Taxa (with Annotated Genomes)'
      letter = 'all'
      count_txt0 = 'Showing '+big_tax_list2.length.toString()+' rows with no genomes.'
  }else if(letter && letter.match(/[A-Z]{1}/)){   // always caps
      helpers.print(['GOT a TaxLetter: ',letter])
       // COOL.... filter the whole list
      big_tax_list2 = big_tax_list0.filter(item => item.genus.toUpperCase().charAt(0) === letter)
      count_txt0 = 'Showing '+big_tax_list2.length.toString()+' rows for genus starting with: "'+letter+'"'
  }else {
    
    helpers.print('NO to only annotations or tax letters')
    //whole list or 
    
    var intiial_status_filter = C.tax_status_on  //['named','unnamed','phylotype','lost']  // no['dropped','nonoralref']
    // filter
    big_tax_list1 = big_tax_list0.filter(item => intiial_status_filter.indexOf(item.status.toLowerCase()) !== -1 )
    //var intiial_site_filter = C.tax_sites_on  //['oral', 'nasal', 'skin', 'vaginal', 'unassigned'];
    //console.log('send_tax_obj1[0]',send_tax_obj1[0])
    big_tax_list2 = big_tax_list1
    // big_tax_list2 = big_tax_list1.filter( function(e) {
//         //console.log(e)
//         if(e.sites.length > 0 && intiial_site_filter.indexOf(e.sites[0].toLowerCase()) !== -1){
//            return e
//         }
//       }) 
      letter = 'all'
      count_txt0 = 'Showing '+big_tax_list2.length.toString()+' rows.'
      
    }
    //console.log('send_tax_obj[0]',send_tax_obj[0])
    // Here we add the genome size formatting on the fly AND Ecology button
    big_tax_list2.map(function(el){
        el.gsize = ''
        //console.log(el)
        if(el.genomes.length === 0){
          //console.log('g length:0')
          el.gsize = ''
        }else if(el.genomes.length === 1 && el.genomes[0] in C.genome_lookup){
          //console.log('g length:1')
          el.gsize = helpers.format_Mbps(C.genome_lookup[el.genomes[0]].tlength).toString()
        }else {  // More than one genome
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
          }else {
            el.gsize = helpers.format_Mbps(min)+' - '+helpers.format_Mbps(max)
          }
        }
        
        // do we have ecology/abundance data?  
        // Is abundance the only thing on the ecology page?
        el.ecology = 0  // change to 1 if we do
        
        if(el.status != 'Dropped'){
              var node = C.homd_taxonomy.taxa_tree_dict_map_by_name_n_rank[el.genus+' '+el.species+'_species']
          
              var lineage_list = make_lineage(node)
              if(lineage_list[0] in C.taxon_counts_lookup){
                  if('segata' in C.taxon_counts_lookup[lineage_list[0]] && Object.keys(C.taxon_counts_lookup[lineage_list[0]]['segata']).length != 0){
                     el.ecology = 1
                 }else if('dewhirst' in C.taxon_counts_lookup[lineage_list[0]] && Object.keys(C.taxon_counts_lookup[lineage_list[0]]['dewhirst']).length != 0){
                     el.ecology = 1
                 }else if('eren' in C.taxon_counts_lookup[lineage_list[0]] && Object.keys(C.taxon_counts_lookup[lineage_list[0]]['eren']).length != 0){
                     el.ecology = 1
                 }else {
                     el.ecology = 0
                 }
              }
        }
  })
  //console.log(big_tax_list2[0])
    //console.log('send_tax_obj[0]',send_tax_obj[0])
    //sort
    big_tax_list2.sort(function (a, b) {
      return helpers.compareStrings_alpha(a.genus, b.genus);
    })
    
    
  send_list = big_tax_list2
  //count_txt0 =  'Showing '+(Object.keys(send_list).length).toString()
 
  //var count_text = get_count_text_n_page_form(page)
  helpers.print(C.tax_status_on)
  count_txt = count_txt0 + '<br><small>(Total:'+(big_tax_list0.length).toString()+')</small> '
  //helpers.print(['send_list[0]',send_list[0]])
  console.log('send_list[0]',send_list[0])
  res.render('pages/taxa/taxtable', {
    title: 'HOMD :: Taxon Table', 
    pgtitle: pgtitle,
    pgname: 'taxon/tax_table',  //for AbountThisPage
    config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
    data: JSON.stringify(send_list),
    
    count_txt: count_txt,
    letter: letter,
    statusfltr: JSON.stringify(C.tax_status_on),  // default
    sitefltr: JSON.stringify(C.tax_sites_on),  //default
    default_filters:'1',
    //show_filters:show_filters,
    search_txt: '0',
    search_field:'0',
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
  })
})

router.post('/tax_table', function tax_table_post(req, res) {
  
  helpers.print('in taxtable -post')
  let send_tax_obj = {}
  //helpers.show_session(req)
  helpers.print(req.body)
  //plus valid
  //valid = req.body.valid  // WHAT IS THIS???
  let big_tax_list,count_txt, count_txt0, send_list;

  
  //show_filters = 1
  let statusfilter_on =[]
  //let sitefilter_on  = []
  for(var i in req.body){
    // if(C.tax_sites_all.indexOf(i) !== -1){
//        sitefilter_on.push(i)
//     }
    if(C.tax_status_all.indexOf(i) !== -1){
       statusfilter_on.push(i)
    }
    
  }
  helpers.print(['statusfilter_on',statusfilter_on])
  //helpers.print(['sitefilter_on',sitefilter_on])
  // letterfilter
  // if dropped is on need to add dropped to 
  big_tax_list = Object.values(C.taxon_lookup);
  
  if(statusfilter_on.length == C.tax_status_all.length){
    // no filter -- allow all
    send_list = big_tax_list
  }else{
  	send_list = big_tax_list.filter( function(e){
	  if( statusfilter_on.indexOf(e.status.toLowerCase()) !== -1 ){
		 return e
	  }
	}) 
  }
  
  

    
      send_list.map(function(el){
        el.ecology = '0'  // change to 1 if we do
        
        if(el.status != 'Dropped'){
          var node = C.homd_taxonomy.taxa_tree_dict_map_by_name_n_rank[el.genus+' '+el.species+'_species']
      
          var lineage_list = make_lineage(node)
          if(lineage_list[0] in C.taxon_counts_lookup){
              if('segata' in C.taxon_counts_lookup[lineage_list[0]] && Object.keys(C.taxon_counts_lookup[lineage_list[0]]['segata']).length != 0){
                 el.ecology = '1'
             }else if('dewhirst' in C.taxon_counts_lookup[lineage_list[0]] && Object.keys(C.taxon_counts_lookup[lineage_list[0]]['dewhirst']).length != 0){
                 el.ecology = '1'
             }else if('eren' in C.taxon_counts_lookup[lineage_list[0]] && Object.keys(C.taxon_counts_lookup[lineage_list[0]]['eren']).length != 0){
                 el.ecology = '1'
             }else {
                 el.ecology = '0'
             }
          }
        }
      })
    
  
  send_list.sort(function (a, b) {
        return helpers.compareStrings_alpha(a.genus, b.genus);
    })
  helpers.print(['statusfilter_on',statusfilter_on])
  // use session for taxletter
  //count_txt0 =  'Showing '+(Object.keys(send_list).length).toString()+' rows (status and body site filter).'
  count_txt0 =  'Showing '+(Object.keys(send_list).length).toString()+' rows (status filter).'
  
  count_txt = count_txt0+'<br><small>(Total:'+(big_tax_list.length).toString()+')</small>'
  res.render('pages/taxa/taxtable', {
    title: 'HOMD :: Taxon Table', 
    pgtitle: 'List of Human Microbial Taxa',
    pgname: 'taxon/tax_table',  //for AbountThisPage
    config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
    data: JSON.stringify(send_list),
    count_txt: count_txt,
    letter: 'all',
    statusfltr: JSON.stringify(statusfilter_on),
    //sitefltr: JSON.stringify(sitefilter_on),
    default_filters:'0',
    //show_filters: show_filters,
    search_txt: '0',
    search_field:'0',
    
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
  })
})
//
router.get('/flags', function flags(req, res) {
    res.render('pages/taxa/flags', {
      title: 'HOMD :: Taxon Flags', 
      pgtitle:'Taxa Flag',
      pgname: '',  //for AbountThisPage
      config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
      ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
    })


})
router.post('/search_taxtable', function search_taxtable(req, res) {
  console.log(req.body)
  
  let search_txt = req.body.tax_srch.toLowerCase()  // already filtered for empty string and extreme length
  let search_field = req.body.field
  var count_txt, count_txt0
  
  helpers.print(['C.taxon_lookup[389]',C.taxon_lookup[389]])
  // filter: all;otid;genus;species;synonyms;type_strains;(16S rRNA ID)
  //send_tax_obj = send_tax_obj.filter(item => (item.status !== 'Dropped' && item.status !== 'NonOralRef'))
  let big_tax_list = Object.values(C.taxon_lookup);  // search_field=='all'
  let send_list = get_filtered_taxon_list(big_tax_list, search_txt, search_field)
  
  count_txt0 =  'Showing '+(send_list.length).toString()+' rows using search string: "'+req.body.tax_srch+'".'
  count_txt = count_txt0+'<br><small>(Total:'+(big_tax_list.length).toString()+')</small>'
  res.render('pages/taxa/taxtable', {
    title: 'HOMD :: Taxon Table', 
    pgtitle: 'Search TaxTable',
    pgname: 'taxon/tax_table',  //for AbountThisPage
    config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
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
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
  })
  
  
})
//


//
//
router.get('/tax_hierarchy', (req, res) => {
  //the json file was created from a csv of vamps taxonomy
  // using the script: taxonomy_csv2json.py in ../homd_data
  
  
  res.render('pages/taxa/taxhierarchy', {
      title: 'HOMD :: Taxon Hierarchy',
      pgname: 'taxon/hierarchy', // for AbountThisPage
      config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
      data: {},
      dhtmlx: JSON.stringify(C.dhtmlxTreeData),
      ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
  })
})
router.get('/tax_level', function tax_level_get(req, res) {
  
  //var oral;
    
  //req.session.tax_obj = C.homd_taxonomy
    //console.log(req.session.counts_file)
  
  res.render('pages/taxa/taxlevel', {
    title: 'HOMD :: Taxon Level', 
    pgname: 'taxon/level', // for AbountThisPage
    config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
    level: 'domain',
    //oral: oral,
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
  })
})
//
//
router.post('/tax_level', function tax_level_post(req, res) {
  
  helpers.print(req.body)
  
  let rank = req.body.rank
  
  const tax_resp = []
  fs.readFile(path.join(CFG.PATH_TO_DATA, C.taxcounts_fn), 'utf8', function readTaxCountsFile(err, data) {
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
//          // here we 'fix' the species to exclude the genus so that
//          // the whole lineage can be used as an index for the counts
//          genus = lineage[lineage.length - 2]
//          species = lineage[lineage.length - 1]
//          new_sp = species.replace(genus,'')
//          lineage[lineage.length - 1] = new_sp.trim()
          
        }
        return_obj.item_taxon = lineage[lineage.length - 1]
        return_obj.parent_rank = C.ranks[C.ranks.indexOf(rank) - 1]
        return_obj.parent_taxon = lineage[lineage.length - 2]
        //console.log(rank,lineage)
        if(lineage.length == C.ranks.indexOf(rank)+1){
            let lineage_str = lineage.join(';')
                    //console.log(lineage_str)
            if(taxdata.hasOwnProperty(lineage_str)){
                return_obj.tax_count = taxdata[lineage_str].tax_cnt
                return_obj.gne_count = taxdata[lineage_str].gcnt
                return_obj.rrna_count = taxdata[lineage_str].refcnt
                return_obj.lineage = lineage_str 
            }else {
                return_obj.tax_count = 0
                return_obj.gne_count = 0
                return_obj.rrna_count = 0
                return_obj.lineage = '' 
            }
        }else {
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
        })
        //console.log(tax_resp)
      res.send(JSON.stringify(tax_resp));
  })
})
//
router.post('/oral_counts_toggle', function oral_counts_toggle(req, res) {
  // NO USED!!!
  var oral = req.body.oral
  
  helpers.print(['oral ',oral])
  
  res.send({ok:'ok'})

})
// test: choose custom taxonomy, show tree
router.get('/tax_custom_dhtmlx', function tax_custom_dhtmlx(req, res) {
  //console.time("TIME: tax_custom_dhtmlx");
  //console.log('IN tax_custom_dhtmlx')
  let cts,lineage,options_obj
  //let myurl = url.parse(req.url, true);
  let id = req.query.id;

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
            lineage = make_lineage(node)  // [str obj]
            cts = get_counts(lineage[0])
            //console.log(node)
            options_obj = get_options_by_node(node);
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
          lineage = make_lineage(node)  // [str obj]
          //console.log('lineage:',lineage)
          cts = get_counts(lineage[0])
          options_obj = get_options_by_node(node);
          options_obj.text = options_obj.text + ' '+cts
          options_obj.checked = false;
          json.item.push(options_obj);
        })
  }
  //console.log(json)
  json.item.sort(function sortByAlpha(a, b) {
    return helpers.compareStrings_alpha(a.text, b.text);
  })

  //console.timeEnd("TIME: tax_custom_dhtmlx");

  res.json(json);
})
/////////////////////////////////
router.get('/tax_description', function tax_description(req, res){
  // let myurl = url.parse(req.url, true);
  let otid = req.query.otid.replace(/^0+/,'')   // remove leading zeros
  let data1,data2,data3,data4,data5,links
  /*
  This busy page needs:
  1  otid     type:string
  2  status
  3  reference strains vs strain info  type:array
    Why do some pages have ref and others straininfo?
  4  Tax classification  data3 type strings
  5  16S rRNA Reference Seqs
  6  Abundance
  7  Hierarchy Structure -- what is this?
  8  body site
  9  synonyms type:array
  10 NCBI taxid
  11 PubMed, Entrez Nucleotide and Proten Searches -- links(uses genus+species)
  12 Genome Sequence  - needs genome count and otid
  13 Ref Data: General,Citations,Pheno,Cultivability,Pevalence...
  */
  /*
  Link Exceptions
  105   Peptostreptococcaceae [XI][G-1] [Eubacterium] infirmum  
  467   Peptostreptococcaceae [XI][G-1] [Eubacterium] sulci 
759 Peptostreptococcaceae [XI][G-5] [Eubacterium] saphenum  
673 Peptostreptococcaceae [XI][G-6] [Eubacterium] minutum   
694 Peptostreptococcaceae [XI][G-6] [Eubacterium] nodatum   
557 Peptostreptococcaceae [XI][G-9] [Eubacterium] brachy    

106 Peptostreptococcaceae [XI][G-7] [Eubacterium] yurii subsp. schtitka
377 Peptostreptococcaceae [XI][G-7] [Eubacterium] yurii subsps. yurii & margaretiae

  
  */
  let link_exceptions = {}
  link_exceptions['105'] = {'ncbilink':'Eubacterium-infirmum','gcmlink':'Eubacterium%20infirmum','lpsnlink':'species/eubacterium-infirmum'}
  link_exceptions['467'] = {'ncbilink':'Eubacterium-sulci','gcmlink':'Eubacterium%20sulci','lpsnlink':'species/eubacterium-sulci'}
  link_exceptions['759'] = {'ncbilink':'Eubacterium-saphenum','gcmlink':'Eubacterium%20saphenum','lpsnlink':'species/eubacterium-saphenum'}
  link_exceptions['673'] = {'ncbilink':'Eubacterium-minutum','gcmlink':'Eubacterium%20minutum','lpsnlink':'species/eubacterium-minutum'}
  link_exceptions['694'] = {'ncbilink':'Eubacterium-nodatum','gcmlink':'Eubacterium%20nodatum','lpsnlink':'species/eubacterium-nodatum'}
  link_exceptions['557'] = {'ncbilink':'Eubacterium-brachy','gcmlink':'Eubacterium%20brachy','lpsnlink':'species/eubacterium-brachy'}
  // susp 106   Peptostreptococcaceae [XI][G-7] [Eubacterium] yurii subsp. schtitka
  link_exceptions['106'] = {'ncbilink':'Eubacterium-yurii','gcmlink':'Eubacterium%20yurii','lpsnlink':'subspecies/eubacterium-yurii-schtitka'}
  // subsp 377  Peptostreptococcaceae [XI][G-7] [Eubacterium] yurii subsps. yurii & margaretiae
  link_exceptions['377'] = {'ncbilink':'Eubacterium-yurii','gcmlink':'Eubacterium%20yurii','lpsnlink':'subspecies/Eubacterium-yurii-margaretiae'}
  
  data1 = C.taxon_lookup[otid]
  helpers.print(['data1',data1])
  if(C.dropped_taxids.indexOf(otid) !== -1){
     helpers.print(data1)
     let message = "That is a dropped TaxonID: "+otid
     res.render('pages/lost_message', {
         title: 'HOMD :: Error',
         pgname: '', // for AbountThisPage 
      config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
      message:message,
      ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
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
      data2 = C.taxon_info_lookup[otid]
  }else {
      console.warn('No taxon_info for HMT:',otid,' in C.taxon_info_lookup')
      data2 = {}
  }
  helpers.print(['data2',data2])
  if(C.taxon_lineage_lookup[otid] ){
      data3 = C.taxon_lineage_lookup[otid]
      helpers.print(data3)
  }else {
      console.warn('NO taxon_lineage for HMT:',otid,' in C.taxon_lineage_lookup')
      data3 = {}
  }
  //console.log('389')
  //console.log(C.taxon_references_lookup['389'])
  if(C.taxon_references_lookup[otid]){
    data4 = C.taxon_references_lookup[otid]
    
  }else {
    console.warn('No taxon_references for HMT:',otid,'in C.taxon_references_lookup')
    data4 = {}
  }
  if(C.refseq_lookup[otid]){
    data5 = C.refseq_lookup[otid]
  }else {
    console.warn('No refseq for HMT:',otid,'in C.refseq_lookup')
    data5 = []
  }
  // phage known to infect
  //let tmp_list = Object.values(C.phage_lookup).filter(item => item.host_otid === otid)
  //let pids = tmp_list.map()
  //console.log('d1',data1)
  //console.log('d2',data2)
  // get_genus photos
  let node = C.homd_taxonomy.taxa_tree_dict_map_by_name_n_rank[data3.species+'_species']
  //console.log('node',node)
  let lineage_list = make_lineage(node)  // [str obj]
  let image_array = find_images('species',otid,data3.species)
  //console.log('genus',data3.genus)
  //console.log('imgs',image_array)
  //console.log('regex1',lineage_list[0].replace(/.*(;)/,'<em>'))+'</em>'
  //console.log('regex2',lineage_list[0].split(';').pop())
  //console.log('regex3',lineage_list[0].split(';').slice(0,-1).join('; ') +'; <em>'+lineage_list[0].split(';').pop()+'</em>')
  let lineage_string = lineage_list[0].split(';').slice(0,-1).join('; ') +'; <em>'+lineage_list[0].split(';').pop()+'</em>'
  if(otid in link_exceptions){
     links = link_exceptions[otid]
  }else{
     if(data3.subspecies){
        links = {'ncbilink':data1.genus+'-'+data1.species,'gcmlink':data1.genus+'%20'+data1.species+'%20'+data3.subspecies,'lpsnlink':'subspecies/'+data1.genus+'-'+data1.species+'-'+data3.subspecies.split(' ')[1]}
     }else{
        links = {'ncbilink':data1.genus+'-'+data1.species,'gcmlink':data1.genus+'%20'+data1.species,'lpsnlink':'species/'+data1.genus+'-'+data1.species}
     }
  }
  res.render('pages/taxa/taxdesc', {
    title: 'HOMD :: Taxon Info', 
    pgname: 'taxon/description', // for AbountThisPage
    config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
    otid: otid,
    pids: pid_list,
    image_array:JSON.stringify(image_array),
    data1: JSON.stringify(data1),
    data2: JSON.stringify(data2),
    data3: JSON.stringify(data3),
    data4: JSON.stringify(data4),
    data5: JSON.stringify(data5),
    links: JSON.stringify(links),
    lineage: lineage_string,
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
  })
})


router.post('/get_refseq', function get_refseq(req, res) {
  helpers.print(req.body)
  var refseq_id = req.body.refid;

  
  //The 16S sequence pulled from the taxon page should be seq_trim9, which is longest.
  let q = queries.get_refseq_query(refseq_id)
  helpers.print(q)
  TDBConn.query(q, (err, rows) => {
    //console.log(rows)
    let seqstr = rows[0].seq.toString()
    let arr = helpers.chunkSubstr(seqstr,80)
    let html = arr.join('<br>')
    res.send(html)
  })
})




router.get('/life', function life(req, res) {
  
  //console.log('in LIFE')
  // let myurl = url.parse(req.url, true);
  let tax_name = req.query.name;
  let rank = (req.query.rank)
  let lin,lineage_string,otid
    //console.log('rank:',rank)
  //console.log('tax_name',tax_name)
  if(tax_name){
    tax_name = req.query.name.replace(/"/g,'')
  }
  var image_array =[]
  if(rank){
     image_array = find_images(rank,'',tax_name)
     //console.log(image_array)
  }
  
  //Capnocytophaga Schaalia, Leptotrichia,Corynebacterium have images
  let text = get_rank_text(rank,tax_name)
  //console.log('TEXT',text)
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
     html += " <span class='vist-taxon-page'><a href='ecology/domain/Archaea'>Abundance</a></span><br>"
       title = 'Domain: Bacteria'
       cts = C.taxon_counts_lookup['Bacteria'].tax_cnt.toString()
     html += "<a title='"+title+"' href='life?rank=domain&name=\"Bacteria\"'>Bacteria</a> <small>("+cts+")</small>"
     html += " <span class='vist-taxon-page'><a href='ecology/domain/Bacteria'>Abundance</a></span><br>"

     html += '</td></tr>'
     image_array =[{'name':'cellular_organisms.png','text':''}]
  }else {
    //console.log(upto)
    let node = C.homd_taxonomy.taxa_tree_dict_map_by_name_n_rank[tax_name+'_'+rank]
    
    var lineage_list = make_lineage(node)  // [str obj]
      
    rank_id = C.ranks.indexOf(rank) +2
    show_ranks = C.ranks.slice(0,rank_id)
    
    //console.log('show_ranks',show_ranks)
    last_rank = show_ranks[show_ranks.length -1]
    
    space = '&nbsp;' 
    for(var i in show_ranks){
       
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
        if(show_ranks[i] == 'species'){
          html += "<a title='"+title+"' href='life?rank="+show_ranks[i]+"&name=\""+lineage_list[1][show_ranks[i]]+"\"'><em>"+lineage_list[1][show_ranks[i]]+'</em></a> ('+cts+')'
        }else {
          html += "<a title='"+title+"' href='life?rank="+show_ranks[i]+"&name=\""+lineage_list[1][show_ranks[i]]+"\"'>"+lineage_list[1][show_ranks[i]]+'</a> ('+cts+')'
    
        }
         
        html += " <span class='vist-taxon-page'><a href='ecology/"+show_ranks[i]+"/"+lineage_list[1][show_ranks[i]]+"'>Abundance</a></span>"
        html += '</td></tr>'
       }else {  // Gather rows before the last row
         
       next_rank = C.ranks[C.ranks.indexOf(rank) +1]
       childern_ids = C.homd_taxonomy.taxa_tree_dict_map_by_name_n_rank[tax_name+'_'+rank].children_ids
       
       for(var n in childern_ids){
         taxon = C.homd_taxonomy.taxa_tree_dict_map_by_id[childern_ids[n]].taxon
         taxa_list.push(taxon)
       }
       var use_plural = false;
       if(taxa_list.length > 1){
          use_plural = true;
       }
       rank_display = get_rank_display(show_ranks[i],use_plural)
       //console.log('rank_displayx',rank_display)
       
       html += "<tr><td class='life-taxa-name'>"+space+rank_display+"</td><td class='life-taxa blue'>"
       taxa_list.sort(function (a, b) {
            return helpers.compareStrings_alpha(a, b);
         })
       for(var n in taxa_list){
         //console.log('SHOW RANKS',show_ranks.length)
         title = rank_display+': '+taxa_list[n]
         if(rank === 'genus'){

               childern_ids = C.homd_taxonomy.taxa_tree_dict_map_by_name_n_rank[taxa_list[n]+'_'+'species'].children_ids
               if(childern_ids.length > 0){  // only if subspecies
               //Bacteria;Firmicutes;Bacilli;Lactobacillales;Streptococcaceae;Streptococcus;Streptococcus oralis;
                 //console.log('childern_ids-2')
                 html += "<span class=''>"+space+"<a title='"+title+"' href='life?rank="+next_rank+"&name=\""+taxa_list[n]+"\"'>"+taxa_list[n]+'</a></span><br>'
               }else {
                 otid = C.homd_taxonomy.taxa_tree_dict_map_by_name_n_rank[taxa_list[n]+'_'+'species'].otid
               //console.log('otid',otid)
               html += "<span class=''>"+space+'<em>'+taxa_list[n]+"</em> (<a title='"+title+"' href='tax_description?otid="+otid+"'>"+helpers.make_otid_display_name(otid)+'</a>)'
               html += " <span class='vist-taxon-page'><a href='ecology/"+show_ranks[i]+"/"+taxa_list[n]+"'>Abundance</a></span></span><br>"
               }
         
         }else {
          if(rank === 'species'){
               //display will be subspecies
               //console.log('taxa_list[n]',taxa_list[n])
               //console.log('taxa_list[n]2',C.homd_taxonomy.taxa_tree_dict_map_by_name_n_rank[taxa_list[n]+'_'+'subspecies'])
               otid = C.homd_taxonomy.taxa_tree_dict_map_by_name_n_rank[taxa_list[n]+'_'+'subspecies'].otid
               html += "<span class=''>"+space+taxa_list[n]+"  </span>(<a title='"+title+"' href='tax_description?otid="+otid+"'>"+helpers.make_otid_display_name(otid)+'</a>)<br>'    
            }else {
             // list of not genus or species 
             node = C.homd_taxonomy.taxa_tree_dict_map_by_name_n_rank[taxa_list[n]+'_'+next_rank]
             lin = make_lineage(node)
             cts = C.taxon_counts_lookup[lin[0]].tax_cnt.toString()
             html += "<span class=''>"+space+"<a title='"+title+"' href='life?rank="+next_rank+"&name=\""+taxa_list[n]+"\"'>"+taxa_list[n]+'</a> <small>('+cts+')</small>'
             html += " <span class='vist-taxon-page'><a href='ecology/"+show_ranks[i]+"/"+taxa_list[n]+"'>Abundance</a></span></span><br>"
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
  
  //lineage_string = helpers.make_lineage_string_with_links(lineage_list, 'life')
  lineage_string = lineage_list[0]
  res.render('pages/taxa/life', {
      title: 'HOMD :: '+page_title, 
      pgname: 'taxon/life', // for AbountThisPage
      config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
      data: {},
      tax_name: tax_name,
      //headline: 'Life: Cellular Organisms',
      rank: rank,
      taxa_list: JSON.stringify(taxa_list),
      image_array:JSON.stringify(image_array),
      text_file: text[0],
      text_format: text[1],
      html: html,
      lineage:lineage_string,
      ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
    })
  
})
//
router.get('/ecology', function ecology_index(req, res) {
    let bar_graph_data = []
    let site_species = {},sp_per_site = {}// {site,sp,abund} ordered by sp
    // let graph_site_order = C.base_abundance_order
//     graph_site_order.push('NS')
//     console.log('PUSH',C.base_abundance_order,graph_site_order)
    let abundance_graph_order = C.base_abundance_order.concat(['NS'])
    //console.log('g ORDER',abundance_graph_order,C.base_abundance_order)
    let sole_arch = {'domain':'Archaea','phylum':'Euryarchaeota','klass':'Methanobacteria','order':'Methanobacteriales','family':'Methanobacteriaceae','genus':'Methanobrevibacter'}
    let phyla_obj = C.homd_taxonomy.taxa_tree_dict_map_by_rank['phylum']
    let class_obj = C.homd_taxonomy.taxa_tree_dict_map_by_rank['klass']
    let order_obj = C.homd_taxonomy.taxa_tree_dict_map_by_rank['order']
    let family_obj = C.homd_taxonomy.taxa_tree_dict_map_by_rank['family']
    let genus_obj = C.homd_taxonomy.taxa_tree_dict_map_by_rank['genus']
    let species_obj = C.homd_taxonomy.taxa_tree_dict_map_by_rank['species']
    let group_collector={}
    let species_for_plot = C.plot_species.map(el => el.name)
    species_for_plot.push('other')
    let colors_for_plot = C.plot_species.map(el => el.color)
    colors_for_plot.push('grey')
    let spcount = 0
    let other_collector = {}, test_all_collector={},abund_obj
    for(let n in abundance_graph_order){
        //console.log('graph_site_order',graph_site_order[n])
        //other_collector[graph_site_order[n]] = 0.0
    }
    let site_sums = {}
    for(let y in abundance_graph_order){
        site_sums[abundance_graph_order[y]]=0.0
    }
    for(let i in species_obj){  // all species
        //let s = species[i]
        //console.log('sp0',species_obj[i])
        let lineage_list = make_lineage(species_obj[i])
        //console.log('sp1',lineage_list)
        let sp = lineage_list[0].split(';')[lineage_list[0].split(';').length - 1]
        //console.log('sp',sp)
        if(species_for_plot.indexOf(sp) === -1){  // not found
           // must get site avg
           //console.log('NOT Found',sp)
//           abund_obj = get_site_avgs(C.taxon_counts_lookup[lineage_list[0]])
//           delete abund_obj['ST']
           // for(let site in abund_obj){
//               console.log('n',site,abund_obj[site])
//               other_collector[site] += parseFloat(abund_obj[site])
//            }
           
        }else{
            //console.log('in list',sp,C.taxon_counts_lookup[lineage_list[0]])
            spcount += 1
            abund_obj = get_site_avgs(C.taxon_counts_lookup[lineage_list[0]],'species')
            delete abund_obj['ST']
            group_collector[lineage_list[0]]={}
            group_collector[lineage_list[0]] = abund_obj
            for(let site in abund_obj){
               //console.log('n',sp,site,abund_obj[site])
               site_sums[site] += parseFloat(abund_obj[site])
            }
            //group_collector[lineage_list[0]].colors = 
        }
        

    }
    group_collector['other'] = {}
    for(let y in abundance_graph_order){
        //console.log(graph_site_order[y],site_sums)
        group_collector['other'][abundance_graph_order[y]] = (100 - site_sums[abundance_graph_order[y]]).toFixed(3)
        site_species[abundance_graph_order[y]]=[]
    }
   
    //https://observablehq.com/@d3/stacked-normalized-horizontal-bar
    
    //console.log('site_order',site_order)
    let tmp
    for(let n in abundance_graph_order){//Object.keys(C.abundance_names)){
        let site = abundance_graph_order[n]
        //console.log('site',site)
        tmp={}
        tmp['site'] = site
        sp_per_site[site] = {}
        for(let species in group_collector){
            //console.log('sp',species)
            let sp = species.split(';')[species.split(';').length -1]
            let val = parseFloat(group_collector[species][site])
            //let c = group_collector[species].color
            tmp[sp] = val
            sp_per_site[site][sp] = val  // {site,sp,sp,sp,sp,sp....}
            site_species[site].push({'site':site,'species': sp, 'abundance': val})
            //site_species[site][sp] = 
        }
        
        bar_graph_data.push(tmp)
        
    }
    
    //console.log('bar_graph_data',bar_graph_data.length)
    
    
    let bac_phyla_only = phyla_obj.filter( (x) =>{
      if(C.homd_taxonomy.taxa_tree_dict_map_by_id[x.parent_id].taxon == 'Bacteria'){
        return x
      }
    })
    let bac_classes_only = class_obj.filter( (x) =>{
      if(x.taxon !== sole_arch['klass']){
        return x
      }
    })
    let bac_orders_only = order_obj.filter( (x) =>{
      if(x.taxon !== sole_arch['order']){
        return x
      }
    })
    let bac_families_only = family_obj.filter( (x) =>{
      if(x.taxon !== sole_arch['family']){
        return x
      }
    })
    let bac_genera_only = genus_obj.filter( (x) =>{
      if(x.taxon !== sole_arch['genus']){
        return x
      }
    })
    let phyla = bac_phyla_only.map( x => x.taxon)
    let klasses = bac_classes_only.map( x => x.taxon)
    let orders = bac_orders_only.map( x => x.taxon)
    let families = bac_families_only.map( x => x.taxon)
    let genera = bac_genera_only.map( x => x.taxon)

    phyla.sort()
    klasses.sort()
    orders.sort()
    families.sort()
    genera.sort()
    //console.log('bar_graph_data',bar_graph_data)
    res.render('pages/taxa/ecology_index', {
      title: 'HOMD :: Ecology', 
      pgname: 'taxon/ecology', // for AbountThisPage
      config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
      ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
      sole_arch:JSON.stringify(sole_arch),
      phyla: JSON.stringify(phyla),
      klasses: JSON.stringify(klasses),
      orders: JSON.stringify(orders),
      families: JSON.stringify(families),
      genera: JSON.stringify(genera),
      constant_colors: JSON.stringify(colors_for_plot),
      
      bar_data1: JSON.stringify(sp_per_site),
      bar_data2: JSON.stringify(bar_graph_data),
      site_species: JSON.stringify(site_species),
      site_order: JSON.stringify(abundance_graph_order),
      ab_names: JSON.stringify(C.abundance_names)
      
    })
})
//

router.get('/ecology/:level/:name', function ecology(req, res) {
    helpers.print('in ecology')
    let rank = req.params.level;
    let tax_name = req.params.name;
    //let segata_text = '',dewhirst_text='',erenv1v3_text='';
    let segata_notes = '',dewhirst_notes='',erenv1v3_notes='',erenv3v5_notes='';
    let max = 0;
    let otid ='0';
    let max_obj = {};
    //let major_genera=0;
    let segata_data={},dewhirst_data={},erenv1v3_data={},erenv3v5_data={};
    let segata_max=0,dewhirst_max=0,erenv1v3_max=0,erenv3v5_max=0;
    let erenv1v3_table='',erenv3v5_table='',dewhirst_table='',segata_table='';
    //console.log('rank: '+rank+' name: '+tax_name);
    // TODO::should be in constants???
    let text = get_rank_text(rank,tax_name)
   
    let node = C.homd_taxonomy.taxa_tree_dict_map_by_name_n_rank[tax_name+'_'+rank]
    if(!node){
      //error
    }
    let genera = get_major_genera(rank, node)
    // sort genera list 
    genera.sort(function sortByTaxa(a, b) {
        return helpers.compareStrings_alpha(a.taxon, b.taxon);
    })
    console.log(tax_name,rank,node)
    if(rank == 'species'){
      if(node.hasOwnProperty('otid')){
          otid = node.otid
      }
    }else if(rank == 'subspecies'){
      otid = node.otid
    }
   //console.log('node')
   //console.log(node)
   // /subspecies/subsp.%20dentisani%20clade%20058
   //console.log(node)
   var children_list = []
   for(var i in node.children_ids){ // must sort?? by getting list of nodes=>sort=>then create list
      let n = C.homd_taxonomy.taxa_tree_dict_map_by_id[node.children_ids[i]]
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
   }else {
       if(lineage_list[0] in C.taxon_counts_lookup){
         
         if('segata' in C.taxon_counts_lookup[lineage_list[0]] && Object.keys(C.taxon_counts_lookup[lineage_list[0]]['segata']).length != 0){
             segata_max = C.taxon_counts_lookup[lineage_list[0]]['max_segata']
             segata_data = Object.values(C.taxon_counts_lookup[lineage_list[0]]['segata'])
             let clone_segata_data = JSON.parse(JSON.stringify(segata_data)) // clone to avoid difficult errors
             segata_table = build_abundance_table('segata',clone_segata_data, C.base_abundance_order.concat(['ST']))
             if('segata' in C.taxon_counts_lookup[lineage_list[0]]['notes']){
                 segata_notes = C.taxon_counts_lookup[lineage_list[0]]['notes']['segata']
             }
         }
         
         if('dewhirst' in C.taxon_counts_lookup[lineage_list[0]] && Object.keys(C.taxon_counts_lookup[lineage_list[0]]['dewhirst']).length != 0){
             dewhirst_max = C.taxon_counts_lookup[lineage_list[0]]['max_dewhirst']
             //console.log('in Dewhirst')
             dewhirst_data = Object.values(C.taxon_counts_lookup[lineage_list[0]]['dewhirst'])
             let clone_dewhirst_data = JSON.parse(JSON.stringify(dewhirst_data)) // clone to avoid difficult errors
             dewhirst_table = build_abundance_table('dewhirst',clone_dewhirst_data, C.base_abundance_order.concat(['NS']))
             if('dewhirst' in C.taxon_counts_lookup[lineage_list[0]]['notes']){
                 dewhirst_notes = C.taxon_counts_lookup[lineage_list[0]]['notes']['dewhirst']
             }
         }
         if('eren_v1v3' in C.taxon_counts_lookup[lineage_list[0]] && Object.keys(C.taxon_counts_lookup[lineage_list[0]]['eren_v1v3']).length != 0){
             erenv1v3_max = C.taxon_counts_lookup[lineage_list[0]]['max_erenv1v3']
             erenv1v3_data = Object.values(C.taxon_counts_lookup[lineage_list[0]]['eren_v1v3'])
             let clone_eren_data = JSON.parse(JSON.stringify(erenv1v3_data)) // clone to avoid difficult errors
             helpers.print(C.taxon_counts_lookup[lineage_list[0]])
             erenv1v3_table = build_abundance_table('eren_v1v3', clone_eren_data, C.base_abundance_order.concat(['ST']))
             if('eren_v1v3' in C.taxon_counts_lookup[lineage_list[0]]['notes']){
                 erenv1v3_notes = C.taxon_counts_lookup[lineage_list[0]]['notes']['eren_v1v3']
             }
         }
         if('eren_v3v5' in C.taxon_counts_lookup[lineage_list[0]] && Object.keys(C.taxon_counts_lookup[lineage_list[0]]['eren_v3v5']).length != 0){
             erenv3v5_max = C.taxon_counts_lookup[lineage_list[0]]['max_erenv3v5']
             erenv3v5_data = Object.values(C.taxon_counts_lookup[lineage_list[0]]['eren_v3v5'])
             let clone_eren_data = JSON.parse(JSON.stringify(erenv3v5_data)) // clone to avoid difficult errors
             helpers.print(C.taxon_counts_lookup[lineage_list[0]])
             erenv3v5_table = build_abundance_table('eren_v3v5', clone_eren_data, C.base_abundance_order.concat(['ST']))
             if('eren_v3v5' in C.taxon_counts_lookup[lineage_list[0]]['notes']){
                 erenv3v5_notes = C.taxon_counts_lookup[lineage_list[0]]['notes']['eren_v3v5']
             }
         }
         
      }
    }
   //console.log('segata_data',segata_data)
    let lineage_string = helpers.make_lineage_string_with_links(lineage_list, 'ecology')
   
    res.render('pages/taxa/ecology', {
      title: 'HOMD ::'+rank+'::'+tax_name,
      pgname: 'taxon/ecology', // for AbountThisPage 
      config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
      tax_name: tax_name,
      //headline: 'Life: Cellular Organisms',
      lineage: lineage_string,
      rank: rank,
      max: JSON.stringify({'segata':segata_max,'dewhirst':dewhirst_max,'erenv1v3':erenv1v3_max,'erenv3v5':erenv3v5_max}),
      otid: otid,  // zero unless species
      genera: JSON.stringify(genera),
      text_file: text[0],
      text_format: text[1],
      children: JSON.stringify(children_list),
      notes: JSON.stringify({'segata':segata_notes,'dewhirst':dewhirst_notes,'erenv1v3':erenv1v3_notes,'erenv3v5':erenv3v5_notes}),
      segata_table: segata_table,
      dewhirst_table: dewhirst_table,
      erenv1v3_table: erenv1v3_table,
      erenv3v5_table: erenv3v5_table,
      segata: JSON.stringify(segata_data),
      dewhirst: JSON.stringify(dewhirst_data),
      erenv1v3: JSON.stringify(erenv1v3_data),
      erenv3v5: JSON.stringify(erenv3v5_data),
      ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
    })
})
//
router.get('/download/:type/:fxn', function download(req, res) {
    let type = req.params.type   // browser, text or excel
    let fxn = req.params.fxn     // hierarchy or level
    helpers.print(['in download: '+type+'::'+fxn])
    let file_filter_txt, table_tsv;
   
    let temp_list = Object.values(C.taxon_lookup);
    let list_of_otids = temp_list.map(item => item.otid)  // use all the otids
    if(fxn == 'level'){
        file_filter_txt = "HOMD.org Taxon Data::Taxonomic Level" 
        table_tsv = create_table(list_of_otids, 'level', type, file_filter_txt )
    }else if(fxn == 'hierarchy'){
        file_filter_txt = "HOMD.org Taxon Data::Taxonomic Hierarchy" 
        table_tsv = create_table(list_of_otids, 'hierarchy', type, file_filter_txt )
    }else {
       // type error
    }
    if(type === 'browser'){
      res.set('Content-Type', 'text/plain');  // <= important - allows tabs to display
  }else if(type === 'text'){
      res.set({"Content-Disposition":"attachment; filename=\"HOMD_taxon_table"+today+'_'+currentTimeInSeconds+".txt\""})
  }else if(type === 'excel'){
      res.set({"Content-Disposition":"attachment; filename=\"HOMD_taxon_table"+today+'_'+currentTimeInSeconds+".xls\""})
  }else {
      // error
      console.log('Download table format ERROR')
  }
  res.send(table_tsv)
  res.end()
    
})

router.get('/dld_abund/:type/:source/', function dld_abund_table(req, res) {
//router.get('/dld_table/:type/:letter/:sites/:stati', function dld_table_get(req, res) {
    console.log('in dld abund - taxon')
    let type = req.params.type
    let source = req.params.source
    helpers.print('type: '+type+' source: '+source)
    let table_tsv='',row,site
    let temp_list = Object.values(C.taxon_counts_lookup)
    let abundance_order
    let header = 'HOMD (https://node.homd.info/)::'
    if(source === 'segata'){
        header += 'Data from Segata(2012); '
        abundance_order = C.base_abundance_order.concat(['ST'])
    }else if(source === 'dewhirst'){
        header += 'Data from Dewhirst(unpublished); '
        abundance_order = C.base_abundance_order.concat(['NS'])
    }else if(source === 'erenv1v3'){
        header += 'Data from Eren(2014) V1-V3; '
        abundance_order = C.base_abundance_order.concat(['ST'])
    }else if(source === 'erenv3v5'){
        header += 'Data from Eren(2014) V3-V5; '
        abundance_order = C.base_abundance_order.concat(['ST'])
    }
    header += 'HMT == Human Microbial Taxon'
    table_tsv += header+'\nTAX\tHMT' 
    
    for(let n in abundance_order){
         site = abundance_order[n]
         table_tsv += '\t' +site+'_mean'+'\t'+site+'_stdev'+'\t'+site+'_prev'
    }
    table_tsv += '\n'
    for(let tax_string in C.taxon_counts_lookup){
      
      if(source === 'segata' 
                && C.taxon_counts_lookup[tax_string].hasOwnProperty('segata') 
                && Object.keys(C.taxon_counts_lookup[tax_string]['segata']).length > 0)
            {
            table_tsv += tax_string+'\t'+C.taxon_counts_lookup[tax_string]['otid']
            row = C.taxon_counts_lookup[tax_string]['segata']
            for(let n in abundance_order){
                site = abundance_order[n]
                table_tsv += '\t'+row[site]['avg']+'\t'+row[site]['sd']+'\t'+row[site]['prev']
            }
            table_tsv += '\n'
      }else if(source === 'dewhirst' 
                && C.taxon_counts_lookup[tax_string].hasOwnProperty('dewhirst') 
                && Object.keys(C.taxon_counts_lookup[tax_string]['dewhirst']).length > 0)
            {
            table_tsv += tax_string+'\t'+C.taxon_counts_lookup[tax_string]['otid']
            row = C.taxon_counts_lookup[tax_string]['dewhirst']
            for(let n in abundance_order){
                site = abundance_order[n]
                table_tsv += '\t'+row[site]['avg']+'\t'+row[site]['sd']+'\t'+row[site]['prev']
            }
            table_tsv += '\n'
      }else if(source === 'erenv1v3' 
                && C.taxon_counts_lookup[tax_string].hasOwnProperty('eren_v1v3')
                && Object.keys(C.taxon_counts_lookup[tax_string]['eren_v1v3']).length > 0)
            {
            table_tsv += tax_string+'\t'+C.taxon_counts_lookup[tax_string]['otid']
            row = C.taxon_counts_lookup[tax_string]['eren_v1v3']
            for(let n in abundance_order){
                site = abundance_order[n]
                table_tsv += '\t'+row[site]['avg']+'\t'+row[site]['sd']+'\t'+row[site]['prev']
            }
            table_tsv += '\n'
      }else if(source === 'erenv3v5' 
                && C.taxon_counts_lookup[tax_string].hasOwnProperty('eren_v3v5')
                &&  Object.keys(C.taxon_counts_lookup[tax_string]['eren_v3v5']).length > 0)
            {
            table_tsv += tax_string+'\t'+C.taxon_counts_lookup[tax_string]['otid']
            row = C.taxon_counts_lookup[tax_string]['eren_v3v5']
            for(let n in abundance_order){
                site = abundance_order[n]
                table_tsv += '\t'+row[site]['avg']+'\t'+row[site]['sd']+'\t'+row[site]['prev']
            }
            table_tsv += '\n'
      }else{
         // error
      }
    }
    let filename = 'HOMD_abundance_table_'+source
    if(type === 'browser'){
      res.set('Content-Type', 'text/plain');  // <= important - allows tabs to display
    }else if(type === 'text'){
      res.set({"Content-Disposition":"attachment; filename=\""+filename+today+'_'+currentTimeInSeconds+".txt\""})
    }else if(type === 'excel'){
      res.set({"Content-Disposition":"attachment; filename=\""+filename+today+'_'+currentTimeInSeconds+".xls\""})
    }else {
      // error
      console.log('Download table format ERROR')
    }
    res.send(table_tsv)
    res.end()
}) 
//
//   
router.get('/dld_table/:type/:letter/:sites/:stati/:search_txt/:search_field', function dld_tax_table(req, res) {
//router.get('/dld_table/:type/:letter/:sites/:stati', function dld_table_get(req, res) {

  
  console.log('in dld table - taxon')
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
      helpers.print(['MATCH Letter: ',letter])
      send_list = temp_list.filter(item => item.genus.charAt(0) === letter)
      file_filter_txt = "HOMD.org Taxon Data::Letter Filter Applied (genus with first letter of '"+letter+"')"
  }else if(search_txt !== '0'){
      send_list = get_filtered_taxon_list(search_txt, search_field)
      file_filter_txt = "HOMD.org Taxon Data::Search Filter Applied (Search text '"+search_txt+"')"
  //}else if(sitefilter.length > 0 ||  statusfilter.length > 0){
  }else if(statusfilter.length === 0 && sitefilter.length === 0){
    // this is for download default table. on the downloads page
    // you cant get here from the table itself (javascript prevents)
    helpers.print('in dwnld filters==[][]')
    send_list = temp_list
  }else {
    // apply site/status filter as last resort
    console.log('in dwnld filters')
    
    if(statusfilter.length == 0){  // only items from site filter checked
      send_list = temp_list.filter( function(e){
          if(e.sites.length > 0){
            for(var n in e.sites){
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
  }else {
      send_list = temp_list.filter( function(e){
          if(e.sites.length > 0){
            for(var n in e.sites){
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
    
    

  file_filter_txt = "HOMD.org Taxon Data::Site/Status Filter applied"+ " Date: "+today 

    let list_of_otids = send_list.map(item => item.otid)
    //console.log('list_of_otids',list_of_otids)
  // type = browser, text or excel
  var table_tsv = create_taxon_table(list_of_otids, 'table', type, file_filter_txt )
  if(type === 'browser'){
      res.set('Content-Type', 'text/plain');  // <= important - allows tabs to display
  }else if(type === 'text'){
      res.set({"Content-Disposition":"attachment; filename=\"HOMD_taxon_table"+today+'_'+currentTimeInSeconds+".txt\""})
  }else if(type === 'excel'){
      res.set({"Content-Disposition":"attachment; filename=\"HOMD_taxon_table"+today+'_'+currentTimeInSeconds+".xls\""})
  }else {
      // error
      console.log('Download table format ERROR')
  }
  res.send(table_tsv)
  res.end()
})
//
//
router.get('/abundance_by_site/:rank', function abundance_by_site(req, res) {
    console.log('in abundance_by_site')
    
    let rank = req.params.rank
    let node_list = C.homd_taxonomy.taxa_tree_dict_map_by_rank[rank]
    //let abund_refs = ['segata','eren_v1v3','eren_v3v5','dewhirst']
    let abund_sites = Object.keys(C.abundance_names) 
    
    let group_collector = {},top_ten = {},node,lineage_list
    for(let i in node_list){
        //console.log(phyla[p])
        node = node_list[i]
        lineage_list = make_lineage(node)
        //console.log('lineage_list',lineage_list)
        //let avg = get_site_avgs(C.taxon_counts_lookup[lineage_list[0]])
        group_collector[lineage_list[0]] = get_site_avgs(C.taxon_counts_lookup[lineage_list[0]],rank)
        
    }
    for(let i in abund_sites){
        let site = abund_sites[i]
        top_ten[site] = get_sorted_abund_names(group_collector, site, rank, 10)
    }
    //console.log(top_ten)
    //const porder = [...C.base_abundance_order] //;.concat(['NS'])
    //porder.push('NS')
    //console.log(C.base_abundance_order,porder)
    res.render('pages/taxa/abundance_by_site', {
      title: 'HOMD ::Abundance by oral site',
      pgname: '', // for AbountThisPage 
      config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
      ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
      data: JSON.stringify(top_ten),
      plot_order: C.base_abundance_order.concat(['NS']),
      site_names: JSON.stringify(C.abundance_names),
      rank:rank
    })
})
//
router.get('/show_all_abundance/:site/:rank', function show_all_abundance(req, res) {
    console.log('in show_all_abundance')
    let site = req.params.site
    let rank = req.params.rank
    //console.log('site2',site,'rank2',rank)
    let group = C.homd_taxonomy.taxa_tree_dict_map_by_rank[rank]
    let group_collector = {},top_names = {},node,lineage_list,showrank
    if(rank == 'klass') {
        showrank = 'Class'
    }else{
        showrank = rank.charAt(0).toUpperCase() + rank.slice(1)
    }
    for(let i in group){
        //console.log(phyla[p])
        node = group[i]
        lineage_list = make_lineage(node)
        //console.log('lineage_list',lineage_list)
        group_collector[lineage_list[0]] = get_site_avgs(C.taxon_counts_lookup[lineage_list[0]],rank)
    }
    top_names = get_sorted_abund_names(group_collector, site, rank, 'all')
    //console.log(top_names)
    let count = 1
    let txt = 'Oral Site: '+C.abundance_names[site]+"<br><table border='1'>"
    txt += '<tr><td></td><td>Level: <b>'+showrank+'</b></td><td><b>% Abund</b></td></tr>'
    for(let i in top_names){
        txt += '<tr><td>'+count.toString()+'</td>'
        if(rank === 'species'){
          txt += '<td><i>'+top_names[i].name+'</i></td>'
        }else{
          txt += '<td>'+top_names[i].name+'</td>'
        }
        txt += '<td>'+top_names[i].value+'</td></tr>'
        count+=1
    }
    txt += '</table>'
    res.send(txt)
    
})
////////////////////////////////////////////////////////////////////////////////////
/////////////////////// FUNCTIONS //////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
function get_rank_text(rank, tax_name){
    let text = [false,false]
    if(rank == "genus"){
      if(C.names_w_text.genera.indexOf(tax_name) != -1){
        text[0] = 'genus/'+tax_name+'.ejs'
      }else if(C.names_w_text.provisional_genera.indexOf(tax_name) != -1){
        console.log('GOT Provisional')
        console.log(C.homd_taxonomy.taxa_tree_dict_map_by_name_n_rank[tax_name+'_genus'])
        let children_ids = C.homd_taxonomy.taxa_tree_dict_map_by_name_n_rank[tax_name+'_genus'].children_ids
        let num_species = children_ids.length
        let children = []
        text[1] = tax_name +" is a provisionally named genus constructed to provide a" 
        text[1] += " stably named reference for a currently unnamed taxon represented"
        text[1] += " by a set of 16S rRNA clones.  It contains "+num_species.toString()+" species:<br>"
        for(let n in children_ids){
            text[1] += ' - '+C.homd_taxonomy.taxa_tree_dict_map_by_id[children_ids[n]].taxon +'<br>'
        }

      }
    }
    return text
}
//
//
function get_sorted_abund_names(collector, site, rank, num_to_return){
    
    let tmp1={},tmp2=[]
    
    for(let taxname in collector){
        tmp1={}
        //console.log('taxname',taxname)
        tmp1[taxname] = collector[taxname]
        tmp2.push(tmp1)
    }
    //console.log('tmp2-1',tmp2)
    let x = tmp2.map(el => {
        //console.log(Object.keys(el)[0])
        let obj = {}
        let name_ary = Object.keys(el)[0].split(';')
        obj['name'] = name_ary[name_ary.length - 1]
        obj['value'] = el[Object.keys(el)[0]][site] 
        if(rank == 'species'){
            obj['otid']  = C.homd_taxonomy.taxa_tree_dict_map_by_name_n_rank[name_ary[name_ary.length - 1] +'_species'].otid
        }
        return obj
    })
   
    //sort by value
    if(num_to_return === 'all'){
        return sortByKeyDEC(x,'value')
    }else{
        return sortByKeyDEC(x,'value').slice(0, 10)
    }
}

function sortByKeyDEC(array, key) {
  return array.sort(function(a,b) { return b[key] - a[key];});
}
//
function get_site_avgs(obj,rank){
    //console.log('\nin obj',obj)
    let return_obj = {}
    let ref,site,count
    let abund_refs = C.abundance_refs
    //let abund_refs = ['dewhirst']
    //let abund_sites = ['BM','KG','HP','TD','PT','TH','SV','SupP','SubP','ST','NS']
    let abund_sites = Object.keys(C.abundance_names)
    //console.log('obj',obj)
    let counter_per_site = {}
    for(let i in abund_sites){
        site = abund_sites[i]
        counter_per_site[site] = 0
        return_obj[abund_sites[i]] = 0
    }
   
    for(let n in abund_refs){
       ref = abund_refs[n]
       
       for(let i in abund_sites){
           site = abund_sites[i]
           
           if(obj.hasOwnProperty(ref) && (Object.keys(obj[ref]).indexOf(site) != -1)){
                //console.log('found site',site, 'adding',parseFloat(obj[ref][site].avg))
                 return_obj[site] += parseFloat(obj[ref][site].avg)
                 counter_per_site[site] += 1
               
           }else{
              //console.log('excluding',ref,site)
           }
       }
       
    }
    //console.log('counter SV',counter_per_site['SV'])
    //console.log('countSV',count,return_obj['SV'])
    for(let site in return_obj){
          //let result = (return_obj[site] / counter_per_site[site]).toFixed(3)
          if(site == 'NS'){   // only Dewhirst
            let result = (return_obj[site]).toFixed(3)  // divide by 1 ONLY Dewhirst
            return_obj[site] = result 
          }else if(rank === 'species'){  //only dewhirst and erinx2
            let result = (return_obj[site] / 3).toFixed(3)  // divide by 4 a
            return_obj[site] = result 
          }else{
            let result = (return_obj[site] / 4).toFixed(3)  // divide by 4 a
            return_obj[site] = result 
          }
          
          // }else{
//               return_obj[site] = '0.000'
//           }
          
    }
    
    //console.log('avg return SubP',return_obj['SubP'])
    //console.log('avg return SV',return_obj['SV'])
    //console.log('')
    return return_obj
}
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
      display_name = 'Genera'
     }else if(rank === 'species'){
        display_name = 'Species'
     }else if(rank === 'subspecies'){
        display_name = 'Subspecies/Clade'
     }
   }else {
    if(rank === 'klass'){
       display_name = 'Class'
     
     }else {
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
    if(node.parent_id == 0){
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
function create_taxon_table(otids, source, type, head_txt) {
    // source == table, hirearchy or level
    let txt = head_txt+'\n'
    let headers,lineage,old_lineage,otid_pretty,rank,cnts
    if(source === 'table'){
        let obj1 = C.taxon_lookup
        let obj2 = C.taxon_lineage_lookup
        let obj3 = C.taxon_info_lookup 
        let obj4 = C.taxon_references_lookup 
        //console.log('o1-3')
        //console.log(obj1[3])
        headers = ["HMT_ID","Domain","Phylum","Class","Order","Family","Genus","Species","Status","Body_site","Warning","Type_strain","16S_rRNA","Clone_count","Clone_%","Clone_rank","Synonyms","NCBI_taxon_id","NCBI_pubmed_count","NCBI_nucleotide_count","NCBI_protein_count","Genome_ID","General_info","Cultivability","Phenotypic_characteristics","Prevalence","Disease","References"]
        
        txt +=  headers.join('\t')
        var o1,o2,o3,o4
        for(var n in otids){
            
            let otid = otids[n].toString()
            o1 = obj1[otid]
             //console.log('otid',otid)
             
            if(otid in obj2){
               o2 = obj2[otid]
            }else {
               o2 = {'domain':'','phylum':'','klass':'','order':'','family':'','genus':'','species':''}
            }
            if(otid in obj3){
               o3 = obj3[otid]
            }else {
               o3 = {'general':'','culta':'','pheno':'','prev':'','disease':''}
            }
            if(otid in obj4){
               o4 = obj4[otid]
            }else {
               o4 = {NCBI_pubmed_search_count: '0',NCBI_nucleotide_search_count: '0',NCBI_protein_search_count: '0'}
            }
            // list! o1.type_strain, o1,genomes, o1,synonyms, o1.sites, o1.ref_strains, o1,rrna_sequences
            // clone counts
            if(o2.domain){  // weeds out dropped
               //console.log(o2)
               let tstrains = o1.type_strains.join(' | ')
               let gn = o1.genomes.join(' | ')
               let syn = o1.synonyms.join(' | ')
               let sites = o1.sites.join(' | ')
               let rstrains = o1.ref_strains.join(' | ')
               let rnaseq = o1.rrna_sequences.join(' | ')
               // per FDewhirst: species needs to be unencumbered of genus for this table
               // let species_pts = o2.species.split(' ')
//                species_pts.shift()
//                let species = species_pts.join(' ')
               
               let species = o2.species.replace(o2.genus,'').trim()
               var r = [("000" + otid).slice(-3),o2.domain,o2.phylum,o2.klass,o2.order,o2.family,o2.genus,species,o1.status,sites,o1.warning,tstrains,rnaseq,,,,syn,o1.ncbi_taxid,o4.NCBI_pubmed_search_count,o4.NCBI_nucleotide_search_count,o4.NCBI_protein_search_count,gn,o3.general,o3.culta,o3.pheno,o3.prev,o3.disease,,]
               var row = r.join('\t')
               txt += '\n'+row
            }
        }
    }else if(source === 'level'){
        headers = ['Domain','Domain_count','Phylum','Phylum_count','Class','Class_count','Order','Order_count','Family','Family_count','Genus','Genus_count','Species','Species_count','Subspecies','Oral_Taxon_ID']
        txt +=  headers.join('\t')+'\n'
        
        for(var n in otids){
            otid_pretty = 'HMT-'+("000" + otids[n]).slice(-3);
            //console.log(C.taxon_lineage_lookup[otids[n]])
            old_lineage = ''
            if(otids[n] in C.taxon_lineage_lookup){
                for( var m in C.ranks){
                    rank = C.ranks[m]
                
                    lineage = old_lineage + C.taxon_lineage_lookup[otids[n]][rank]
                    //console.log(rank,lineage)
                    cnts = C.taxon_counts_lookup[lineage].tax_cnt
                    if(rank == 'subspecies' ){
                          txt += C.taxon_lineage_lookup[otids[n]]['subspecies']+'\t'+otid_pretty // no counts
                    }else if(rank == 'species' ){
                      if(C.taxon_lineage_lookup[otids[n]]['subspecies'] == ''){
                         old_lineage = lineage
                      }else {
                         old_lineage = lineage+';'
                      }
                      txt += C.taxon_lineage_lookup[otids[n]]['species']+'\t'+cnts+'\t'
                    }else {
                       old_lineage = lineage+';'
                       txt += C.taxon_lineage_lookup[otids[n]][rank]+'\t'+cnts+'\t'
                    }
                }
                txt += '\n'
            }
        }
    }else if(source === 'hierarchy'){
        headers = ['Domain','Phylum','Class','Order','Family','Genus','Species','Subspecies','Oral_Taxon_ID',
                   'Domain_Taxon_Count','Domain_Seq_Count','Domain_Clone_Count',
                   'Phylum_Taxon_Count','Phylum_Seq_Count','Phylum_Clone_Count',
                   'Class_Taxon_Count','Class_Seq_Count','Class_Clone_Count',
                   'Order_Taxon_Count','Order_Seq_Count','Order_Clone_Count',
                   'Family_Taxon_Count','Family_Seq_Count','Family_Clone_Count',
                   'Genus_Taxon_Count','Genus_Seq_Count','Genus_Clone_Count',
                   'Species_Taxon_Count','Species_Seq_Count','Species_Clone_Count',
                   'Subspecies_Taxon_Count','Subspecies_Seq_Count','Subspecies_Clone_Count'
                   ]
        txt +=  headers.join('\t')+'\n'
        for(var n in otids){
            otid_pretty = 'HMT-'+("000" + otids[n]).slice(-3);
            old_lineage = ''
            if(otids[n] in C.taxon_lineage_lookup){
                for( var m in C.ranks){
                    rank = C.ranks[m]
                    txt += C.taxon_lineage_lookup[otids[n]][rank] +'\t'
                }
                txt += otid_pretty+'\t'
                // tax_counts
                for( var m in C.ranks){
                    rank = C.ranks[m]
                    lineage = old_lineage + C.taxon_lineage_lookup[otids[n]][rank]
                    cnts = C.taxon_counts_lookup[lineage]
                    //console.log(lineage)
                    //console.log(cnts)
                    txt += cnts.tax_cnt +'\t'+cnts.gcnt +'\t'+cnts.refcnt +'\t'
                    if(rank == 'species' ){
                      if(C.taxon_lineage_lookup[otids[n]]['subspecies'] == ''){
                         old_lineage = lineage
                      }else {
                         old_lineage = lineage+';'
                      }
                    }else {
                      old_lineage = lineage+';'
                    }
                }
                // are clone counts the same as refseq counts????
                txt += '\n'
            }
        }
        
    }else {
       // source ERROR
       return 'ERROR'
    }
    //console.log(C.homd_taxonomy)
    //console.log(C.taxon_counts_lookup )
    return txt
}        
 //
function find_images(rank, otid, tax_name) {

  var image_list = []
  if(C.images[rank].hasOwnProperty(tax_name)){
     if(C.images[rank][tax_name].hasOwnProperty('filename1')){
         image_list.push({name:path.join(rank,C.images[rank][tax_name]['filename1']),text:C.images[rank][tax_name]['text1']})
     }
     if(C.images[rank][tax_name].hasOwnProperty('filename2')){
         image_list.push({name:path.join(rank,C.images[rank][tax_name]['filename2']),text:C.images[rank][tax_name]['text2']})
     }
     if(C.images[rank][tax_name].hasOwnProperty('filename3')){
         image_list.push({name:path.join(rank,C.images[rank][tax_name]['filename3']),text:C.images[rank][tax_name]['text3']})
     }
     if(C.images[rank][tax_name].hasOwnProperty('filename4')){
         image_list.push({name:path.join(rank,C.images[rank][tax_name]['filename4']),text:C.images[rank][tax_name]['text4']})
     }
  
  }
  
  return image_list
  
//   var ext = 'png'
//   // for photos NO Spaces = join w/ underscore
//   var tname,fname1_prefix,fname2_prefix,fname3_prefix,fname4_prefix
//   if(otid){
//       helpers.print('looking for otid image: HMT'+otid+'(1-4).png')
//       fname1_prefix = 'HMT/HMT'+otid+'-1' // look for .jpg .jpeg png
//       fname2_prefix = 'HMT/HMT'+otid+'-2' // or '-2.jpeg'
//       fname3_prefix = 'HMT/HMT'+otid+'-3' // or '-3.jpeg'
//       fname4_prefix = 'HMT/HMT'+otid+'-4' // or '-3.jpeg'
//   }else {  // rank and not otid
//       tname = tax_name.replace(/ /g,'_')  // mostly for species 
//       fname1_prefix = rank+'/'+tname+'-1' // look for .jpg .jpeg png
//       fname2_prefix = rank+'/'+tname+'-2' // or '-2.jpeg'
//       fname3_prefix = rank+'/'+tname+'-3' // or '-3.jpeg'
//       fname4_prefix = rank+'/'+tname+'-4' // or '-3.jpeg'
//   } 
//  
//   try {
//     if (fs.existsSync(path.join(CFG.PATH_TO_IMAGES,fname1_prefix+'.'+ext))) {
//     //console.log('adding1',fname1_prefix)
//     image_list.push({"name":fname1_prefix+'.'+ext,"text":""})
//     
//     }else {
//       //console.log('no find1',path.join(CFG.PATH_TO_IMAGES,rank,fname1_prefix+'.'+ext))
//     }
//     
//     if (fs.existsSync(path.join(CFG.PATH_TO_IMAGES,fname2_prefix+'.'+ext))) {
//     //console.log('adding2',fname2_prefix)
//     image_list.push({"name":fname2_prefix+'.'+ext,"text":""})
//     }else {
//       //console.log('no find2',path.join(CFG.PATH_TO_IMAGES,rank,fname2_prefix))
//     }
//    
//     if (fs.existsSync(path.join(CFG.PATH_TO_IMAGES,fname3_prefix+'.'+ext))) {
//     //console.log('adding',fname3_prefix+'.'+ext)
//     image_list.push({"name":fname3_prefix+'.'+ext,"text":""})
//     }else {
//       //console.log('no find3',path.join(CFG.PATH_TO_IMAGES,rank,fname3_prefix))
//     }
//     
//    if (fs.existsSync(path.join(CFG.PATH_TO_IMAGES,fname4_prefix+'.'+ext))) {
//     //console.log('adding',fname4_prefix+'.'+ext)
//     image_list.push({"name":fname4_prefix+'.'+ext,"text":""})
//     }else {
//       //console.log('no find4',path.join(CFG.PATH_TO_IMAGES,rank,fname4_prefix))
//     }
//     
//   } catch(err) {
//     console.error(err)
//   }
//   
//   //console.log('im-arry',image_list)
//   return image_list
}      
        
 function get_filtered_taxon_list(big_tax_list, search_txt, search_field){

  let send_list = []
  if(search_field == 'taxid'){
      send_list = big_tax_list.filter(item => item.otid.toLowerCase().includes(search_txt))
  }else if(search_field == 'genus'){
      send_list = big_tax_list.filter(item => item.genus.toLowerCase().includes(search_txt))
  }else if(search_field == 'species'){
      send_list = big_tax_list.filter(item => item.species.toLowerCase().includes(search_txt))
  }else if(search_field == 'synonym'){
      send_list = big_tax_list.filter( function(e) {
         for(var n in e.synonyms){
            if(e.synonyms[n].toLowerCase().includes(search_txt)){
               return e
            }
         }
      })    
      
  }else if(search_field == 'type_strain'){
      send_list = big_tax_list.filter( function filterBigList1(e) {
         for(var n in e.type_strains){
            if(e.type_strains[n].toLowerCase().includes(search_txt)){
               return e
            }
         }
      })
  }else {
      // search all
      //send_list = send_tax_obj
      let temp_obj = {}
      var tmp_send_list = big_tax_list.filter(item => item.otid.toLowerCase().includes(search_txt))
      // for uniqueness convert to object
      for(var n in tmp_send_list){
         temp_obj[tmp_send_list[n].otid] = tmp_send_list[n]
      }
      
      tmp_send_list = big_tax_list.filter(item => item.genus.toLowerCase().includes(search_txt))
      for(var n in tmp_send_list){
         temp_obj[tmp_send_list[n].otid] = tmp_send_list[n]
      }
      
      tmp_send_list = big_tax_list.filter(item => item.species.toLowerCase().includes(search_txt))
      for(var n in tmp_send_list){
         temp_obj[tmp_send_list[n].otid] = tmp_send_list[n]
      }
      
      tmp_send_list = big_tax_list.filter( function filterBigList2(e) {
         for(var n in e.synonyms){
            if(e.synonyms[n].toLowerCase().includes(search_txt)){
               return e
            }
         }
      })    
      for(var n in tmp_send_list){
         temp_obj[tmp_send_list[n].otid] = tmp_send_list[n]
      }
      
      tmp_send_list = big_tax_list.filter( function filterBigList3(e) {
         for(var n in e.type_strains){
            if(e.type_strains[n].toLowerCase().includes(search_txt)){
               return e
            }
         }
      })
      for(var n in tmp_send_list){
         temp_obj[tmp_send_list[n].otid] = tmp_send_list[n]
      }
      
      // now back to a list
      send_list = Object.values(temp_obj);
      
      
  }
  return send_list
} 
//
//
function get_abundance_text(max, data, names, rank, tax_name){
    helpers.print(['max',max])
    let max_obj = data.find(function findData(o) { helpers.print(o);return o.avg == max})
    helpers.print(['max_obj',max_obj])
    /*
    From Jessica Email 8/31/2021
    The scheme for generating the text for HOMD would look something like this:  
    intended text in blue:
    [Genus/Family/Order/Class/Phylum] xxx is  
    {if maximum abundance in Segata et al. 2012 data is} 
      >= 1% at some site:  [an abundant] 
      0.1-1% [a moderately abundant] 
      0.001-0.1% [a low-abundance] 
    member of the healthy oral microbiome. 

    It reaches its highest relative abundance in the  
     [buccal mucosa, keratinized gingiva, and hard palate] 
     
     [tongue dorsum, tonsils, and throat] 
     
     [supra- and sub-gingival dental plaque] 
     [sub-gingival dental plaque]  {if SubP and SupP are higher than the other sites, and  SUBP > 2x SUPP}
     
     [hard palate]  {if BM, KG, and HP are higher than the other sites, and HP > 2x BM}
     
     [saliva] suggesting that its site of greatest abundance has not yet been identified] 

    Then show a table of abundance (mean and standard deviation) for this taxon at 9 oral sites, from Segata et al. 2012  

    if max abundance is zero: 
     not found in the healthy oral microbiome, but is included in HOMD as a non-oral reference taxon. 
    */
    
    var text = helpers.clean_rank_name_for_show(rank)
    if(rank=='species'){
       text += ': <b><i>'+tax_name+ '</i></b> is '
    }else {
       text += ': <b>'+tax_name+ '</b> is '
    }
    
    if(max > 1){
       text += ' an abundant'
    }else if(max > 0.1 && max <=1){
       text += ' a moderately abundant'
    }else {  // smaller than 0.1
       text += ' a low-abundance'
    }
   text += ' member of the healthy oral microbiome. It reaches its highest relative abundance '
   if(max_obj.site in names){
    
    var all_min = Math.min.apply(Math,data.map(i => i.avg))
    var all_max = Math.max.apply(Math,data.map(i => i.avg))
    
    if(tax_name == 'Bacteria' || tax_name == 'Archaea'){
       text += ' across all oral locations.'  // for bacteria,Archaea
    }else if(['TD','PT','Throat'].indexOf(max_obj.site) >= 0) {
       text += ' in the Tongue Dorsum, Palatine Tonsils, and Throat'
    }else if(max_obj.site == 'HP' && (data.filter(i => i.site = 'HP')).avg  > 2*(data.filter(i => i.site = 'BM')).avg){
        text += ' in the Hard Palate'
    }else if(['BM','KG','HP'].indexOf(max_obj.site) >= 0) {
       text += ' in the Buccal Mucosa, Keratinized Gingiva, and Hard Palate'
    }else if(max_obj.site == 'SubP' && (data.filter(i => i.site = 'SubP')).avg  > 2*(data.filter(i => i.site = 'SupP')).avg){
        text += ' in the Sub-Gingival Dental Plaque'
    }else if(['SupP','SubP'].indexOf(max_obj.site) >= 0) {
       text += ' in the Supra-Gingival and Sub-Gingival Dental Plaques'
    }else if(max_obj.site == 'Saliva'){
       text += ' suggesting that its site of greatest abundance has not yet been identified.'
    }else {
         text += ' in the '+max_obj.site
    }
  
   }else {
    text += ' across all oral locations.'
   }
   
   return text
} 
function build_abundance_table(cite, data, order){
    //console.log('data',data)
    
    var html = '<table><thead><tr><td></td>'
    for(var n in order){
        html += '<th>'+order[n]+'</th>'
    }
    html += '</tr></thead><tbody>'
   
    html += '<tr><th>Avg</th>'
    for(var n in data){
        html += '<td class="right-justify">'+(parseFloat(data[n].avg)).toFixed(3)+'</td>'
    }
    html += '</tr>'
    if(['dewhirst','eren_v1v3','eren_v3v5'].indexOf(cite) != -1){
        html += '<tr><th>10<sup>th</sup>p</th>'
        for(var n in data){
            html += '<td class="right-justify">'+(parseFloat(data[n]['10p'])).toFixed(3)+'</td>'
        }
        html += '</tr>'
        html += '<tr><th>90<sup>th</sup>p</th>'
        for(var n in data){
            html += '<td class="right-justify">'+(parseFloat(data[n]['90p'])).toFixed(3)+'</td>'
        }
        html += '</tr>'
    }
    
    html += '<tr><th>Stdev</th>'
    for(var n in data){
        html += '<td class="right-justify">'+(parseFloat(data[n].sd)).toFixed(3)+'</td>'
    }
    html += '</tr>'
    // dewhirst, eren  (Not for Segata)
    if(['dewhirst','eren_v1v3','eren_v3v5'].indexOf(cite) != -1){
      html += '<tr><th>Prev</th>'
      for(var n in data){
        html += '<td class="right-justify">'+(parseFloat(data[n].prev)).toFixed(3)+'</td>'
      }
      html += '</tr>'
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

      for(var n in node.children_ids){
        let new_node1 = C.homd_taxonomy.taxa_tree_dict_map_by_id[node.children_ids[n]]  // klass ,order or family
        for(var m in new_node1.children_ids){
          let new_node2 = C.homd_taxonomy.taxa_tree_dict_map_by_id[new_node1.children_ids[m]]  // order, family or genus
          if(new_node2.rank == 'genus'){
            //stop you're done
            //counts = C.taxon_counts_lookup[make_lineage(new_node2)[0]]
            genera.push(new_node2)
          }else {
            for(var p in new_node2.children_ids){
              let new_node3 = C.homd_taxonomy.taxa_tree_dict_map_by_id[new_node2.children_ids[p]] // family or genus
              if(new_node3.rank == 'genus'){
                //stop you're done
                //counts = C.taxon_counts_lookup[make_lineage(new_node3)[0]]
                genera.push(new_node3)
              }else {
                for(var q in new_node3.children_ids){
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




