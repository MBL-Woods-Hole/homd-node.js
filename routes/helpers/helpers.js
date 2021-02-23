const C       = require(app_root + '/public/constants');
//const queries = require(app_root + '/routes/queries');
//const CFG  = require(app_root + '/config/config');
const express     = require('express');
const fs          = require('fs-extra');
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

  let ranks = C.RANKS;

  // ranks = ["domain","phylum","klass","order","family","genus","species","strain"]
  return ranks.includes(field_name);
};

module.exports.compareStrings_alpha = (a, b) => {
  // Assuming you want case-insensitive comparison
  a = a.toLowerCase();
  b = b.toLowerCase();
  return (a < b) ? -1 : (a > b) ? 1 : 0;
};
// Sort list of json objects numerically
module.exports.compareStrings_int   = (a, b) => {
  // Assuming you want case-insensitive comparison
  a = parseInt(a);
  b = parseInt(b);
  return (a < b) ? -1 : (a > b) ? 1 : 0;
};