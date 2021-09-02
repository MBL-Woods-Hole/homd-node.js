const CFG   = require(app_root + '/config/config');
let constants = {};

constants.rRNA_refseq_version    = '15.22'
constants.genomic_refseq_version = '9.14'

//constants.ranks = ["domain", "phylum", "klass", "order", "family", "genus", "species"];
constants.ranks = ["domain", "phylum", "klass", "order", "family", "genus", "species","subspecies"];
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
constants.references_lookup_fn 	= 'homdData-TaxonReferencesLookup.json'
constants.taxcounts_fn 	        = 'homdData-TaxonCounts.json'
constants.taxon_lookup_fn 		= 'homdData-TaxonLookup.json'
constants.lineage_lookup_fn 	= 'homdData-TaxonLineagelookup.json'
constants.tax_hierarchy_fn 		= 'homdData-TaxonHierarchy.json'
constants.refseq_lookup_fn 		= 'homdData-TaxonRefSeqLookup.json'
constants.phage_list_fn         = 'homdData-PhageList.json'
constants.phage_lookup_fn       = 'homdData-PhageLookup.json'
constants.annotation_lookup_fn  = 'homdData-AnnotationLookup.json'
constants.segata_lookup_fn      = 'segata_taxon_abundance_data.json'

//constants.access_log_format = 'url=":url" method=":method" statusCode=":statusCode" delta=":delta" ip=":ip"'
constants.access_log_format = ':ip - [:clfDate] ":method :url :protocol/:httpVersion" :statusCode :contentLength ":userAgent"'

constants.access_logfile = CFG.LOG_DIR+'/homd-access.log'  // if you want a non-relative url use: config.js

constants.default_phage_cols = [  // six at most
       {name:'pid', view:'Phage-ID', width:'col1', order:'1'},
       {name:'family_ncbi', view:'Phage Family', width:'col3', order:'2'},
       {name:'genus_ncbi', view:'Phage Genus', width:'col3', order:'3'},
       {name:'species_ncbi', view:'Phage Species', width:'col3', order:'4'},
       {name:'host_otid', view:'Host Taxon-ID', width:'col1', order:'5'},
       {name:'host_ncbi', view:'Host Name', width:'', order:'6'} // one col should have no width
  ] 
constants.all_phage_cols = [
      {name:'pid', view:'Phage-ID', width:'col1', order:'1'},
      {name:'host_otid', view:'Host Taxon-ID', width:'col1', order:'5'},
      {name:'assembly_ncbi', view:'NCBI Assembly', width:'col3', order:''},
      {name:'sra_accession_ncbi', view:'SRA Accession', width:'col3', order:''},
      {name:'submitters_ncbi', view:'NCBI Submitters', width:'col5', order:''},
      {name:'release_date_ncbi', view:'NCBI Release Date', width:'col3', order:''},
      {name:'family_ncbi', view:'Phage Family', width:'col3', order:'2'},
      {name:'genus_ncbi', view:'Phage Genus', width:'col3', order:'3'},
      {name:'species_ncbi', view:'Phage Species', width:'col3', order:'4'},
      {name:'publications_ncbi', view:'Publications', width:'col3', order:''},
      {name:'molecule_type_ncbi', view:'Molecule Type', width:'col1', order:''},
      {name:'sequence_type_ncbi', view:'Sequence Type', width:'col1', order:''},
      {name:'geo_location_ncbi', view:'Geo Location', width:'col1', order:''},
      {name:'usa_ncbi', view:'USA', width:'col1', order:''},
      {name:'host_ncbi', view:'Host Name', width:'', order:'6'}, // one col should have no width
      {name:'isolation_source_ncbi', view:'Isolation Source', width:'col3', order:''},
      {name:'collection_date_ncbi', view:'Collection Date', width:'col3', order:''},
      {name:'biosample_ncbi', view:'BioSample', width:'col3', order:''},
      {name:'genbank_title_ncbi', view:'Genbank Title', width:'col3', order:''}
  ]
  
module.exports = constants;