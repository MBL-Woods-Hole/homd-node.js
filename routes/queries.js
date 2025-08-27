// const express = require('express')
// const router = express.Router()
// const CFG = require(app_root + '/config/config')
// const fs = require('fs-extra')
// const path = require('path')
const C = require(app_root + '/public/constants')
// const helpers = require(app_root + '/routes/helpers/helpers')

module.exports.get_refseq_query = (refid) => {
  let qSelectRefseq = 'SELECT UNCOMPRESS(seq_compressed) as seq from 16S_refseq '
  qSelectRefseq += " WHERE refseq_id='" + refid + "'"

  return qSelectRefseq
}
module.exports.get_gtdb_tax = (genomes) => {
  let g = genomes.join("','")
  let qSelectGTDBTaxonomy = 'SELECT genome_id, GTDB_taxonomy  from `'+C.genomes_table_name+'`'
  qSelectGTDBTaxonomy += " WHERE genome_id in ('" + g + "')"
  //console.log(qSelectGTDBTaxonomy)
  return qSelectGTDBTaxonomy
}
module.exports.get_refseq_metadata_query = (otid) => {
  // let qSelectRefseqInfo = 'SELECT refseqid,seqname,strain,genbank from taxon_refseqid '
//   qSelectRefseqInfo += " WHERE otid='" + otid + "'"
  let qSelectRefseqInfo = 'SELECT refseq_id,species from 16S_refseq '
  qSelectRefseqInfo += " WHERE otid='" + otid + "'"

  return qSelectRefseqInfo
}
module.exports.get_taxon_info_query = (otid) => {
  let q = "SELECT  notes,`general`,prevalence as prev,cultivability as culta,disease_associations as disease,phenotypic_characteristics as pheno"
  q += " from taxon_info"
  q += " WHERE otid='"+otid+"'"
  return q
}

module.exports.get_dropped_taxa = () => {
  
  let q = "SELECT otid, naming_status, cultivation_status, notes, genus, species from otid_prime"
    q += " JOIN taxonomy using(taxonomy_id)"
    q += " JOIN status using(otid)"
    q += " JOIN genus using (genus_id)"
    q += " JOIN species using (species_id)"
    q += " WHERE status='Dropped'   Order By genus,species"
  return q
}
// module.exports.get_16s_rRNA_sequence_query = (gid) => {
//   let qSelect16Sseq = 'SELECT 16s_rRNA from genomes '
//   qSelect16Sseq += "WHERE genome_id='" + gid + "'"
// 
//   return qSelect16Sseq
// }
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
module.exports.get_all_pangenomes_query = () => {
    let q = "SELECT pangenome_name,homd_genome_version,description FROM pangenome_v4"
    q += " WHERE active='1' ORDER by pangenome_name"
    return q
}

