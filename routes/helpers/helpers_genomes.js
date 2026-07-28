'use strict'
let router = express.Router();
import C from '../../public/constants.js';
//const queries = require(app_root + '/routes/queries');

import express from 'express';
import fs from 'fs-extra';
import readline from 'readline';
import accesslog from 'access-log';
import async from 'async';
import util from 'util';
import path from 'path';
import { exec, spawn } from 'child_process';
import * as helpers from './helpers.js';
import * as helpers_genomes from './helpers_genomes.js';
import pino from 'pino';
const logger = helpers.pino_conf(pino)


export const get_default_annot_filter = () => {
  let defaultfilter = {
    text: {
      txt_srch: '',
      field: 'all',
    },
    sort_col: 'molecule',
    sort_rev: 'off'
  };
  return defaultfilter;
};

export const get_taxa_wgenomes = () => {
  let alltax_list = Object.values(C.taxon_lookup).filter(item => (item.status.toLowerCase() !== 'dropped'));
  let taxa_wgenomes = alltax_list.filter(item => item.genomes.length > 0);
  return taxa_wgenomes;
};

export const set_gtable_session = (req) => {

  //logger.info('set sess body',req.body)
  //logger.info('xsession',req.session)
  let letter = '0';
  if (req.session.gtable_filter && req.session.gtable_filter.letter) {
    letter = req.session.gtable_filter.letter;
  }
  //req.session.gtable_filter = helpers_genomes.get_default_gtable_filter()
  req.session.gtable_filter = helpers_genomes.get_null_gtable_filter();
  req.session.gtable_filter.letter = letter;
  
  for (let item in req.body) {
    if (item === 'letter') {
      req.session.gtable_filter.letter = req.body.letter;
    }
    if (item === 'sort_col') {
      req.session.gtable_filter.sort_col = req.body.sort_col;
    }
    if (item === 'sort_rev') {
      req.session.gtable_filter.sort_rev = 'on';
    }
    if (item === 'phylum') {
      req.session.gtable_filter.phylum = req.body.phylum;
    }
    if (item === 'txt_srch') {
      req.session.gtable_filter.text.txt_srch = req.body.txt_srch.toLowerCase();
    }
    if (item === 'field') {
      req.session.gtable_filter.text.field = req.body.field;
    }
    if (item === 'paging') {
      req.session.gtable_filter.paging = req.body.paging;
    }
    if (item === 'mags') {
      req.session.gtable_filter.mags = req.body.mags;
    }

    // Genome Level
    let cat_array = ['complete_genome', 'scaffold', 'contig', 'chromosome'];
    for (let item in cat_array) {
      if (Object.prototype.hasOwnProperty.call(req.body, cat_array[item])) {
        req.session.gtable_filter.level[cat_array[item]] = req.body[cat_array[item]];
      }
    }
    // Tax Status
    let status_array = ['named_cultivated', 'named_uncultivated', 'unnamed_cultivated', 'phylotype'];
    for (let item in status_array) {
      if (Object.prototype.hasOwnProperty.call(req.body, status_array[item])) {
        req.session.gtable_filter.status[status_array[item]] = req.body[status_array[item]];
      }
    }
    // Tax Site
    let site_array = ['oral', 'nasal', 'skin', 'gut', 'vaginal', 'unassigned', 'environmental', 'reference', 'pathogen'];
    
    for (let item in site_array) {
      if (Object.prototype.hasOwnProperty.call(req.body, site_array[item])) {
        req.session.gtable_filter.site[site_array[item]] = req.body[site_array[item]];
      }
    }
    // Tax Abundance
    let abund_array = ['high_abund', 'medium_abund', 'low_abund', 'scarce_abund'];
    for (let item in abund_array) {
      if (Object.prototype.hasOwnProperty.call(req.body, abund_array[item])) {
        req.session.gtable_filter.abund[abund_array[item]] = req.body[abund_array[item]];
      }

    }
  }

};

export const init_page_data = () => {
  let page_data = {};
  page_data.rows_per_page = C.PAGER_ROWS;

  return page_data;
};

