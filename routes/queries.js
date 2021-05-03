const express  = require('express');
var router    = express.Router();
const CFG     = require(app_root + '/config/config');
const fs       = require('fs-extra');
const path     = require('path');
const C		  = require(app_root + '/public/constants');
const helpers = require(app_root + '/routes/helpers/helpers');


module.exports.get_refseq_query = (refid) => {
    var qSelectRefseq = "SELECT seq_trim9 from taxon_refseqid ";
    qSelectRefseq += " WHERE refseqid='"+refid+"'";
    console.log(qSelectRefseq);
    return qSelectRefseq;
}

module.exports.get_16s_rRNA_sequence_query = (gid) => {
    var qSelect16Sseq = "SELECT 16s_rRNA from seq_genomes_extra ";
    qSelect16Sseq += " WHERE seq_id='"+gid+"'";
    console.log(qSelect16Sseq);
    return qSelect16Sseq;
}

