
let constants = {};

constants.rRNA_refseq_version    = '15.22'
constants.genomic_refseq_verson = '9.14'

constants.RANKS = ["domain", "phylum", "klass", "order", "family", "genus", "species"];
constants.available_jbgenomes = ['volvox','tomato','yeast_synteny'];

constants.tax_status_all =['named','unnamed','phylotype','lost','dropped'];
constants.tax_status_on =['named','unnamed','phylotype','lost'];
constants.tax_sites_all =['oral','nasal','skin','vaginal','unassigned','nonoral'];
constants.tax_sites_on =['oral', 'nasal', 'skin', 'vaginal', 'unassigned'];

// tax filenames (fn)
constants.taxcounts_fn 		= 'homd_data_taxcounts.json'
constants.tax_lookup_fn 	= 'homd_data_taxalookup.json'
constants.genome_lookup_fn 		= 'homd_genome_lookup.json'
constants.tax_hierarchy_fn 	= 'homd_data_hierarchy.json'
constants.info_lookup_fn 	= 'homd_data_infolookup.json'
constants.lineage_lookup_fn = 'homd_data_lineagelookup.json'
constants.refs_lookup_fn 	= 'homd_data_refslookup.json'
// genome filenames
//constants.gindex_lookup_fn 	= 'homd_genomedata_indexlookup.json'


module.exports = constants;