export const apply_species = (lst) => {
  let otid, sp = '',genus='';
  let subspecies = '';

  for (let i in lst) {
    otid = lst[i].otid;
    //sp = lst[i].species
    //logger.info('otid',otid)
    lst[i].genus = C.taxon_lineage_lookup[otid].genus;
    lst[i].species = C.taxon_lineage_lookup[otid].species;
    lst[i].subspecies = '';
    if (C.taxon_lineage_lookup.hasOwnProperty(otid) && C.taxon_lineage_lookup[otid].subspecies) {
      //subspecies = ' <small>['+C.taxon_lineage_lookup[otid].subspecies+']</small>'
      //lst[i].species = sp + subspecies
      lst[i].subspecies = C.taxon_lineage_lookup[otid].subspecies;
    }
  }
  //logger.info('lst',lst)
  return lst;

};

export const on_paging = (glist, fltr, pd) => {
  let txt = '';
  let cbp = glist.length;
  let ret_obj = helpers_genomes.apply_pages(glist, fltr, pd);
  let sendList = ret_obj.send_list;
  let pageData = ret_obj.page_data;
  let space = '&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;';
  //logger.info('get init pd',page_data)
  //logger.info(page_data)
  if (cbp > sendList.length) {
    //logger.info('must add pager txt')
    txt = "page: <span class='gray'>" + pageData.page + " (of " + pageData.number_of_pages + "p)</span>" + space;
    let next = (pageData.page + 1).toString();
    let prev = (pageData.page - 1).toString();
    txt += "<a href='genome_table?page=" + prev + "'> Previous Page</a>";
    txt += "<==><a href='genome_table?page=" + next + "'>Next Page</a>";
    txt += space + "Jump to Page: <select class='gray' onchange=\"document.location.href='genome_table?page='+this.value\" >";
    for (let i = 1; i <= pageData.number_of_pages; i++) {
      if (i === parseInt(pageData.page)) {
        txt += '<option selected value="' + i + '">pg: ' + i + '</option>';
      } else {
        txt += '<option value="' + i + '">pg: ' + i + '</option>';
      }
    }
    txt += "</select>" + space + "(<a href='genome_table?page=1'>Return to Page1</a>)";
  }

  return { send_list: sendList, page_data: pageData, pager_txt: txt };
};

export const apply_pages = (glist, fltr, pd) => {
  let genomeList;
  const trows = glist.length;
  pd.trecords = trows;
  if (trows > pd.rows_per_page) {


    pd.number_of_pages = Math.ceil(trows / pd.rows_per_page);
    if (pd.page > pd.number_of_pages) { pd.page = 1; }
    if (pd.page < 1) { pd.page = pd.number_of_pages; }
    //helpers.print(['page_data.number_of_pages', pd.number_of_pages])
    pd.show_page = pd.page;
    if (pd.show_page === 1) {

      genomeList = glist.slice(0, pd.rows_per_page); // first 500

      pd.start_count = 1;
    } else {
      genomeList = glist.slice(pd.rows_per_page * (pd.show_page - 1), pd.rows_per_page * pd.show_page); // second 200
      pd.start_count = pd.rows_per_page * (pd.show_page - 1) + 1;
    }
    //logger.info('start count', pageData.start_count)
  } else {

    genomeList = glist;

  }
  return { send_list: genomeList, page_data: pd };
};

