const C       = require(app_root + '/public/constants');
//const queries = require(app_root + '/routes/queries');
//const CFG  = require(app_root + '/config/config');
const express     = require('express');
const fs          = require('fs-extra');
var accesslog = require('access-log');
//const nodemailer  = require('nodemailer');
//let transporter = nodemailer.createTransport({});
const util        = require('util');
const path        = require('path');

// route middleware to make sure a user is logged in
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
  req.flash('fail', 'Please login or <a href="/admin/register">register</a> before continuing.');
  res.redirect('admin/login');
  // return;
};

// todo: use in file instead of those in the class
module.exports.check_if_rank = (field_name) => {

  let ranks = C.ranks;

  // ranks = ["domain","phylum","klass","order","family","genus","species","strain"]
  return ranks.includes(field_name);
};

module.exports.compareStrings_alpha = (a, b) => {
  // Assuming you want case-insensitive comparison
  a = a.toLowerCase();
  b = b.toLowerCase();
  return (a < b) ? -1 : (a > b) ? 1 : 0;
  
  // sort a list of objects by a value?
  // obj_list.sort(function sortByTime(a, b) {
//       //reverse sort: recent-->oldest
//       return helpers.compareStrings_alpha(b.time.getTime(), a.time.getTime());
//     });
  
};
// Sort list of json objects numerically
module.exports.compareStrings_int   = (a, b) => {
  // Assuming you want case-insensitive comparison
  a = parseInt(a);
  b = parseInt(b);
  return (a < b) ? -1 : (a > b) ? 1 : 0;
};
module.exports.show_session = (req) =>{
	console.log('(Availible for when sessions are needed) req.session: ')
    console.log('req.session',req.session)
    console.log('req.sessionID',req.sessionID)
    console.log('req.session.id',req.session.id)
};
module.exports.accesslog = (req, res) =>{
    accesslog(req, res, C.access_log_format, function(s) {
      //console.log(s);
      //fs.writeFileSync(C.access_logfile, s+'\n', {flag:'a'})
    
    
        fs.writeFile(C.access_logfile, s+'\n', err => {
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