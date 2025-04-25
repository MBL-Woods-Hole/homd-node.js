const CFG   = require(app_root + '/config/config');
const constants = {};

constants.access_log_format = ':ip - [:clfDate] ":method :url :protocol/:httpVersion" :statusCode :contentLength ":userAgent"'
constants.access_logfile = CFG.LOG_DIR+'/homd-access.log'  // JBROWSE if you want a non-relative url use: config.js

constants.rRNA_refseq_version    = '16.01'  //'15.23'
constants.genomic_refseq_version = '11.0'  //'10.1'
constants.homd_taxonomy_version = '4.0'  // Used on title page

constants.genomes_table_name = 'genomesV11.0'
constants.genomes_prokka_table_name = 'genomes_prokkaV11.0'
constants.genomes_ncbi_table_name = 'genomes_ncbiV11.0'
constants.user_security_levels = {
    '1': 'Administrator',
    '50': 'Regular User',
    '99': 'Guest User'
}
//constants.ranks = ["domain", "phylum", "klass", "order", "family", "genus", "species"];
constants.ranks = ["domain", "phylum", "klass", "order", "family", "genus", "species","subspecies"];

  
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
//constants.abundance_refs  = ['segata','eren_v1v3','eren_v3v5','dewhirst']
constants.abundance_refs = ['eren_v1v3','eren_v3v5','dewhirst','hmp_refseq_v1v3','hmp_refseq_v3v5']
constants.base_abundance_order     = ['SUBP','SUPP','AKE','BMU','HPA','SAL','THR','PTO','TDO','ANA','LRC','RRC','LAF','RAF','VIN','MVA','PFO','STO']
constants.eren_abundance_order     = ['SUBP','SUPP','AKE','BMU','HPA','SAL','THR','PTO','TDO',                                                'STO']
constants.dewhirst_abundance_order = ['SUBP','SUPP','AKE','BMU','HPA','SAL','THR','PTO','TDO','ANA']
constants.hmp_metaphlan_abundance_order=['SUBP','SUPP','PERIO','AKE','BMU','HPA','SAL','THR','PTO','TDO','ANA','LRC','RRC','RAF','VIN','MVA','PFO','STO']
constants.hmp_refseq_abundance_order   =['SUBP','SUPP','AKE','BMU','HPA','SAL','THR','PTO','TDO','ANA','LRC','RRC','LAF','RAF','VIN','MVA','PFO','STO']