export const apply_gtable_filter = (req, filter) => {
  let big_g_list = Object.values(C.genome_lookup);
  //logger.info('big_g_list-0',big_g_list[0])
  
  let vals;
  if (req.session.gtable_filter) {
    vals = req.session.gtable_filter;
  } else {
    vals = helpers_genomes.get_default_gtable_filter();
  }
  ///logger.info('ZZZ Vals',vals)
  // big_g_list.filter(function (item) {
//     if (item.gid === 'GCA_013333485.2') {
//       logger.info('GOOOOD-00',item)
//     }
//   })
  if(vals.text.txt_srch){
    big_g_list = helpers_genomes.get_filtered_genome_list(big_g_list, vals.text.txt_srch, vals.text.field);
  }
  //logger.info("GCA_013333485.2-0",big_g_list.length)
  //letter
  if (vals.letter && vals.letter.match(/[A-Z]{1}/)) { // always caps
    //helpers.print(['FILTER::GOT a TaxLetter: ',vals.letter])
    // COOL.... filter the whole list
    big_g_list = big_g_list.filter(item => item.organism.toUpperCase().charAt(0) === vals.letter);

  }
  //phylum
  if (vals.phylum !== '') {
    big_g_list = helpers.filter_for_phylum(big_g_list, vals.phylum);
  }
//logger.info("GCA_013333485.2-1",big_g_list.length)
  //sort_col
  //logger.info('big_g_list count INIT',big_g_list.length)
  //logger.info('vals',vals)
  if (vals.sort_rev === 'on') {
    //logger.info('REV sorting by ',vals.sort_col,' ',big_g_list.length)
    if (vals.sort_col === 'gid') {
      big_g_list.sort(function (b, a) {
        return helpers.compareStrings_alpha(a.gid, b.gid);
        //return helpers.compareStrings_int(a[vals.sort_col], b[vals.sort_col]);
      });
    } else if (vals.sort_col === 'otid') {
      big_g_list.sort(function (b, a) {
        return helpers.compareStrings_int(a.otid, b.otid);
      });
    } else if (vals.sort_col === 'strain') {
      big_g_list.sort(function (b, a) {
        return helpers.compareStrings_alpha(a.strain, b.strain);
        //return helpers.compareStrings_int(a[vals.sort_col], b[vals.sort_col]);
      });
    } else if (vals.sort_col === 'level') {
      big_g_list.sort(function (b, a) {
        return helpers.compareStrings_alpha(a.level, b.level);
        //return helpers.compareStrings_int(a[vals.sort_col], b[vals.sort_col]);
      });
    } else if (vals.sort_col === 'mag') {
      big_g_list.sort(function (b, a) {
        return helpers.compareStrings_alpha(a.mag, b.mag);
        //return helpers.compareStrings_int(a[vals.sort_col], b[vals.sort_col]);
      });
    } else if (vals.sort_col === 'contigs') {
      big_g_list.sort(function (b, a) {
        return helpers.compareStrings_int(a.contigs, b.contigs);
      });
    } else if (vals.sort_col === 'combined_size') {
      big_g_list.sort(function (b, a) {
        return helpers.compareStrings_int(a.combined_size, b.combined_size);
      });
    } else if (vals.sort_col === 'gc') {

      big_g_list.sort(function (b, a) {
        return helpers.compareStrings_float(a[vals.sort_col], b[vals.sort_col]);
      });
    } else {
      // default: sort by organism
      big_g_list.sort(function (b, a) {
        return helpers.compareStrings_alpha(a.organism, b.organism);
      });
    }

  } else {
    //logger.info('FWD sorting by ',vals.sort_col,' ',big_g_list[0])
    if (vals.sort_col === 'gid') {
      big_g_list.sort(function (a, b) {
        return helpers.compareStrings_alpha(a.gid, b.gid);
      });
    } else if (vals.sort_col === 'otid') {
      big_g_list.sort(function (a, b) {
        return helpers.compareStrings_int(a.otid, b.otid);
      });
    } else if (vals.sort_col === 'strain') {
      big_g_list.sort(function (a, b) {
        return helpers.compareStrings_alpha(a.strain, b.strain);
        //return helpers.compareStrings_int(a[vals.sort_col], b[vals.sort_col]);
      });
    } else if (vals.sort_col === 'level') {
      big_g_list.sort(function (a, b) {
        return helpers.compareStrings_alpha(a.level, b.level);
        //return helpers.compareStrings_int(a[vals.sort_col], b[vals.sort_col]);
      });
    } else if (vals.sort_col === 'mag') {
      big_g_list.sort(function (a, b) {
        return helpers.compareStrings_alpha(a.mag, b.mag);
        //return helpers.compareStrings_int(a[vals.sort_col], b[vals.sort_col]);
      });
    } else if (vals.sort_col === 'contigs') {
      big_g_list.sort(function (a, b) {
        return helpers.compareStrings_int(a.contigs, b.contigs);
      });
    } else if (vals.sort_col === 'combined_size') {
      big_g_list.sort(function (a, b) {
        //logger.info('a.combined_size',a.combined_size)
        return helpers.compareStrings_int(a.combined_size, b.combined_size);
      });
    } else if (vals.sort_col === 'gc') {
      //logger.info('sortgc1',big_g_list[0],big_g_list[1],big_g_list[2],big_g_list[3])
      big_g_list.sort(function (a, b) {
        return helpers.compareStrings_float(a[vals.sort_col], b[vals.sort_col]);
      });
      //logger.info('sortgc2',big_g_list[0],big_g_list[1],big_g_list[2],big_g_list[3])
    } else {
      // default: sort by organism
      big_g_list.sort(function (a, b) {
        return helpers.compareStrings_alpha(a.organism, b.organism);
      });
    }
  }
  //logger.info('big_g_list count 2',big_g_list.length)
  //logger.info("GCA_013333485.2-2",big_g_list.length)
  // Assembly Level
  let level_on = Object.keys(vals.level).filter(item => vals.level[item] === 'on');
  //logger.info('vals',vals)
  //logger.info('level_on',level_on)
  big_g_list = big_g_list.filter(function (item) {
    if (level_on.includes(helpers.getKeyByValue(C.genome_level_all, item.level))) {
      return item;
    }
  });
//logger.info("GCA_013333485.2-3",big_g_list.length)
  // ADV::Tax Status ////////////////////////////////////////////////
  let status_on = Object.keys(vals.status).filter(item => vals.status[item] === 'on');
  
  
  
  let default_length_of_status = 4;  // default should be 4 exclude dropped
  
  
  big_g_list = big_g_list.filter(function (item) {
    if (status_on.length === default_length_of_status) {
      return item;
    } else {
      //logger.info('Status',C.site_lookup[item.otid].s1)
      let status
      
      //first_part=['named','unnamed','phylotype']
      //second_part=['cultivated','uncultivated']
      let nstatus = C.taxon_lookup[item.otid].naming_status.toLowerCase()
      let cstatus = C.taxon_lookup[item.otid].cultivation_status.toLowerCase()
      if(nstatus == 'phylotype'){
        status='phylotype'
      }else if(nstatus.slice(0,5) === 'named'){  // this catches named** and name NVP
        status='named_'+cstatus
      }else if(nstatus.slice(0,7) === 'unnamed'){
        status='unnamed_'+cstatus
      }else{
         logger.warn('XXXX WARNING:: nstatus: '+nstatus+' cstatus: '+cstatus)
      }
      
      
      //logger.info('status',status)
      if (status_on.includes(status)) {
        return item;
      }
    }

  });


//logger.info('big_g_list count 3',big_g_list.length)
  //logger.info("GCA_013333485.2-4",big_g_list.length)
  //  big_g_list.filter(function (item) {
//     if (item.gid === 'GCA_013333485.2') {
//       logger.info('GOOOOD',item)
//     }
//})
  
  // ADV::Tax Sites ////////////////////////////////////////////////
  let site_on = Object.keys(vals.site).filter(item => vals.site[item] === 'on');
  
  //logger.info('site_on',site_on)
  //logger.info('big_g_list[]',big_g_list[0])
  big_g_list = big_g_list.filter(function (item) {
    if (site_on.length === C.default_site_on.length) {
      return item;
    } else {
      //logger.info('Sites:',C.site_lookup[item.otid].s1)
      //logger.info('Sites2:', C.taxon_lookup[item.otid].sites[0].toLowerCase());
      let site = C.taxon_lookup[item.otid].sites[0].toLowerCase();
      //logger.info('site',site)
      if (site_on.includes(site)) {
        return item;
      }
    }

  });
  //logger.info('big_g_list count 3b',big_g_list.length)
  // ADV::Tax Abundance ////////////////////////////////////////////////
  //logger.info('vals',vals)
  let abund_on = Object.keys(vals.abund).filter(item => vals.abund[item] === 'on');
  let default_length_of_abund = 4;
  //logger.info('abundOn',abund_on)
  big_g_list = big_g_list.filter(function filterAbundance(item) {
    //logger.info('item',C.site_lookup[item.otid])
    if (abund_on.length === default_length_of_abund) {
      return item;
    } else {
      if (C.site_lookup.hasOwnProperty(item.otid) && C.site_lookup[item.otid].s1) {
        let site_item_primary = C.site_lookup[item.otid].s1;
        //logger.info('site_item_primary',site_item_primary)
        //abundOn [ 'medium_abund', 'low_abund', 'scarce_abund' ]
        for (let n in abund_on) {
          let high_to_scarce = helpers.capitalizeFirst(abund_on[n].split('_')[0]);
          
          if (site_item_primary.includes(high_to_scarce)) {
            return item;
          }
        }
      }
    }
  });
  
  // MAGs /////////////////////////////////////////////////
  
  big_g_list = big_g_list.filter(function filterMAGs(item) {
    
    if (vals.mags === 'no_mags') {
      if (item.mag === '') {
        return item;
      }
    } else if (vals.mags === 'only_mags') {
      if (item.mag === 'yes') {
        return item;
      }
    } else {
      return item;
    }

  });
  
  /// OTID ///
  big_g_list = big_g_list.filter(function filterOTIDs(item) {
    
    if (vals.otid === ''){ 
        return item;
    }else{
      if( parseInt(vals.otid) === parseInt(item.otid) ){
        return item;
      }
    }

  });
  logger.info(`big_g_list length: ${big_g_list.length}`)
  return big_g_list;
};

