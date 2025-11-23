'use strict'

const router = express.Router()
import C from '../../public/constants.js';
//const queries = require(app_root + '/routes/queries');

import express from 'express';
import fs from 'fs-extra';
import readline from 'readline';
//import accesslog from 'access-log';
import async from 'async';
import util from 'util';
import path from 'path';
import { exec, spawn } from 'child_process';
//import helpers from './helpers.js';
import  * as helpers_taxa from './helpers_taxa.js'
//let hmt = 'HMT-'+("000" + otid).slice(-3)

export const getKeyByValue = (object, value) => {
  return Object.keys(object).find(key => object[key] === value);
};

export const timestamp = (dateonly) => {
    //let today = new Date().toUTCString();
  if(dateonly){
      return new Date().toISOString().substring(0,10)
  }else{
      return new Date().toISOString()
  }
    

};

export const get_today_obj = () => {
  let today = new Date()
    let dd = String(today.getDate()).padStart(2, '0')
    let mm = String(today.getMonth() + 1).padStart(2, '0') // January is 0!
    let yyyy = today.getFullYear()
    today = yyyy + '-' + mm + '-' + dd
    let currentTimeInSeconds=Math.floor(Date.now()/1000) // unix timestamp in seconds
    return {today:today,seconds:currentTimeInSeconds,day:dd,month:mm,year:yyyy}
};

export const log_timestamp = () => {
  let date = new Date();
  let day  = date.toLocaleDateString();
  let time = date.toLocaleTimeString();
  return day + " " + time;
};

// todo: use in file instead of those in the class
export const check_if_rank = (field_name) => {

  let ranks = C.ranks;

  // ranks = ["domain","phylum","klass","order","family","genus","species","strain"]
  return ranks.includes(field_name);
};

export const compareStrings_alpha = (a, b) => {
  // Assuming you want case-insensitive comparison
  a = a.toLowerCase();
  b = b.toLowerCase();
  return (a < b) ? -1 : (a > b) ? 1 : 0;
  
};

export const compareByTwoStrings_alpha = (a, b, colA, colB) => {
  // Assuming you want case-insensitive comparison
  // eg: 
  //a = a.toLowerCase();
  //b = b.toLowerCase();
  if (a[colA].toLowerCase() === b[colA].toLowerCase()){
    return a[colB] < b[colB] ? -1 : 1
  } else {
    return a[colA] < b[colA] ? -1 : 1
  }
  
};

// Sort list of json objects numerically
export const compareStrings_int = (a, b) => {
  
  let numa = parseInt(a.toString().replaceAll(',',''))
  let numb = parseInt(b.toString().replaceAll(',',''))
  //console.log('numa',numa)
  
  return (numa < numb) ? -1 : (numa > numb) ? 1 : 0;
};

export const compareStrings_float = (a, b) => {
  if(!a){a=0}
  if(!b){b=0}
  a = parseFloat(a);
  b = parseFloat(b);
  return (a < b) ? -1 : (a > b) ? 1 : 0;
};

export const show_session = (req) =>{
  console.log('(Availible for when sessions are needed) req.session: ')
    //console.log('req.session',req.session)
    //console.log('req.sessionID',req.sessionID)
    console.log('req.session.id',req.session.id)
};

// export const accesslog = (req, res) =>{
//     console.log('ip',req.ip)
//     accesslogx(req, res, 'RemoteIP:'+req.ip+':'+ C.access_log_format, function(s) {
//        let testout = 'Request from:'+req.ip+ s+'\n'
//        console.log(testout);
//         fs.appendFile(C.access_logfile, s+'\n', err => {
//              if (err) {
//                  console.error(err)
//                  return
//              }
//              //file written successfully
//          })
//     });
// };
export const accesslog = (req, res) => {
       let testout = 'Request from:'+req.ip+'\n'
       //console.log(C.access_logfile);
        fs.appendFile(C.access_logfile, testout, err => {
             if (err) {
                 console.error(err)
                 return
             }
             //file written successfully
         })
};
export const chunkSubstr = (str, size) =>{
  //https://stackoverflow.com/questions/7033639/split-large-string-in-n-size-chunks-in-javascript
  const numChunks = Math.ceil(str.length / size)
  const chunks = new Array(numChunks)

  for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
    chunks[i] = str.substr(o, size)
  }

  return chunks
};

