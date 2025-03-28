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

//let hmt = 'HMT-'+("000" + otid).slice(-3)

module.exports.getKeyByValue = (object, value) => {
  return Object.keys(object).find(key => object[key] === value);
}
module.exports.timestamp = (dateonly) => {
    //var today = new Date().toUTCString();
    if(dateonly){
      var today = new Date().toISOString().substring(0,10)
    }else{
      var today = new Date().toISOString()
    }
    return today
//     var dd = String(today.getDate()).padStart(2, '0');
//     var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
//     var yyyy = today.getFullYear();
//     var hours = today.getHours()
//     var mins = today.getMinutes()
//     var secs = today.getSeconds()
//     var date_string = yyyy + '-' + mm + '-' + dd;
//     var time_string = '('+String(hours)+'-'+String(mins)+'-'+String(secs)+')'
//     return date_string + ' '+time_string
}
module.exports.isLoggedIn = (req, res, next) => {
  // if user is authenticated in the session, carry on

  if (req.isAuthenticated()) {
    console.log(module.exports.log_timestamp());
    console.log("Hurray! isLoggedIn.req.isAuthenticated:", req.user.username);
    return next();
  }
  // if they aren't redirect them to the home page
  console.log("Oops! NOT isLoggedIn.req.isAuthenticated");
  // save the url in the session
  req.session.returnTo = req.originalUrl;
  req.flash('fail', 'Please <a href="/admin/login">login</a> or <a href="/admin/signup">register</a> before continuing.');
  res.redirect('/admin/login');
  // return;
};
//
module.exports.isAdmin = (req, res, next) => {
  if (req.user.security_level === 1) {
    console.log("Hurray! USER is an Admin:", req.user.username);
    return next();
  }
  // if they aren't redirect them to the home page
  console.log("Whoa! NOT an Admin: ", req.user.username);
  // save the url in the session
  req.session.returnTo = req.path;
  //console.log('URL Requested: '+JSON.stringify(req));
  //console.log(util.inspect(req, {showHidden: false, depth: null}));
  req.flash('fail', 'The page you are trying to access is for VAMPS admins only.');
  res.redirect('/');
  // return;
};
module.exports.log_timestamp = () => {
  let date = new Date();
  let day  = date.toLocaleDateString();
  let time = date.toLocaleTimeString();
  return day + " " + time;
};
// todo: use in file instead of those in the class
module.exports.check_if_rank = (field_name) => {

  let ranks = C.ranks;

  // ranks = ["domain","phylum","klass","order","family","genus","species","strain"]
  return ranks.includes(field_name);
};

// module.exports.sortDataBy = (obj, key, type) => {
//   // https://dev.to/madanlal/how-to-sort-array-of-object-using-object-keys-in-javascript-58f1
//   let sortedData;
//   if(type == 'alpha'){
//     sortedData = obj.sort(function(a,b){
//       let x = a[key].toLowerCase();
//       let y = b[key].toLowerCase();
//       if(x>y){return 1;}
//       if(x<y){return -1;}
//       return 0;
//     });
//   }else{
//     sortedData = obj.sort(function(a,b){
//       return a[key] - b[key];
//     })
//   }
//   return sortedData;
// }