export const get_filtered_genome_list = (gidObjList, searchText, searchField) => {
  logger.info('in get_filtered_genome_list')
  let sendList, tmpSendList;
  const tempObj = {};
  
  if (searchField === 'strain') {
    sendList = gidObjList.filter(item => item.strain.toLowerCase().includes(searchText));

  } else {
    // tmpSendList = gidObjList.filter(item => item.gb_asmbly.toLowerCase().includes(searchText))
    //     for (let n in tmpSendList) {
    //       tempObj[tmpSendList[n].gid] = tmpSendList[n]
    //     }
    
    // gid
    //logger.info('searchText',searchText)
    tmpSendList = gidObjList.filter(item => item.gid.toLowerCase().includes(searchText));
    for (let n in tmpSendList) {
      tempObj[tmpSendList[n].gid] = tmpSendList[n];
    }
    
    if(searchText.slice(0, 3) === 'hmt'){ 
        let pototid = parseInt(searchText.slice(3).replace('-','').replace('_',''))
        tmpSendList = gidObjList.filter(item => {
            //logger.info('pototid',pototid)
            if(pototid && item.otid == pototid){
                //logger.info('item',item)
                return item
            }
        });
        
    }else{
        tmpSendList = gidObjList.filter(item => item.otid.toString().toLowerCase().includes(searchText));
    }
    
    
    
    // for uniqueness convert to object::otid THIS is WRONG: Must be gid
    for (let n in tmpSendList) {
      tempObj[tmpSendList[n].gid] = tmpSendList[n];
    }
    
    //Species
    tmpSendList = gidObjList.filter(item => item.organism.toLowerCase().includes(searchText));
    // for uniqueness convert to object::gid
    for (let n in tmpSendList) {
      tempObj[tmpSendList[n].gid] = tmpSendList[n];
    }
    
    // Strain
    tmpSendList = gidObjList.filter(item => item.strain.toLowerCase().includes(searchText));
    // for uniqueness convert to object::gid
    for (let n in tmpSendList) {
      tempObj[tmpSendList[n].gid] = tmpSendList[n];
    }

    
    // now back to a list
    sendList = Object.values(tempObj);
  }
  return sendList;
};