//
export const format_long_numbers = (x) =>{
    // change 456734 => 456,734
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const format_Mbps = (x) =>{ // mega base pairs
    // change 456734 => 456,734
    return (parseFloat(x) /1000000).toFixed(2).toString() +' Mbps'
};

export const format_MB = (x) =>{ // mega bytes
    // change 456734 => 456,734
    return (parseFloat(x) /1000000).toFixed(3).toString() +' MB'
};

export const get_min = (ary) => {
  let ret = ary[0];
  for (let i = 0; i < ary.length; i++) {
    if (ary[i] < ret) {
      ret = ary[i];
    }
  }
  return ret;
};

export const get_max = (ary) => {
  let ret = 0;
  for (let i = 0; i < ary.length; i++) {
    if (ary[i] > ret) {
      ret = ary[i];
    }
  }
  return ret;
};

//
export const onlyUnique = (value, index, self) =>{
  return self.indexOf(value) === index;
};

export const capitalizeFirst = (value, index, self) =>{
  return value.charAt(0).toUpperCase() + value.slice(1)
};

export const print_size = (obj, index, self) =>{
  let size = Buffer.byteLength(JSON.stringify(C.taxon_lookup))
    //console.log('C.taxon_lookup length:',Object.keys(C.taxon_lookup).length,'\t\tsize(KB):',size/1024)
};

export const make_otid_display_name = (otid) =>{
    return 'HMT-'+("000" + otid.toString()).slice(-3);
};

export const addslashes = (str) => (str + '').replace(/[\]\[\\"']/g, '\\$&');
export const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));

export const getAllDirFiles = (dirPath, arrayOfFiles) => {
  arrayOfFiles = {};
  arrayOfFiles.files = [];
  arrayOfFiles.dirs = [];
  let excludeddirs = ['users'];
  try {
    const files = fs.readdirSync(dirPath);

    files.forEach(function getFilesArray(file) {
      let stats = fs.statSync(dirPath + "/" + file);
      let unixFilePermissions = '0' + (stats.mode & parseInt('777', 8)).toString(8);
      //console.log(file,unixFilePermissions,stats)
      if (stats.mode & (fs.constants.S_IRUSR | fs.constants.S_IRGRP | fs.constants.S_IROTH)) {

        if (stats.isDirectory()) {
          if (excludeddirs.indexOf(file) === -1) {
            //arrayOfFiles = getAllDirFiles(dirPath + "/" + file, arrayOfFiles)
            arrayOfFiles.dirs.push({ name: file, src: dirPath + "/" + file, type: 'dir' });
          }
        } else {
          arrayOfFiles.files.push({ name: file, src: dirPath + "/" + file, type: 'file' });
        }
      }
    });
    return arrayOfFiles;
  } catch (e) {
    return 0;
  }

};

// module.exports.readAsync = async function readAsync(file, callback) {
//     if(ENV.ENV === 'development'){
//         console.log('Reading File:',file)
//     }
//     module.exports.print(['Reading File:',file])
//     try {
//       if (fs.existsSync(file)) {
//     //file exists
//       }
//     } catch(err) {
//       console.error(err)
//     }
//     
//     //await module.exports.sleep(10000)
//     fs.readFile(file, callback);
// }

//
export const makeid = (length) => {
  // Used for blast.id and spamguard
  // REMOVE 1/I and 0/o confusing
  let result = '';
  let characters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjklmnpqrstuvwxyz23456789';
  let charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

//

//
export const checkFileSize = (file_path) => {
  let statsObj = fs.statSync(file_path);
  //console.log('size',statsObj.size);  // bytes
  return statsObj.size;
  
};

export const print = function print(thing) {
    // console.log only if development
    // https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
    let date = new Date().toISOString()
    if(ENV.ENV == 'localhost' ) {
        console.log('\x1b[31m%s\x1b[0m',date, thing)  
    }
    
};

export const execute = (command, callback) => {
  exec(command, function (error, stdout, stderr) { callback(stdout); });
};

export const getCallerIP = (request) => {
  let ip = request.headers['x-forwarded-for'] ||
    request.connection.remoteAddress ||
    request.socket.remoteAddress ||
    request.connection.socket.remoteAddress;
  ip = ip.split(',')[0];
  ip = ip.split(':').slice(-1); //in case the ip returned in a format: "::ffff:146.xxx.xxx.xxx"
  return ip;
};

export const get_gc_for_gccontent = (gc) => (parseFloat(gc) / 100).toFixed(2);

export const readFromFile = (file, ext) => new Promise((resolve, reject) => {
  fs.readFile(file, (err, data) => {
    if (err) {
      console.log(err);
      reject(err);
    }
    else {
      if (ext == 'json') {
        resolve(JSON.parse(data));
      } else if (ext == 'csv') {
        let gids = [];
        //console.log(data.toString())
        let pts = data.toString().split('\n');
        for (let i in pts) {
          //#re.findall(r'\S+', s)
          gids.push(pts[i].split(/(\s+)/)[0]);
        }

        // const allFileContents = fs.readFileSync('broadband.sql', 'utf-8');
        // allFileContents.split(/\r?\n/).forEach(line =>  {
        //   console.log(`Line from file: ${line}`);
        // });
        resolve(gids);

      } else {
        //console.log(data)
        resolve(data);
      }
    }
  });
});

//
/**
 * Executes a shell command and return it as a Promise.
 * @param cmd {string}
 * @return {Promise<string>}
 */
export const execShellCommand = (cmd) => {
  const exec = require('child_process').exec;
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.warn('error', error);
      }
      resolve(stdout ? stdout : stderr);
    });
  });
};

