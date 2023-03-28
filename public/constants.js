const CFG   = require(app_root + '/config/config');
const constants = {};

constants.rRNA_refseq_version    = '15.22'
constants.genomic_refseq_version = '10.1'
constants.use_cluster = false
constants.user_security_levels = {
    '1': 'Administrator',
    '50': 'Regular User',
    '99': 'Guest User'
}
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
constants.names_w_text = {
  genera:['Actinomyces','Campylobacter','Corynebacterium','Gemella','Leptotrichia',
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
  ],
  species:['666']
}
constants.abundance_refs  = ['segata','eren_v1v3','eren_v3v5','dewhirst']
//constants.abundance_order = ['BM',"KG",'HP','TD','PT','TH','SV',"SupP","SubP",'ST']
constants.base_abundance_order       = ['SubP','SupP','KG','BM','HP','SV','TH','PT','TD'] //,'NS','ST']
//constants.base_abundance_graphs      = ['SubP','SupP','KG','BM','HP','SV','TH','PT','TD','NS']
//constants.segata_order =   constants.base_abundance_order.concat(['ST'])
//constants.eren_order = constants.base_abundance_order.concat(['ST'])
//constants.dewhirst_order  = constants.base_abundance_order.concat(['NS'])
//constants.eren_order =     ['BM',"KG",'HP','TD','PT','TH','SV','SupP','SubP','ST']
//constants.site_order      = ['SubP','SupP','KG','BM','HP','SV','TH','PT','TD','NS','ST']
constants.abundance_names = {
      'BM': "Buccal Mucosa (BM)",
      "KG": "Keratinized Gingiva (KG)",
      'HP': 'Hard Palate (HP)',
      'TH': "Throat (TH)",
      "PT": "Palatine Tonsils (PT)",
      "TD": 'Tongue Dorsum (TD)',
      "SV": "Saliva (SV)",
      "SupP": "Supra-gingival Plaque (SupP)",
      "SubP": "Sub-gingival Plaque (SubP)",
      "NS": "Nasal (NS)",
      "ST": "Stool (ST)"
}  