//CORRECT ORDER
// SubP 
// SupP
// KG = AKE
// BM = BMU
// HP = HPA
// SV = SAL
// TH = THR
// PT = PTO
// TD = TDO
// Nares = ANA
// Retroauricular crease Left = LRC
// Retroauricular crease Right = RRC
// Anterior fossa Left =LAF
// Anterior fossa Right = RAF
// Vaginal introitus =VIN
// mid-vagina = MVA
// posterior fornix = PFO 
// Stool = STO
constants.abundance_names = { 
'ANA':'Anterior Nares (nasal)',
'AKE':'Attached Keratinized Gingiva (oral)',
'BMU':'Buccal Mucosa (oral)',
'HPA':'Hard Palate (oral)',
'LAF':'L_Antecubital Fossa (skin)',
'LRC':'L_Retroauricular Crease (skin)',
'MVA':'Mid Vagina (vaginal)',
'PTO':'Palatine Tonsils (oral)',
'PFO':'Posterior Fornix (vaginal)',
'RAF':'R_Antecubital Fossa (skin)',
'RRC':'R_Retroauricular Crease (skin)',
'SAL':'Saliva (oral)',
'STO':'Stool (gut)',
'SUBP':'Subgingival Plaque (oral)',
'SUPP':'Supragingival Plaque (oral)',
'THR':'Throat (oral)',
'TDO':'Tongue Dorsum (oral)',
'VIN':'Vaginal Introitus (vaginal)',
'PERIO':'Periodontal (oral)'
}
constants.abundance_site_colors ={
    'AKE': '#ff7f0e', //Attached_Keratinized_gingiva
    'ANA': '#ffbb78', //#Anterior_nares
    'BMU':  '#2ca02c', //#Buccal_mucosa
    'HPA':  '#98df8a', //#Hard_palate
    'LAF':  '#d62728', //#L_Antecubital_fossa  # not in HMP
    'PERIO': '#aec7e8',  //# ONLY in HMP
    'LRC': '#ff9896',  //#L_Retroauricular_crease
    'MVA': '#9467bd',  //#Mid_vagina
    'PFO': '#c5b0d5',  //#Posterior_fornix
    'PTO': '#8c564b',  //#Palatine_Tonsils
    'RAF': '#c49c94',  //#R_Antecubital_fossa
    'RRC': '#e377c2',  //#R_Retroauricular_crease
    'SAL': '#f7b6d2',  //#Saliva
    
    'STO': '#7f7f7f',  //#Stool
    'SUBP': '#c7c7c7', //#Subgingival_plaque
    'SUPP': '#bcbd22', //#Supragingival_plaque
    'THR': '#dbdb8d',  //#Throat
    'TDO': '#17becf',  //#Tongue_dorsum
    'VIN':'#9edae5'   //#Vaginal_introitus
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
constants.plot_species_colors = [  // to be put in db with species_id
    {otid:'866',name:'Actinomyces graevenitzii',color:'lightsalmon'},
    {otid:'176',name:'Actinomyces naeslundii',color:'#dc143c'},
    {otid:'893',name:'Actinomyces oris',color:'#ff4040'},
    {otid:'473',name:'Alloprevotella sp._HMT_473',color:'DarkViolet'},
    {otid:'17',name:'Anaerococcus octavius',color: anaero_color[0]},
    {otid:'290',name:'Anaerococcus sp._HMT_290',color: anaero_color[1]},
    {otid:'575',name:'Campylobacter concisus',color:'#1f8ad5'},
    {otid:'337',name:'Capnocytophaga gingivalis',color: capno_color[0]},
    {otid:'325',name:'Capnocytophaga granulosa',color: capno_color[1]},
    {otid:'329',name:'Capnocytophaga leadbetteri',color: capno_color[2]},
    {otid:'775',name:'Capnocytophaga sputigena',color: capno_color[3]},
    {otid:'19',name:'Corynebacterium accolens',color: nasal_coryne_color[0]},
    {otid:'595',name:'Corynebacterium durum',color: coryne_color[0]},
    {otid:'50',name:'Corynebacterium macginleyi',color: nasal_coryne_color[1]},
    {otid:'666',name:'Corynebacterium matruchotii',color: coryne_color[1]},
    {otid:'59',name:'Corynebacterium propinquum',color: nasal_coryne_color[2]},
    {otid:'60',name:'Corynebacterium pseudodiphtheriticum',color: nasal_coryne_color[3]},
    {otid:'77',name:'Corynebacterium tuberculostearicum',color: nasal_coryne_color[4]},
    {otid:'530',name:'Cutibacterium acnes',color:'MediumSeaGreen'},
    {otid:'698',name:'Fusobacterium nucleatum',color:'yellow'},
    {otid:'201',name:'Fusobacterium periodonticum',color:'chartreuse'},
    {otid:'626',name:'Gemella haemolysans',color:'#3bea0f'},
    {otid:'534',name:'Granulicatella adiacens',color:'plum'},
    {otid:'596',name:'Granulicatella elegans',color:'aliceblue'},
    {otid:'851',name:'Haemophilus haemolyticus',color: haemo_color},
    {otid:'718',name:'Haemophilus parainfluenzae',color:'#ffa500'},
    {otid:'36',name:'Haemophilus sp._HMT_036',color: haemo_color},
    {otid:'22',name:'Lautropia mirabilis',color:'#804e71'},
    {otid:'563',name:'Leptotrichia buccalis',color: lepto1_color},
    {otid:'222',name:'Leptotrichia wadei',color: lepto1_color},
    {otid:'417',name:'Leptotrichia sp._HMT_417',color: lepto2_color},
    {otid:'610',name:'Neisseria flavescens',color:'#a04115'},
    {otid:'101',name:'Neisseria perflava',color:'#9a8bf0'},
    {otid:'279',name:'Porphyromonas pasteri',color:'#87cefa'},
    {otid:'930',name:'Porphyromonas sp._HMT_930',color:'moccasin'},
    {otid:'469',name:'Prevotella melaninogenica',color:'#7b68ee'},
    {otid:'311',name:'Prevotella oris',color:'#9400d3'},
    {otid:'221',name:'Pseudoleptotrichia sp._HMT_221',color: lepto2_color},
    {otid:'188',name:'Rothia aeria',color:'#4ddc9b'},
    {otid:'587',name:'Rothia dentocariosa',color:'#e13ffa'},
    {otid:'681',name:'Rothia mucilaginosa',color:'#f4f74a'},
    {otid:'701',name:'Schaalia odontolytica',color:'#ff0000'},
    {otid:'172',name:'Schaalia sp._HMT_172',color:'#ff0000'},
    {otid:'180',name:'Schaalia sp._HMT_180',color:'#ff0000'},
    {otid:'550',name:'Staphylococcus aureus',color: staph_color[0]},
    {otid:'601',name:'Staphylococcus epidermidis',color: staph_color[1]},
    {otid:'73',name:'Streptococcus australis',color:'#008080'},
    {otid:'578',name:'Streptococcus cristatus',color:'#008080'},
    {otid:'886',name:'Streptococcus cristatus',color:'#008080'},  //DROPPED
    {otid:'431',name:'Streptococcus infantis',color: strep_color[0]},
    {otid:'638',name:'Streptococcus infantis',color: strep_color[0]},
    {otid:'677',name:'Streptococcus mitis',color: strep_color[1]},
    {otid:'707',name:'Streptococcus oralis',color: strep_color[2]},
    {otid:'411',name:'Streptococcus parasanguinis',color:'#3CBC3C'},
    {otid:'721',name:'Streptococcus parasanguinis',color:'#3CBC3C'},  //DROPPED
    {otid:'755',name:'Streptococcus salivarius',color:'#50D050'},
    {otid:'758',name:'Streptococcus sanguinis',color:'#008080'},
    {otid:'74',name:'Streptococcus sp._HMT_074',color: strep_color[3]},
    {otid:'423',name:'Streptococcus sp._HMT_423',color: strep_color[4]},
    {otid:'524',name:'Veillonella atypica',color:'#ffcff1'},
    {otid:'160',name:'Veillonella dispar',color:'#fddde6'},
    {otid:'161',name:'Veillonella parvula',color:'#ffb6c1'},
    {otid:'158',name:'Veillonella rogosae',color:'#fba0e3'},
    {otid:'780',name:'Veillonella sp._HMT_780',color:'deeppink'}
]   

//constants.tax_sites_all =['oral','nasal','skin','vaginal','unassigned','nonoralref'];

//constants.tax_sites_on = ['oral','nasal','skin','vaginal','unassigned'];
constants.tax_sites_all ={
   'oral'         :'Oral',
   'nasal'        :'Nasal',
   'skin'         :'Skin',
   'gut'          :'Gut',
   'vaginal'      :'Vaginal',
   'pathogen'     :'Pathogen',
   'enviro'       :'Environmental',
   'ref'          :'Reference',  // Was NonOralRef
   'unassigned'   :'Unassigned'
}
constants.tax_sites_default = ['oral', 'nasal', 'skin','gut', 'vaginal', 'pathogen', 'enviro', 'ref', 'unassigned']

constants.tax_status_all     = ['named_cultivated','named_uncultivated','unnamed_cultivated','phylotype','dropped'];
constants.tax_status_default = ['named_cultivated','named_uncultivated','unnamed_cultivated','phylotype'];

constants.tax_abund_all     = ['high_abund','medium_abund','low_abund','scarce_abund','nodata_abund'];
constants.tax_abund_default = ['high_abund','medium_abund','low_abund','scarce_abund','nodata_abund'];

constants.genome_level_all = {
  'complete_genome':'Complete Genome',
  'scaffold':       'Scaffold',
  'contig':         'Contig',
  'chromosome':     'Chromosome'
}


// tax filenames (fn)
constants.genome_lookup_fn    = 'homdData-GenomeLookup.json'
constants.info_lookup_fn      = 'homdData-TaxonInfoLookup.json'
constants.references_lookup_fn  = 'homdData-TaxonReferencesLookup.json'
constants.taxcounts_fn          = 'homdData-TaxonCounts.json'
constants.taxon_lookup_fn     = 'homdData-TaxonLookup.json'
constants.lineage_lookup_fn   = 'homdData-TaxonLineagelookup.json' // supplied to create dict
constants.tax_hierarchy_fn    = 'homdData-TaxonHierarchy.json'
constants.refseq_lookup_fn    = 'homdData-TaxonRefSeqLookup.json'
constants.phage_list_fn         = 'homdData-PhageList.json'
constants.phage_lookup_fn       = 'homdData-PhageLookup.json'
constants.annotation_lookup_fn  = 'homdData-AnnotationLookup.json'
constants.contig_lookup_fn      = 'homdData-ContigsLookup.json'
constants.site_lookup_fn      = 'homdData-TaxonSiteLookup.json'
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
// constants.species_w_subspecies = {
//     'Streptococcus parasanguinis': ['clade_411','clade_721'],
//     'Streptococcus infantis': ['clade_431','clade_638'],
//     'Streptococcus cristatus': ['clade_578','clade_886'],
//     'Streptococcus oralis': ['subsp._oralis', 'subsp._dentisani_clade_058', 'subsp._dentisani_clade_398', 'subsp._tigurinus_clade_070', 'subsp._tigurinus_clade_071'],
//     'Fusobacterium nucleatum': ['subsp._animalis', 'subsp._nucleatum', 'subsp._polymorphum', 'subsp._vincentii'],
//     'Limosilactobacillus reuteri': ['clade_818','clade_938'],  // no abundance data
//     'Peptostreptococcaceae_[G-7] [Eubacterium]_yurii': ['subsps._yurii_&_margaretiae','subsp._schtitka']
// }
//
constants.anviserver_link = "https://vamps.mbl.edu/anviserver/pangenomes/"
// this should reflect what is avalable on HOMD (vamps/anviserver)
// **** NOTE NOTE This data is obsolete!! Look at the mysql table:pangenomes and the script Initialize_Taxonomy.py
constants.pangenomes = [
    {
      otids: ['46','555','626','757','928'], 
      name: 'Gemella2022_07_05',
      dnld_v7: '',  //only if present
      dnld_v8: 'HOMD_Gemella2022_07_05-V8.tar.gz',  //only if present
      show:'<i>Gemella</i> (2022-07-05)',
      seqids:['SEQF2298','SEQF2460','SEQF1019','SEQF2070','SEQF2071','SEQF2783'],
      description: 'Pangenome of the genus Gemella containing all 30 available genomes from GenBank with a RefSeq equivalent by 03/02/2021.',
      file_size: '200'
    },
    {
      otids: [], 
      name: 'Mitis_Group',
      dnld_v7: '',  //only if present
      dnld_v8: 'HOMD_Mitis_Group-V8.tar.gz',  //only if present
      show:'<i>Mitis</i> Group',
      seqids:[],
      description: 'All 134 Genomes from HMT-677 (<i>Stroptococcus Mitis</i>)',
      file_size: '586'
    },
    {
      otids: [], 
      name: 'Prochlorococcus_31',
      dnld_v7: '',  //only if present
      dnld_v8: 'HOMD_Prochlorococcus_31-V8.tar.gz',  //only if present
      show:'<i>Prochlorococcus</i> (31)',
      seqids:[],
      description: "31 Prochlorococcus genome dataset from Meren's site (Non-HOMD):<br>&nbsp;&nbsp;&nbsp;&nbsp;<a href='https://merenlab.org/2016/11/08/pangenomics-v2' target='_blank'>https://merenlab.org/2016/11/08/pangenomics-v2</a>",
      file_size: '139'
    },
    {
      otids: [], 
      name: 'Veillonella_Atypica',
      dnld_v7: 'Veillonella_atypica_pangenome-V7.tar.gz',  //only if present
      dnld_v8: 'Veillonella_atypica_pangenome-V8.tar.gz',  //only if present
      show:'<i>Veillonella atypica</i>',
      seqids:[],
      description: 'This pangenome was build using Anvi’o v7 with Python v3.7.9 and consists of 18 <i>Veillonella atypica</> (HMT-524) refseq assemblies and associated <i>V.</> sp. refseq assemblies downloaded from NCBI on 12/15/2022. Genomes are annotated with the Pfams data base (<a href="https://www.ebi.ac.uk/interpro/" target="_blank">https://www.ebi.ac.uk/interpro/</a>).',
      file_size: '442'
    },
    {
      otids: [], 
      name: 'Veillonella_Denticariosi',
      dnld_v7: 'Veillonella_denticariosi_pangenome-V7.tar.gz',  //only if present
      dnld_v8: 'Veillonella_denticariosi_pangenome-V8.tar.gz',  //only if present
      show:'<i>Veillonella denticariosi</i>',
      seqids:[],
      description: 'This pangenome was build using Anvi’o v7 with Python v3.7.9 and consists of 2 <i>Veillonella denticariosi</> (HMT-887) refseq assemblies and associated <i>V.</> sp. refseq assemblies downloaded from NCBI on 12/15/2022. Genomes are annotated with the Pfams data base (<a href="https://www.ebi.ac.uk/interpro/" target="_blank">https://www.ebi.ac.uk/interpro/</a>).',
      file_size: '428'
    },
    {
      otids: [], 
      name: 'Veillonella_Dispar',
      dnld_v7: 'Veillonella_dispar_pangenome-V7.tar.gz',  //only if present
      dnld_v8: 'Veillonella_dispar_pangenome-V8.tar.gz',  //only if present
      show:'<i>Veillonella dispar</i>',
      seqids:[],
      description: 'This pangenome was build using Anvi’o v7 with Python v3.7.9 and consists of 18 <i>Veillonella dispar</> *(HMT-160) refseq assemblies and associated <i>V.</> sp. refseq assemblies downloaded from NCBI on 12/15/2022. Genomes are annotated with the Pfams data base (<a href="https://www.ebi.ac.uk/interpro/" target="_blank">https://www.ebi.ac.uk/interpro/</a>).',
      file_size: '444'
    },
    {
      otids: [], 
      name: 'Veillonella_HMT780',
      dnld_v7: 'Veillonella_HMT780_pangenome-V7.tar.gz',  //only if present
      dnld_v8: 'Veillonella_HMT780_pangenome-V8.tar.gz',  //only if present
      show:'<i>Veillonella</i> (HMT-780)',
      seqids:[],
      description: '6 genomes for <i>Veillonella sp.</i> HMT-780 and associated <i>V.</i> sp. refseq assemblies',
      file_size: '327'
    },
    {
      otids: [], 
      name: 'Veillonella_Infantium',
      dnld_v7: 'Veillonella_infantium_pangenome-V7.tar.gz',  //only if present
      dnld_v8: 'Veillonella_infantium_pangenome-V8.tar.gz',  //only if present
      show:'<i>Veillonella infantium</i>',
      seqids:[],
      description: 'This pangenome was build using Anvi’o v7 with Python v3.7.9 and consists of 2 <i>Veillonella infantium</> refseq assemblies and associated <i>V.</> sp. refseq assemblies downloaded from NCBI on 12/15/2022. Genomes are annotated with the Pfams data base (<a href="https://www.ebi.ac.uk/interpro/" target="_blank">https://www.ebi.ac.uk/interpro/</a>).',
      file_size: '428'
    },
    {
      otids: [], 
      name: 'Veillonella_Parvula',
      dnld_v7: 'Veillonella_parvula_pangenome-V7.tar.gz',  //only if present
      dnld_v8: 'Veillonella_parvula_pangenome-V8.tar.gz',  //only if present
      show:'<i>Veillonella parvula</i>',
      seqids:[],
      description: 'This pangenome was build using Anvi’o v7 with Python v3.7.9 and consists of 29 <i>Veillonella atypica</> (HMT-161) refseq assemblies and associated <i>V.</> sp. refseq assemblies downloaded from NCBI on 12/15/2022. Genomes are annotated with the Pfams data base (<a href="https://www.ebi.ac.uk/interpro/" target="_blank">https://www.ebi.ac.uk/interpro/</a>).',
      file_size: '454'
    },
    {
      otids: [], 
      name: 'Veillonella_Rogosae',
      dnld_v7: 'Veillonella_rogosae_pangenome-V7.tar.gz',  //only if present
      dnld_v8: 'Veillonella_rogosae_pangenome-V8.tar.gz',  //only if present
      show:'<i>Veillonella rogosae</i>',
      seqids:[],
      description: 'This pangenome was build using Anvi’o v7 with Python v3.7.9 and consists of 3 <i>Veillonella rogosae</> (HMT-158) refseq assemblies and associated <i>V.</> sp. refseq assemblies downloaded from NCBI on 12/15/2022. Genomes are annotated with the Pfams data base (<a href="https://www.ebi.ac.uk/interpro/" target="_blank">https://www.ebi.ac.uk/interpro/</a>).',
      file_size: '429'
    },
    {
      otids: [], 
      name: 'Veillonella_Tobetsuensis',
      dnld_v7: 'Veillonella_tobetsuensis_pangenome-V7.tar.gz',  //only if present
      dnld_v8: 'Veillonella_tobetsuensis_pangenome-V8.tar.gz',  //only if present
      show:'<i>Veillonella tobetsuensis</i>',
      seqids:[],
      description: 'This pangenome was build using Anvi’o v7 with Python v3.7.9 and consists of 4 <i>Veillonella tobetsuensis</> refseq assemblies downloaded from NCBI on 12/15/2022. Genomes are annotated with the Pfams data base (<a href="https://www.ebi.ac.uk/interpro/" target="_blank">https://www.ebi.ac.uk/interpro/</a>).',
      file_size: '430'
    },
    {
      otids: [], 
      name: 'Veillonella_genus',
      dnld_v7: 'Veillonella_genus_pangenome-V7.tar.gz',  //only if present
      dnld_v8: 'Veillonella_genus_pangenome-V8.tar.gz',  //only if present
      show:'<i>Veillonella</i> (genus)',
      seqids:[],
      description: 'This pangenome was build using Anvi’o v7 with Python v3.7.9 and consists of 101 <i>Veillonella</> refseq assemblies downloaded from NCBI on 12/15/2022. Genomes are annotated with the Pfams data base (<a href="https://www.ebi.ac.uk/interpro/" target="_blank">https://www.ebi.ac.uk/interpro/</a>).',
      file_size: '719'
    },
]
constants.PAGER_ROWS = 500

constants.hmp_v3v5_to_suppress =[
'34','36','851',
'641','56','622','948','73','677','574','638','87','755','721','152','543','767','76' ,
'114','116','612','834','127','128','141','550','591','601','598','682','764','275','283',
'298','313','469','572','885','306','323','324','380','412','902','903','700','326','335','336',
]

// links on taxa description page
constants.link_exceptions = {}
constants.link_exceptions['105'] = {'ncbilink':'Eubacterium-infirmum','gcmlink':'Eubacterium%20infirmum','lpsnlink':'species/eubacterium-infirmum'}
constants.link_exceptions['467'] = {'ncbilink':'Eubacterium-sulci','gcmlink':'Eubacterium%20sulci','lpsnlink':'species/eubacterium-sulci'}
constants.link_exceptions['759'] = {'ncbilink':'Eubacterium-saphenum','gcmlink':'Eubacterium%20saphenum','lpsnlink':'species/eubacterium-saphenum'}
constants.link_exceptions['673'] = {'ncbilink':'Eubacterium-minutum','gcmlink':'Eubacterium%20minutum','lpsnlink':'species/eubacterium-minutum'}
constants.link_exceptions['694'] = {'ncbilink':'Eubacterium-nodatum','gcmlink':'Eubacterium%20nodatum','lpsnlink':'species/eubacterium-nodatum'}
constants.link_exceptions['557'] = {'ncbilink':'Eubacterium-brachy','gcmlink':'Eubacterium%20brachy','lpsnlink':'species/eubacterium-brachy'}
constants.link_exceptions['106'] = {'ncbilink':'Eubacterium-yurii','gcmlink':'Eubacterium%20yurii','lpsnlink':'subspecies/eubacterium-yurii-schtitka'}
constants.link_exceptions['377'] = {'ncbilink':'Eubacterium-yurii','gcmlink':'Eubacterium%20yurii','lpsnlink':'subspecies/Eubacterium-yurii-margaretiae'}
// constants.link_exceptions['174'] = {'lpsnlink':'family/Neisseriaceae'}
// constants.link_exceptions['327'] = {'lpsnlink':'family/Neisseriaceae'}
// constants.link_exceptions['274'] = {'lpsnlink':'order/Bacteroidales'}
// constants.link_exceptions[''] = {'lpsnlink':''}
// constants.link_exceptions[''] = {'lpsnlink':''}
// constants.link_exceptions[''] = {'lpsnlink':''}
// constants.link_exceptions[''] = {'lpsnlink':''}
// constants.link_exceptions[''] = {'lpsnlink':''}
// constants.link_exceptions[''] = {'lpsnlink':''}
// constants.link_exceptions[''] = {'lpsnlink':''}
// constants.link_exceptions[''] = {'lpsnlink':''}
// constants.link_exceptions[''] = {'lpsnlink':''}

module.exports = constants;