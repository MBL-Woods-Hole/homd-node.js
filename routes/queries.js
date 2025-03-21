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
module.exports.get_refseq_metadata_query = (otid) => {
  let qSelectRefseqInfo = 'SELECT refseqid,seqname,strain,genbank from taxon_refseqid '
  qSelectRefseqInfo += " WHERE otid='" + otid + "'"

  return qSelectRefseqInfo
}
module.exports.get_taxon_info_query = (otid) => {
  let q = "SELECT  notes,`general`,prevalence as prev,cultivability as culta,disease_associations as disease,phenotypic_characteristics as pheno"
  q += " from taxon_info"
  q += " WHERE otid='"+otid+"'"
  return q
}
// module.exports.taxon_description_info = (otid) => {
//     let q = "select refseqid,seqname,strain,genbank, pubmed_id,journal,`authors`,title,"
//     q += "NCBI_pubmed_search_count as a,NCBI_nucleotide_search_count as b,NCBI_protein_search_count as c,NCBI_genome_search_count as d,"
//     q += "NCBI_taxonomy_search_count as e,        NCBI_gene_search_count as f, NCBI_genomeP_search_count as g,"
//     q += "`general`,prevalence as prev,cultivability as culta,disease_associations as disease,phenotypic_characteristics as pheno"
//     q += " from otid_prime"
//     q += " left join taxon_refseqid using (otid)"
//     q += " left join extra_flat_info using (otid)"
//     q += " left join reference using(otid)"
//     q += " left join taxon_info using (otid)"
//     q += " WHERE otid='"+otid+"'"
//     return q
// }
module.exports.get_16s_rRNA_sequence_query = (gid) => {
  let qSelect16Sseq = 'SELECT 16s_rRNA from genomes '
  qSelect16Sseq += "WHERE genome_id='" + gid + "'"

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
  qSelectAnno += " WHERE genome_id = '"+gid+"'"
  
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
module.exports.get_peptide = () => {
    let qSelectPeptide = "SELECT `genomes`.otid, study_id, seq_id, organism, protein_accession,jb_link,molecule,peptide_id,peptide,product from protein_peptide"
    qSelectPeptide += " JOIN `genomes` using (seq_id)"
    
    return qSelectPeptide
}
module.exports.get_peptide2 = () => {
    let q = "SELECT seq_id, `genomes`.otid, organism, protein_count, peptide_count,study_id from protein_peptide_counts "
    q += " JOIN `genomes` using (seq_id)"
    q += " JOIN protein_peptide_counts_study using (protein_peptide_counts_id)"
    q += " JOIN protein_peptide_studies using (study_id)"
    return q
}
module.exports.get_peptide3 = (gid) => {
    let q = "SELECT organism as org,protein_accession as pid,peptide_id,molecule as mol,`genomes`.otid,product,peptide,jb_link,protein_peptide.study_id,study_name"
    q += " FROM protein_peptide"
    q += " JOIN protein_peptide_counts using (seq_id)"
    q += " JOIN `genomes` using (seq_id)"
    q += " JOIN protein_peptide_counts_study using (protein_peptide_counts_id)"
    q += " JOIN protein_peptide_studies on (protein_peptide_counts_study.study_id=protein_peptide_studies.study_id) "
    

    //q += " JOIN protein_peptide_studies using (seq_id)"
    q += " where seq_id='"+gid+"'"
    
    return q
}
module.exports.get_crispr_cas_data = (gid) => {
    let qSelectCrisprCas = "SELECT contig,operon,operon_pos,prediction,crisprs,distances,prediction_cas,prediction_crisprs"
    qSelectCrisprCas += " FROM crispr_cas where seq_id='"+gid+"'"
    
    return qSelectCrisprCas
}
module.exports.get_NN_NA = (db, gid, pid) => {
    let q = 'SELECT UNCOMPRESS(seq_compressed) as seq FROM ' + db
    q += " WHERE genome_id ='"+gid+"' and protein_id='" + pid + "'"
    
    return q
}
module.exports.get_genome = (gid) => {   // always NCBI for taxon description
  // data for genome description
  // NCBI Fields
  // fields = ['organism','assembly_level', 'assembly_method', 'bioproject', 'biosample', 'submission_date', 'geo_loc_name', 'isolation_source', 'status', 'seqtech', 'submitter', 'GC',  'coverage', 'contigs', 'combined_size', 'ANI', 'checkM_completeness', 'checkM_percentile', 'checkM_contamination', 'taxid', 'refseq_assembly', 'WGS']
 
  let qSelectGenome = "SELECT `genomesV11.0`.strain,`genomesV11.0`.organism,`genomesV11.0`.contigs,`genomesV11.0`.combined_size,`genomesV11.0`.category,`genomesV11.0`.GC,`genomesV11.0`.url, "
        qSelectGenome +=' bioproject,taxid,biosample,assembly_name,assembly_level,assembly_method,'
        qSelectGenome +=' submission_date,geo_loc_name,isolation_source,status,seqtech,submitter,coverage,ANI,checkM_completeness,checkM_percentile,checkM_contamination,refseq_assembly,WGS,'
        qSelectGenome +=' `genomes_prokkaV11.0`.contigs as prokka_contigs,`genomes_prokkaV11.0`.CDS as prokka_CDS,`genomes_prokkaV11.0`.gene as prokka_gene,`genomes_prokkaV11.0`.mRNA as prokka_mRNA,`genomes_prokkaV11.0`.misc_RNA as prokka_misc_RNA,`genomes_prokkaV11.0`.rRNA as prokka_rRNA,`genomes_prokkaV11.0`.tRNA as prokka_tRNA,`genomes_prokkaV11.0`.tmRNA as prokka_tmRNA'
        
        qSelectGenome +=' FROM `genomesV11.0`'
        qSelectGenome +=" left JOIN `genomes_prokkaV11.0` using(genome_id)"
        qSelectGenome +=" left JOIN `genomes_ncbiV11.0` using(genome_id)"
        qSelectGenome +=" WHERE genome_id = '"+gid+"'"
  

    return qSelectGenome
}
module.exports.get_contigs = (gid) => {   // always NCBI for taxon description
  //const db = 'NCBI_' + gid
  let qSelectContigs = "SELECT accession, GC from `NCBI_meta`.`molecules` WHERE genome_id = '"+gid+"'"
  // molecules is from which file? NCBI: gb_asmbly+asm_name+.genomic.fna.gz
  //                               PROKKA gb_asmbly+.fna.gz
  // asm_name amd gb_asm are both from genomes_obj
  //qSelectContigs = "SELECT accession, GC from "+db+".molecules"
  return qSelectContigs
}

