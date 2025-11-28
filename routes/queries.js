import express from 'express';
const router = express.Router()

import C from '../public/constants.js';

export const get_refseq_query = (refid) => {
  let qSelectRefseq = 'SELECT UNCOMPRESS(seq_compressed) as seq from 16S_refseq '
  qSelectRefseq += " WHERE refseq_id='" + refid + "'"

  return qSelectRefseq
};

export const get_gtdb_tax = (genomes) => {
  let g = genomes.join("','")
  let qSelectGTDBTaxonomy = 'SELECT genome_id, GTDB_taxonomy  from `'+C.genomes_table_name+'`'
  qSelectGTDBTaxonomy += " WHERE genome_id in ('" + g + "')"
  //console.log(qSelectGTDBTaxonomy)
  return qSelectGTDBTaxonomy
};

export const get_refseq_metadata_query = (otid) => {
  // let qSelectRefseqInfo = 'SELECT refseqid,seqname,strain,genbank from taxon_refseqid '
//   qSelectRefseqInfo += " WHERE otid='" + otid + "'"
  let qSelectRefseqInfo = 'SELECT refseq_id,species from homd.16S_refseq '
  qSelectRefseqInfo += " WHERE otid='" + otid + "'"

  return qSelectRefseqInfo
};

export const get_taxon_info_query = (otid) => {
  let q = "SELECT notes,`general`,prevalence as prev,cultivability as culta,disease_associations as disease,phenotypic_characteristics as pheno"
  q += " from taxon_info"
  q += " WHERE otid='"+otid+"'"
  return q
};

export const get_dropped_taxa = () => {
  
  let q = "SELECT otid, naming_status, cultivation_status, notes, genus, species from otid_prime"
    q += " JOIN taxonomy using(taxonomy_id)"
    q += " JOIN status using(otid)"
    q += " JOIN genus using (genus_id)"
    q += " JOIN species using (species_id)"
    q += " WHERE status='Dropped'   Order By genus,species"
  return q
};

// module.exports.get_16s_rRNA_sequence_query = (gid) => {
//   let qSelect16Sseq = 'SELECT 16s_rRNA from genomes '
//   qSelect16Sseq += "WHERE genome_id='" + gid + "'"
// 
//   return qSelect16Sseq
// }
export const get_db_updates_query = () => {
  return "SELECT otid, description, reason, date FROM updates WHERE `show`='1'"
};

// GENOMES
export const get_annotation_query = (gid, anno) => {
  let qSelectAnno 
  if(anno === 'prokka'){
    qSelectAnno = 'SELECT accession,  gc, protein_id, length_na,length_aa, `start`, `stop`,'
    
    qSelectAnno += 'PROKKA.orf.product as product,'
    qSelectAnno += 'PROKKA.orf.gene as gene,'
    qSelectAnno += 'BAKTA.orf.Bakta_product as bakta_product,'
    qSelectAnno += 'BAKTA.orf.Bakta_gene as bakta_gene,'
    qSelectAnno += 'BAKTA.orf.bakta_Length'
    qSelectAnno += ' FROM PROKKA.orf'
    qSelectAnno += ' LEFT JOIN BAKTA.orf on(protein_id=core_ID)'
  }else{
    qSelectAnno = 'SELECT accession,  gc, protein_id, product, length_na,length_aa, `start`, `stop`, gene'
    qSelectAnno += ' FROM '+anno.toUpperCase()+'.orf'
  }
  qSelectAnno += " WHERE "+anno.toUpperCase()+".orf.genome_id = '"+gid+"'"
  // const db = anno.toUpperCase() + '_' + gid  // ie: NCBI_SEF10000
//   let qSelectAnno = 'SELECT accession, GC, protein_id, product,length,`start`,`stop`,length(seq_na) as len_na,length(seq_aa) as len_aa FROM ' + db + '.ORF_seq'
//   qSelectAnno += ' JOIN ' + db + '.molecules ON ' + db + '.ORF_seq.mol_id=' + db + '.molecules.id'
  return qSelectAnno
};

export const get_lineage_query = (otid) => {
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
};

export const get_all_pangenomes_query = () => {
    let q = "SELECT pangenome_name,homd_genome_version,description FROM pangenome_v4"
    q += " WHERE active='1' ORDER by pangenome_name"
    return q
};

export const get_pangenomes_query = (otid) => {
    //let q = "SELECT distinct pangenome_name from pangenome_genome"
    let q = "SELECT DISTINCT pangenome_v4.pangenome_name as pangenome" 
    q += " FROM pangenome_genome"
    q += " JOIN pangenome_v4 using(pangenome_id)"
    q += " WHERE otid='"+otid+"'"
    return q
};

