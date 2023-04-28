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
module.exports.get_db_updates_query = () => {
  return "SELECT otid, description, reason, date FROM updates WHERE `show`='1'"
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
// GENOMES
module.exports.get_annotation_query = (gid, anno) => {
  
  let qSelectAnno = 'SELECT accession,  gc, protein_id, product, length_na,length_aa, `start`, `stop`'
  qSelectAnno += ' FROM `'+anno.toUpperCase()+'_meta`.`orf`'
  qSelectAnno += " WHERE seq_id = '"+gid+"'"
  
  // const db = anno.toUpperCase() + '_' + gid  // ie: NCBI_SEF10000
//   let qSelectAnno = 'SELECT accession, GC, protein_id, product,length,`start`,`stop`,length(seq_na) as len_na,length(seq_aa) as len_aa FROM ' + db + '.ORF_seq'
//   qSelectAnno += ' JOIN ' + db + '.molecules ON ' + db + '.ORF_seq.mol_id=' + db + '.molecules.id'
  return qSelectAnno
}
module.exports.get_annotation_query2 = (gid, anno, pid_list) => {
  
  let qSelectAnno = 'SELECT accession,  gc, protein_id, product, length_na,length_aa, `start`, `stop`'
      qSelectAnno += ' FROM `'+anno.toUpperCase()+'_meta`.`orf`'
      //qSelectAnno += " WHERE seq_id = '"+gid+"' and protein_id in ('"+pid_list.join("','")+"')"
      qSelectAnno += " WHERE protein_id in ('"+pid_list.join("','")+"')"
  //const db = anno.toUpperCase() + '_' + gid
  // let qSelectAnno = 'SELECT accession, GC, protein_id, product,length,`start`,`stop`,length(seq_na) as len_na,length(seq_aa) as len_aa FROM ' + db + '.ORF_seq'
//   qSelectAnno += ' JOIN ' + db + '.molecules ON ' + db + '.ORF_seq.mol_id=' + db + '.molecules.id'
//   qSelectAnno += " WHERE protein_id in ('"+pid_list.join("','")+"')"
  return qSelectAnno
}
module.exports.get_annotation_query3 = (search_text) => {
  // this query takes too long
  let qSelectAnno = "SELECT 'ncbi' as anno, seq_id as gid, protein_id, product from `NCBI_meta`.orf WHERE product like '%"+search_text+"%'"
    qSelectAnno += ' UNION ALL'  // UNION vs UNION ALL
    qSelectAnno += "SELECT 'prokka' as anno, seq_id as gid, protein_id, product from `PROKKA_meta`.orf WHERE product like '%"+search_text+"%'"
    
  return qSelectAnno
}
module.exports.get_annotation_query4 = (search_text, anno_type) => {
  // this query takes too long
  let qSelectAnno
  if(anno_type === 'ncbi'){
     qSelectAnno = "SELECT seq_id as gid, protein_id, product from `NCBI_meta`.orf WHERE product like '%"+search_text+"%'"
  }else{
     qSelectAnno = "SELECT seq_id as gid, protein_id, product from `PROKKA_meta`.orf WHERE product like '%"+search_text+"%'"
  }
  return qSelectAnno
}
module.exports.get_contigs = (gid) => {   // always NCBI for taxon description
  //const db = 'NCBI_' + gid
  let qSelectContigs = "SELECT accession, GC from `NCBI_meta`.`molecules` WHERE seq_id = '"+gid+"'"
  // molecules is from which file? NCBI: gb_asmbly+asm_name+.genomic.fna.gz
  //                               PROKKA gb_asmbly+.fna.gz
  // asm_name amd gb_asm are both from genomes_obj
  //qSelectContigs = "SELECT accession, GC from "+db+".molecules"
  return qSelectContigs
}