module.exports.compareStrings_alpha = (a, b) => {
  // Assuming you want case-insensitive comparison
  a = a.toLowerCase();
  b = b.toLowerCase();
  return (a < b) ? -1 : (a > b) ? 1 : 0;
  
};
module.exports.compareByTwoStrings_alpha = (a, b, colA, colB) => {
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
module.exports.compareStrings_int   = (a, b) => {
  
  let numa = parseInt(a.toString().replaceAll(',',''))
  let numb = parseInt(b.toString().replaceAll(',',''))
  //console.log('numa',numa)
  
  return (numa < numb) ? -1 : (numa > numb) ? 1 : 0;
};
module.exports.compareStrings_float   = (a, b) => {
  if(!a){a=0}
  if(!b){b=0}
  a = parseFloat(a);
  b = parseFloat(b);
  return (a < b) ? -1 : (a > b) ? 1 : 0;
};
module.exports.show_session = (req) =>{
  console.log('(Availible for when sessions are needed) req.session: ')
    //console.log('req.session',req.session)
    //console.log('req.sessionID',req.sessionID)
    console.log('req.session.id',req.session.id)
};
module.exports.accesslog = (req, res) =>{
    accesslog(req, res, 'RemoteIP:'+req.ip+':'+ C.access_log_format, function(s) {
       var testout = 'Request from:'+req.ip+ s+'\n'
       console.log(testout);
        fs.appendFile(C.access_logfile, s+'\n', err => {
             if (err) {
                 console.error(err)
                 return
             }
             //file written successfully
         })
    });
}

module.exports.chunkSubstr = (str, size) =>{
  //https://stackoverflow.com/questions/7033639/split-large-string-in-n-size-chunks-in-javascript
  const numChunks = Math.ceil(str.length / size)
  const chunks = new Array(numChunks)

  for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
    chunks[i] = str.substr(o, size)
  }

  return chunks
}
//
module.exports.format_long_numbers = (x) =>{
    // change 456734 => 456,734
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
module.exports.format_Mbps = (x) =>{ // mega base pairs
    // change 456734 => 456,734
    return (parseFloat(x) /1000000).toFixed(2).toString() +' Mbps'
}
module.exports.format_MB = (x) =>{ // mega bytes
    // change 456734 => 456,734
    return (parseFloat(x) /1000000).toFixed(3).toString() +' MB'
}
module.exports.get_min = function get_min(ary){
   let ret = ary[0]
   for(let i=0;i<ary.length;i++){
      if(ary[i] < ret){
         ret = ary[i]
      }
   }
   return ret
}
module.exports.get_max = function get_max(ary){
   let ret = 0
   for(let i=0;i<ary.length;i++){
      if(ary[i] > ret){
         ret = ary[i]
      }
   }
   return ret
}
//
module.exports.onlyUnique = (value, index, self) =>{
  return self.indexOf(value) === index;
}
module.exports.capitalizeFirst = (value, index, self) =>{
  return value.charAt(0).toUpperCase() + value.slice(1)
}
module.exports.print_size = (obj, index, self) =>{
  let size = Buffer.byteLength(JSON.stringify(C.taxon_lookup))
    //console.log('C.taxon_lookup length:',Object.keys(C.taxon_lookup).length,'\t\tsize(KB):',size/1024)
}
module.exports.make_otid_display_name = (otid) =>{
    return 'HMT-'+("000" + otid.toString()).slice(-3);
} 



module.exports.addslashes = function addslashes( str ) {
    return (str + '').replace(/[\]\[\\"']/g, '\\$&')
}


module.exports.sleep = function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

module.exports.getAllDirFiles = function getAllDirFiles(dirPath, arrayOfFiles) {
  arrayOfFiles = {}
  arrayOfFiles.files =[]
  arrayOfFiles.dirs =[]
  let excludeddirs =['users']
  try{
      const files = fs.readdirSync(dirPath)
 
      files.forEach(function getFilesArray(file) {
        let stats = fs.statSync(dirPath + "/" + file)
        var unixFilePermissions = '0' + (stats.mode & parseInt('777', 8)).toString(8);
        //console.log(file,unixFilePermissions,stats)
        if (stats.mode & (fs.constants.S_IRUSR | fs.constants.S_IRGRP | fs.constants.S_IROTH)) {
            
            if (stats.isDirectory()) {
              if(excludeddirs.indexOf(file) === -1){
                //arrayOfFiles = getAllDirFiles(dirPath + "/" + file, arrayOfFiles)
                arrayOfFiles.dirs.push({name:file,src:dirPath + "/" + file,type:'dir'})
              }
            } else {
              arrayOfFiles.files.push({name:file,src:dirPath + "/" + file,type:'file'})
            }
        }
      })
      return arrayOfFiles
  }catch(e){
        return 0
  }
  
}
// module.exports.readAsync = async function readAsync(file, callback) {
//     if(CFG.ENV === 'development'){
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
module.exports.makeid = function makeid(length) {
    // Used for blast.id and spamguard
    // REMOVE 1/I and 0/o confusing
    var result           = '';
    var characters       = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjklmnpqrstuvwxyz23456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
//

//
module.exports.checkFileSize = function checkFileSize(file_path){
   let statsObj = fs.statSync(file_path);
   //console.log('size',statsObj.size);  // bytes
   return statsObj.size
   // fs.statSync(file_path, (err, stats) => {
//     if (err) {
//         console.log(`File doesn't exist.`);
//     } else {
//         console.log('size',stats.size);  // bytes
//         return stats.size
//     }
//});
}
module.exports.print = function print(thing) {
    // console.log only if development
    // https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
    let date = new Date().toISOString()
    if(CFG.ENV == 'localhost' ) {
        console.log('\x1b[31m%s\x1b[0m',date, thing)  
    }
    
}

module.exports.execute = function execute(command, callback){
    exec(command, function(error, stdout, stderr){ callback(stdout); });
};

module.exports.getCallerIP = function getCallerIP(request) {
    var ip = request.headers['x-forwarded-for'] ||
        request.connection.remoteAddress ||
        request.socket.remoteAddress ||
        request.connection.socket.remoteAddress;
    ip = ip.split(',')[0];
    ip = ip.split(':').slice(-1); //in case the ip returned in a format: "::ffff:146.xxx.xxx.xxx"
    return ip;
};

module.exports.get_gc_for_gccontent = function get_gc_for_gccontent(gc){
    return (parseFloat(gc)/100).toFixed(2)
};

module.exports.readFromFile = function readFromFile(file, ext) {
    return new Promise((resolve, reject) => {
        fs.readFile(file, (err, data) => {
            if (err) {
                console.log(err);
                reject(err);
            }
            else {
                if(ext == 'json'){
                   resolve(JSON.parse(data));
                }else if(ext == 'csv'){
                   let gids = []
                   //console.log(data.toString())
                   let pts = data.toString().split('\n')
                   for( let i in pts){
                     //#re.findall(r'\S+', s)
                      gids.push(pts[i].split(/(\s+)/)[0])
                   }
                   
                  // const allFileContents = fs.readFileSync('broadband.sql', 'utf-8');
// allFileContents.split(/\r?\n/).forEach(line =>  {
//   console.log(`Line from file: ${line}`);
// });
                    resolve(gids);
                
                }else{
                   //console.log(data)
                   resolve(data);
                }
            }
        });
    });
}


//
/**
 * Executes a shell command and return it as a Promise.
 * @param cmd {string}
 * @return {Promise<string>}
 */
module.exports.execShellCommand = function execShellCommand(cmd) {
 const exec = require('child_process').exec;
 return new Promise((resolve, reject) => {
  exec(cmd, (error, stdout, stderr) => {
   if (error) {
    console.warn('error',error);
   }
   resolve(stdout? stdout : stderr);
  });
 });
}

module.exports.rtrim = function rtrim(x, characters) {
  //console.log('x,characters',x,characters)
  var start = 0;
  var end = x.length - 1;
  while (characters.indexOf(x[end]) >= 0) {
    end -= 1;
  }
  return x.substr(0, end + 1);
}
module.exports.ltrim = function ltrim(x, characters) {
  var start = 0;
  while (characters.indexOf(x[start]) >= 0) {
    start += 1;
  }
  var end = x.length - 1;
  return x.substr(start);
}

// module.exports.filter_for_phylumXX = function filter_for_phylum(list, phy){
//     //console.log('list[0]',list[0])
//     var lineage_list = Object.values(C.taxon_lineage_lookup)
//     var obj_lst = lineage_list.filter(item => item.phylum === phy)  //filter for phylum 
//     //console.log('obj_lst[0]',obj_lst[0])
//     var otid_list = obj_lst.map( (el) =>{  // get list of otids with this phylum
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

module.exports.filter_for_phylum = function filter_for_phylum(obj_list, phylum){
    //console.log('tlist[0]',tlist[0])
    //console.log('C.taxon_lineage_lookup',C.taxon_lineage_lookup['1'])
    let new_obj_list = obj_list.filter(item => {   // filter genome obj list for inclusion in otid list
        if(C.taxon_lineage_lookup.hasOwnProperty(item.otid) && C.taxon_lineage_lookup[item.otid].phylum == phylum){
            return true
        }
    })
    return new_obj_list
}