export const get_peptide = () => {
/// USING Ver 3.1
    let qSelectPeptide = "SELECT `genomes`.otid, study_id, seq_id, organism, protein_accession,jb_link,molecule,peptide_id,peptide,product from protein_peptide"
    qSelectPeptide += " JOIN `genomes` using (seq_id)"
    
    return qSelectPeptide
};

export const get_peptide2 = () => {
/// USING Ver 3.1
    let q = "SELECT seq_id, `genomes`.otid, organism, protein_count, peptide_count,study_id from protein_peptide_counts "
    q += " JOIN `genomes` using (seq_id)"
    q += " JOIN protein_peptide_counts_study using (protein_peptide_counts_id)"
    q += " JOIN protein_peptide_studies using (study_id)"
    return q
};

export const get_peptide3 = (gid) => {
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
};

export const get_crispr_cas_data = (gid) => {
    let qSelectCrisprCas = "SELECT contig,operon,operon_pos,prediction,crisprs,distances,prediction_cas,prediction_crisprs"
    qSelectCrisprCas += " FROM crispr_cas where genome_id='"+gid+"'"
    
    return qSelectCrisprCas
};

export const get_AA_NA = (db, gid, pid) => {
    let q = 'SELECT UNCOMPRESS(seq_compressed) as seq FROM ' + db
    q += " WHERE genome_id ='"+gid+"' and protein_id='" + pid + "'"
    
    return q
};

export const get_bakta_AA = (db, gid, pid) => {
    let q = 'SELECT UNCOMPRESS(seq_compressed) as seq FROM ' + db
    q += " WHERE genome_id ='"+gid+"' and core_ID='" + pid + "'"
    
    return q
};

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
        qSelectGenome +=` checkM2_contamination,refseq_assembly,WGS,`
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
    
    
    console.log(qSelectGenome)
    return qSelectGenome
}

export const get_all_genomes = () => {  // for downld all
    let q = genome_query()

    return q
};

export const get_genome = (gid) => {   // always NCBI for genome description
    let q = genome_query()
    q +=" WHERE genome_id = '"+gid+"'"
  
    return q 
};

export const get_contigs = (gid) => {   // always NCBI for taxon description
  //const db = 'NCBI_' + gid
  let qSelectContigs = "SELECT accession, GC from `NCBI`.`molecule` WHERE genome_id = '"+gid+"'"
  // molecules is from which file? NCBI: gb_asmbly+asm_name+.genomic.fna.gz
  //                               PROKKA gb_asmbly+.fna.gz
  // asm_name amd gb_asm are both from genomes_obj
  //qSelectContigs = "SELECT accession, GC from "+db+".molecules"
  return qSelectContigs
};

export const get_contig = (gid, mid) => {   // always NCBI for taxon description
  //const db = 'NCBI_' + gid
  let qSelectContigs = "SELECT UNCOMPRESS(seq_compressed) as seq from `NCBI`.`contig` WHERE genome_id = '"+gid+"' and mol_id='"+mid+"'"
  // molecules is from which file? NCBI: gb_asmbly+asm_name+.genomic.fna.gz
  //                               PROKKA gb_asmbly+.fna.gz
  // asm_name amd gb_asm are both from genomes_obj
  //qSelectContigs = "SELECT accession, GC from "+db+".molecules"
  return qSelectContigs
};

export const get_all_phage_for_download = () => {
    let q = "SELECT genome_id,site,cenote_taker3 as cenote_count,cenote_coverage_bps,cenote_coverage_pct,"
    q += "genomad as genomad_count,genomad_coverage_bps,genomad_coverage_pct,"
    q += "phage_id,type,contig,start,end"
    q += " FROM phage_stats"
    q += " JOIN phage_data using (genome_id)"
    
    //console.log(q)
    return q

};

export const get_phage = (gid) => {   // always NCBI for taxon description

  let qSelectPhage = "SELECT phage_id,type,contig,start,end FROM phage_data where genome_id='"+gid+"'"
  return qSelectPhage
};

export const get_phage_fasta = (search_id_list) => {   // 
  let q = "SELECT CONCAT('>',search_id,' | ',genome_id,' | ',contig,' | ',predictor,' | ',start,'..',end,"
    q += "' | ',accession,"
    q += "' | ',description,' | Length ',seq_length) AS defline,"
    q += "UNCOMPRESS(seq_compressed) AS sequence"
    q += " from phage_search where search_id in ("+search_id_list+')'
  return q
};

export const get_phage_from_ids_noseqs = (search_id_list) => {   // always NCBI for taxon description
  let q = "SELECT search_id,genome_id,contig,predictor,start,end,"
  // bakta_core_product,"
//     q += "IFNULL(bakta_core_note,'') as bcnote,"
//     q += "bakta_EC,"
//     q += "IFNULL(bakta_GO,'') as bakta_GO,"
//     q += "bakta_COG,"
    q += "accession,"
    q += "description"
    
    q += " from phage_search where search_id in ("+search_id_list+')'
  return q
};

export default router;