module.exports.get_pangenomes_query = (otid) => {
    //let q = "SELECT distinct pangenome_name from pangenome_genome"
    let q = "SELECT DISTINCT pangenome_v4.pangenome_name as pangenome" 
    q += " FROM pangenome_genome"
    q += " JOIN pangenome_v4 using(pangenome_id)"
    q += " WHERE otid='"+otid+"'"
    return q
}
module.exports.get_peptide = () => {
/// USING Ver 3.1
    let qSelectPeptide = "SELECT `genomes`.otid, study_id, seq_id, organism, protein_accession,jb_link,molecule,peptide_id,peptide,product from protein_peptide"
    qSelectPeptide += " JOIN `genomes` using (seq_id)"
    
    return qSelectPeptide
}
module.exports.get_peptide2 = () => {
/// USING Ver 3.1
    let q = "SELECT seq_id, `genomes`.otid, organism, protein_count, peptide_count,study_id from protein_peptide_counts "
    q += " JOIN `genomes` using (seq_id)"
    q += " JOIN protein_peptide_counts_study using (protein_peptide_counts_id)"
    q += " JOIN protein_peptide_studies using (study_id)"
    return q
}
module.exports.get_peptide3 = (gid) => {
    /// USING Ver 3.1
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
function genome_query() {
    let tbl  = C.genomes_table_name
    let ntbl = C.genomes_ncbi_table_name
    let ptbl = C.genomes_prokka_table_name
    let qSelectGenome = `SELECT \`${tbl}\`.genome_id as GENOME_ID,concat("HMT-",LPAD(\`${tbl}\`.otid,3,"0")) as HMT_ID,`
        qSelectGenome +=` \`${tbl}\`.strain,naming_status as hmt_naming_status, cultivation_status as hmt_cultivation_status,`
        qSelectGenome +=` site as hmt_primary_body_site_w_abundance,\`${ptbl}\`.organism,\`${tbl}\`.contigs,\`${tbl}\`.combined_size,`
        qSelectGenome +=` \`${tbl}\`.MAG,\`${tbl}\`.GC,\`${tbl}\`.url,\`${tbl}\`.GTDB_taxonomy,  bioproject,taxid,biosample,`
        qSelectGenome +=` assembly_name,assembly_level,assembly_method, submission_date,geo_loc_name,isolation_source,`
        qSelectGenome +=` seqtech,submitter,coverage,ANI,checkM_completeness,checkM_contamination,checkM2_completeness,`
        qSelectGenome +=` checkM2_contamination,refseq_assembly,WGS, \`${ptbl}\`.contigs as prokka_contigs,`
        qSelectGenome +=` \`${ptbl}\`.CDS as prokka_CDS,\`${ptbl}\`.gene as prokka_gene,\`${ptbl}\`.mRNA as prokka_mRNA,`
        qSelectGenome +=` \`${ptbl}\`.misc_RNA as prokka_misc_RNA,\`genomes_prokkaV11.0\`.rRNA as prokka_rRNA,`
        qSelectGenome +=` \`${ptbl}\`.tRNA as prokka_tRNA,\`${ptbl}\`.tmRNA as prokka_tmRNA,`
        qSelectGenome +=` pangenome_v4.pangenome_name as pangenome`
        qSelectGenome +=` FROM \`${tbl}\``
        qSelectGenome +=` JOIN status using(otid)`
        qSelectGenome +=` JOIN sites on primary_body_site_id = site_id`
        qSelectGenome +=` LEFT JOIN \`${ptbl}\` using(genome_id)`
        qSelectGenome +=` LEFT JOIN \`${ntbl}\` using(genome_id)`
        qSelectGenome +=` LEFT JOIN pangenome_genome using(genome_id)`
        qSelectGenome +=` LEFT JOIN pangenome_v4 using(pangenome_id)`
    
    
    
    
   //  let qSelectGenome = "SELECT `"+tbl+"`.genome_id,`"+tbl+"`.otid,`"+tbl+"`.strain,`"+ptbl+"`.organism,`"+tbl+"`.contigs,`"+tbl+"`.combined_size,`"+tbl+"`.MAG,`"+tbl+"`.GC,`"+tbl+"`.url,`"+tbl+"`.GTDB_taxonomy, "
//         qSelectGenome +=" bioproject,taxid,biosample,assembly_name,assembly_level,assembly_method,"
//         qSelectGenome +=" submission_date,geo_loc_name,isolation_source,status,seqtech,submitter,coverage,ANI,checkM_completeness,checkM_contamination,checkM2_completeness,checkM2_contamination,refseq_assembly,WGS,"
//         qSelectGenome +=" `"+ptbl+"`.contigs as prokka_contigs,`"+ptbl+"`.CDS as prokka_CDS,`"+ptbl+"`.gene as prokka_gene,`"+ptbl+"`.mRNA as prokka_mRNA,`"+ptbl+"`.misc_RNA as prokka_misc_RNA,`"+ptbl+"`.rRNA as prokka_rRNA,`"+ptbl+"`.tRNA as prokka_tRNA,`"+ptbl+"`.tmRNA as prokka_tmRNA,"
//         
//         qSelectGenome +=" pangenome_v4.pangenome_name as pangenome"  // works as long as only one pg per genome
// 
//         qSelectGenome +=" FROM `"+tbl+"`"
//         qSelectGenome +=" LEFT JOIN `"+ptbl+"` using(genome_id)"
//         qSelectGenome +=" LEFT JOIN `"+ntbl+"` using(genome_id)"
//         
//         qSelectGenome +=" LEFT JOIN `pangenome_genome` using(genome_id)"
//         qSelectGenome +=" LEFT JOIN `pangenome_v4` using(pangenome_id)"
    console.log(qSelectGenome)
    return qSelectGenome
}
module.exports.get_all_genomes = () => {  // for downld all
    let q = genome_query()

    return q
}
module.exports.get_genome = (gid) => {   // always NCBI for taxon description
    let q = genome_query()
    q +=" WHERE genome_id = '"+gid+"'"
  
    return q 
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
module.exports.get_contig = (gid, mid) => {   // always NCBI for taxon description
  //const db = 'NCBI_' + gid
  let qSelectContigs = "SELECT UNCOMPRESS(seq_compressed) as seq from `NCBI_contig`.`contig_seq` WHERE genome_id = '"+gid+"' and mol_id='"+mid+"'"
  // molecules is from which file? NCBI: gb_asmbly+asm_name+.genomic.fna.gz
  //                               PROKKA gb_asmbly+.fna.gz
  // asm_name amd gb_asm are both from genomes_obj
  //qSelectContigs = "SELECT accession, GC from "+db+".molecules"
  return qSelectContigs
}
