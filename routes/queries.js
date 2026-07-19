import express from 'express';
const router = express.Router()
import pool from '../config/database.js';
import C from '../public/constants.js';
import { logPoolStatus } from './helpers/helpers.js';

// Generalized query function
export const run_query = async (sql, req, res) => {
  console.log('\nExecuting:',sql)
  console.log('Request from: '+req.ip)
  logPoolStatus(res, pool)
  try {
    const [rows] = await pool.query(sql);
    return rows;
  } catch (error) {
    console.error('Database Query Error:', error);
    res.status(500).send('Error fetching MySQL data');
  }
};

export const run_query_stream = async (sql, res) => {
  console.log('Streaming:',sql)
  //logPoolStatus(res, pool)
  try {
    const connection = await pool.getConnection();
      
    const [queryStream] = await connection.query(sql) //.stream();
    return queryStream;
  } catch (error) {
    console.error('Database Query Error:', error);
    res.status(500).send('Error fetching MySQL stream');
  }
};

export const get_refseq_query = (refid) => {
  let q = 'SELECT UNCOMPRESS(seq_compressed) as seq from 16S_refseq '
  q += " WHERE refseq_id='" + refid + "'"

  return q
};

export const get_gtdb_tax = (genomes) => {
  let g = genomes.join("','")
  let q = 'SELECT genome_id, GTDB_taxonomy  from `'+C.genomes_table_name+'`'
  q += " WHERE genome_id in ('" + g + "')"
  //console.log(qSelectGTDBTaxonomy)
  return q
};

export const get_refseq_metadata_query = (otid) => {
  // let qSelectRefseqInfo = 'SELECT refseqid,seqname,strain,genbank from taxon_refseqid '
//   qSelectRefseqInfo += " WHERE otid='" + otid + "'"
  let q = 'SELECT refseq_id,species,seqids from homd.16S_refseq '
  q += " WHERE otid='" + otid + "'"

  return q
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
  let q 
  if(anno === 'prokka'){
    q = "SELECT a.accession, type, gc, a.protein_id, product, a.length_na, a.length_aa, `start`, `end`, gene"
   q += ' FROM PROKKA.orf_gff a'
   q += ' LEFT JOIN PROKKA.faa b on a.genome_id=b.genome_id and a.protein_id=b.protein_id '
   q += ' LEFT JOIN PROKKA.ffn c on a.genome_id=c.orf_id and a.protein_id=c.orf_id '
   q += " WHERE a.genome_id = '"+gid+"'"
    
    

  
  }else if(anno === 'ncbi') {
    q = "SELECT a.accession, type, gc, a.protein_id, product, a.length_na, a.length_aa, `start`, `end`, gene"
    q += ' FROM NCBI.orf_gff a'
    q += ' LEFT JOIN NCBI.faa b on a.genome_id=b.genome_id and a.protein_id=b.protein_id '
    q += ' LEFT JOIN NCBI.ffn c on a.genome_id=c.orf_id and a.protein_id=c.orf_id '
    q += " WHERE a.genome_id = '"+gid+"'"
  
  }else{ // BAKTA
//     SELECT a.region, a.type,  a.attribute_locus_tag as locus_tag,  a.attribute_product as product, 'c.length_na', b.length_aa, a.`start`, a.`end`, a.attribute_gene as gene 
// FROM BAKTA.gff a 
// LEFT JOIN BAKTA.faa b on b.protein_id=a.attribute_locus_tag
/* using(protein_id)  */
/* LEFT JOIN BAKTA.ffn c using(protein_id)  */
//WHERE a.genome_id = 'GCA_900105505.1'
    q = 'SELECT a.region, a.type,  a.attribute_locus_tag as protein_id,  a.attribute_product as product, "c.length_na", b.length_aa, a.`start`, a.`end`, a.attribute_gene as gene '
    q += ' FROM BAKTA.gff a'
    q += ' LEFT JOIN BAKTA.faa b on a.genome_id=b.genome_id and b.protein_id=a.attribute_locus_tag'
    //qSelectAnno += ' LEFT JOIN BAKTA.ffn c using(protein_id)'
    q += " WHERE a.genome_id = '"+gid+"'"
  }
  
  // const db = anno.toUpperCase() + '_' + gid  // ie: NCBI_SEF10000
//   let qSelectAnno = 'SELECT accession, GC, protein_id, product,length,`start`,`stop`,length(seq_na) as len_na,length(seq_aa) as len_aa FROM ' + db + '.ORF_seq'
//   qSelectAnno += ' JOIN ' + db + '.molecules ON ' + db + '.ORF_seq.mol_id=' + db + '.molecules.id'
  return q
};

