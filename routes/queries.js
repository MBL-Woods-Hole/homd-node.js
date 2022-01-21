// const express = require('express')
// const router = express.Router()
// const CFG = require(app_root + '/config/config')
// const fs = require('fs-extra')
// const path = require('path')
// const C = require(app_root + '/public/constants')
// const helpers = require(app_root + '/routes/helpers/helpers')

module.exports.get_refseq_query = (refid) => {
  let qSelectRefseq = 'SELECT UNCOMPRESS(seq_trim9) as seq from taxon_refseqid '
  qSelectRefseq += " WHERE refseqid='" + refid + "'"

  return qSelectRefseq
}

module.exports.get_16s_rRNA_sequence_query = (gid) => {
  let qSelect16Sseq = 'SELECT 16s_rRNA from genomes_homd_extra '
  qSelect16Sseq += "WHERE seq_id='" + gid + "'"

  return qSelect16Sseq
}

module.exports.get_annotation_query = (gid, anno) => {
  let qSelectAnno = 'SELECT accession, PID, product FROM annotation.orf_sequence'
  qSelectAnno += ' JOIN annotation.molecule ON orf_sequence.gid=molecule.gid'
  qSelectAnno += ' AND orf_sequence.annotation=molecule.annotation'
  qSelectAnno += ' AND orf_sequence.mol_id=molecule.mol_id'
  qSelectAnno += " WHERE orf_sequence.gid='" + gid + "'"
  qSelectAnno += " AND orf_sequence.annotation='" + anno + "'"

  return qSelectAnno
}

module.exports.get_annotation_query2 = (gid, anno) => {
  const db = anno.toUpperCase() + '_' + gid
  let qSelectAnno = 'SELECT accession, PID, product,length,`start`,`stop`,length(seq_na) as len_na,length(seq_aa) as len_aa FROM ' + db + '.ORF_seq'
  qSelectAnno += ' JOIN ' + db + '.molecules ON ' + db + '.ORF_seq.mol_id=' + db + '.molecules.id'
  return qSelectAnno
}

module.exports.get_db_updates_query = () => {
  return "SELECT otid, description, reason, date FROM updates WHERE `show`='1'"
}
