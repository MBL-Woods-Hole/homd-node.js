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
  
  let qSelectAnno = 'SELECT accession,  gc, protein_id, product, length_na,length_aa, `start`, `stop`, gene'
  qSelectAnno += ' FROM `'+anno.toUpperCase()+'_meta`.`orf`'
  qSelectAnno += " WHERE seq_id = '"+gid+"'"
  
  // const db = anno.toUpperCase() + '_' + gid  // ie: NCBI_SEF10000
//   let qSelectAnno = 'SELECT accession, GC, protein_id, product,length,`start`,`stop`,length(seq_na) as len_na,length(seq_aa) as len_aa FROM ' + db + '.ORF_seq'
//   qSelectAnno += ' JOIN ' + db + '.molecules ON ' + db + '.ORF_seq.mol_id=' + db + '.molecules.id'
  return qSelectAnno
}
module.exports.get_lineage_query = (otid) => {
   let qSelectTaxnames = 'SELECT domain,phylum,klass,`order`,family,genus,species,subspecies from otid_prime'
    qSelectTaxnames += ' join taxonomy using(taxonomy_id)'
    qSelectTaxnames += ' join domain using(domain_id)'
    qSelectTaxnames += ' join phylum using(phylum_id)'
    qSelectTaxnames += ' join klass using(klass_id)'
    qSelectTaxnames += ' join `order` using(order_id)'
    qSelectTaxnames += ' join family using(family_id)'
    qSelectTaxnames += ' join genus using(genus_id)'
    qSelectTaxnames += ' join species using(species_id)'
    qSelectTaxnames += ' join subspecies using(subspecies_id)'
    qSelectTaxnames += " WHERE otid='"+otid+"'"
    return qSelectTaxnames
}
// module.exports.get_annotation_query2 = (gid, anno, pid_list) => {
//   
//   let qSelectAnno = 'SELECT accession,  gc, protein_id, product, length_na,length_aa, `start`, `stop`'
//       qSelectAnno += ' FROM `'+anno.toUpperCase()+'_meta`.`orf`'
//       //qSelectAnno += " WHERE seq_id = '"+gid+"' and protein_id in ('"+pid_list.join("','")+"')"
//       qSelectAnno += " WHERE protein_id in ('"+pid_list.join("','")+"')"
//   //const db = anno.toUpperCase() + '_' + gid
//   // let qSelectAnno = 'SELECT accession, GC, protein_id, product,length,`start`,`stop`,length(seq_na) as len_na,length(seq_aa) as len_aa FROM ' + db + '.ORF_seq'
// //   qSelectAnno += ' JOIN ' + db + '.molecules ON ' + db + '.ORF_seq.mol_id=' + db + '.molecules.id'
// //   qSelectAnno += " WHERE protein_id in ('"+pid_list.join("','")+"')"
//   return qSelectAnno
// }
// module.exports.get_annotation_query3 = (search_text) => {
//   // this query takes too long
//   let qSelectAnno = "SELECT 'ncbi' as anno, seq_id as gid, protein_id, product from `NCBI_meta`.orf WHERE product like '%"+search_text+"%'"
//     qSelectAnno += ' UNION ALL'  // UNION vs UNION ALL
//     qSelectAnno += "SELECT 'prokka' as anno, seq_id as gid, protein_id, product from `PROKKA_meta`.orf WHERE product like '%"+search_text+"%'"
//     
//   return qSelectAnno
// }
// module.exports.get_annotation_query4 = (search_text, anno_type) => {
//   // this query takes too long
//   let qSelectAnno
//   if(anno_type === 'ncbi'){
//      qSelectAnno = "SELECT seq_id as gid, protein_id, product from `NCBI_meta`.orf WHERE product like '%"+search_text+"%'"
//   }else{
//      qSelectAnno = "SELECT seq_id as gid, protein_id, product from `PROKKA_meta`.orf WHERE product like '%"+search_text+"%'"
//   }
//   return qSelectAnno
// }
module.exports.get_genome = (gid) => {   // always NCBI for taxon description
  
  let qSelectGenome = "SELECT strain_or_isolate,organism,coverage,status,"
        qSelectGenome +=' date,'
        qSelectGenome +=' submitter,'
        qSelectGenome +=' ncontigs,'
        qSelectGenome +=' tlength,'
        qSelectGenome +=' isolate_origin,'
        qSelectGenome +=' ncbi_bioproject,'
        qSelectGenome +=' ncbi_taxonid,'
        qSelectGenome +=' ncbi_biosample,'
        qSelectGenome +=' ncbi_assembly_name,'
        qSelectGenome +=' gc,'
        qSelectGenome +=' gb_assembly,'
        qSelectGenome +=' refseq_assembly,'
        qSelectGenome +=' assembly_type,'
        qSelectGenome +=' release_type,'
        qSelectGenome +=' assembly_level,'
        qSelectGenome +=' genome_rep,'
        qSelectGenome +=' method,'
        qSelectGenome +=' wgs,'
        qSelectGenome +=' seqtech,'
        qSelectGenome +=' crisper_cas'
        qSelectGenome +=' FROM genomes'
        qSelectGenome +=" WHERE seq_id = '"+gid+"'"
// let qSelectGenome = "SELECT  otid,"
//         qSelectGenome +=' strain_or_isolate,'
//         qSelectGenome +=' MAG,'
//         qSelectGenome +=' organism,'
//         qSelectGenome +=' coverage,'
//         qSelectGenome +=' contig_count,'
//         qSelectGenome +=' genome_size,'
//         qSelectGenome +=' GC_percentage,'
//         qSelectGenome +=' checkM,'
//         qSelectGenome +=' checkM2,'
//         qSelectGenome +=' 5S_count,'
//         qSelectGenome +=' 16S_count,'
//         qSelectGenome +=' 23S_count,'
//         qSelectGenome +=' tRNA_count,'
//         qSelectGenome +=' ncbi_version_status,'
//         qSelectGenome +=' ncbi_date,'
//         qSelectGenome +=' ncbi_submitter,'
//         qSelectGenome +=' ncbi_isolation_source,'
//         qSelectGenome +=' ncbi_bioproject,'
//         qSelectGenome +=' ncbi_taxid,'
//         qSelectGenome +=' ncbi_biosample,'
//         qSelectGenome +=' ncbi_assembly_name,'
//         qSelectGenome +=' ncbi_assembly_level,'
//         qSelectGenome +=' ncbi_assembly_type,'
//         qSelectGenome +=' ncbi_CDS_count,'
//         qSelectGenome +=' ncbi_country,'
//         qSelectGenome +=' ncbi_isolate,'
//         qSelectGenome +=' ncbi_lat_lon,'
//         qSelectGenome +=' ncbi_molecule_count,'
//         qSelectGenome +=' ncbi_refseq_category,'
//         qSelectGenome +=' refseq_accession_id,'
//         qSelectGenome +=' ncbi_seq_rel_date,'
//         qSelectGenome +=' ncbi_spanned_gaps,'
//         qSelectGenome +=' ncbi_species_taxid,'
//         qSelectGenome +=' ncbi_SSU_count,'
//         qSelectGenome +=' ncbi_total_gap_length,'
//         qSelectGenome +=' ncbi_translation_table,'
//         qSelectGenome +=' ncbi_tRNA_count_total,'
//         qSelectGenome +=' ncbi_type_material,'
//         qSelectGenome +=' ncbi_unspanned_gaps,'
//         qSelectGenome +=' ncbi_genome_representation,'
//         qSelectGenome +=' ncbi_WGS,'
//         qSelectGenome +=' method,'
//         qSelectGenome +=' seqtech,'
//         qSelectGenome +=' crisper_cas,'
//         qSelectGenome +=' has_hsp_study,'
//         qSelectGenome +=" WHERE genome_id = '"+gid+"'"
    return qSelectGenome
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

