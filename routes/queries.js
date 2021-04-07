const express  = require('express');
var router    = express.Router();
const CFG     = require(app_root + '/config/config');
const fs       = require('fs-extra');
const path     = require('path');
const C		  = require(app_root + '/public/constants');
const helpers = require(app_root + '/routes/helpers/helpers');


module.exports.get_refseq_query = (refid) => {
    var qSelectRefseq = "SELECT seq_trim28 from taxonid_refseqid_seq ";
    qSelectRefseq += " WHERE refseqid='"+refid+"'";
    console.log(qSelectRefseq);
    return qSelectRefseq;
}