export const get_lineage_query = (otid) => {
   let q = 'SELECT domain,phylum,klass,`order`,family,genus,species,subspecies from otid_prime'
    q += ' join taxonomy using(taxonomy_id)'
    q += ' join domain using(domain_id)'
    q += ' join phylum using(phylum_id)'
    q += ' join klass using(klass_id)'
    q += ' join `order` using(order_id)'
    q += ' join family using(family_id)'
    q += ' join genus using(genus_id)'
    q += ' join species using(species_id)'
    q += ' join subspecies using(subspecies_id)'
    q += " WHERE otid='"+otid+"'"
    return q
};

export const get_all_pangenomes_query = () => {
    let q = "SELECT pangenome_name,homd_genome_version,description FROM pangenomes"
    q += " WHERE active='1' AND homd_genome_version = '"+C.genomic_refseq_version+"'"
    q += " ORDER by pangenome_name"
    return q
};

export const get_pangenomes_query = (otid) => {
    //let q = "SELECT distinct pangenome_name from pangenome_genome"
    let q = "SELECT DISTINCT pangenomes.pangenome_name as pg" 
    q += " FROM pangenome_genome"
    q += " JOIN pangenomes using(pangenome_id)"
    q += " WHERE otid='"+otid+"' AND homd_genome_version = '"+C.genomic_refseq_version+"'"
    return q
};

export const get_peptide = () => {
/// USING Ver 3.1
    let q = "SELECT `genomes`.otid, study_id, seq_id, organism, protein_accession,jb_link,molecule,peptide_id,peptide,product from protein_peptide"
    q += " JOIN `genomes` using (seq_id)"
    
    return q
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
    let q = "SELECT contig,operon,operon_pos,prediction,crisprs,distances,prediction_cas,prediction_crisprs"
    q += " FROM crispr_cas where genome_id='"+gid+"'"
    
    return q
};
export const get_all_crispr_cas_data = () => {
    let q = "SELECT homd.genome_id,contig,operon,operon_pos,prediction,crisprs,distances,prediction_cas,prediction_crisprs"
    q += " FROM crispr_cas"
    
    return q
};
export const get_amr_data = (gid) => {
    let q = 'SELECT homd.amr.protein_id,element_symbol,element_name,scope,type,subtype,class,'
    q += "subclass,method,target_length,ref_seq_length,pct_cov_of_ref,pct_ident_to_ref,align_length,closest_ref_acc, "
    q += "closest_ref_name,hmm_acc,hmm_description,region,start,stop"
    q += " FROM homd.amr"
    q += " JOIN PROKKA.orf using(protein_id)"
    q += " WHERE homd.amr.genome_id='"+gid+"'"
    
    return q
};
export const get_all_amr_data = () => {
    let q = 'SELECT amr.genome_id,homd.amr.protein_id,element_symbol,element_name,scope,type,subtype,class,'
    q += "subclass,method,target_length,ref_seq_length,pct_cov_of_ref,pct_ident_to_ref,align_length,closest_ref_acc, "
    q += "closest_ref_name,hmm_acc,hmm_description,region,start,stop"
    q += " FROM homd.amr"
    q += " JOIN PROKKA.orf using(protein_id)"
    
    return q
};
export const get_AA_NA = (db, gid, pid,type) => {
    let q = ''
    if(type === 'prokka-na' || type === 'ncbi-na'){
        q = 'SELECT UNCOMPRESS(seq_compressed) as seq FROM ' + db
        //q += " WHERE genome_id ='"+gid+"' and orf_id='" + pid + "'"
        q += " WHERE genome_id ='"+gid+"' and protein_id='" + pid + "'"
    }else{
        q = 'SELECT UNCOMPRESS(seq_compressed) as seq FROM ' + db
        q += " WHERE genome_id ='"+gid+"' and protein_id='" + pid + "'"
    }
    console.log(q)
    return q
};

// export const get_bakta_AA = (db, gid, pid, type ) => {
//     let q = 'SELECT UNCOMPRESS(seq_compressed) as seq FROM ' + db
//     q += " WHERE genome_id ='"+gid+"' and protein_id='" + pid + "'"
//     
//     return q
// };