export const get_default_gtable_filter = () => {
  let defaultfilter = {
    gid: '',
    otid: '',
    phylum: '',
    text: {
      txt_srch: '',
      field: 'all',
    },
    letter: '0',
    sort_col: 'organism',
    sort_rev: 'off',
    paging: 'on',
    mags: 'default',
    level: {
      complete_genome: 'on',
      scaffold: 'on',
      contig: 'on',
      chromosome: 'on'
    },

    // Taxa Items
    status: {
      named_cultivated: 'on',
      named_uncultivated: 'on',
      unnamed_cultivated: 'on',
      phylotype: 'on',
      //dropped: 'on',
      //nonoralref:'off'
    },
    site: {
      oral: 'on',
      nasal: 'on',
      skin: 'on',
      gut: 'on',
      vaginal: 'on',
      unassigned: 'on',
      environmental: 'on',
      reference: 'on',
      pathogen: 'on'
      //p_or_pst    :'primary_site'
    },
    abund: {
      high_abund: 'on',
      medium_abund: 'on',
      low_abund: 'on',
      scarce_abund: 'on'
    },
  };
  return defaultfilter;
};

export const get_null_gtable_filter = () => {
  let defaultfilter = {
    gid: '',
    otid: '',
    phylum: '',
    text: {
      txt_srch: '',
      field: 'all',
    },
    letter: '0',
    sort_col: 'organism',
    sort_rev: 'off',
    paging: 'on',
    mags: 'default',
    level: {
      complete_genome: 'off',
      scaffold: 'off',
      contig: 'off',
      chromosome: 'off'
    },

    // Taxa Items
    status: {
      named_cultivated: 'off',
      named_uncultivated: 'off',
      unnamed_cultivated: 'off',
      phylotype: 'off',
      //dropped: 'off',
      //nonoralref:'off'
    },
    site: {
      oral: 'off',
      nasal: 'off',
      skin: 'off',
      gut: 'off',
      vaginal: 'off',
      unassigned: 'off',
      environmental: 'off',
      reference: 'off',
      pathogen: 'off'
      //p_or_pst    :'primary_site'
    },
    abund: {
      high_abund: 'off',
      medium_abund: 'off',
      low_abund: 'off',
      scarce_abund: 'off'
    },
  };
  return defaultfilter;
};

