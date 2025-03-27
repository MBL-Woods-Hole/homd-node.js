'use strict'
const C       = require(app_root + '/public/constants');
//const queries = require(app_root + '/routes/queries');
const CFG  = require(app_root + '/config/config');
const express     = require('express');
const fs          = require('fs-extra');
const readline = require('readline');
var accesslog = require('access-log');
const async = require('async')
const util        = require('util');
const path        = require('path');
const {exec, spawn} = require('child_process');
const helpers = require(app_root + '/routes/helpers/helpers');
const helpers_taxa = require(app_root + '/routes/helpers/helpers_taxa');
//let hmt = 'HMT-'+("000" + otid).slice(-3)

module.exports.get_all_phyla = function get_all_phyla(){
    var phyla_obj = C.homd_taxonomy.taxa_tree_dict_map_by_rank['phylum']
    var phyla = phyla_obj.map(function mapPhylaObj2 (el) { return el.taxon; })
    return phyla
}
module.exports.clean_rank_name_for_show = (rank) =>{
    // capitalise and fix klass => Class
    if(rank == 'klass' || rank == 'Klass'){
       rank = 'Class'
    }
    return rank.charAt(0).toUpperCase() + rank.slice(1)
}


module.exports.get_default_tax_filter = function getDefaultTaxFilter(){
    
    let defaultfilter = {otid:'',status:{},site:{},abund:{}}
    
    // body sites
    let body_sites = Object.keys(C.tax_sites_all)
    for(let n in body_sites){
        if(C.tax_sites_default.indexOf(body_sites[n]) == -1){
            defaultfilter.site[body_sites[n]] = 'off' // then turn all 'on'
        }else{
            defaultfilter.site[body_sites[n]] = 'on' // then turn all 'on'
        }
    }
    defaultfilter.site['p_or_pst'] = 'primary_site'
    
    // abundance
    for(let n in C.tax_abund_all){
        if(C.tax_abund_default.indexOf(C.tax_abund_all[n]) == -1){
            defaultfilter.abund[C.tax_abund_default[n]] = 'off' // then turn all 'on'
        }else{
            defaultfilter.abund[C.tax_abund_default[n]] = 'on' // then turn all 'on'
        }
    }
    
    // status
    for(let n in C.tax_status_all){
        if(C.tax_status_default.indexOf(C.tax_status_all[n]) == -1){
            defaultfilter.status[C.tax_status_default[n]] = 'off' // then turn all 'on'
        }else{
            defaultfilter.status[C.tax_status_default[n]] = 'on' // then turn all 'on'
        }
    }
    
        defaultfilter.genomes='both'
        defaultfilter.text={
            txt_srch: '',
            field: 'all',
        }
        defaultfilter.letter='0'
        defaultfilter.phylum='0'
        defaultfilter.sort_col='genus'
        defaultfilter.sort_rev= 'off'
    
    return defaultfilter
}
module.exports.get_null_tax_filter = function get_null_tax_filter(){
    let nullfilter = {
        otid:'',
        status:{
            named_cultivated:'off',
            named_uncultivated:'off',
            unnamed_cultivated: 'off',
            unnamed_uncultivated: 'off',
            dropped:'off',
            //nonoralref:'off'
            
        },
        site:{
           oral:'off',
           nasal:'off',
           skin:'off',
           gut:'off',
           vaginal:'off',
           unassigned:'off',
           enviro      :'off',
           ref         :'off',
           pathogen    :'off',
           p_or_pst    :'primary_site'
        },
        abund:{
           high_abund:'off',
           medium_abund:'off',
           low_abund:'off',
           scarce_abund:'off'
        },
        genomes:'both',
        text:{
            txt_srch: '',
            field: 'all',
        },
        letter: '0',
        phylum:'0',
        sort_col: 'genus',
        sort_rev: 'off'
    }
    return nullfilter
}

