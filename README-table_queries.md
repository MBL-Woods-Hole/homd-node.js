## Taxon Table:
```
SELECT IF(otid !='', CONCAT('HMT-',LPAD(otid, 4, '0')), '') AS HMT_ID,
domain,phylum,klass,`order`,family,genus,species,subspecies,
naming_status,cultivation_status,
general_habitat,major_body_site,major_site_abundance,
ncbi_taxon_id,
ts.type_strain,
rs.rrna_sequence,
syn.synonym,
g.genome_id

FROM `otid_prime`
JOIN taxonomy using(taxonomy_id)
JOIN domain using(domain_id)
JOIN phylum using (phylum_id)
JOIN klass using (klass_id)
JOIN `order` using (order_id)
JOIN family using (family_id)
JOIN genus using(genus_id)
JOIN species  using (species_id)
JOIN subspecies using (subspecies_id)
JOIN `status` using(otid)
JOIN body_sites using(otid)
LEFT JOIN (
   select type_strain.otid,GROUP_CONCAT(type_strain) as type_strain from type_strain
   GROUP BY type_strain.otid
 ) ts using(otid)
LEFT JOIN (
   select rrna_sequence.otid,GROUP_CONCAT(rrna_sequence) as rrna_sequence from rrna_sequence
   GROUP BY rrna_sequence.otid
 ) rs using(otid)
LEFT JOIN (
   select synonym.otid,GROUP_CONCAT(synonym) as synonym from synonym
   GROUP BY synonym.otid
 ) syn using(otid)
LEFT JOIN (
   select `genomesV11.0`.otid,GROUP_CONCAT(genome_id) as genome_id from `genomesV11.0`
   GROUP BY `genomesV11.0`.otid
 ) g using(otid)
```

## Genome Table:
```
SELECT `genomesV11.0`.genome_id as GENOME_ID,concat("HMT-",LPAD(`genomesV11.0`.otid,3,"0")) as HMT_ID,
`genomesV11.0`.strain,naming_status as hmt_naming_status, cultivation_status as hmt_cultivation_status,
major_body_site as hmt_primary_body_site,major_site_abundance,`genomes_prokkaV11.0`.organism,`genomesV11.0`.contigs,`genomesV11.0`.combined_size,
`genomesV11.0`.MAG,`genomesV11.0`.GC,`genomesV11.0`.url,`genomesV11.0`.GTDB_taxonomy,  bioproject,taxid,biosample,
assembly_name,assembly_level,assembly_method, submission_date,geo_loc_name,isolation_source,
seqtech,submitter,coverage,ANI,checkM_completeness,checkM_contamination,checkM2_completeness,
checkM2_contamination,refseq_assembly,WGS,
`genomes_prokkaV11.0`.CDS as prokka_CDS,`genomes_prokkaV11.0`.gene as prokka_gene,`genomes_prokkaV11.0`.mRNA as prokka_mRNA,
`genomes_prokkaV11.0`.misc_RNA as prokka_misc_RNA,`genomes_prokkaV11.0`.rRNA as prokka_rRNA,
`genomes_prokkaV11.0`.tRNA as prokka_tRNA,`genomes_prokkaV11.0`.tmRNA as prokka_tmRNA
FROM `genomesV11.0`
JOIN status using(otid)
JOIN body_sites using(otid)
LEFT JOIN `genomes_prokkaV11.0` using(genome_id)
LEFT JOIN `genomes_ncbiV11.0` using(genome_id)
```


## Abundance Table:
```
SELECT
reference,
IF(otid !='', CONCAT('HMT-',LPAD(otid, 4, '0')), '') AS otid,
domain,
phylum,
klass,
`order`,
family,
genus,species,subspecies,
notes,level,max,
AKE_n,AKE_mean,AKE_10p,AKE_90p,AKE_prev,AKE_sd,
ANA_n,ANA_mean,ANA_10p,ANA_90p,ANA_prev,ANA_sd,
BMU_n,BMU_mean,BMU_10p,BMU_90p,BMU_prev,BMU_sd,
HPA_n,HPA_mean,HPA_10p,HPA_90p,HPA_prev,HPA_sd,
LAF_n,LAF_mean,LAF_10p,LAF_90p,LAF_prev,LAF_sd,
LRC_n,LRC_mean,LRC_10p,LRC_90p,LRC_prev,LRC_sd,
MVA_n,MVA_mean,MVA_10p,MVA_90p,MVA_prev,MVA_sd,
PFO_n,PFO_mean,PFO_10p,PFO_90p,PFO_prev,PFO_sd,
PTO_n,PTO_mean,PTO_10p,PTO_90p,PTO_prev,PTO_sd,
RAF_n,RAF_mean,RAF_10p,RAF_90p,RAF_prev,RAF_sd,
RRC_n,RRC_mean,RRC_10p,RRC_90p,RRC_prev,RRC_sd,
SAL_n,SAL_mean,SAL_10p,SAL_90p,SAL_prev,SAL_sd,
STO_n,STO_mean,STO_10p,STO_90p,STO_prev,STO_sd,
SUBP_n,SUBP_mean,SUBP_10p,SUBP_90p,SUBP_prev,SUBP_sd,
SUPP_n,SUPP_mean,SUPP_10p,SUPP_90p,SUPP_prev,SUPP_sd,
THR_n,THR_mean,THR_10p,THR_90p,THR_prev,THR_sd,
TDO_n,TDO_mean,TDO_10p,TDO_90p,TDO_prev,TDO_sd,
VIN_n,VIN_mean,VIN_10p,VIN_90p,VIN_prev,VIN_sd,
PERIO_n,PERIO_mean,PERIO_10p,PERIO_90p,PERIO_prev,PERIO_sd
FROM `abundance`
JOIN domain using(domain_id)
JOIN phylum using (phylum_id)
JOIN klass using (klass_id)
JOIN `order` using (order_id)
JOIN family using (family_id)
JOIN genus using(genus_id)
JOIN species using (species_id)
JOIN subspecies using (subspecies_id)
```


## Body Sites
```
SELECT
CONCAT('HMT-',LPAD(otid, 4, '0')) as otid,
domain,
phylum,
klass,
`order`,
family,
genus,species,subspecies,
general_habitat,

major_body_site,
secondary_sites,
major_site_abundance,
subsite_of_primary,
secondary_site_abundance,
site_reason,
curation_reference

FROM `body_sites`
join otid_prime using(otid)
join taxonomy using(taxonomy_id)
JOIN domain using(domain_id)
JOIN phylum using (phylum_id)
JOIN klass using (klass_id)
JOIN `order` using (order_id)
JOIN family using (family_id)
JOIN genus using(genus_id)
JOIN species using (species_id)
JOIN subspecies using (subspecies_id)
```

