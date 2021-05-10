const CFG   = require(app_root + '/config/config');
let constants = {};

constants.rRNA_refseq_version    = '15.22'
constants.genomic_refseq_version = '9.14'

constants.ranks = ["domain", "phylum", "klass", "order", "family", "genus", "species"];
constants.phyla = [ 'Actinobacteria',
					'Bacteroidetes',
					'Chlamydiae',
					'Chlorobi',
					'Chloroflexi',
					'Euryarchaeota',
					'Firmicutes',
					'Fusobacteria',
					'Gracilibacteria (GN02)',
					'Proteobacteria',
					'Saccharibacteria (TM7)',
					'Spirochaetes',
					'SR1',
					'Synergistetes',
					'WPS-2'
]

//constants.available_jbgenomes = ['volvox','tomato','yeast_synteny'];

constants.tax_status_all =['named','unnamed','phylotype','lost','dropped'];
constants.tax_status_on =['named','unnamed','phylotype','lost'];
constants.tax_sites_all =['oral','nasal','skin','vaginal','unassigned','nonoralref'];
constants.tax_sites_on =['oral', 'nasal', 'skin', 'vaginal', 'unassigned'];

// tax filenames (fn)
constants.genome_lookup_fn 		= 'homdData-GenomeLookup.json'
constants.info_lookup_fn 		= 'homdData-TaxonInfoLookup.json'

constants.references_lookup_fn 		= 'homdData-TaxonReferencesLookup.json'
//constants.oral_taxcounts_fn 	= 'homd_data_oral_taxcounts.json'
constants.taxcounts_fn 	        = 'homdData-TaxonCounts.json'
constants.taxon_lookup_fn 		= 'homdData-TaxonLookup.json'
//constants.oral_lineage_lookup_fn 	= 'homd_data_oral_lineagelookup.json'
constants.lineage_lookup_fn 	= 'homdData-TaxonLineagelookup.json'
//constants.oral_tax_hierarchy_fn 		= 'homd_data_oral_hierarchy.json'
constants.tax_hierarchy_fn 		= 'homdData-TaxonHierarchy.json'
constants.refseq_lookup_fn 		= 'homdData-TaxonRefSeqLookup.json'

constants.phage_list_fn          = 'homdData-PhageList.json'
//constants.phage_lookup_fn           = 'homdData-PhageLookup.json'  //dont yet have an indexID
// genome filenames
//constants.gindex_lookup_fn 	= 'homd_genomedata_indexlookup.json'

//constants.access_log_format = 'url=":url" method=":method" statusCode=":statusCode" delta=":delta" ip=":ip"'
constants.access_log_format = ':ip - [:clfDate] ":method :url :protocol/:httpVersion" :statusCode :contentLength ":userAgent"'

constants.access_logfile = CFG.LOG_DIR+'/homd-access.log'  // if you want a non-relative url use: config.js

module.exports = constants;