//All the Capnocytophaga can be the same color;
let capno_color = ['#a1ee0a','#98fb98','#00ff7f','#adff2f']  // 4 greens
//both Corynebacterium matruchotii and Corynebacterium durum can be the same color;
let coryne_color = ['#da70d6', 'magenta']// 2 magenta
// The 5 nasal Corynebacterium (accolens, pseudodiphtheriticum, tuberculostearucium, propinquum, macginleyi) can be the same color;
let nasal_coryne_color = ['lightblue','#ace5ee','#abcdef','#a4dded','#b0e0e6']
// Staph epidermidis and Staph aureus can be the same color;
let staph_color = ['tomato','lightsalmon']
// Anaerococcus octavius and Anaerococcus sp. HMT 290 can be the same colorc;
let anaero_color = ['#fff8dc','#fcffa4']
// Haemophilus haemolyticus and H. sp. HMT 036 can be the same color;
let haemo_color = 'orangered'
// Leptotrichia buccalis and Leptotrichia wadei can be the same color;
let lepto1_color = '#00ffff'
// Leptotrichia sp. HMT 417 and Pseudoleptotrichia HMT 221 can be the same color;
let lepto2_color = '#96152e'
// and it would be good if S. mitis, S. oralis, and S. infantis, and S. spp. HMT 074 and 423 
//were very similar color or the same color to emphasize that we can't really tell them apart with this data. 
let strep_color = ['#acbf60','#b0c24a','#a4c639','#8c9e5e','#9ab973'] // 5 green
constants.plot_species = [  // to be put in db with species_id
    {name:'Actinomyces graevenitzii',color:'lightsalmon'},
    {name:'Actinomyces naeslundii',color:'#dc143c'},
    {name:'Actinomyces oris',color:'#ff4040'},
    {name:'Alloprevotella sp._HMT_473',color:'DarkViolet'},
    {name:'Anaerococcus octavius',color: anaero_color[0]},
    {name:'Anaerococcus sp._HMT_290',color: anaero_color[1]},
    {name:'Campylobacter concisus',color:'#1f8ad5'},
    {name:'Capnocytophaga gingivalis',color: capno_color[0]},
    {name:'Capnocytophaga granulosa',color: capno_color[1]},
    {name:'Capnocytophaga leadbetteri',color: capno_color[2]},
    {name:'Capnocytophaga sputigena',color: capno_color[3]},
    {name:'Corynebacterium accolens',color: nasal_coryne_color[0]},
    {name:'Corynebacterium durum',color: coryne_color[0]},
    {name:'Corynebacterium macginleyi',color: nasal_coryne_color[1]},
    {name:'Corynebacterium matruchotii',color: coryne_color[1]},
    {name:'Corynebacterium propinquum',color: nasal_coryne_color[2]},
    {name:'Corynebacterium pseudodiphtheriticum',color: nasal_coryne_color[3]},
    {name:'Corynebacterium tuberculostearicum',color: nasal_coryne_color[4]},
    {name:'Cutibacterium acnes',color:'MediumSeaGreen'},
    {name:'Fusobacterium nucleatum',color:'yellow'},
    {name:'Fusobacterium periodonticum',color:'chartreuse'},
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
    {name:'Schaalia sp._HMT_172',color:'#ff0000'},
    {name:'Schaalia sp._HMT_180',color:'#ff0000'},
    {name:'Staphylococcus aureus',color: staph_color[0]},
    {name:'Staphylococcus epidermidis',color: staph_color[1]},
    {name:'Streptococcus australis',color:'#008080'},
    {name:'Streptococcus cristatus',color:'#008080'},
    {name:'Streptococcus infantis',color: strep_color[0]},
    {name:'Streptococcus mitis',color: strep_color[1]},
    {name:'Streptococcus oralis',color: strep_color[2]},
    {name:'Streptococcus parasanguinis',color:'#3CBC3C'},
    {name:'Streptococcus salivarius',color:'#50D050'},
    {name:'Streptococcus sanguinis',color:'#008080'},
    {name:'Streptococcus sp._HMT_074',color: strep_color[3]},
    {name:'Streptococcus sp._HMT_423',color: strep_color[4]},
    {name:'Veillonella atypica',color:'#ffcff1'},
    {name:'Veillonella dispar',color:'#fddde6'},
    {name:'Veillonella parvula',color:'#ffb6c1'},
    {name:'Veillonella rogosae',color:'#fba0e3'},
    {name:'Veillonella sp._HMT_780',color:'deeppink'}
]   
constants.tax_status_all =['named','unnamed','phylotype','lost','dropped','nonoralref'];
constants.tax_status_on =['named','unnamed','phylotype','lost'];
constants.tax_sites_all =['oral','nasal','skin','vaginal','unassigned','nonoralref'];
constants.tax_sites_on =['oral', 'nasal', 'skin', 'vaginal', 'unassigned'];

// tax filenames (fn)
constants.genome_lookup_fn    = 'homdData-GenomeLookup.json'
constants.info_lookup_fn      = 'homdData-TaxonInfoLookup.json'
constants.references_lookup_fn  = 'homdData-TaxonReferencesLookup.json'
constants.taxcounts_fn          = 'homdData-TaxonCounts.json'
constants.taxon_lookup_fn     = 'homdData-TaxonLookup.json'
constants.lineage_lookup_fn   = 'homdData-TaxonLineagelookup.json'
constants.tax_hierarchy_fn    = 'homdData-TaxonHierarchy.json'
constants.refseq_lookup_fn    = 'homdData-TaxonRefSeqLookup.json'
constants.phage_list_fn         = 'homdData-PhageList.json'
constants.phage_lookup_fn       = 'homdData-PhageLookup.json'
constants.annotation_lookup_fn  = 'homdData-AnnotationLookup.json'
constants.contig_lookup_fn      = 'homdData-ContigsLookup.json'
//constants.image_location_fn     = 'ImageLocation.js'

constants.image_location_locfn     = 'ImageLocation_loc.js'
constants.image_location_taxfn     = 'ImageLocation_tax.js'
//constants.abundance_lookup_fn      = 'homdData-Abundance.json'
constants.hires_images = {
   "Capno_256x256.png": "Capnocytophaga_HighRes.png",
   "Coryne_matruch_256x256.png": "Coryne_matruch_HighRes.png",
   "Leptotrichia_256x256.png": "Leptotrichia_HighRes.png",
   "MarkWelch2016_Fig4B_256_ForCoryne_Porph_Strep_Aggr.png": "MarkWelch2016_Fig4B_HighRes.png",
   "Schaalia_Rothmuc_Neiss_Veill_256.png": "Schaalia_Rothmuc_Neiss_Veill_HighRes.png"
   }
