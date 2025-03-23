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
       big_g_list = filter_for_phylum(big_g_list, vals.phylum)
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
        }else if(vals.sort_col === 'category'){
          big_g_list.sort(function (b,a) {
            return helpers.compareStrings_alpha(a.category,b.category);
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
        }else if(vals.sort_col === 'category'){
          big_g_list.sort(function (a, b) {
            return helpers.compareStrings_alpha(a.category,b.category);
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
    // Category
    let category_on = Object.keys(vals.category).filter(item => vals.category[item] == 'on')
    //console.log('vals',vals)
    //console.log('category_on',category_on)
    
    
    big_g_list = big_g_list.filter( function(item){

           if(category_on.includes(helpers.getKeyByValue(C.genome_categories_all, item.category))){
           
              
              return item
           }
           
         //}
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
        category:{
            complete_genome:'on',
            scaffold:'on',
            contig:'on',
            chromosome:'on',
            mag:'on'
        }
    }
    return defaultfilter
}