export const rtrim = (x, characters) => {
  //console.log('x,characters',x,characters)
  let start = 0;
  let end = x.length - 1;
  while (characters.indexOf(x[end]) >= 0) {
    end -= 1;
  }
  return x.substr(0, end + 1);
};

export const ltrim = (x, characters) => {
  let start = 0;
  while (characters.indexOf(x[start]) >= 0) {
    start += 1;
  }
  let end = x.length - 1;
  return x.substr(start);
};

// module.exports.filter_for_phylumXX = function filter_for_phylum(list, phy){
//     //console.log('list[0]',list[0])
//     let lineage_list = Object.values(C.taxon_lineage_lookup)
//     let obj_lst = lineage_list.filter(item => item.phylum === phy)  //filter for phylum 
//     //console.log('obj_lst[0]',obj_lst[0])
//     let otid_list = obj_lst.map( (el) =>{  // get list of otids with this phylum
//         return el.otid
//     })
//     //console.log('otid_list.length',otid_list.length)
//     let otid_grabber = {}
//     let gid_obj_list = list.filter(item => {   // filter genome obj list for inclusion in otid list
//         if(otid_list.indexOf(item.otid.toString()) !== -1){
//             otid_grabber[item.otid] = 1
//             return true
//         }
//         //return otid_list.indexOf(item.otid) !== -1
//     })
//     //console.log('otid_grabber',otid_grabber)
//     //console.log('gid_obj_list',gid_obj_list)
//     // now get just the otids from the selected gids
//     gid_obj_list.map( (el) =>{ return el.otid })
//     return gid_obj_list
// }