//['Capnocytophaga','Coryne_matruch','Leptotrichia','MarkWelch2016_Fig4B','Schaalia_Rothmuc_Neiss_Veill']
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
constants.blast_max_file =  { size:1.50, seqs:500 }// MB === 1,500,000
 // BLASTP  Compares an amino acid query sequence against a protein sequence database
  // BLASTN  Compares a nucleotide query sequence against a nucleotide sequence database
  // BLASTX  Compares a nucleotide query sequence translated in all reading frames against a protein sequence database
  // TBLASTN Compares a protein query sequence against a nucleotide sequence database dynamically translated in all reading frames
constants.blastPrograms = ['BLASTN', 'BLASTP', 'BLASTX', 'TBLASTN']
constants.refseq_blastn_db_choices = [
     {name:'eHOMD 16s rRNA RefSeq Version 15.22 (starts at pos 28)',value:'15.22',
         filename:'HOMD_16S_rRNA_RefSeq_V15.22.fasta'},
    {name:'eHOMD 16s rRNA RefSeq Version 15.22 (starts at pos 9)',value:'15.22_9',
         filename:'HOMD_16S_rRNA_RefSeq_V15.22.p9.fasta'},
    {name:'eHOMD 16s rRNA RefSeq Version 14.51 (starts at pos 28)',value:'14.51',
         filename:'HOMD_16S_rRNA_RefSeq_V14.51.fasta'},
    {name:'eHOMD 16s rRNA RefSeq Version 14.51 (starts at pos 9)',value:'14.51-9',
         filename:'HOMD_16S_rRNA_RefSeq_V14.51.p9.fasta'},
    
    {name:'eHOMD 16s rRNA RefSeq Version 14.51 (starts at 28 trimmed at 1407 of aligned seq)',value:'14.51-trimmed',
         filename:'HOMD_16S_rRNA_RefSeq_V14.5.trimmed.fasta'},
    {name:'eHOMD 16s rRNA RefSeq Version 13.2 (starts at pos 28)',value:'13.2',
         filename:'HOMD_16S_rRNA_RefSeq_V13.2.fasta'},    
    {name:'eHOMD 16s rRNA RefSeq Version 13.2 (starts at pos 9)',value:'13.2-9',
         filename:'HOMD_16S_rRNA_RefSeq_V13.2.p9.fasta'},
    
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
constants.all_genome_blastn_db_choices = { 
    nucleotide:
    [
      // blastn & tblastn & tblastx 2dbs: 
      {name: 'Genomic DNA from all HOMD Genomes', value:'all_genomes1', programs:['blastn','tblastn','tblastx'],
           ext:'fna',filename:'fna/ALL_genomes.fna'},
      {name: 'DNA Sequences of Proteins from all HOMD Genomes', value:'all_genomes2', programs:['blastn','tblastn','tblastx'],
           ext:'ffn',filename:'ffn/ALL_genomes.ffn'}
    ],
//>1
//LLGDFFRKSKEKIGKEFKRIVQRIKDFLRNLVPRTES
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
//
constants.anviserver_link = "https://vamps.mbl.edu/anviserver/pangenomes/"
// this should reflect what is avalable on HOMD (vamps/anviserver)
// **** NOTE NOTE This data is obsolete!! Look at the mysql table:pangenomes and the script Initialize_Taxonomy.py
constants.pangenomes = [
    {
      otids: ['46','555','626','757','928'], 
      pangenome_name: 'Gemella2022_07_05',
      seqids:['SEQF2298','SEQF2460','SEQF1019','SEQF2070','SEQF2071','SEQF2783'],
      description: 'Pangenome of the genus Gemella containing all 30 available genomes from GenBank with a RefSeq equivalent by 03/02/2021.'
    }
    
    // **** NOTE NOTE This data is obsolete!!
    
]
constants.PAGER_ROWS = 500

module.exports = constants;