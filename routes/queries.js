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
    
    return qSelectRefseq;
}

module.exports.get_16s_rRNA_sequence_query = (gid) => {
    var qSelect16Sseq = "SELECT 16s_rRNA from genomes_extra ";
    qSelect16Sseq += " WHERE seq_id='"+gid+"'";
    
    return qSelect16Sseq;
}

module.exports.get_annotation_query = (gid, anno) => {
   //  var qSelectAnno = "select mol_id, accession, PID, product from annotation.orf_sequence"
//     qSelectAnno += " join annotation.molecule using(mol_id)"
//     qSelectAnno += " where orf_sequence.gid='"+gid+"'"
//     qSelectAnno += " and orf_sequence.annotation='"+anno+"'";
    var qSelectAnno = "SELECT accession, PID, product FROM annotation.orf_sequence" 
    qSelectAnno += " JOIN annotation.molecule ON orf_sequence.gid=molecule.gid"
    qSelectAnno += " AND orf_sequence.annotation=molecule.annotation"
    qSelectAnno += " AND orf_sequence.mol_id=molecule.mol_id"
    qSelectAnno += " WHERE orf_sequence.gid='"+gid+"'" 
    qSelectAnno += " AND orf_sequence.annotation='"+anno+"'";      

    return qSelectAnno;
}
