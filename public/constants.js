const CFG   = require(app_root + '/config/config');
let constants = {};

constants.rRNA_refseq_version    = '15.22'
constants.genomic_refseq_version = '9.14'
constants.use_cluster = false

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
constants.names_w_text = {genera:['Actinomyces','Campylobacter','Corynebacterium','Gemella','Leptotrichia',
    'Porphyromonas','Pseudoleptotrichia','Schaalia','Tannerella','Aggregatibacter','Capnocytophaga',
    'Fusobacterium','Haemophilus','Neisseria','Prevotella','Rothia','Streptococcus','Veillonella'],
    provisional_genera:['Absconditabacteria_(SR1)_[G-1]','Anaerolineae_[G-1]','Bacteroidaceae_[G-1]',
    'Bacteroidales_[G-2]','Bacteroidetes_[G-3]','Bacteroidetes_[G-4]','Bacteroidetes_[G-5]','Bacteroidetes_[G-7]',
    'Clostridiales_[F-1][G-1]','Clostridiales_[F-1][G-2]','Clostridiales_[F-3][G-1]','Erysipelotrichaceae_[G-1]',
    'Gracilibacteria_(GN02)_[G-1]','Gracilibacteria_(GN02)_[G-2]','Gracilibacteria_(GN02)_[G-3]',
    'Gracilibacteria_(GN02)_[G-4]','Lachnospiraceae_[G-10]','Lachnospiraceae_[G-2]','Lachnospiraceae_[G-3]',
    'Lachnospiraceae_[G-7]','Lachnospiraceae_[G-8]','Lachnospiraceae_[G-9]','Mollicutes_[G-1]','Mollicutes_[G-2]',
    'Neisseriaceae_[G-1]','Peptoniphilaceae_[G-1]','Peptoniphilaceae_[G-2]','Peptoniphilaceae_[G-3]',
    'Peptostreptococcaceae_[G-1]','Peptostreptococcaceae_[G-2]','Peptostreptococcaceae_[G-3]',
    'Peptostreptococcaceae_[G-4]','Peptostreptococcaceae_[G-5]','Peptostreptococcaceae_[G-6]',
    'Peptostreptococcaceae_[G-7]','Peptostreptococcaceae_[G-8]','Peptostreptococcaceae_[G-9]',
    'Propionibacteriaceae_[G-1]','Propionibacteriaceae_[G-2]','Ruminococcaceae_[G-1]','Ruminococcaceae_[G-2]',
    'Ruminococcaceae_[G-3]','Saccharibacteria_(TM7)_[G-1]','Saccharibacteria_(TM7)_[G-2]',
    'Saccharibacteria_(TM7)_[G-3]','Saccharibacteria_(TM7)_[G-4]','Saccharibacteria_(TM7)_[G-5]',
    'Saccharibacteria_(TM7)_[G-6]','Saccharibacteria_(TM7)_[G-7]','Saccharibacteria_(TM7)_[G-8]',
    'Syntrophomonadaceae_[VIII][G-1]','Veillonellaceae_[G-1]'
]
    }
constants.abundance_refs = ['segata','eren_v1v3','eren_v3v5','dewhirst']
constants.abundance_order =   ['BM',"KG",'HP','TD','PT','TH','SV',"SupP","SubP",'ST']
//constants.segata_order =   ['BM',"KG",'HP','TD','PT','TH','SV',"SupP","SubP",'ST']
constants.dewhirst_order = ['BM',"KG",'HP','TD','PT','TH','SV','SupP','SubP','NS']
//constants.eren_order =     ['BM',"KG",'HP','TD','PT','TH','SV','SupP','SubP','ST']

constants.abundance_names = {
      'BM':"Buccal Mucosa (BM)",
      "KG":"Keratinized Gingiva (KG)",
      'HP':'Hard Palate (HP)',
      'TH':"Throat",
      "PT":"Palatine Tonsils (PT)",
      "TD":'Tongue Dorsum (TD)',
      "SV":"Saliva",
      "SupP":"Supra-gingival Plaque (SupP)",
      "SubP":"Sub-gingival Plaque (SubP)",
      "NS": "Nasal",
      "ST":"Stool"
}   
   
constants.tax_status_all =['named','unnamed','phylotype','lost','dropped'];
constants.tax_status_on =['named','unnamed','phylotype','lost'];
constants.tax_sites_all =['oral','nasal','skin','vaginal','unassigned','nonoralref'];
constants.tax_sites_on =['oral', 'nasal', 'skin', 'vaginal', 'unassigned'];

// tax filenames (fn)
constants.genome_lookup_fn    = 'homdData-GenomeLookup.json'
constants.info_lookup_fn    = 'homdData-TaxonInfoLookup.json'
constants.references_lookup_fn  = 'homdData-TaxonReferencesLookup.json'
constants.taxcounts_fn          = 'homdData-TaxonCounts.json'
constants.taxon_lookup_fn     = 'homdData-TaxonLookup.json'
constants.lineage_lookup_fn   = 'homdData-TaxonLineagelookup.json'
constants.tax_hierarchy_fn    = 'homdData-TaxonHierarchy.json'
constants.refseq_lookup_fn    = 'homdData-TaxonRefSeqLookup.json'
constants.phage_list_fn         = 'homdData-PhageList.json'
constants.phage_lookup_fn       = 'homdData-PhageLookup.json'
constants.annotation_lookup_fn  = 'homdData-AnnotationLookup.json'
//constants.abundance_lookup_fn      = 'homdData-Abundance.json'

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
constants.blast_max_file_size =  1500000
 // BLASTP  Compares an amino acid query sequence against a protein sequence database
  // BLASTN  Compares a nucleotide query sequence against a nucleotide sequence database
  // BLASTX  Compares a nucleotide query sequence translated in all reading frames against a protein sequence database
  // TBLASTN Compares a protein query sequence against a nucleotide sequence database dynamically translated in all reading frames