module.exports.get_filtered_taxon_list = function getFilteredTaxonList(big_tax_list, search_txt, search_field){

  let send_list = []
  //console.log('txt srch',search_txt,search_field)
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
      
      //OTID
      var tmp_send_list = big_tax_list.filter(item => item.otid.toLowerCase().includes(search_txt))
      //var tmp_send_list = big_tax_list.filter(screen_tax_list)
      // for uniqueness convert to object
      for(var n in tmp_send_list){
         temp_obj[tmp_send_list[n].otid] = tmp_send_list[n]
      }
      
      
      //Genus
      //console.log('srchfield',search_field, search_txt)
      //console.log('big_tax_list2.length',big_tax_list.length)
      tmp_send_list = big_tax_list.filter(item => item.genus.toLowerCase().includes(search_txt))
      //console.log('tmp_send_list1',tmp_send_list)
      for(var n in tmp_send_list){
         temp_obj[tmp_send_list[n].otid] = tmp_send_list[n]
      }
      
      
      // Species
      //console.log('tmp_send_list2',tmp_send_list)
      tmp_send_list = big_tax_list.filter(item => item.species.toLowerCase().includes(search_txt))
      for(var n in tmp_send_list){
         temp_obj[tmp_send_list[n].otid] = tmp_send_list[n]
      }
      
      
      //Synonyms
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
      
      
      //type_strains
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
      
      //Body Sites and their Notes
      tmp_send_list = big_tax_list.filter( function filterBigList4(e) {
         if(e.otid in C.site_lookup){
             let to_include = Object.values(C.site_lookup[e.otid])
             let glom = to_include.join(' ').toLowerCase()
             //console.log('site_on[n]',site_on[n],'glom',glom)
             if(glom.includes(search_txt)){
                //if(site_on.includes(item.sites[n].toLowerCase())){
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
module.exports.make_lineage = function make_lineage(node){
    //console.log('in lineage-node',node)
    if(!node){
       return ['',{}]
    }
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
        
        let on = tax_obj[fn.parent_id]
        let kn = tax_obj[on.parent_id]
        let pn = tax_obj[kn.parent_id]
        let dn = tax_obj[pn.parent_id]
        // console.log('phylum1',pn)
//         console.log('class1',kn)
//         console.log('order1',on)
//         console.log('family1',fn)
        
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
//
// TT filter //
//
module.exports.set_ttable_session = function set_ttable_session(req) {
    // set req.session.ttable_filter.otid 5 places
    // 1taxa/life
    // 2taxa/tax_description
    // 3taxa/ecology
    // 4taxa/tax_description
    // 5genome_genome_table
    //console.log('set sess body',req.body)
    //console.log('xsession',req.session)
    let letter = '0'
    if(req.session.ttable_filter && req.session.ttable_filter.letter){
       letter = req.session.ttable_filter.letter
    }
    req.session.ttable_filter = helpers_taxa.get_null_tax_filter()
    req.session.ttable_filter.letter = letter
    
    for( let item in req.body){
       if(item == 'letter'){
         req.session.ttable_filter.letter = req.body.letter
       }
       if(item == 'phylum'){
         req.session.ttable_filter.phylum = req.body.phylum
       }
       if(item == 'genomes'){
         req.session.ttable_filter.genomes = req.body.genomes
       }
       if(item == 'sort_col'){
         req.session.ttable_filter.sort_col = req.body.sort_col
       }
       if(item == 'sort_rev'){
         req.session.ttable_filter.sort_rev = 'on'
       }
       
// Named Cultivated
// Unnamed Uncultivated
// Named Uncultivated
// Dropped Dropped
// Unnamed Cultivated

       if(item == 'named_cultivated'){
         req.session.ttable_filter.status.named_cultivated = 'on'
       }
       if(item == 'unnamed_uncultivated'){
         req.session.ttable_filter.status.unnamed_uncultivated = 'on'
       }
       if(item == 'named_uncultivated'){
         req.session.ttable_filter.status.named_uncultivated = 'on'
       }
       if(item == 'unnamed_cultivated'){
         req.session.ttable_filter.status.unnamed_cultivated = 'on'
       }
       if(item == 'dropped'){
         req.session.ttable_filter.status.dropped = 'on'
       }
       
       
       
       // sites
       for(let site_code in C.tax_sites_all){
            if(item == site_code){
                //console.log('C.tax_sites_all[n]',item,C.tax_sites_all[site_code])
               req.session.ttable_filter.site[site_code] = 'on'
            }
       }
       
       if(item == 'p_or_pst'){
         req.session.ttable_filter.site.p_or_pst = req.body.p_or_pst
       }
       if(item == 'high_abund'){
         req.session.ttable_filter.abund.high_abund = 'on'
       }
       if(item == 'medium_abund'){
         req.session.ttable_filter.abund.medium_abund = 'on'
       }
       if(item == 'low_abund'){
         req.session.ttable_filter.abund.low_abund = 'on'
       }
       if(item == 'scarce_abund'){
         req.session.ttable_filter.abund.scarce_abund = 'on'
       }
       //////
       if(item == 'txt_srch'){
         req.session.ttable_filter.text.txt_srch = req.body.txt_srch.toLowerCase()
       }
       if(item == 'field'){
         req.session.ttable_filter.text.field = req.body.field
       }
       
    }
    
}
module.exports.apply_ttable_filter = function apply_ttable_filter(req, filter) {
   
    let big_tax_list = Object.values(C.taxon_lookup);
    //console.log('olength-0',big_tax_list)
    let vals
    //
    //console.log('req.session.ttable_filter',req.session.ttable_filter)
    if(req.session.ttable_filter){
       //console.log('vals from session ttfilter')
       vals = req.session.ttable_filter
    }else{
        //console.log('vals from default ttfilter')
        vals = helpers_taxa.get_default_tax_filter()
    }
    //console.log('vals',vals)
    //
    // txt_srch
    //console.log('big_tax_list.length-1',big_tax_list.length)
    if(vals.text.txt_srch !== ''){
       big_tax_list = helpers_taxa.get_filtered_taxon_list(big_tax_list, vals.text.txt_srch, vals.text.field)
    }
    //console.log('big_tax_list',big_tax_list[0])
    //console.log('vals',vals)
    ///// status /////
    let status_on = Object.keys(vals.status).filter(item => vals.status[item] == 'on')
    //console.log('status_on',status_on)
    let combo = ''
    big_tax_list = big_tax_list.filter( function filterStatus(item) {
        //console.log('item',item)
        combo = (item.naming_status.split(/(\s+)/)[0] +'_'+item.cultivation_status.split(/(\s+)/)[0]).toLowerCase()
        
        if(item.status =='Dropped'){ // || item.naming_status =='NonOralRef'){
            combo = item.naming_status.toLowerCase()
        }
        //console.log('combo',combo)
        if(status_on.indexOf('dropped') != -1 && item.status =='Dropped'){
            return item
        }else if(status_on.indexOf(combo) !==-1 ){  //818
            //if(vals.status.nonoralref == 'off' && item.status == 'NonOralRef'){
            //if(vals.status.nonoralref == 'on' || item.status != 'NonOralRef'){
            
            //}else{
               return item
            //}
            
        }
        // else if(item.status == 'NonOralRef' && vals.status.nonoralref == 'on'){
//             return item
//         }else if(item.status == 'Dropped' && vals.status.dropped == 'on'){
//             return item
//         }
    })
    //console.log('big_tax_list.length-2',big_tax_list.length)
    //OLD WAY:item => status_on.indexOf(item.status.toLowerCase()) !== -1 )
    //Abundance
     let abund_on = Object.keys(vals.abund).filter(item => vals.abund[item] == 'on')
     //console.log('abundOn',abund_on)
     big_tax_list = big_tax_list.filter( function filterAbundance(item) {
        //console.log('item',C.site_lookup[item.otid])
        if(abund_on.length == 4){
            return item
        }else{
          if(C.site_lookup.hasOwnProperty(item.otid) && C.site_lookup[item.otid].s1){
            let site_item_primary = C.site_lookup[item.otid].s1
            //console.log('site_item_primary',site_item_primary)
            //abundOn [ 'medium_abund', 'low_abund', 'scarce_abund' ]
        
            for(let n in abund_on){
              let test = helpers.capitalizeFirst(abund_on[n].split('_')[0])
              //console.log('test',test)
              if(site_item_primary.includes(test)){
               return item
              }
            }
          }
        }
    })
    //site
    // create array of 'on's
    let site_on = Object.keys(vals.site).filter(item => vals.site[item] == 'on')
    //let site_on = Object.keys(vals.site).filter(item => vals.site[0][helpers.getKeyByValue(C.tax_sites_all,item.sites[0])] == 'on')
     
    // PROBLEM: if there is no entry for a 'new' taxon in the otid_site table the
    // taxon will be excluded here from the taxon table

    //console.log('olength-1',big_tax_list.length)
    //console.log('site_on',site_on)
    //console.log('C.site_lookup[988] ',Object.values(C.site_lookup[988]) )
    
    if(filter && filter.site.p_or_pst == 'primary_site'){
       big_tax_list = big_tax_list.filter( function(item){
         // if(item.otid =='999'){
//            console.log('item.sites999',item)
//          }
         
         for(let n in item.sites){
           //console.log('n',n,'site',item.sites[n])
           //console.log('item.sites',item.sites)
           if(site_on.includes(helpers.getKeyByValue(C.tax_sites_all, item.sites[0]))){
           //if(site_on.includes(item.sites[n].toLowerCase())){
              item.site = item.sites[0]
              
              if(item.otid in C.site_lookup){
                 item.site = C.site_lookup[item.otid].s1
              }
              return item
           }
           
         }
       })
        
    }else{
        //C.site_lookup[1]
        big_tax_list = big_tax_list.filter( function(item){
         //let otid = item.otid
         //console.log('otid',item)
         if(item.otid in C.site_lookup){
           //console.log('looking1')
           let to_include = Object.values(C.site_lookup[item.otid])  // C.site_lookup[559]  [ '', 'Environmental (soil/water)', 'Opportunistic pathogen' ]
           for(let n in site_on){  //'oral', 'nasal', 'skin','gut','vaginal','unassigned','enviro','pathogen'
             let glom = to_include.join(' ').toLowerCase()
             //console.log('site_on[n]',site_on[n],'glom',glom)
             if(glom.includes(site_on[n])){
                //if(site_on.includes(item.sites[n].toLowerCase())){
                 item.site = item.sites[0]
                 return item
             }
           }
         }
       })
    }
    //console.log('big_tax_list.length-3',big_tax_list.length)
    //phylum
    if(vals.phylum != '0'){
       big_tax_list = helpers.filter_for_phylum(big_tax_list, vals.phylum)
    }
  //console.log('olength-2',big_tax_list.length)
  //console.log('vals',vals)
    //
    //letter
    if(vals.letter && vals.letter.match(/[A-Z]{1}/)){   // always caps
      helpers.print(['FILTER::GOT a TaxLetter: ',vals.letter])
       // COOL.... filter the whole list
      big_tax_list = big_tax_list.filter(item => item.genus.toUpperCase().charAt(0) === vals.letter)
    }
    //
    // genomes
    if(vals.genomes == 'wgenomes'){
      big_tax_list = big_tax_list.filter(item => item.genomes.length >0)
    }else if(vals.genomes == 'wogenomes'){
      big_tax_list = big_tax_list.filter(item => item.genomes.length === 0)
    }
    
    big_tax_list.map(function(el){
        // do we have ecology/abundance data?  
        // Is abundance the only thing on the ecology page?
        
        
        if(el.status != 'Dropped'){
              el.subsp = C.taxon_lineage_lookup[el.otid].subspecies || ''
              var node = C.homd_taxonomy.taxa_tree_dict_map_by_name_n_rank[el.genus+' '+el.species+'_species']
              //console.log(el)
              var lineage_list = helpers_taxa.make_lineage(node)

              if( C.taxon_counts_lookup.hasOwnProperty(lineage_list[0]) && C.taxon_counts_lookup[lineage_list[0]].ecology == '1'){
                el.ecology = 1
              }else {
                el.ecology = 0
              }
              
        }
    })
    //console.log('big_tax_list.length-4',big_tax_list.length)
    //sort column
    if(vals.sort_rev === 'on'){
        if(vals.sort_col === 'otid'){
          big_tax_list.sort(function (b, a) {
            return helpers.compareStrings_int(a[vals.sort_col], b[vals.sort_col]);
          })
        }else if(vals.sort_col === 'lineage'){
           //console.log('sorting by lineage')
           big_tax_list.sort(function (b, a) {
                let lin_a = C.taxon_lineage_lookup[a.otid].domain
                let lin_b = C.taxon_lineage_lookup[b.otid].domain
                //,lin_barray = []
                let ranks_tmp = C.ranks.slice(1,)
                for(let n in ranks_tmp){
                    lin_a = lin_a +';'+C.taxon_lineage_lookup[a.otid][ranks_tmp[n]]
                    lin_b = lin_b +';'+C.taxon_lineage_lookup[b.otid][ranks_tmp[n]]
                }
                return helpers.compareStrings_alpha(lin_a, lin_b);
            })
        }else{
          big_tax_list.sort(function (b, a) {
            return helpers.compareStrings_alpha(a[vals.sort_col], b[vals.sort_col]);
          })
        }
    }else{
        if(vals.sort_col === 'genus'){
          big_tax_list.sort(function (a, b) {
            return helpers.compareByTwoStrings_alpha(a, b, 'genus','species');
          })
        }else if(vals.sort_col === 'otid'){
          big_tax_list.sort(function (a, b) {
            return helpers.compareStrings_int(a[vals.sort_col], b[vals.sort_col]);
          })
        }else if(vals.sort_col === 'lineage'){
           //console.log('sorting by lineage')
           big_tax_list.sort(function (a, b) {
                //console.log('a',a)
                //C.taxon_lineage_lookup
                let lin_a = C.taxon_lineage_lookup[a.otid].domain
                let lin_b = C.taxon_lineage_lookup[b.otid].domain
                //,lin_barray = []
                let ranks_tmp = C.ranks.slice(1,)  // remove domain
                for(let n in ranks_tmp){
                    lin_a = lin_a +';'+C.taxon_lineage_lookup[a.otid][ranks_tmp[n]]
                    lin_b = lin_b +';'+C.taxon_lineage_lookup[b.otid][ranks_tmp[n]]
                }
                //console.log('lina',lin_a)
                return helpers.compareStrings_alpha(lin_a, lin_b);
            })
        
        }else{
          //console.log(big_tax_list[0])
          //console.log('sorting by ',vals.sort_col)
          big_tax_list.sort(function (a, b) {
            return helpers.compareStrings_alpha(a[vals.sort_col], b[vals.sort_col]);
          })
        }
    }
    //console.log('big_tax_list.length-5',big_tax_list.length)
    return big_tax_list

}
//

//
module.exports.get_lpsn_outlink1 = function get_lpsn_link(obj1, lineage){
   //console.log('obj',obj1,lineage)
   if(lineage['genus'].includes('[')){
       let gpts = lineage['genus'].split(/\s/)
       let g = gpts.shift()
       
       let l = gpts.length
       //console.log('l',g,l)
       if(l == 1){
           return 'family/'+lineage['family']
       }
       if(l == 2){
           return 'order/'+lineage['order']
       }
       if(l == 3){
           return 'class/'+lineage['klass']
       }
       if(l == 4){
           let ppts = lineage['phylum'].split(/\s/)
           //console.log('l2',lineage['phylum'],ppts)
           if(ppts.length == 2){
              return 'phylum/'+ppts[1]
           }else{
              return 'phylum/'+lineage['phylum']
           }
       }
   }else if(obj1['species'].includes('HMT')){  //Anaerococcus sp. HMT-290
      return 'genus/'+obj1['genus']
   }else{
      return 'species/'+obj1['genus']+'-'+obj1['species']
   }
}

module.exports.get_lpsn_outlink2 = function get_lpsn_link2(rank, lineage, nexttaxname){
   //console.log('obj',rank,lineage,nexttaxname)
   let lpsnrank,linkrank,l,pts,ppts=[]
   if(lineage.hasOwnProperty('phylum')){
       ppts = lineage['phylum'].split(/\s/)
   }
   if(lineage.hasOwnProperty(rank) && lineage[rank].includes('[')){
       pts = lineage[rank].split(/\s/)
       pts.shift()  // shift name off front  'Clostridiales [F3]'
       l = pts.length
       
       if(l == 1){
          linkrank = C.ranks[C.ranks.indexOf(rank) -1]
          lpsnrank = linkrank
          if(linkrank == 'klass'){lpsnrank = 'class'}
          if(ppts.length == 2){return 'phylum/'+ppts[1] }
          return lpsnrank+'/'+lineage[linkrank]
       }
       if(l == 2){
          linkrank = C.ranks[C.ranks.indexOf(rank) -2]
          lpsnrank = linkrank
          //if(linkrank == 'klass'){lpsnrank = 'class'}
          if(ppts.length == 2){return 'phylum/'+ppts[1] }
          return lpsnrank+'/'+lineage[linkrank]
       }
       if(l == 3){
          linkrank = C.ranks[C.ranks.indexOf(rank) -3]
          lpsnrank = linkrank
          //if(linkrank == 'klass'){lpsnrank = 'class'}
          if(ppts.length == 2){return 'phylum/'+ppts[1] }
          return lpsnrank+'/'+lineage[linkrank]
       }
       if(l == 4){
          linkrank = C.ranks[C.ranks.indexOf(rank) -4]
          lpsnrank = linkrank
          //if(linkrank == 'klass'){lpsnrank = 'class'}
          if(ppts.length == 2){return 'phylum/'+ppts[1] }
          return lpsnrank+'/'+lineage[linkrank]
       }
   }else{
       lpsnrank = rank
       if(rank == 'klass'){lpsnrank = 'class'}
       if(ppts.length == 2){
              return 'phylum/'+ppts[1]
       }
       if(!lineage[rank]){
           if(nexttaxname.includes('[')){
               pts = nexttaxname.split(/\s/)
               pts.shift()  // shift name off front  'Clostridiales [F3]'
               l = pts.length
               if(l == 1){
                  linkrank = C.ranks[C.ranks.indexOf(rank) -1]
//                lpsnrank = linkrank
//                if(linkrank == 'klass'){lpsnrank = 'class'}
//                if(ppts.length == 2){return 'phylum/'+ppts[1] }
                  return linkrank+'/'+lineage[linkrank]
               }
               if(l == 2){
                  linkrank = C.ranks[C.ranks.indexOf(rank) -2]
//                lpsnrank = linkrank
//                if(linkrank == 'klass'){lpsnrank = 'class'}
//                if(ppts.length == 2){return 'phylum/'+ppts[1] }
                  return linkrank+'/'+lineage[linkrank]
               }
           }
           if(rank == 'species'){
              return lpsnrank+'/'+nexttaxname.replace(' ','-')
           }
           return lpsnrank+'/'+nexttaxname
       }
       if(lpsnrank == 'species'){
           return lpsnrank+'/'+lineage[rank].replace(' ','-')
        }
       return lpsnrank+'/'+lineage[rank]
   }
   
}
//
////////////
module.exports.make_lineage_string_with_links = function make_lineage_string_with_links(lineage_list, link, page) {
     let tmp = ''
     let i = 0 
     for(let n in lineage_list[1]){
         if(link == 'life'){
           tmp += "<a href='/taxa/"+link+"?rank="+C.ranks[i]+"&name=\""+lineage_list[1][n]+"&page=\""+page+  "\"'>"+lineage_list[1][n]+'</a>; '
         }else{
           if(i === (Object.keys(lineage_list[1])).length - 1){
               tmp += lineage_list[1][n]
           }else{
               tmp += "<a href='/taxa/"+link+"?rank="+C.ranks[i]+"&name="+lineage_list[1][n]+"&page="+page+"'>"+lineage_list[1][n]+'</a>; '
            }
         }
         i += 1
     }
     //console.log(tmp)
     return tmp
}