export const get_checkm_status = (ginfo) => {
    //logger.info('in checkM')
    //logger.info('1',ginfo.checkM_completeness,ginfo.checkM_contamination)
    //logger.info('2',ginfo.checkM2_completeness,ginfo.checkM2_contamination)
    let pct_dif_comp,pct_dif_cont
    if(!ginfo.checkM_completeness){ginfo.checkM_completeness = 0}
    if(!ginfo.checkM2_completeness){ginfo.checkM2_completeness = 0}
    if(ginfo.checkM_completeness==0 && ginfo.checkM2_completeness==0){
        pct_dif_cont = 0
    }else{
        let dif1 = Math.abs(parseFloat(ginfo.checkM_completeness) - parseFloat(ginfo.checkM2_completeness))
        let avg1 = (parseFloat(ginfo.checkM_completeness) + parseFloat(ginfo.checkM2_completeness))/2
        pct_dif_comp = (dif1 / avg1 )*100
    }
    if(!pct_dif_comp){
         pct_dif_comp = 0
    }
    if(!ginfo.checkM_contamination){ginfo.checkM_contamination = 0}
    if(!ginfo.checkM2_contamination){ginfo.checkM2_contamination = 0}
    if(ginfo.checkM_contamination==0 && ginfo.checkM2_contamination==0){
        pct_dif_cont = 0
    }else{
        let dif2 = Math.abs(parseFloat(ginfo.checkM_contamination) - parseFloat(ginfo.checkM2_contamination))
        let avg2 = (parseFloat(ginfo.checkM_contamination) + parseFloat(ginfo.checkM2_contamination))/2
        pct_dif_cont = (dif2 / avg2 )*100
    }
    if(!pct_dif_cont){
         pct_dif_cont = 0
    }
    return {cont_dif:pct_dif_cont, comp_dif:pct_dif_comp}

};

export default router;