constants.blastPrograms = ['BLASTN', 'BLASTP', 'BLASTX', 'TBLASTN']
constants.refseq_blastn_db_choices = [
    {name:'eHOMD 16s rRNA RefSeq Version 15.22 (starts at pos 9)',value:'15.22_9',
         filename:'HOMD_16S_rRNA_RefSeq_V15.22.p9.fasta'},
    {name:'eHOMD 16s rRNA RefSeq Version 15.22 (starts at pos 28)',value:'15.22',
         filename:'HOMD_16S_rRNA_RefSeq_V15.22.fasta'},
    {name:'eHOMD 16s rRNA RefSeq Version 14.51 (starts at pos 9)',value:'14.51-9',
         filename:'HOMD_16S_rRNA_RefSeq_V14.51.p9.fasta'},
    {name:'eHOMD 16s rRNA RefSeq Version 14.51 (starts at pos 28)',value:'14.51',
         filename:'HOMD_16S_rRNA_RefSeq_V14.51.fasta'},
    {name:'eHOMD 16s rRNA RefSeq Version 14.51 (starts at 28 trimmed at 1407 of aligned seq)',value:'14.51-trimmed',
         filename:'HOMD_16S_rRNA_RefSeq_V14.5.trimmed.fasta'},
    {name:'eHOMD 16s rRNA RefSeq Version 13.2 (starts at pos 9)',value:'13.2-9',
         filename:'HOMD_16S_rRNA_RefSeq_V13.2.p9.fasta'},
    {name:'eHOMD 16s rRNA RefSeq Version 13.2 (starts at pos 28)',value:'13.2',
         filename:'HOMD_16S_rRNA_RefSeq_V13.2.fasta'},
// where are these DBs? are they important?
   //  {name:'Greengenes 16S rRNA Sequences (gg16S_unaligned)',value:'GG',
//          filename:''},
//     {name:'NCBI Reference RNA Sequences (refseq_rna, 1969-12-31)',value:'NCBI',
//          filename:''},
//     {name:'RDP 16S rRNA Sequences',value:'RDP',
//          filename:''},
    
    {name:'eHOMD 16s rRNA RefSeq Extended V1.1',value:'V1.1',
         filename:'Extended_reference_version1'}
]
// constants.genome_blastn_db_choices = [
constants.all_genome_blastn_db_choices = { nucleotide:
    [
      // blastn & tblastn & tblastx 2dbs: 
      {name: 'Genomic DNA from all HOMD Genomes', value:'all_genomes1', programs:['blastn','tblastn','tblastx'],
           ext:'fna',filename:'fna/ALL_genomes.fna'},
      {name: 'DNA Sequences of Proteins from all HOMD Genomes', value:'all_genomes2', programs:['blastn','tblastn','tblastx'],
           ext:'ffn',filename:'ffn/ALL_genomes.ffn'}
    ],
    protein: [
        // blastp and blastx 1db:
      { name: 'Proteins Annotated from all HOMD Genomes', value: 'all_genomes3', programs:['blastp','blastx'],
           ext:'faa',filename: 'faa/ALL_genomes.faa' }
    ]
}
constants.species_w_subspecies = {
    'Streptococcus parasanguinis': ['clade_411','clade_721'],
    'Streptococcus infantis': ['clade_431','clade_638'],
    'Streptococcus cristatus': ['clade_578','clade_886'],
    'Streptococcus oralis': ['subsp._oralis', 'subsp._dentisani_clade_058', 'subsp._dentisani_clade_398', 'subsp._tigurinus_clade_070', 'subsp._tigurinus_clade_071'],
    'Fusobacterium nucleatum': ['subsp._animalis', 'subsp._nucleatum', 'subsp._polymorphum', 'subsp._vincentii'],
    'Limosilactobacillus reuteri': ['clade_818','clade_938'],  // no abundance data
    'Peptostreptococcaceae_[G-7] [Eubacterium]_yurii': ['subsps._yurii_&_margaretiae','subsp._schtitka']
}
// constants.posters_pdfs =
// [
// {shortname:"McCafferty2014", filename:'2014-AADR-McCafferty.pdf'},
// {shortname:"Chen2014", filename:'2014-AADR-TCHEN.pdf'},
// {shortname:"Dewhirst2014", filename:'2014-AADR-DEWHIRST.pdf'},
// {shortname:"2012a", filename:'2012a.pdf'},
// {shortname:"2012b", filename:'2012b.pdf'},
// {shortname:"2012c", filename:'2012c.pdf'},
// ]

module.exports = constants;