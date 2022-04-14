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
  let qSelect16Sseq = 'SELECT 16s_rRNA from genomes '
  qSelect16Sseq += "WHERE seq_id='" + gid + "'"

  return qSelect16Sseq
}

// module.exports.get_annotation_query = (gid, anno) => {
//   let qSelectAnno = 'SELECT accession, PID, product FROM annotation.orf_sequence'
//   qSelectAnno += ' JOIN annotation.molecule ON orf_sequence.gid=molecule.gid'
//   qSelectAnno += ' AND orf_sequence.annotation=molecule.annotation'
//   qSelectAnno += ' AND orf_sequence.mol_id=molecule.mol_id'
//   qSelectAnno += " WHERE orf_sequence.gid='" + gid + "'"
//   qSelectAnno += " AND orf_sequence.annotation='" + anno + "'"
// 
//   return qSelectAnno
// }

module.exports.get_annotation_query = (gid, anno) => {
  const db = anno.toUpperCase() + '_' + gid
  let qSelectAnno = 'SELECT accession, GC, PID, product,length,`start`,`stop`,length(seq_na) as len_na,length(seq_aa) as len_aa FROM ' + db + '.ORF_seq'
  qSelectAnno += ' JOIN ' + db + '.molecules ON ' + db + '.ORF_seq.mol_id=' + db + '.molecules.id'
  return qSelectAnno
}
module.exports.get_contigs = (gid) => {   // always NCBI
  const db = 'NCBI_' + gid
  qSelectContigs = "SELECT accession,GC from "+db+".molecules"
  return qSelectContigs
}
module.exports.get_db_updates_query = () => {
  return "SELECT otid, description, reason, date FROM updates WHERE `show`='1'"
}
///////////////////////////
////// ACCOUNT ////////////
//////////////////////////
module.exports.get_user_by_name = (uname, passwd) =>{
    var q = "SELECT user_id, username, email, institution, first_name, last_name, active, security_level,"
     q += " encrypted_password, PASSWORD('"+passwd+"') as entered_pw, sign_in_count,"
     q += " DATE_FORMAT(current_sign_in_at,'%Y-%m-%d %T') as current_sign_in_at,last_sign_in_at FROM user"
     q += " WHERE username ='"+uname+"'"
    return q;
}
//
module.exports.insert_new_user = (mysql_new_user) => {
    
    var qInsertUser = "INSERT INTO user (username, encrypted_password, first_name, last_name, email, institution, active, sign_in_count, security_level, current_sign_in_at, last_sign_in_at)";
    qInsertUser +=    " VALUES ('" + mysql_new_user.username +"', "+
                                   // helpers.generateHash(mysql_new_user.password) +"', '"+
                                    "PASSWORD('"+mysql_new_user.password+"'),   '"+
                                    mysql_new_user.firstname +"', '"+
                                    mysql_new_user.lastname +"', '"+
                                    mysql_new_user.email +"', '"+
                                    mysql_new_user.institution +"',"+                                    
                                    " 1,"+
                                     " 1, "+
                                     mysql_new_user.security_level +","+
                                    " CURRENT_TIMESTAMP(), "+
                                     " CURRENT_TIMESTAMP() )";
    return qInsertUser
}
