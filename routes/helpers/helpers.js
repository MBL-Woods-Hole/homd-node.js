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

