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
const helpers_genomes = require(app_root + '/routes/helpers/helpers_genomes');
//let hmt = 'HMT-'+("000" + otid).slice(-3)

module.exports.apply_gtable_filter = function apply_gtable_filter(req, filter) {
    let big_g_list = Object.values(C.genome_lookup);
    //console.log('big_g_list-0',big_g_list[0])
    let vals
    if(req.session.gtable_filter){
       vals = req.session.gtable_filter
    }else{
        vals = helpers.get_default_gtable_filter()
    }
    
    big_g_list = helpers_genomes.get_filtered_genome_list(big_g_list, vals.text.txt_srch, vals.text.field)
   
    //letter
    if(vals.letter && vals.letter.match(/[A-Z]{1}/)){   // always caps
      //helpers.print(['FILTER::GOT a TaxLetter: ',vals.letter])
       // COOL.... filter the whole list
      big_g_list = big_g_list.filter(item => item.organism.toUpperCase().charAt(0) === vals.letter)
      
    }
    //phylum
    
    if(vals.phylum  !== ''){
       big_g_list = helpers.filter_for_phylum(big_g_list, vals.phylum)
    }
    
    //sort_col
    if(vals.sort_rev === 'on'){
        //console.log('REV sorting by ',vals.sort_col,' ',big_g_list.length)
        if(vals.sort_col === 'gid'){
          big_g_list.sort(function (b,a) {
            return helpers.compareStrings_alpha(a.gid,b.gid);
            //return helpers.compareStrings_int(a[vals.sort_col], b[vals.sort_col]);
          })
        }else if(vals.sort_col === 'otid'){
          big_g_list.sort(function (b,a) {
            return helpers.compareStrings_int(a.otid, b.otid);
          })
        }else if(vals.sort_col === 'strain'){
          big_g_list.sort(function (b,a) {
            return helpers.compareStrings_alpha(a.strain,b.strain);
            //return helpers.compareStrings_int(a[vals.sort_col], b[vals.sort_col]);
          })
        }else if(vals.sort_col === 'level'){
          big_g_list.sort(function (b,a) {
            return helpers.compareStrings_alpha(a.level,b.level);
            //return helpers.compareStrings_int(a[vals.sort_col], b[vals.sort_col]);
          })
        }else if(vals.sort_col === 'mag'){
          big_g_list.sort(function (b,a) {
            return helpers.compareStrings_alpha(a.mag,b.mag);
            //return helpers.compareStrings_int(a[vals.sort_col], b[vals.sort_col]);
          })
        }else if(vals.sort_col === 'contigs'){
          big_g_list.sort(function (b,a) {
            return helpers.compareStrings_int(a.contigs, b.contigs);
          })
        }else if(vals.sort_col === 'combined_size'){
          big_g_list.sort(function (b,a) {
            return helpers.compareStrings_int(a.combined_size, b.combined_size);
          })
        }else if(vals.sort_col === 'gc'){
          
          big_g_list.sort(function (b,a) {
            return helpers.compareStrings_float(a[vals.sort_col], b[vals.sort_col]);
          })
         
          
        }else{
          // default: sort by organism
          big_g_list.sort(function (b,a) {
            return helpers.compareStrings_alpha(a.organism, b.organism);
          })
        }
        
    }else{
        //console.log('FWD sorting by ',vals.sort_col,' ',big_g_list[0])
        if(vals.sort_col === 'gid'){
          
          big_g_list.sort(function (a, b) {
            return helpers.compareStrings_alpha(a.gid,b.gid);
            
            
          })
        }else if(vals.sort_col === 'otid'){
          big_g_list.sort(function (a, b) {
            return helpers.compareStrings_int(a.otid, b.otid);
          })
        }else if(vals.sort_col === 'strain'){
          big_g_list.sort(function (a, b) {
            return helpers.compareStrings_alpha(a.strain,b.strain);
            //return helpers.compareStrings_int(a[vals.sort_col], b[vals.sort_col]);
          })
        }else if(vals.sort_col === 'level'){
          big_g_list.sort(function (a, b) {
            return helpers.compareStrings_alpha(a.level,b.level);
            //return helpers.compareStrings_int(a[vals.sort_col], b[vals.sort_col]);
          })
        }else if(vals.sort_col === 'mag'){
          big_g_list.sort(function (a,b) {
            return helpers.compareStrings_alpha(a.mag,b.mag);
            //return helpers.compareStrings_int(a[vals.sort_col], b[vals.sort_col]);
          })
        }else if(vals.sort_col === 'contigs'){
          big_g_list.sort(function (a, b) {
            return helpers.compareStrings_int(a.contigs, b.contigs);
          })
        }else if(vals.sort_col === 'combined_size'){
          big_g_list.sort(function (a, b) {
            //console.log('a.combined_size',a.combined_size)
            return helpers.compareStrings_int(a.combined_size, b.combined_size);
          })
        }else if(vals.sort_col === 'gc'){
          //console.log('sortgc1',big_g_list[0],big_g_list[1],big_g_list[2],big_g_list[3])
          big_g_list.sort(function (a, b) {
            return helpers.compareStrings_float(a[vals.sort_col], b[vals.sort_col]);
          })
          //console.log('sortgc2',big_g_list[0],big_g_list[1],big_g_list[2],big_g_list[3])
          
        }else{
          // default: sort by organism
          big_g_list.sort(function (a, b) {
            return helpers.compareStrings_alpha(a.organism, b.organism);
          })
        }
    }
    // Assembly Level
    let level_on = Object.keys(vals.level).filter(item => vals.level[item] == 'on')
    //console.log('vals',vals)

    //console.log('level_on',level_on)
    big_g_list = big_g_list.filter( function(item){
        if(level_on.includes(helpers.getKeyByValue(C.genome_level_all, item.level))){
            return item
        }
    })
       
    // ADV::Tax Status ////////////////////////////////////////////////
    let status_on = Object.keys(vals.status).filter(item => vals.status[item] == 'on')
    //console.log('status_on',status_on)
    //console.log('big_g_list[0]',big_g_list[0])
    let default_length_of_status = 5
    big_g_list = big_g_list.filter( function(item) {
         if(status_on.length == default_length_of_status){
            return item
         }else{

           
           //console.log('Status',C.site_lookup[item.otid].s1)
           let status = (C.taxon_lookup[item.otid].naming_status +'_'+ C.taxon_lookup[item.otid].cultivation_status).toLowerCase()
           //console.log('status',status)
           if(status_on.includes(status)){
              return item
           }
         }
         
    })
    // ADV::Tax Sites ////////////////////////////////////////////////
    let site_on = Object.keys(vals.site).filter(item => vals.site[item] == 'on')
    let default_length_of_site = 9
    console.log('site_on',site_on)
    //console.log('big_g_list[]',big_g_list[0])
    big_g_list = big_g_list.filter( function(item) {
         if(site_on.length == default_length_of_site){
            return item
         }else{
           //console.log('Sites:',C.site_lookup[item.otid].s1)
           console.log('Sites2:',C.taxon_lookup[item.otid].sites[0].toLowerCase())
           let site = C.taxon_lookup[item.otid].sites[0].toLowerCase()
           //console.log('site',site)
           if(site_on.includes(site)){
            return item
           }
         }
         
    })
    // ADV::Tax Abundance ////////////////////////////////////////////////
    //console.log('vals',vals)
    let abund_on = Object.keys(vals.abund).filter(item => vals.abund[item] == 'on')
    let default_length_of_abund = 4
    //console.log('abundOn',abund_on)
    big_g_list = big_g_list.filter( function filterAbundance(item) {
        //console.log('item',C.site_lookup[item.otid])
        if(abund_on.length == default_length_of_abund){
            return item
        }else{
          if(C.site_lookup.hasOwnProperty(item.otid) && C.site_lookup[item.otid].s1){
            let site_item_primary = C.site_lookup[item.otid].s1
            //console.log('site_item_primary',site_item_primary)
            //abundOn [ 'medium_abund', 'low_abund', 'scarce_abund' ]
        
            for(let n in abund_on){
              let high_to_scarce = helpers.capitalizeFirst(abund_on[n].split('_')[0])
              //console.log('test',high_to_scarce)
              if(site_item_primary.includes(high_to_scarce)){
               return item
              }
            }
          }
        }
    })
    // MAGs /////////////////////////////////////////////////
    console.log('vals',vals)
    big_g_list = big_g_list.filter( function filterMAGs(item) {
       //console.log('item',item)
       if(vals.mags == 'no_mags'){
           if(item.mag == ''){
              return item
           }
       }else if(vals.mags == 'only_mags'){
           if(item.mag == 'yes'){
              return item
           }
       }else{
           return item
       }
    
    })
    return big_g_list
}
module.exports.get_filtered_genome_list =function getFilteredGenomeList (gidObjList, searchText, searchField) {
  let sendList, tmpSendList
  const tempObj = {}
  
  //console.log('gidObjList',gidObjList)
  if (searchField === 'strain') {
    sendList = gidObjList.filter(item => item.strain.toLowerCase().includes(searchText))

  } else {
    // tmpSendList = gidObjList.filter(item => item.gb_asmbly.toLowerCase().includes(searchText))
//     for (let n in tmpSendList) {
//       tempObj[tmpSendList[n].gid] = tmpSendList[n]
//     }
     // gid
    //console.log('searchText',searchText)
    tmpSendList = gidObjList.filter(item => item.gid.toLowerCase().includes(searchText))
    for (let n in tmpSendList) {
      tempObj[tmpSendList[n].gid] = tmpSendList[n]
    }
    //otid
    tmpSendList = gidObjList.filter(item => item.otid.toString().includes(searchText))
    // for uniqueness convert to object::otid THIS is WRONG: Must be gid
    for (let n in tmpSendList) {
      tempObj[tmpSendList[n].gid] = tmpSendList[n]
    }
    tmpSendList = gidObjList.filter(item => item.organism.toLowerCase().includes(searchText))
        // for uniqueness convert to object::gid
        for (let n in tmpSendList) {
          tempObj[tmpSendList[n].gid] = tmpSendList[n]
        }
        // species
    
    

    // culture collection
    tmpSendList = gidObjList.filter(item => item.strain.toLowerCase().includes(searchText))
    // for uniqueness convert to object::gid
    for (let n in tmpSendList) {
      tempObj[tmpSendList[n].gid] = tmpSendList[n]
    }

    for (let n in tmpSendList) {
      tempObj[tmpSendList[n].gid] = tmpSendList[n]
    }
    // now back to a list
    sendList = Object.values(tempObj)
  }
  return sendList
}