function genome_query() {
    let tbl  = C.genomes_table_name
    let ntbl = C.genomes_ncbi_table_name
    let ptbl = C.genomes_prokka_table_name
    let q = `SELECT \`${tbl}\`.genome_id as GENOME_ID,concat("HMT-",LPAD(\`${tbl}\`.otid,3,"0")) as HMT_ID,`
        q +=` \`${tbl}\`.strain,naming_status as hmt_naming_status, cultivation_status as hmt_cultivation_status,`
        q +=` site as hmt_primary_body_site_w_abundance,\`${ptbl}\`.organism,\`${tbl}\`.contigs,\`${tbl}\`.combined_size,`
        q +=` \`${tbl}\`.MAG,\`${tbl}\`.GC,\`${tbl}\`.url,\`${tbl}\`.GTDB_taxonomy,  bioproject,taxid,biosample,`
        q +=` assembly_name,assembly_level,assembly_method, submission_date,geo_loc_name,isolation_source,`
        q +=` seqtech,submitter,coverage,ANI,checkM_completeness,checkM_contamination,checkM2_completeness,`
        q +=` checkM2_contamination,refseq_assembly,WGS,`
        q +=` \`${ptbl}\`.CDS as prokka_CDS,\`${ptbl}\`.gene as prokka_gene,\`${ptbl}\`.mRNA as prokka_mRNA,`
        q +=` \`${ptbl}\`.misc_RNA as prokka_misc_RNA,\`genomes_prokkaV11.0\`.rRNA as prokka_rRNA,`
        q +=` \`${ptbl}\`.tRNA as prokka_tRNA,\`${ptbl}\`.tmRNA as prokka_tmRNA,`
        q +=` pangenomes.pangenome_name as pangenome`
        q +=` FROM \`${tbl}\``
        q +=` JOIN status using(otid)`
        q +=` JOIN sites on primary_body_site_id = site_id`
        q +=` LEFT JOIN \`${ptbl}\` using(genome_id)`
        q +=` LEFT JOIN \`${ntbl}\` using(genome_id)`
        q +=` LEFT JOIN pangenome_genome using(genome_id)`
        q +=` LEFT JOIN pangenomes using(pangenome_id)`
    
    return q
}

export const get_all_genomes = () => {  // for downld all
    let q = genome_query()
    return q
};

export const get_genome = (gid) => {   // always NCBI for genome description
    let q = genome_query()
    q +=" WHERE genome_id = '"+gid+"'"
    q += " AND homd_genome_version = '"+C.genomic_refseq_version+"'" // for correct pangenome
  
    return q 
};

export const get_contigs = (gid) => {   // always NCBI for taxon description
  //const db = 'NCBI_' + gid
  let q = "SELECT accession, GC from `NCBI`.`molecule` WHERE genome_id = '"+gid+"'"
  // molecules is from which file? NCBI: gb_asmbly+asm_name+.genomic.fna.gz
  //                               PROKKA gb_asmbly+.fna.gz
  // asm_name amd gb_asm are both from genomes_obj
  //qSelectContigs = "SELECT accession, GC from "+db+".molecules"
  return q
};

export const get_contig = (gid, mid) => {   // always NCBI for taxon description
  //const db = 'NCBI_' + gid
  let q = "SELECT UNCOMPRESS(seq_compressed) as seq from `NCBI`.`contig` WHERE genome_id = '"+gid+"' and mol_id='"+mid+"'"
  // molecules is from which file? NCBI: gb_asmbly+asm_name+.genomic.fna.gz
  //                               PROKKA gb_asmbly+.fna.gz
  // asm_name amd gb_asm are both from genomes_obj
  //qSelectContigs = "SELECT accession, GC from "+db+".molecules"
  return q
};

export const get_all_phage_for_download = () => {
    let q = "SELECT genome_id,site,cenote_count,cenote_coverage_bps,cenote_coverage_pct,"
    q += "genomad_count,genomad_coverage_bps,genomad_coverage_pct,"
    q += "phage_id,type,contig,start,end"
    q += " FROM phage_stats"
    q += " JOIN phage_data using (genome_id)"
    
    return q

};

export const get_phage = (gid) => {   // always NCBI for taxon description

  let q = "SELECT phage_id,type,contig,start,end FROM phage_data where genome_id='"+gid+"'"
  return q
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
  
    q += "accession,"
    q += "description"
    
    q += " from phage_search where search_id in ("+search_id_list+')'
  return q
};

export default router;