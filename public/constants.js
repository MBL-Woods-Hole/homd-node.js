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
constants.abundance_refs  = ['segata','eren_v1v3','eren_v3v5','dewhirst']
//constants.abundance_order = ['BM',"KG",'HP','TD','PT','TH','SV',"SupP","SubP",'ST']
constants.base_abundance_order      = ['SubP','SupP','KG','BM','HP','SV','TH','PT','TD'] //,'NS','ST']
constants.segata_order =   constants.base_abundance_order.concat(['ST'])
constants.eren_order = constants.base_abundance_order.concat(['ST'])
constants.dewhirst_order  = constants.base_abundance_order.concat(['NS'])
//constants.eren_order =     ['BM',"KG",'HP','TD','PT','TH','SV','SupP','SubP','ST']
//constants.site_order      = ['SubP','SupP','KG','BM','HP','SV','TH','PT','TD','NS','ST']
constants.abundance_names = {
      'BM': "Buccal Mucosa (BM)",
      "KG": "Keratinized Gingiva (KG)",
      'HP': 'Hard Palate (HP)',
      'TH': "Throat",
      "PT": "Palatine Tonsils (PT)",
      "TD": 'Tongue Dorsum (TD)',
      "SV": "Saliva",
      "SupP": "Supra-gingival Plaque (SupP)",
      "SubP": "Sub-gingival Plaque (SubP)",
      "NS": "Nasal",
      "ST": "Stool"
}  

//All the Capnocytophaga can be the same color;
let capno_color ='#a1ee0a'
//both Corynebacterium matruchotii and Corynebacterium durum can be the same color;
let coryne_color = '#da70d6'
// The 5 nasal Corynebacterium (accolens, pseudodiphtheriticum, tuberculostearucium, propinquum, macginleyi) can be the same color;
let nasal_coryne_color = 'lightblue'
// Staph epidermidis and Staph aureus can be the same color;
let staph_color = 'tomato'
// Anaerococcus octavius and Anaerococcus sp. HMT 290 can be the same colorc;
let anaero_color = 'PaleGoldenrod'
// Haemophilus haemolyticus and H. sp. HMT 036 can be the same color;
let haemo_color = 'silver'
// Leptotrichia buccalis and Leptotrichia wadei can be the same color;
let lepto1_color = '#00ffff'
// Leptotrichia sp. HMT 417 and Pseudoleptotrichia HMT 221 can be the same color;
let lepto2_color = '#96152e'
// and it would be good if S. mitis, S. oralis, and S. infantis, and S. spp. HMT 074 and 423 
//were very similar color or the same color to emphasize that we can't really tell them apart with this data. 
let strep_color = '#008000'
constants.plot_species = [  // to be put in db with species_id
    {name:'Actinomyces graevenitzii',color:'lightsalmon'},
    {name:'Actinomyces naeslundii',color:'#dc143c'},
    {name:'Actinomyces oris',color:'#ff4040'},
    {name:'Alloprevotella sp._HMT_473',color:'#e6082d'},
    {name:'Anaerococcus octavius',color: anaero_color},
    {name:'Anaerococcus sp._HMT_290',color: anaero_color},
    {name:'Campylobacter concisus',color:'#1f8ad5'},
    {name:'Capnocytophaga gingivalis',color: capno_color},
    {name:'Capnocytophaga granulosa',color: capno_color},
    {name:'Capnocytophaga leadbetteri',color: capno_color},
    {name:'Capnocytophaga sputigena',color: capno_color},
    {name:'Corynebacterium accolens',color: nasal_coryne_color},
    {name:'Corynebacterium durum',color: coryne_color},
    {name:'Corynebacterium macginleyi',color: nasal_coryne_color},
    {name:'Corynebacterium matruchotii',color: coryne_color},
    {name:'Corynebacterium propinquum',color: nasal_coryne_color},
    {name:'Corynebacterium pseudodiphtheriticum',color: nasal_coryne_color},
    {name:'Corynebacterium tuberculostearicum',color: nasal_coryne_color},
    {name:'Cutibacterium acnes',color:'MediumSeaGreen'},
    {name:'Fusobacterium nucleatum',color:'#fcffa4'},
    {name:'Fusobacterium periodonticum',color:'#fff44f'},
    {name:'Gemella haemolysans',color:'#3bea0f'},
    {name:'Granulicatella adiacens',color:'plum'},
    {name:'Granulicatella elegans',color:'aliceblue'},
    {name:'Haemophilus haemolyticus',color: haemo_color},
    {name:'Haemophilus parainfluenzae',color:'#ffa500'},
    {name:'Haemophilus sp._HMT_036',color: haemo_color},
    {name:'Lautropia mirabilis',color:'#804e71'},
    {name:'Leptotrichia buccalis',color: lepto1_color},
    {name:'Leptotrichia wadei',color: lepto1_color},
    {name:'Leptotrichia sp._HMT_417',color: lepto2_color},
    {name:'Neisseria flavescens',color:'#a04115'},
    {name:'Neisseria perflava',color:'#9a8bf0'},
    {name:'Porphyromonas pasteri',color:'#87cefa'},
    {name:'Porphyromonas sp._HMT_930',color:'moccasin'},
    {name:'Prevotella melaninogenica',color:'#7b68ee'},
    {name:'Prevotella oris',color:'#9400d3'},
    {name:'Pseudoleptotrichia sp._HMT_221',color: lepto2_color},
    {name:'Rothia aeria',color:'#4ddc9b'},
    {name:'Rothia dentocariosa',color:'#e13ffa'},
    {name:'Rothia mucilaginosa',color:'#f4f74a'},
    {name:'Schaalia odontolytica',color:'#ff0000'},
    {name:'Staphylococcus aureus',color: staph_color},
    {name:'Staphylococcus epidermidis',color: staph_color},
    {name:'Streptococcus australis',color:'#008080'},
    {name:'Streptococcus cristatus',color:'#008080'},
    {name:'Streptococcus infantis',color: strep_color},
    {name:'Streptococcus mitis',color: strep_color},
    {name:'Streptococcus oralis',color: strep_color},
    {name:'Streptococcus parasanguinis',color:'#3CBC3C'},
    {name:'Streptococcus salivarius',color:'#50D050'},
    {name:'Streptococcus sanguinis',color:'#008080'},
    {name:'Streptococcus sp._HMT_074',color: strep_color},
    {name:'Streptococcus sp._HMT_423',color: strep_color},
    {name:'Veillonella atypica',color:'#4eb52d'},
    {name:'Veillonella dispar',color:'#3de5c8'},
    {name:'Veillonella parvula',color:'#4ecb04'},
    {name:'Veillonella rogosae',color:'deeppink'},
    {name:'Veillonella sp._HMT_780',color:'#3bd2e4'}
]   
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