module.exports.get_default_gtable_filter = function get_default_gtable_filter(){
    let defaultfilter = {
        gid:'',
        otid:'',
        phylum:'',
        text:{
            txt_srch: '',
            field: 'all',
        },
        letter: '0',
        sort_col: 'organism',
        sort_rev: 'off',
        paging:'on',
        mags:'default',
        level:{
            complete_genome:'on',
            scaffold:'on',
            contig:'on',
            chromosome:'on'
        },
        
        // Taxa Items
        status:{
            named_cultivated:'on',
            named_uncultivated:'on',
            unnamed_cultivated: 'on',
            unnamed_uncultivated: 'on',
            dropped:'on',
            //nonoralref:'off'
            
        },
        site:{
           oral:'on',
           nasal:'on',
           skin:'on',
           gut:'on',
           vaginal:'on',
           unassigned:'on',
           enviro      :'on',
           ref         :'on',
           pathogen    :'on'
           //p_or_pst    :'primary_site'
        },
        abund:{
           high_abund:'on',
           medium_abund:'on',
           low_abund:'on',
           scarce_abund:'on'
        },

    }
    return defaultfilter
}
module.exports.get_null_gtable_filter = function get_null_gtable_filter(){
    let defaultfilter = {
        gid:'',
        otid:'',
        phylum:'',
        text:{
            txt_srch: '',
            field: 'all',
        },
        letter: '0',
        sort_col: 'organism',
        sort_rev: 'off',
        paging:'on',
        mags:'default',
        level:{
            complete_genome:'off',
            scaffold:'off',
            contig:'off',
            chromosome:'off'
        },
        
        // Taxa Items
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
           pathogen    :'off'
           //p_or_pst    :'primary_site'
        },
        abund:{
           high_abund:'off',
           medium_abund:'off',
           low_abund:'off',
           scarce_abund:'off'
        },
    }
    return defaultfilter
}
// module.exports.gtfilter_for_phylum = function gtfilter_for_phylum(glist, phy){
//     
//     //console.log('glist[0]',glist[0])
//     //var lineage_list = Object.values(C.taxon_lineage_lookup)
//     //var obj_lst = lineage_list.filter(item => item.phylum === phy)  //filter for phylum 
//     //console.log('obj_lst',obj_lst)
//     //var otid_list = glist.map( (el) =>{  // get list of otids with this phylum
//     //    return el.otid
//     //})
//     //let otid_grabber = {}
//     let gid_obj_list = glist.filter(item => {   // filter genome obj list for inclusion in otid list
//         if(C.taxon_lineage_lookup.hasOwnProperty(item.otid) && C.taxon_lineage_lookup[item.otid].phylum == phy){
//             return true
//         }
//     })
//     //console.log('otid_grabber',otid_grabber)
//     //console.log('gid_obj_list',gid_obj_list)
//     // now get just the otids from the selected gids
//     //gid_obj_list.map( (el) =>{ return el.otid })
//     return gid_obj_list
// }