export const filter_for_phylum = (obj_list, phylum) => {
  //console.log('tlist[0]',tlist[0])
  //console.log('C.taxon_lineage_lookup',C.taxon_lineage_lookup['1'])
  let new_obj_list = obj_list.filter(item => {
    if (C.taxon_lineage_lookup.hasOwnProperty(item.otid) && C.taxon_lineage_lookup[item.otid].phylum == phylum) {
      return true;
    }
  });
  return new_obj_list;
};

export const walk = (dir) => {
// a simple walk method

 
    // get the contents of dir
    console.log('dir',dir)
    
    fs.readdir(dir, (e, items) => {
         
        // for each item in the contents
        if(e){
          console.log('e',e)
          return
        }else{
          items.forEach((item) => {
             
            // get the item path
            let itemPath = path.join(dir, item);
 
            // get the stats of the item
            fs.stat(itemPath, (e, stats) => {
 
                // Just log the item path for now
                console.log('walking',itemPath);
 
                // for now just use stats to find out
                // if the current item is a dir
                if (stats.isDirectory()) {
 
                    // if so walk that too, by calling this
                    // method recursively
                    walk(itemPath);
 
                }
 
            });
 
          });
        }
        
 
    });
 
};
export const get_has_abundance = () => {
   console.log('getting abund +-')
   /// Relies on the C.taxon_counts_lookup to have acurate data
   /// see Initialize_Abundance.py
   /// used on ecology_home page
    
    let data ={domain:{},phylum:{},klass:{},order:{},family:{},genus:{},species:{}}
    let domain_obj = C.homd_taxonomy.taxa_tree_dict_map_by_rank['domain']
    let phyla_obj = C.homd_taxonomy.taxa_tree_dict_map_by_rank['phylum']
    let class_obj = C.homd_taxonomy.taxa_tree_dict_map_by_rank['klass']
    let order_obj = C.homd_taxonomy.taxa_tree_dict_map_by_rank['order']
    let family_obj = C.homd_taxonomy.taxa_tree_dict_map_by_rank['family']
    let genus_obj = C.homd_taxonomy.taxa_tree_dict_map_by_rank['genus']
    let species_obj = C.homd_taxonomy.taxa_tree_dict_map_by_rank['species']
    let lineage_list,tc
    //console.log(phyla_obj)
    for(let n in domain_obj){
        lineage_list = helpers_taxa.make_lineage(domain_obj[n])
        tc = C.taxon_counts_lookup[lineage_list[0]]
        data.domain[domain_obj[n].taxon] = tc.ecology
    }
    for(let n in phyla_obj){
        lineage_list = helpers_taxa.make_lineage(phyla_obj[n])
        tc = C.taxon_counts_lookup[lineage_list[0]]
        data.phylum[phyla_obj[n].taxon] = tc.ecology
    }
    for(let n in class_obj){
        lineage_list = helpers_taxa.make_lineage(class_obj[n])
        tc = C.taxon_counts_lookup[lineage_list[0]]
        data.klass[class_obj[n].taxon] = tc.ecology
    }
    for(let n in order_obj){
        lineage_list = helpers_taxa.make_lineage(order_obj[n])
        tc = C.taxon_counts_lookup[lineage_list[0]]
        data.order[order_obj[n].taxon] = tc.ecology
    }
    for(let n in family_obj){
        lineage_list = helpers_taxa.make_lineage(family_obj[n])
        tc = C.taxon_counts_lookup[lineage_list[0]]
        data.family[family_obj[n].taxon] = tc.ecology
    }
    for(let n in genus_obj){
        lineage_list = helpers_taxa.make_lineage(genus_obj[n])
        tc = C.taxon_counts_lookup[lineage_list[0]]
        data.genus[genus_obj[n].taxon] = tc.ecology
    }
    for(let n in species_obj){
        lineage_list = helpers_taxa.make_lineage(species_obj[n])
        tc = C.taxon_counts_lookup[lineage_list[0]]
        data.species[species_obj[n].taxon] = tc.ecology
    }
    //console.log('abund data',data)
    return data
}
export default router;