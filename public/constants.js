const constants = {};

constants.access_log_format =
    ':ip - [:clfDate] ":method :url :protocol/:httpVersion" :statusCode :contentLength ":userAgent"';
//constants.access_logfile = ENV.LOG_DIR+'/homd-access.log'  // JBROWSE if you want a non-relative url use: config.js

constants.rRNA_refseq_version = "16.03"; // Used on title page header
constants.genomic_refseq_version = "11.03"; // Used on title page header
constants.homd_taxonomy_version = "4.3"; // Used on title page header
constants.homd_ecology_version = "1.0";
constants.virome_version = "1.2";
constants.GTDB_version = "226"; // used on genome description page
constants.version_information = {
    rna_ver: constants.rRNA_refseq_version,
    gen_ver: constants.genomic_refseq_version,
    tax_ver: constants.homd_taxonomy_version,
    vir_ver: constants.virome_version,
    gtdb_ver: constants.GTDB_version,
    eco_ver: constants.homd_ecology_version,
};
constants.page_title = "HOMD V" + constants.homd_taxonomy_version;
constants.page_title += ENV.ENV === "localhost" ? "Local" : "";
constants.page_title += ENV.NODE_ENV === "development" ? "Dev" : "";
constants.homd_stats = {}; // SEE helpers.calculate_homd_stats()

constants.grep_search_max_rows = 70000; //500000  //100000 // up from 50000 on 2025-07-28
constants.sql_search_max_rows = 70000;
constants.genomes_table_name = "genomesV11.0";
constants.genomes_prokka_table_name = "genomes_prokkaV11.0";
constants.genomes_ncbi_table_name = "genomes_ncbiV11.0";
constants.user_security_levels = {
    1: "Administrator",
    50: "Regular User",
    99: "Guest User",
};
//constants.ranks = ["domain", "phylum", "klass", "order", "family", "genus", "species"];
constants.ranks = [
    "domain",
    "phylum",
    "klass",
    "order",
    "family",
    "genus",
    "species",
    "subspecies",
];
constants.taxon_table_headers = [
    "HMT-ID",
    "Domain",
    "Phylum",
    "Class",
    "Order",
    "Family",
    "Genus",
    "Species",
    "Subspecies",
    "Naming Status",
    "Cultivation Status",
    "Body Site(s)",
    "Type Strain",
    "16S_rRNA",
    "Synonyms",
    "NCBI Taxon ID",
    "Genome IDs",
    "Genome Size Range",
];
constants.genome_table_headers = [
    "GENOME_ID",
    "HMT_ID",
    "strain",
    "hmt_naming_status",
    "hmt_cultivation_status",
    "hmt_primary_body_site_w_abundance",
    "organism",
    "contigs",
    "combined_size",
    "MAG",
    "GC",
    "url",
    "GTDB_taxonomy",
    "bioproject",
    "taxid",
    "biosample",
    "assembly_name",
    "assembly_level",
    "assembly_method",
    "submission_date",
    "geo_loc_name",
    "isolation_source",
    "seqtech",
    "submitter",
    "coverage",
    "ANI",
    "checkM_completeness",
    "checkM_contamination",
    "checkM2_completeness",
    "checkM2_contamination",
    "refseq_assembly",
    "WGS",
    "prokka_CDS",
    "prokka_gene",
    "prokka_mRNA",
    "prokka_misc_RNA",
    "prokka_rRNA",
    "prokka_tRNA",
    "prokka_tmRNA",
    "pangenome",
];

constants.names_w_text = {
    // these genera have ejs files in partials/taxa/
    genera: [
        "Actinomyces",
        "Campylobacter",
        "Corynebacterium",
        "Gemella",
        "Leptotrichia",
        "Porphyromonas",
        "Pseudoleptotrichia",
        "Schaalia",
        "Tannerella",
        "Aggregatibacter",
        "Capnocytophaga",
        "Fusobacterium",
        "Haemophilus",
        "Neisseria",
        "Prevotella",
        "Rothia",
        "Streptococcus",
        "Veillonella",
    ],
    //   provisional_genera:['Absconditabacteria_(SR1)_[G-1]','Anaerolineae_[G-1]','Bacteroidaceae_[G-1]',
    //     'Bacteroidales_[G-2]','Bacteroidetes_[G-3]','Bacteroidetes_[G-4]','Bacteroidetes_[G-5]','Bacteroidetes_[G-7]',
    //     'Clostridiales_[F-1][G-1]','Clostridiales_[F-1][G-2]','Clostridiales_[F-3][G-1]','Erysipelotrichaceae_[G-1]',
    //     'Gracilibacteria_(GN02)_[G-1]','Gracilibacteria_(GN02)_[G-2]','Gracilibacteria_(GN02)_[G-3]',
    //     'Gracilibacteria_(GN02)_[G-4]','Lachnospiraceae_[G-10]','Lachnospiraceae_[G-2]','Lachnospiraceae_[G-3]',
    //     'Lachnospiraceae_[G-7]','Lachnospiraceae_[G-8]','Lachnospiraceae_[G-9]','Mollicutes_[G-1]','Mollicutes_[G-2]',
    //     'Neisseriaceae_[G-1]','Peptoniphilaceae_[G-1]','Peptoniphilaceae_[G-2]','Peptoniphilaceae_[G-3]',
    //     'Peptostreptococcaceae_[G-1]','Peptostreptococcaceae_[G-2]','Peptostreptococcaceae_[G-3]',
    //     'Peptostreptococcaceae_[G-4]','Peptostreptococcaceae_[G-5]','Peptostreptococcaceae_[G-6]',
    //     'Peptostreptococcaceae_[G-7]','Peptostreptococcaceae_[G-8]','Peptostreptococcaceae_[G-9]',
    //     'Propionibacteriaceae_[G-1]','Propionibacteriaceae_[G-2]','Ruminococcaceae_[G-1]','Ruminococcaceae_[G-2]',
    //     'Ruminococcaceae_[G-3]','Saccharibacteria_(TM7)_[G-1]','Saccharibacteria_(TM7)_[G-2]',
    //     'Saccharibacteria_(TM7)_[G-3]','Saccharibacteria_(TM7)_[G-4]','Saccharibacteria_(TM7)_[G-5]',
    //     'Saccharibacteria_(TM7)_[G-6]','Saccharibacteria_(TM7)_[G-7]','Saccharibacteria_(TM7)_[G-8]',
    //     'Syntrophomonadaceae_[VIII][G-1]','Veillonellaceae_[G-1]'
    //   ],
    //   provisional_genera_v4:[
    //   'Absconditibacteriota [C1 O1 F1 G1]','Absconditicoccaceae [G1]','Absconditicoccaceae [G2]',
    // 'Anaerolineae [G1]',
    // 'Anaerovoracaceae [G1]','Anaerovoracaceae [G2]','Anaerovoracaceae [G3]','Anaerovoracaceae [G4]','Anaerovoracaceae [G5]',
    // 'Anaerovoracaceae [G8]','Anaerovoraceae [G1]',
    // 'Bacteroidales [F2 G2]',
    // 'Clostridiales [F1 G1]','Clostridiales [F1 G2]','Clostridiales [F3 G1]',
    // 'Eremiobacterota [C1 O1 F1 G1]','Erysipelotrichaceae [G1]',
    // 'Gracilibacteria [C1 O1 F1 G1]',
    // 'Lachnospiraceae [G10]','Lachnospiraceae [G2]','Lachnospiraceae [G3]','Lachnospiraceae [G7]','Lachnospiraceae [G8]','Lachnospiraceae [G9]','Leptotrichiaceae [G1]',
    // 'Mollicutes [O1 F1 G1]','Mollicutes [O2 F2 G2]',
    // 'Neisseriaceae [G1]','Odoribacteraceae [G3]','Odoribacteraceae [G4]','Odoribacteraceae [G5]','Odoribacteraceae [G7]',
    // 'Paludibacteraceae [G1]',
    // 'Patescibacteria [C1 O1 F1 G1]','Patescibacteria [C1 O1 F1 G2]',
    // 'Peptoniphilaceae [G1]',
    // 'Peptostreptococcaceae [G1 "Eubacterium"]','Peptostreptococcaceae [G1]',
    // 'Peptostreptococcaceae [G2]','Peptostreptococcaceae [G3]','Peptostreptococcaceae [G4]','Peptostreptococcaceae [G5 "Eubacterium"]','Peptostreptococcaceae [G5]','Peptostreptococcaceae [G6 "Eubacterium"]','Peptostreptococcaceae [G7 "Eubacterium"]','Peptostreptococcaceae [G8]','Peptostreptococcaceae [G9 "Eubacterium"]',
    // 'Prevotellaceae [G1]',
    // 'Propionibacteriaceae [G1]','Propionibacteriaceae [G2]',
    // 'Ruminococcaceae [G1]','Ruminococcaceae [G2]','Ruminococcaceae [G3]',
    // 'Saccharimonadales [F1 G1]','Saccharimonadales [F2 G1]','Saccharimonadales [F3 G1]','Saccharimonadales [F4 G1]','Saccharimonadales [F5 G1]','Saccharimonadota [C1 O1 F1 G1]',
    // 'Selenomonadaceae [G1]',
    // 'Syntrophomonadaceae [G1]',
    // 'Victivallales [G1]',
    // 'Weeksellaceae [G1]',
    //   ],
    species: ["666"],
};
//constants.abundance_refs  = ['segata','eren_v1v3','eren_v3v5','dewhirst']
constants.abundance_refs = [
    //"eren_v1v3",
    //"eren_v3v5",
    //"dewhirst",
    "hmp_mapping",
    //"hmp_metaphlan",
    //"hmp_refseq_v1v3",
    //"hmp_refseq_v3v5",
];

constants.base_abundance_order = [
    "SUBP",
    "SUPP",
    "AKE",
    "BMU",
    "HPA",
    "SAL",
    "THR",
    "PTO",
    "TDO",
    "ANA",
    "LRC",
    "RRC",
    "LAF",
    "RAF",
    "VIN",
    "MVA",
    "PFO",
    "STO",
];
constants.eren_abundance_order = [
    "SUBP",
    "SUPP",
    "AKE",
    "BMU",
    "HPA",
    "SAL",
    "THR",
    "PTO",
    "TDO",
    "STO",
];
constants.dewhirst_abundance_order = [
    "SUBP",
    "SUPP",
    "AKE",
    "BMU",
    "HPA",
    "SAL",
    "THR",
    "PTO",
    "TDO",
    "ANA",
];
constants.hmp_metaphlan_abundance_order = [
    "SUBP",
    "SUPP",
    "PERIO",
    "AKE",
    "BMU",
    "HPA",
    "SAL",
    "THR",
    "PTO",
    "TDO",
    "ANA",
    "LRC",
    "RRC",
    "RAF",
    "VIN",
    "MVA",
    "PFO",
    "STO",
];
constants.hmp_refseq_abundance_order = [
    "SUBP",
    "SUPP",
    "AKE",
    "BMU",
    "HPA",
    "SAL",
    "THR",
    "PTO",
    "TDO",
    "ANA",
    "LRC",
    "RRC",
    "LAF",
    "RAF",
    "VIN",
    "MVA",
    "PFO",
    "STO",
];
constants.hmp_mapping_abundance_order = [
    "SUBP",
    "SUPP",
    "PERIO",
    "AKE",
    "BMU",
    "HPA",
    "SAL",
    "THR",
    "PTO",
    "TDO",
    "ANA",
    "LRC",
    "RRC",
    "RAF",
    "VIN",
    "MVA",
    "PFO",
    "STO",
];
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

constants.breadth_plots_by_otid = {
    389: {
        species: "Abiotrophia_defectiva",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Abiotrophia_defectiva.png",
    },
    427: {
        species: "Abiotrophia_sp_HMT_427",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Abiotrophia_sp_HMT_427.png",
    },
    343: {
        species: "Achromobacter_xylosoxidans",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Achromobacter_xylosoxidans.png",
    },
    209: {
        species: "Acidovorax_ebreus",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Acidovorax_ebreus.png",
    },
    216: {
        species: "Acidovorax_temperans",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Acidovorax_temperans.png",
    },
    554: {
        species: "Acinetobacter_baumannii",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Acinetobacter_baumannii.png",
    },
    297: {
        species: "Acinetobacter_johnsonii",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Acinetobacter_johnsonii.png",
    },
    282: {
        species: "Acinetobacter_junii",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Acinetobacter_junii.png",
    },
    5: {
        species: "Acinetobacter_lwoffii",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Acinetobacter_lwoffii.png",
    },
    10: {
        species: "Acinetobacter_radioresistens",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Acinetobacter_radioresistens.png",
    },
    888: {
        species: "Actinomyces_dentalis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Actinomyces_dentalis.png",
    },
    618: {
        species: "Actinomyces_gerencseriae",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Actinomyces_gerencseriae.png",
    },
    866: {
        species: "Actinomyces_graevenitzii",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Actinomyces_graevenitzii.png",
    },
    645: {
        species: "Actinomyces_israelii",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Actinomyces_israelii.png",
    },
    849: {
        species: "Actinomyces_johnsonii",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Actinomyces_johnsonii.png",
    },
    852: {
        species: "Actinomyces_massiliensis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Actinomyces_massiliensis.png",
    },
    176: {
        species: "Actinomyces_naeslundii",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Actinomyces_naeslundii.png",
    },
    708: {
        species: "Actinomyces_oricola",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Actinomyces_oricola.png",
    },
    144: {
        species: "Actinomyces_oris_clade_144",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Actinomyces_oris_clade_144.png",
    },
    79: {
        species: "Actinomyces_oris_clade_079",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Actinomyces_oris_clade_079.png",
    },
    43: {
        species: "Actinomyces_oris_clade_043",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Actinomyces_oris_clade_043.png",
    },
    893: {
        species: "Actinomyces_oris_clade_893",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Actinomyces_oris_clade_893.png",
    },
    171: {
        species: "Actinomyces_oris_clade_171",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Actinomyces_oris_clade_171.png",
    },
    169: {
        species: "Actinomyces_oris_clade_169",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Actinomyces_oris_clade_169.png",
    },
    746: {
        species: "Actinomyces_radicidentis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Actinomyces_radicidentis.png",
    },
    170: {
        species: "Actinomyces_sp_HMT_170",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Actinomyces_sp_HMT_170.png",
    },
    403: {
        species: "Actinomyces_sp_HMT_403",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Actinomyces_sp_HMT_403.png",
    },
    414: {
        species: "Actinomyces_sp_HMT_414",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Actinomyces_sp_HMT_414.png",
    },
    448: {
        species: "Actinomyces_sp_HMT_448",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Actinomyces_sp_HMT_448.png",
    },
    897: {
        species: "Actinomyces_sp_HMT_897",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Actinomyces_sp_HMT_897.png",
    },
    179: {
        species: "Actinomyces_timonensis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Actinomyces_timonensis.png",
    },
    688: {
        species: "Actinomyces_viscosus",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Actinomyces_viscosus.png",
    },
    312: {
        species: "Aerococcus_viridans",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Aerococcus_viridans.png",
    },
    559: {
        species: "Afipia_broomeae",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Afipia_broomeae.png",
    },
    960: {
        species: "Agathobacter_rectalis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Agathobacter_rectalis.png",
    },
    531: {
        species: "Aggregatibacter_actinomycetemcomitans",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Aggregatibacter_actinomycetemcomitans.png",
    },
    545: {
        species: "Aggregatibacter_aphrophilus",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Aggregatibacter_aphrophilus.png",
    },
    426: {
        species: "Aggregatibacter_kilianii",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Aggregatibacter_kilianii.png",
    },
    762: {
        species: "Aggregatibacter_segnis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Aggregatibacter_segnis.png",
    },
    458: {
        species: "Aggregatibacter_sp_HMT_458",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Aggregatibacter_sp_HMT_458.png",
    },
    513: {
        species: "Aggregatibacter_sp_HMT_513",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Aggregatibacter_sp_HMT_513.png",
    },
    485: {
        species: "Agrobacterium_tumefaciens",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Agrobacterium_tumefaciens.png",
    },
    963: {
        species: "Akkermansia_muciniphila",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Akkermansia_muciniphila.png",
    },
    964: {
        species: "Alistipes_onderdonkii",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Alistipes_onderdonkii.png",
    },
    965: {
        species: "Alistipes_putredinis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Alistipes_putredinis.png",
    },
    966: {
        species: "Alistipes_shahii",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Alistipes_shahii.png",
    },
    45: {
        species: "Alkalihalobacillus_clausii",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Alkalihalobacillus_clausii.png",
    },
    831: {
        species: "Alloiococcus_otitis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Alloiococcus_otitis.png",
    },
    302: {
        species: "Alloprevotella_rava",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Alloprevotella_rava.png",
    },
    413: {
        species: "Alloprevotella_sp_HMT_413",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Alloprevotella_sp_HMT_413.png",
    },
    473: {
        species: "Alloprevotella_sp_HMT_473",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Alloprevotella_sp_HMT_473.png",
    },
    466: {
        species: "Alloprevotella_tannerae",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Alloprevotella_tannerae.png",
    },
    198: {
        species: "Alloscardovia_omnicolens",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Alloscardovia_omnicolens.png",
    },
    859: {
        species: "Anaerococcus_lactolyticus",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Anaerococcus_lactolyticus.png",
    },
    792: {
        species: "Anaerococcus_nagyae",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Anaerococcus_nagyae.png",
    },
    17: {
        species: "Anaerococcus_octavius",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Anaerococcus_octavius.png",
    },
    738: {
        species: "Anaerococcus_prevotii",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Anaerococcus_prevotii.png",
    },
    788: {
        species: "Anaerococcus_tetradius",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Anaerococcus_tetradius.png",
    },
    294: {
        species: "Anaerococcus_vaginimassiliensis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Anaerococcus_vaginimassiliensis.png",
    },
    121: {
        species: "Anaeroglobus_geminatus",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Anaeroglobus_geminatus.png",
    },
    123: {
        species: "Anaeroglobus_massiliensis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Anaeroglobus_massiliensis.png",
    },
    995: {
        species: "Anaerolinea_thermophila",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Anaerolinea_thermophila.png",
    },
    386: {
        species: "Anaerosphaera_mikwangii",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Anaerosphaera_mikwangii.png",
    },
    182: {
        species: "Anoxybacillus_flavithermus",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Anoxybacillus_flavithermus.png",
    },
    660: {
        species: "Aquamicrobium_lusatiense",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Aquamicrobium_lusatiense.png",
    },
    739: {
        species: "Arachnia_propionica",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Arachnia_propionica.png",
    },
    194: {
        species: "Arachnia_rubra",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Arachnia_rubra.png",
    },
    811: {
        species: "Arcanobacterium_haemolyticum",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Arcanobacterium_haemolyticum.png",
    },
    190: {
        species: "Arsenicicoccus_sp_HMT_190",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Arsenicicoccus_sp_HMT_190.png",
    },
    229: {
        species: "Arthrospira_platensis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Arthrospira_platensis.png",
    },
    674: {
        species: "Atopobium_minutum",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Atopobium_minutum.png",
    },
    824: {
        species: "Bacillus_anthracis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Bacillus_anthracis.png",
    },
    468: {
        species: "Bacillus_subtilis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Bacillus_subtilis.png",
    },
    967: {
        species: "Bacteroides_caccae",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Bacteroides_caccae.png",
    },
    630: {
        species: "Bacteroides_heparinolyticus",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Bacteroides_heparinolyticus.png",
    },
    968: {
        species: "Bacteroides_ovatus",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Bacteroides_ovatus.png",
    },
    787: {
        species: "Bacteroides_pyogenes",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Bacteroides_pyogenes.png",
    },
    969: {
        species: "Bacteroides_stercoris",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Bacteroides_stercoris.png",
    },
    970: {
        species: "Bacteroides_thetaiotaomicron",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Bacteroides_thetaiotaomicron.png",
    },
    971: {
        species: "Bacteroides_uniformis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Bacteroides_uniformis.png",
    },
    972: {
        species: "Bacteroides_xylanisolvens",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Bacteroides_xylanisolvens.png",
    },
    465: {
        species: "Bacteroides_zoogleoformans",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Bacteroides_zoogleoformans.png",
    },
    1: {
        species: "Bartonella_schoenbuchensis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Bartonella_schoenbuchensis.png",
    },
    895: {
        species: "Bifidobacterium_animalis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Bifidobacterium_animalis.png",
    },
    889: {
        species: "Bifidobacterium_breve",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Bifidobacterium_breve.png",
    },
    588: {
        species: "Bifidobacterium_dentium",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Bifidobacterium_dentium.png",
    },
    862: {
        species: "Bifidobacterium_longum",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Bifidobacterium_longum.png",
    },
    891: {
        species: "Bifidobacterium_scardovii",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Bifidobacterium_scardovii.png",
    },
    890: {
        species: "Bifidobacterium_subtile",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Bifidobacterium_subtile.png",
    },
    828: {
        species: "Bordetella_pertussis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Bordetella_pertussis.png",
    },
    597: {
        species: "Bradyrhizobium_elkanii",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Bradyrhizobium_elkanii.png",
    },
    340: {
        species: "Brevibacterium_paucivorans",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Brevibacterium_paucivorans.png",
    },
    590: {
        species: "Brevundimonas_diminuta",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Brevundimonas_diminuta.png",
    },
    241: {
        species: "Brochothrix_thermosphacta",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Brochothrix_thermosphacta.png",
    },
    192: {
        species: "Brooklawnia_sp_HMT_192",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Brooklawnia_sp_HMT_192.png",
    },
    544: {
        species: "Brucella_anthropi",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Brucella_anthropi.png",
    },
    603: {
        species: "Bulleidia_extructa",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Bulleidia_extructa.png",
    },
    571: {
        species: "Burkholderia_cepacia",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Burkholderia_cepacia.png",
    },
    994: {
        species: "Caldilinea_aerophila",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Caldilinea_aerophila.png",
    },
    433: {
        species: "Campylobacter_concisus_clade_433",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Campylobacter_concisus_clade_433.png",
    },
    575: {
        species: "Campylobacter_concisus_clade_575",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Campylobacter_concisus_clade_575.png",
    },
    580: {
        species: "Campylobacter_curvus",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Campylobacter_curvus.png",
    },
    623: {
        species: "Campylobacter_gracilis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Campylobacter_gracilis.png",
    },
    748: {
        species: "Campylobacter_rectus",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Campylobacter_rectus.png",
    },
    763: {
        species: "Campylobacter_showae",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Campylobacter_showae.png",
    },
    776: {
        species: "Campylobacter_sputorum",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Campylobacter_sputorum.png",
    },
    842: {
        species: "Campylobacter_ureolyticus",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Campylobacter_ureolyticus.png",
    },
    332: {
        species: "Capnocytophaga_bilenii",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Capnocytophaga_bilenii.png",
    },
    337: {
        species: "Capnocytophaga_gingivalis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Capnocytophaga_gingivalis.png",
    },
    325: {
        species: "Capnocytophaga_granulosa",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Capnocytophaga_granulosa.png",
    },
    627: {
        species: "Capnocytophaga_haemolytica",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Capnocytophaga_haemolytica.png",
    },
    329: {
        species: "Capnocytophaga_leadbetteri",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Capnocytophaga_leadbetteri.png",
    },
    700: {
        species: "Capnocytophaga_ochracea",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Capnocytophaga_ochracea.png",
    },
    326: {
        species: "Capnocytophaga_periodontitidis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Capnocytophaga_periodontitidis.png",
    },
    338: {
        species: "Capnocytophaga_sp_HMT_338",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Capnocytophaga_sp_HMT_338.png",
    },
    470: {
        species: "Capnocytophaga_sp_HMT_470",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Capnocytophaga_sp_HMT_470.png",
    },
    471: {
        species: "Capnocytophaga_sp_HMT_471",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Capnocytophaga_sp_HMT_471.png",
    },
    863: {
        species: "Capnocytophaga_sp_HMT_863",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Capnocytophaga_sp_HMT_863.png",
    },
    878: {
        species: "Capnocytophaga_sp_HMT_878",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Capnocytophaga_sp_HMT_878.png",
    },
    775: {
        species: "Capnocytophaga_sputigena",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Capnocytophaga_sputigena.png",
    },
    633: {
        species: "Cardiobacterium_hominis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Cardiobacterium_hominis.png",
    },
    540: {
        species: "Cardiobacterium_valvarum",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Cardiobacterium_valvarum.png",
    },
    428: {
        species: "Catonella_massiliensis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Catonella_massiliensis.png",
    },
    165: {
        species: "Catonella_morbi",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Catonella_morbi.png",
    },
    374: {
        species: "Cellulosimicrobium_funkei",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Cellulosimicrobium_funkei.png",
    },
    726: {
        species: "Centipeda_periodontii",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Centipeda_periodontii.png",
    },
    733: {
        species: "Chlamydia_pneumoniae",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Chlamydia_pneumoniae.png",
    },
    984: {
        species: "Chlorobium_limicola",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Chlorobium_limicola.png",
    },
    422: {
        species: "Cloacibacterium_normanense",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Cloacibacterium_normanense.png",
    },
    858: {
        species: "Comamonas_testosteroni",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Comamonas_testosteroni.png",
    },
    19: {
        species: "Corynebacterium_accolens",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Corynebacterium_accolens.png",
    },
    30: {
        species: "Corynebacterium_afermentans",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Corynebacterium_afermentans.png",
    },
    31: {
        species: "Corynebacterium_amycolatum",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Corynebacterium_amycolatum.png",
    },
    33: {
        species: "Corynebacterium_appendicis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Corynebacterium_appendicis.png",
    },
    34: {
        species: "Corynebacterium_aurimucosum_clade_034",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Corynebacterium_aurimucosum_clade_034.png",
    },
    450: {
        species: "Corynebacterium_aurimucosum_clade_450",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Corynebacterium_aurimucosum_clade_450.png",
    },
    208: {
        species: "Corynebacterium_bovis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Corynebacterium_bovis.png",
    },
    341: {
        species: "Corynebacterium_coyleae",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Corynebacterium_coyleae.png",
    },
    591: {
        species: "Corynebacterium_diphtheriae",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Corynebacterium_diphtheriae.png",
    },
    595: {
        species: "Corynebacterium_durum",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Corynebacterium_durum.png",
    },
    207: {
        species: "Corynebacterium_gottingense",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Corynebacterium_gottingense.png",
    },
    445: {
        species: "Corynebacterium_hesseae",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Corynebacterium_hesseae.png",
    },
    47: {
        species: "Corynebacterium_jeikeium",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Corynebacterium_jeikeium.png",
    },
    783: {
        species: "Corynebacterium_kefirresidentii",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Corynebacterium_kefirresidentii.png",
    },
    49: {
        species: "Corynebacterium_kroppenstedtii",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Corynebacterium_kroppenstedtii.png",
    },
    454: {
        species: "Corynebacterium_macclintockiae",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Corynebacterium_macclintockiae.png",
    },
    50: {
        species: "Corynebacterium_macginleyi",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Corynebacterium_macginleyi.png",
    },
    333: {
        species: "Corynebacterium_massiliense",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Corynebacterium_massiliense.png",
    },
    328: {
        species: "Corynebacterium_mastitidis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Corynebacterium_mastitidis.png",
    },
    666: {
        species: "Corynebacterium_matruchotii",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Corynebacterium_matruchotii.png",
    },
    53: {
        species: "Corynebacterium_minutissimum",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Corynebacterium_minutissimum.png",
    },
    835: {
        species: "Corynebacterium_mucifaciens",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Corynebacterium_mucifaciens.png",
    },
    832: {
        species: "Corynebacterium_otitidis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Corynebacterium_otitidis.png",
    },
    54: {
        species: "Corynebacterium_pilbarense",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Corynebacterium_pilbarense.png",
    },
    59: {
        species: "Corynebacterium_propinquum",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Corynebacterium_propinquum.png",
    },
    60: {
        species: "Corynebacterium_pseudodiphtheriticum",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Corynebacterium_pseudodiphtheriticum.png",
    },
    62: {
        species: "Corynebacterium_simulans",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Corynebacterium_simulans.png",
    },
    63: {
        species: "Corynebacterium_singulare",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Corynebacterium_singulare.png",
    },
    72: {
        species: "Corynebacterium_striatum",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Corynebacterium_striatum.png",
    },
    77: {
        species: "Corynebacterium_tuberculostearicum",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Corynebacterium_tuberculostearicum.png",
    },
    184: {
        species: "Corynebacterium_tuscaniense",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Corynebacterium_tuscaniense.png",
    },
    853: {
        species: "Corynebacterium_urealyticum",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Corynebacterium_urealyticum.png",
    },
    753: {
        species: "Cronobacter_sakazakii",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Cronobacter_sakazakii.png",
    },
    579: {
        species: "Cryptobacterium_curtum",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Cryptobacterium_curtum.png",
    },
    27: {
        species: "Cupriavidus_gilardii",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Cupriavidus_gilardii.png",
    },
    530: {
        species: "Cutibacterium_acnes",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Cutibacterium_acnes.png",
    },
    552: {
        species: "Cutibacterium_avidum",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Cutibacterium_avidum.png",
    },
    114: {
        species: "Cutibacterium_granulosum",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Cutibacterium_granulosum.png",
    },
    193: {
        species: "Cutibacterium_modestum",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Cutibacterium_modestum.png",
    },
    791: {
        species: "Cutibacterium_namnetense",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Cutibacterium_namnetense.png",
    },
    23: {
        species: "Delftia_acidovorans",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Delftia_acidovorans.png",
    },
    354: {
        species: "Dermabacter_hominis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Dermabacter_hominis.png",
    },
    41: {
        species: "Desulfobulbus_oralis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Desulfobulbus_oralis.png",
    },
    703: {
        species: "Desulfomicrobium_orale",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Desulfomicrobium_orale.png",
    },
    605: {
        species: "Desulfovibrio_fairfieldensis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Desulfovibrio_fairfieldensis.png",
    },
    118: {
        species: "Dialister_invisus",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Dialister_invisus.png",
    },
    843: {
        species: "Dialister_micraerophilus",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Dialister_micraerophilus.png",
    },
    736: {
        species: "Dialister_pneumosintes",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Dialister_pneumosintes.png",
    },
    368: {
        species: "Dietzia_cinnamea",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Dietzia_cinnamea.png",
    },
    813: {
        species: "Dolosigranulum_pigrum",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Dolosigranulum_pigrum.png",
    },
    654: {
        species: "Eggerthella_lenta",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Eggerthella_lenta.png",
    },
    569: {
        species: "Eggerthia_catenaformis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Eggerthia_catenaformis.png",
    },
    577: {
        species: "Eikenella_corrodens",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Eikenella_corrodens.png",
    },
    565: {
        species: "Enterobacter_cancerogenus",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Enterobacter_cancerogenus.png",
    },
    634: {
        species: "Enterobacter_hormaechei",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Enterobacter_hormaechei.png",
    },
    801: {
        species: "Enterococcus_casseliflavus",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Enterococcus_casseliflavus.png",
    },
    880: {
        species: "Enterococcus_durans",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Enterococcus_durans.png",
    },
    604: {
        species: "Enterococcus_faecalis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Enterococcus_faecalis.png",
    },
    803: {
        species: "Enterococcus_italicus",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Enterococcus_italicus.png",
    },
    802: {
        species: "Enterococcus_saccharolyticus",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Enterococcus_saccharolyticus.png",
    },
    484: {
        species: "Erysipelothrix_tonsillarum",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Erysipelothrix_tonsillarum.png",
    },
    747: {
        species: "Erythrobacter_ramosus",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Erythrobacter_ramosus.png",
    },
    7: {
        species: "Erythrobacter_tepidarius",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Erythrobacter_tepidarius.png",
    },
    574: {
        species: "Escherichia_coli",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Escherichia_coli.png",
    },
    655: {
        species: "Eubacterium_limosum",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Eubacterium_limosum.png",
    },
    961: {
        species: "Faecalibacterium_prausnitzii",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Faecalibacterium_prausnitzii.png",
    },
    416: {
        species: "Fannyhessea_sp_HMT_416",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Fannyhessea_sp_HMT_416.png",
    },
    814: {
        species: "Fannyhessea_vaginae",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Fannyhessea_vaginae.png",
    },
    935: {
        species: "Fastidiosipila_sanguinis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Fastidiosipila_sanguinis.png",
    },
    929: {
        species: "Fenollaria_massiliensis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Fenollaria_massiliensis.png",
    },
    539: {
        species: "Filifactor_alocis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Filifactor_alocis.png",
    },
    662: {
        species: "Finegoldia_magna",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Finegoldia_magna.png",
    },
    363: {
        species: "Fretibacterium_fastidiosum",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Fretibacterium_fastidiosum.png",
    },
    420: {
        species: "Fusobacterium_animalis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Fusobacterium_animalis.png",
    },
    860: {
        species: "Fusobacterium_gonidiaformans",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Fusobacterium_gonidiaformans.png",
    },
    953: {
        species: "Fusobacterium_hwasookii",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Fusobacterium_hwasookii.png",
    },
    690: {
        species: "Fusobacterium_necrophorum",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Fusobacterium_necrophorum.png",
    },
    698: {
        species: "Fusobacterium_nucleatum_sensu_stricto",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Fusobacterium_nucleatum_sensu_stricto.png",
    },
    201: {
        species: "Fusobacterium_periodonticum",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Fusobacterium_periodonticum.png",
    },
    202: {
        species: "Fusobacterium_polymorphum",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Fusobacterium_polymorphum.png",
    },
    429: {
        species: "Fusobacterium_pseudoperiodonticum",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Fusobacterium_pseudoperiodonticum.png",
    },
    447: {
        species: "Fusobacterium_simiae",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Fusobacterium_simiae.png",
    },
    248: {
        species: "Fusobacterium_sp_HMT_248",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Fusobacterium_sp_HMT_248.png",
    },
    370: {
        species: "Fusobacterium_sp_HMT_370",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Fusobacterium_sp_HMT_370.png",
    },
    200: {
        species: "Fusobacterium_vincentii",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Fusobacterium_vincentii.png",
    },
    464: {
        species: "Fusobacterium_watanabei",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Fusobacterium_watanabei.png",
    },
    557: {
        species: "Gallibacter_brachus",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Gallibacter_brachus.png",
    },
    867: {
        species: "Gardnerella_leopoldii",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Gardnerella_leopoldii.png",
    },
    846: {
        species: "Gardnerella_piotii",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Gardnerella_piotii.png",
    },
    868: {
        species: "Gardnerella_swidsinskii",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Gardnerella_swidsinskii.png",
    },
    829: {
        species: "Gardnerella_vaginalis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Gardnerella_vaginalis.png",
    },
    555: {
        species: "Gemella_bergeri",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Gemella_bergeri.png",
    },
    434: {
        species: "Gemella_haemolysans_clade_434",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Gemella_haemolysans_clade_434.png",
    },
    626: {
        species: "Gemella_haemolysans_clade_626",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Gemella_haemolysans_clade_626.png",
    },
    928: {
        species: "Gemella_massiliensis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Gemella_massiliensis.png",
    },
    46: {
        species: "Gemella_morbillorum",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Gemella_morbillorum.png",
    },
    757: {
        species: "Gemella_sanguinis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Gemella_sanguinis.png",
    },
    534: {
        species: "Granulicatella_adiacens",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Granulicatella_adiacens.png",
    },
    596: {
        species: "Granulicatella_elegans",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Granulicatella_elegans.png",
    },
    316: {
        species: "Haematobacter_missouriensis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Haematobacter_missouriensis.png",
    },
    535: {
        species: "Haemophilus_aegyptius",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Haemophilus_aegyptius.png",
    },
    821: {
        species: "Haemophilus_ducreyi",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Haemophilus_ducreyi.png",
    },
    851: {
        species: "Haemophilus_haemolyticus",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Haemophilus_haemolyticus.png",
    },
    641: {
        species: "Haemophilus_influenzae",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Haemophilus_influenzae.png",
    },
    945: {
        species: "Haemophilus_parahaemolyticus",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Haemophilus_parahaemolyticus.png",
    },
    718: {
        species: "Haemophilus_parainfluenzae",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Haemophilus_parainfluenzae.png",
    },
    35: {
        species: "Haemophilus_paraphrohaemolyticus",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Haemophilus_paraphrohaemolyticus.png",
    },
    946: {
        species: "Haemophilus_pittmaniae",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Haemophilus_pittmaniae.png",
    },
    36: {
        species: "Haemophilus_sp_HMT_036",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Haemophilus_sp_HMT_036.png",
    },
    944: {
        species: "Haemophilus_sputorum",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Haemophilus_sputorum.png",
    },
    583: {
        species: "Hallella_dentalis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Hallella_dentalis.png",
    },
    794: {
        species: "Hallella_multisaccharivorax",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Hallella_multisaccharivorax.png",
    },
    376: {
        species: "Hallella_sp_HMT_376",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Hallella_sp_HMT_376.png",
    },
    812: {
        species: "Helicobacter_pylori",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Helicobacter_pylori.png",
    },
    962: {
        species: "Hominimerdicola_aceti",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Hominimerdicola_aceti.png",
    },
    673: {
        species: "Hornefia_minuta",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Hornefia_minuta.png",
    },
    694: {
        species: "Hornefia_nodatum",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Hornefia_nodatum.png",
    },
    562: {
        species: "Hoylesella_buccalis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Hoylesella_buccalis.png",
    },
    600: {
        species: "Hoylesella_enoeca",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Hoylesella_enoeca.png",
    },
    526: {
        species: "Hoylesella_koreensis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Hoylesella_koreensis.png",
    },
    658: {
        species: "Hoylesella_loescheii",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Hoylesella_loescheii.png",
    },
    665: {
        species: "Hoylesella_marshii",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Hoylesella_marshii.png",
    },
    299: {
        species: "Hoylesella_nanceiensis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Hoylesella_nanceiensis.png",
    },
    705: {
        species: "Hoylesella_oralis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Hoylesella_oralis.png",
    },
    303: {
        species: "Hoylesella_pleuritidis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Hoylesella_pleuritidis.png",
    },
    781: {
        species: "Hoylesella_saccharolytica",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Hoylesella_saccharolytica.png",
    },
    795: {
        species: "Hoylesella_shahii",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Hoylesella_shahii.png",
    },
    317: {
        species: "Hoylesella_sp_HMT_317",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Hoylesella_sp_HMT_317.png",
    },
    475: {
        species: "Hoylesella_sp_HMT_475",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Hoylesella_sp_HMT_475.png",
    },
    982: {
        species: "Ignavibacterium_album",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Ignavibacterium_album.png",
    },
    339: {
        species: "Janibacter_indicus",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Janibacter_indicus.png",
    },
    243: {
        species: "Jeotgalicoccus_marinus",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Jeotgalicoccus_marinus.png",
    },
    635: {
        species: "Johnsonella_ignava",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Johnsonella_ignava.png",
    },
    777: {
        species: "Jonquetella_anthropi",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Jonquetella_anthropi.png",
    },
    582: {
        species: "Kingella_denitrificans",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Kingella_denitrificans.png",
    },
    646: {
        species: "Kingella_kingae",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Kingella_kingae.png",
    },
    405: {
        species: "Kingella_negevensis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Kingella_negevensis.png",
    },
    706: {
        species: "Kingella_oralis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Kingella_oralis.png",
    },
    153: {
        species: "Klebsiella_aerogenes",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Klebsiella_aerogenes.png",
    },
    731: {
        species: "Klebsiella_pneumoniae",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Klebsiella_pneumoniae.png",
    },
    865: {
        species: "Kluyvera_ascorbata",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Kluyvera_ascorbata.png",
    },
    189: {
        species: "Kocuria_atrinae",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Kocuria_atrinae.png",
    },
    84: {
        species: "Kocuria_palustris",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Kocuria_palustris.png",
    },
    197: {
        species: "Kocuria_rhizophila",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Kocuria_rhizophila.png",
    },
    855: {
        species: "Kytococcus_sedentarius",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Kytococcus_sedentarius.png",
    },
    460: {
        species: "Lachnoanaerobaculum_gingivalis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Lachnoanaerobaculum_gingivalis.png",
    },
    82: {
        species: "Lachnoanaerobaculum_orale",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Lachnoanaerobaculum_orale.png",
    },
    494: {
        species: "Lachnoanaerobaculum_saburreum",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Lachnoanaerobaculum_saburreum.png",
    },
    83: {
        species: "Lachnoanaerobaculum_sp_HMT_083",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Lachnoanaerobaculum_sp_HMT_083.png",
    },
    430: {
        species: "Lachnoanaerobaculum_sp_HMT_430",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Lachnoanaerobaculum_sp_HMT_430.png",
    },
    441: {
        species: "Lachnoanaerobaculum_sp_HMT_441",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Lachnoanaerobaculum_sp_HMT_441.png",
    },
    107: {
        species: "Lachnoanaerobaculum_umeaense",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Lachnoanaerobaculum_umeaense.png",
    },
    924: {
        species: "Lachnocurva_vaginae",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Lachnocurva_vaginae.png",
    },
    568: {
        species: "Lacticaseibacillus_casei",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Lacticaseibacillus_casei.png",
    },
    716: {
        species: "Lacticaseibacillus_paracasei",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Lacticaseibacillus_paracasei.png",
    },
    749: {
        species: "Lacticaseibacillus_rhamnosus",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Lacticaseibacillus_rhamnosus.png",
    },
    883: {
        species: "Lactiplantibacillus_pentosus",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Lactiplantibacillus_pentosus.png",
    },
    861: {
        species: "Lactiplantibacillus_plantarum",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Lactiplantibacillus_plantarum.png",
    },
    529: {
        species: "Lactobacillus_acidophilus",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Lactobacillus_acidophilus.png",
    },
    817: {
        species: "Lactobacillus_crispatus",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Lactobacillus_crispatus.png",
    },
    615: {
        species: "Lactobacillus_gasseri",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Lactobacillus_gasseri.png",
    },
    838: {
        species: "Lactobacillus_iners",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Lactobacillus_iners.png",
    },
    839: {
        species: "Lactobacillus_jensenii",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Lactobacillus_jensenii.png",
    },
    819: {
        species: "Lactobacillus_johnsonii",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Lactobacillus_johnsonii.png",
    },
    461: {
        species: "Lactobacillus_ultunensis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Lactobacillus_ultunensis.png",
    },
    804: {
        species: "Lactococcus_lactis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Lactococcus_lactis.png",
    },
    723: {
        species: "Lancefieldella_parvula",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Lancefieldella_parvula.png",
    },
    750: {
        species: "Lancefieldella_rimae",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Lancefieldella_rimae.png",
    },
    199: {
        species: "Lancefieldella_sp_HMT_199",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Lancefieldella_sp_HMT_199.png",
    },
    409: {
        species: "Lautropia_dentalis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Lautropia_dentalis.png",
    },
    22: {
        species: "Lautropia_mirabilis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Lautropia_mirabilis.png",
    },
    173: {
        species: "Lawsonella_clevelandensis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Lawsonella_clevelandensis.png",
    },
    881: {
        species: "Lentilactobacillus_buchneri",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Lentilactobacillus_buchneri.png",
    },
    424: {
        species: "Lentilactobacillus_kisonensis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Lentilactobacillus_kisonensis.png",
    },
    418: {
        species: "Lentilactobacillus_parafarraginis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Lentilactobacillus_parafarraginis.png",
    },
    884: {
        species: "Lentilactobacillus_rapi",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Lentilactobacillus_rapi.png",
    },
    563: {
        species: "Leptotrichia_buccalis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Leptotrichia_buccalis.png",
    },
    224: {
        species: "Leptotrichia_hofstadii",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Leptotrichia_hofstadii.png",
    },
    213: {
        species: "Leptotrichia_hongkongensis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Leptotrichia_hongkongensis.png",
    },
    214: {
        species: "Leptotrichia_shahii",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Leptotrichia_shahii.png",
    },
    218: {
        species: "Leptotrichia_sp_HMT_218",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Leptotrichia_sp_HMT_218.png",
    },
    221: {
        species: "Leptotrichia_sp_HMT_221",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Leptotrichia_sp_HMT_221.png",
    },
    223: {
        species: "Leptotrichia_sp_HMT_223",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Leptotrichia_sp_HMT_223.png",
    },
    225: {
        species: "Leptotrichia_sp_HMT_225",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Leptotrichia_sp_HMT_225.png",
    },
    417: {
        species: "Leptotrichia_sp_HMT_417",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Leptotrichia_sp_HMT_417.png",
    },
    498: {
        species: "Leptotrichia_sp_HMT_498",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Leptotrichia_sp_HMT_498.png",
    },
    847: {
        species: "Leptotrichia_sp_HMT_847",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Leptotrichia_sp_HMT_847.png",
    },
    879: {
        species: "Leptotrichia_sp_HMT_879",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Leptotrichia_sp_HMT_879.png",
    },
    222: {
        species: "Leptotrichia_wadei",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Leptotrichia_wadei.png",
    },
    558: {
        species: "Levilactobacillus_brevis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Levilactobacillus_brevis.png",
    },
    756: {
        species: "Ligilactobacillus_salivarius",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Ligilactobacillus_salivarius.png",
    },
    816: {
        species: "Limosilactobacillus_coleohominis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Limosilactobacillus_coleohominis.png",
    },
    608: {
        species: "Limosilactobacillus_fermentum",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Limosilactobacillus_fermentum.png",
    },
    709: {
        species: "Limosilactobacillus_oris",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Limosilactobacillus_oris.png",
    },
    882: {
        species: "Limosilactobacillus_panis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Limosilactobacillus_panis.png",
    },
    818: {
        species: "Limosilactobacillus_reuteri",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Limosilactobacillus_reuteri.png",
    },
    51: {
        species: "Limosilactobacillus_vaginalis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Limosilactobacillus_vaginalis.png",
    },
    825: {
        species: "Listeria_monocytogenes",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Listeria_monocytogenes.png",
    },
    614: {
        species: "Lysinibacillus_fusiformis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Lysinibacillus_fusiformis.png",
    },
    841: {
        species: "Megasphaera_lornae",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Megasphaera_lornae.png",
    },
    122: {
        species: "Megasphaera_micronuciformis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Megasphaera_micronuciformis.png",
    },
    983: {
        species: "Melioribacter_roseus",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Melioribacter_roseus.png",
    },
    659: {
        species: "Mesorhizobium_japonicum",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Mesorhizobium_japonicum.png",
    },
    632: {
        species: "Metamycoplasma_hominis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Metamycoplasma_hominis.png",
    },
    704: {
        species: "Metamycoplasma_orale",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Metamycoplasma_orale.png",
    },
    754: {
        species: "Metamycoplasma_salivarium",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Metamycoplasma_salivarium.png",
    },
    815: {
        species: "Methanobrevibacter_oralis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Methanobrevibacter_oralis.png",
    },
    330: {
        species: "Micavibrio_aeruginosavorus",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Micavibrio_aeruginosavorus.png",
    },
    185: {
        species: "Microbacterium_ginsengisoli",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Microbacterium_ginsengisoli.png",
    },
    186: {
        species: "Microbacterium_sp_HMT_186",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Microbacterium_sp_HMT_186.png",
    },
    87: {
        species: "Micrococcus_luteus",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Micrococcus_luteus.png",
    },
    684: {
        species: "Mitsuokella_multacida",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Mitsuokella_multacida.png",
    },
    131: {
        species: "Mitsuokella_sp_HMT_131",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Mitsuokella_sp_HMT_131.png",
    },
    830: {
        species: "Mobiluncus_mulieris",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Mobiluncus_mulieris.png",
    },
    593: {
        species: "Mogibacterium_diversum",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Mogibacterium_diversum.png",
    },
    691: {
        species: "Mogibacterium_neglectum",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Mogibacterium_neglectum.png",
    },
    742: {
        species: "Mogibacterium_pumilum",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Mogibacterium_pumilum.png",
    },
    42: {
        species: "Mogibacterium_timidum",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Mogibacterium_timidum.png",
    },
    833: {
        species: "Moraxella_catarrhalis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Moraxella_catarrhalis.png",
    },
    154: {
        species: "Moraxella_lincolnii",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Moraxella_lincolnii.png",
    },
    98: {
        species: "Moraxella_nonliquefaciens",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Moraxella_nonliquefaciens.png",
    },
    711: {
        species: "Moraxella_osloensis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Moraxella_osloensis.png",
    },
    97: {
        species: "Moryella_sp_HMT_097",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Moryella_sp_HMT_097.png",
    },
    823: {
        species: "Mycobacterium_leprae",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Mycobacterium_leprae.png",
    },
    822: {
        species: "Mycobacterium_tuberculosis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Mycobacterium_tuberculosis.png",
    },
    692: {
        species: "Mycolicibacterium_neoaurum",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Mycolicibacterium_neoaurum.png",
    },
    616: {
        species: "Mycoplasmoides_genitalium",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Mycoplasmoides_genitalium.png",
    },
    732: {
        species: "Mycoplasmoides_pneumoniae",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Mycoplasmoides_pneumoniae.png",
    },
    607: {
        species: "Mycoplasmopsis_fermentans",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Mycoplasmopsis_fermentans.png",
    },
    870: {
        species: "Nanogingivalis_gingivitcus",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Nanogingivalis_gingivitcus.png",
    },
    399: {
        species: "Nanogingivalis_sp_HMT_399",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Nanogingivalis_sp_HMT_399.png",
    },
    400: {
        species: "Nanogingivalis_sp_HMT_400",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Nanogingivalis_sp_HMT_400.png",
    },
    401: {
        species: "Nanogingivalis_sp_HMT_401",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Nanogingivalis_sp_HMT_401.png",
    },
    356: {
        species: "Nanoperiomorbus_periodonticus",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Nanoperiomorbus_periodonticus.png",
    },
    957: {
        species: "Nanosynbacter_featherlites",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Nanosynbacter_featherlites.png",
    },
    488: {
        species: "Nanosynbacter_fur",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Nanosynbacter_fur.png",
    },
    952: {
        species: "Nanosynbacter_lyticus",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Nanosynbacter_lyticus.png",
    },
    352: {
        species: "Nanosynbacter_sp_HMT_352",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Nanosynbacter_sp_HMT_352.png",
    },
    353: {
        species: "Nanosynbacter_sp_HMT_353",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Nanosynbacter_sp_HMT_353.png",
    },
    367: {
        species: "Nanosyncoccus_alces",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Nanosyncoccus_alces.png",
    },
    371: {
        species: "Nanosyncoccus_nanoralicus",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Nanosyncoccus_nanoralicus.png",
    },
    351: {
        species: "Nanosyncoccus_sp_HMT_351",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Nanosyncoccus_sp_HMT_351.png",
    },
    364: {
        species: "Nanosyncoccus_sp_HMT_364",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Nanosyncoccus_sp_HMT_364.png",
    },
    13: {
        species: "Neisseria_bacilliformis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Neisseria_bacilliformis.png",
    },
    956: {
        species: "Neisseria_cinerea",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Neisseria_cinerea.png",
    },
    598: {
        species: "Neisseria_elongata",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Neisseria_elongata.png",
    },
    609: {
        species: "Neisseria_flava",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Neisseria_flava.png",
    },
    610: {
        species: "Neisseria_flavescens",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Neisseria_flavescens.png",
    },
    621: {
        species: "Neisseria_gonorrhoeae",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Neisseria_gonorrhoeae.png",
    },
    649: {
        species: "Neisseria_lactamica",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Neisseria_lactamica.png",
    },
    99: {
        species: "Neisseria_macacae",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Neisseria_macacae.png",
    },
    669: {
        species: "Neisseria_meningitidis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Neisseria_meningitidis.png",
    },
    682: {
        species: "Neisseria_mucosa",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Neisseria_mucosa.png",
    },
    14: {
        species: "Neisseria_oralis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Neisseria_oralis.png",
    },
    101: {
        species: "Neisseria_perflava",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Neisseria_perflava.png",
    },
    737: {
        species: "Neisseria_polysaccharea",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Neisseria_polysaccharea.png",
    },
    764: {
        species: "Neisseria_sicca",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Neisseria_sicca.png",
    },
    20: {
        species: "Neisseria_sp_HMT_020",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Neisseria_sp_HMT_020.png",
    },
    476: {
        species: "Neisseria_subflava",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Neisseria_subflava.png",
    },
    92: {
        species: "Neisseria_weaveri",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Neisseria_weaveri.png",
    },
    342: {
        species: "Novosphingobium_panipatense",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Novosphingobium_panipatense.png",
    },
    810: {
        species: "Olegusella_sp_HMT_810",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Olegusella_sp_HMT_810.png",
    },
    809: {
        species: "Olsenella_phocaeensis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Olsenella_phocaeensis.png",
    },
    806: {
        species: "Olsenella_profusa",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Olsenella_profusa.png",
    },
    807: {
        species: "Olsenella_sp_HMT_807",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Olsenella_sp_HMT_807.png",
    },
    38: {
        species: "Olsenella_uli",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Olsenella_uli.png",
    },
    108: {
        species: "Oribacterium_asaccharolyticum",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Oribacterium_asaccharolyticum.png",
    },
    934: {
        species: "Oribacterium_parvum",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Oribacterium_parvum.png",
    },
    457: {
        species: "Oribacterium_sinus",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Oribacterium_sinus.png",
    },
    78: {
        species: "Oribacterium_sp_HMT_078",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Oribacterium_sp_HMT_078.png",
    },
    102: {
        species: "Oribacterium_sp_HMT_102",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Oribacterium_sp_HMT_102.png",
    },
    28: {
        species: "Oryzomicrobium_terrae",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Oryzomicrobium_terrae.png",
    },
    894: {
        species: "Ottowia_sp_HMT_894",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Ottowia_sp_HMT_894.png",
    },
    211: {
        species: "Paenacidovorax_caeni",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Paenacidovorax_caeni.png",
    },
    921: {
        species: "Paenibacillus_glucanolyticus",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Paenibacillus_glucanolyticus.png",
    },
    786: {
        species: "Paenibacillus_phoenicis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Paenibacillus_phoenicis.png",
    },
    48: {
        species: "Paenibacillus_typhae",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Paenibacillus_typhae.png",
    },
    973: {
        species: "Parabacteroides_distasonis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Parabacteroides_distasonis.png",
    },
    974: {
        species: "Parabacteroides_merdae",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Parabacteroides_merdae.png",
    },
    104: {
        species: "Paracoccus_yeei",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Paracoccus_yeei.png",
    },
    586: {
        species: "Parascardovia_denticolens",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Parascardovia_denticolens.png",
    },
    111: {
        species: "Parvimonas_micra",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Parvimonas_micra.png",
    },
    110: {
        species: "Parvimonas_sp_HMT_110",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Parvimonas_sp_HMT_110.png",
    },
    393: {
        species: "Parvimonas_sp_HMT_393",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Parvimonas_sp_HMT_393.png",
    },
    348: {
        species: "Parvisynbacter_sp_HMT_348",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Parvisynbacter_sp_HMT_348.png",
    },
    390: {
        species: "Parvisynbacter_sp_HMT_390",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Parvisynbacter_sp_HMT_390.png",
    },
    848: {
        species: "Peptidiphaga_gingivicola",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Peptidiphaga_gingivicola.png",
    },
    183: {
        species: "Peptidiphaga_sp_HMT_183",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Peptidiphaga_sp_HMT_183.png",
    },
    796: {
        species: "Peptoanaerobacter_margaretiae",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Peptoanaerobacter_margaretiae.png",
    },
    81: {
        species: "Peptoanaerobacter_stomatis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Peptoanaerobacter_stomatis.png",
    },
    548: {
        species: "Peptoniphilus_asaccharolyticus",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Peptoniphilus_asaccharolyticus.png",
    },
    187: {
        species: "Peptoniphilus_grossensis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Peptoniphilus_grossensis.png",
    },
    109: {
        species: "Peptoniphilus_harei",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Peptoniphilus_harei.png",
    },
    840: {
        species: "Peptoniphilus_indolicus",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Peptoniphilus_indolicus.png",
    },
    836: {
        species: "Peptoniphilus_lacrimalis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Peptoniphilus_lacrimalis.png",
    },
    784: {
        species: "Peptoniphilus_lacydonensis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Peptoniphilus_lacydonensis.png",
    },
    542: {
        species: "Peptostreptococcus_anaerobius",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Peptostreptococcus_anaerobius.png",
    },
    112: {
        species: "Peptostreptococcus_stomatis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Peptostreptococcus_stomatis.png",
    },
    272: {
        species: "Phocaeicola_abscessus",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Phocaeicola_abscessus.png",
    },
    975: {
        species: "Phocaeicola_dorei",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Phocaeicola_dorei.png",
    },
    976: {
        species: "Phocaeicola_massiliensis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Phocaeicola_massiliensis.png",
    },
    977: {
        species: "Phocaeicola_plebeius",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Phocaeicola_plebeius.png",
    },
    978: {
        species: "Phocaeicola_vulgatus",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Phocaeicola_vulgatus.png",
    },
    547: {
        species: "Porphyromonas_asaccharolytica",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Porphyromonas_asaccharolytica.png",
    },
    283: {
        species: "Porphyromonas_catoniae",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Porphyromonas_catoniae.png",
    },
    273: {
        species: "Porphyromonas_endodontalis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Porphyromonas_endodontalis.png",
    },
    619: {
        species: "Porphyromonas_gingivalis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Porphyromonas_gingivalis.png",
    },
    279: {
        species: "Porphyromonas_pasteri",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Porphyromonas_pasteri.png",
    },
    275: {
        species: "Porphyromonas_sp_HMT_275",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Porphyromonas_sp_HMT_275.png",
    },
    278: {
        species: "Porphyromonas_sp_HMT_278",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Porphyromonas_sp_HMT_278.png",
    },
    785: {
        species: "Porphyromonas_uenonis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Porphyromonas_uenonis.png",
    },
    797: {
        species: "Prevotella_amnii",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Prevotella_amnii.png",
    },
    943: {
        species: "Prevotella_aurantiaca",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Prevotella_aurantiaca.png",
    },
    556: {
        species: "Prevotella_bivia",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Prevotella_bivia.png",
    },
    979: {
        species: "Prevotella_copri",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Prevotella_copri.png",
    },
    291: {
        species: "Prevotella_denticola",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Prevotella_denticola.png",
    },
    782: {
        species: "Prevotella_fusca",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Prevotella_fusca.png",
    },
    298: {
        species: "Prevotella_histicola",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Prevotella_histicola.png",
    },
    820: {
        species: "Prevotella_illustrans",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Prevotella_illustrans.png",
    },
    643: {
        species: "Prevotella_intermedia",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Prevotella_intermedia.png",
    },
    313: {
        species: "Prevotella_jejuni",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Prevotella_jejuni.png",
    },
    469: {
        species: "Prevotella_melaninogenica",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Prevotella_melaninogenica.png",
    },
    378: {
        species: "Prevotella_micans",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Prevotella_micans.png",
    },
    685: {
        species: "Prevotella_multiformis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Prevotella_multiformis.png",
    },
    693: {
        species: "Prevotella_nigrescens",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Prevotella_nigrescens.png",
    },
    714: {
        species: "Prevotella_pallens",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Prevotella_pallens.png",
    },
    885: {
        species: "Prevotella_scopos",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Prevotella_scopos.png",
    },
    314: {
        species: "Prevotella_sp_HMT_314",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Prevotella_sp_HMT_314.png",
    },
    410: {
        species: "Prevotella_sp_HMT_410",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Prevotella_sp_HMT_410.png",
    },
    798: {
        species: "Prevotella_timonensis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Prevotella_timonensis.png",
    },
    572: {
        species: "Prevotella_veroralis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Prevotella_veroralis.png",
    },
    306: {
        species: "Prevotella_vespertina",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Prevotella_vespertina.png",
    },
    191: {
        species: "Propionibacterium_acidifaciens",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Propionibacterium_acidifaciens.png",
    },
    676: {
        species: "Proteus_mirabilis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Proteus_mirabilis.png",
    },
    845: {
        species: "Pseudoleptotrichia_goodfellowii",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Pseudoleptotrichia_goodfellowii.png",
    },
    212: {
        species: "Pseudoleptotrichia_sp_HMT_212",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Pseudoleptotrichia_sp_HMT_212.png",
    },
    215: {
        species: "Pseudoleptotrichia_sp_HMT_215",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Pseudoleptotrichia_sp_HMT_215.png",
    },
    536: {
        species: "Pseudomonas_aeruginosa",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Pseudomonas_aeruginosa.png",
    },
    612: {
        species: "Pseudomonas_fluorescens",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Pseudomonas_fluorescens.png",
    },
    344: {
        species: "Pseudomonas_luteola",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Pseudomonas_luteola.png",
    },
    740: {
        species: "Pseudomonas_oleovorans",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Pseudomonas_oleovorans.png",
    },
    834: {
        species: "Pseudomonas_otitidis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Pseudomonas_otitidis.png",
    },
    538: {
        species: "Pseudoramibacter_alactolyticus",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Pseudoramibacter_alactolyticus.png",
    },
    357: {
        species: "Pyramidobacter_piscolens",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Pyramidobacter_piscolens.png",
    },
    854: {
        species: "Ralstonia_pickettii",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Ralstonia_pickettii.png",
    },
    857: {
        species: "Rhodobacter_capsulatus",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Rhodobacter_capsulatus.png",
    },
    244: {
        species: "Roseomonas_gilardii",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Roseomonas_gilardii.png",
    },
    245: {
        species: "Roseomonas_mucosa",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Roseomonas_mucosa.png",
    },
    188: {
        species: "Rothia_aeria",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Rothia_aeria.png",
    },
    587: {
        species: "Rothia_dentocariosa",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Rothia_dentocariosa.png",
    },
    147: {
        species: "Rothia_mucilaginosa_clade_147",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Rothia_mucilaginosa_clade_147.png",
    },
    681: {
        species: "Rothia_mucilaginosa_clade_681",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Rothia_mucilaginosa_clade_681.png",
    },
    988: {
        species: "Saccharimonas_aalborgensis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Saccharimonas_aalborgensis.png",
    },
    955: {
        species: "Saccharimonas_sicarius",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Saccharimonas_sicarius.png",
    },
    346: {
        species: "Saccharimonas_sp_HMT_346",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Saccharimonas_sp_HMT_346.png",
    },
    349: {
        species: "Saccharimonas_sp_HMT_349",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Saccharimonas_sp_HMT_349.png",
    },
    394: {
        species: "Saccharimonas_sp_HMT_394",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Saccharimonas_sp_HMT_394.png",
    },
    397: {
        species: "Saccharimonas_sp_HMT_397",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Saccharimonas_sp_HMT_397.png",
    },
    856: {
        species: "Sanguibacter_keddieii",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Sanguibacter_keddieii.png",
    },
    642: {
        species: "Scardovia_inopinata",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Scardovia_inopinata.png",
    },
    195: {
        species: "Scardovia_wiggsiae",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Scardovia_wiggsiae.png",
    },
    850: {
        species: "Schaalia_cardiffensis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Schaalia_cardiffensis.png",
    },
    710: {
        species: "Schaalia_dentiphila",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Schaalia_dentiphila.png",
    },
    617: {
        species: "Schaalia_georgiae",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Schaalia_georgiae.png",
    },
    178: {
        species: "Schaalia_hongkongensis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Schaalia_hongkongensis.png",
    },
    181: {
        species: "Schaalia_lingnae",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Schaalia_lingnae.png",
    },
    671: {
        species: "Schaalia_meyeri",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Schaalia_meyeri.png",
    },
    701: {
        species: "Schaalia_odontolytica",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Schaalia_odontolytica.png",
    },
    172: {
        species: "Schaalia_sp_HMT_172",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Schaalia_sp_HMT_172.png",
    },
    180: {
        species: "Schaalia_sp_HMT_180",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Schaalia_sp_HMT_180.png",
    },
    240: {
        species: "Schaalia_sp_HMT_240",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Schaalia_sp_HMT_240.png",
    },
    404: {
        species: "Schaalia_sp_HMT_404",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Schaalia_sp_HMT_404.png",
    },
    24: {
        species: "Schlegelella_thermodepolymerans",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Schlegelella_thermodepolymerans.png",
    },
    553: {
        species: "Segatella_baroniae",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Segatella_baroniae.png",
    },
    560: {
        species: "Segatella_buccae",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Segatella_buccae.png",
    },
    289: {
        species: "Segatella_maculosa",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Segatella_maculosa.png",
    },
    311: {
        species: "Segatella_oris",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Segatella_oris.png",
    },
    288: {
        species: "Segatella_oulorum",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Segatella_oulorum.png",
    },
    307: {
        species: "Segatella_salivae",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Segatella_salivae.png",
    },
    261: {
        species: "Segetibacter_aerophilus",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Segetibacter_aerophilus.png",
    },
    124: {
        species: "Selenomonas_artemidis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Selenomonas_artemidis.png",
    },
    139: {
        species: "Selenomonas_dianae",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Selenomonas_dianae.png",
    },
    136: {
        species: "Selenomonas_felix",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Selenomonas_felix.png",
    },
    125: {
        species: "Selenomonas_flueggei",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Selenomonas_flueggei.png",
    },
    639: {
        species: "Selenomonas_infelix",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Selenomonas_infelix.png",
    },
    130: {
        species: "Selenomonas_noxia",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Selenomonas_noxia.png",
    },
    126: {
        species: "Selenomonas_sp_HMT_126",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Selenomonas_sp_HMT_126.png",
    },
    133: {
        species: "Selenomonas_sp_HMT_133",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Selenomonas_sp_HMT_133.png",
    },
    892: {
        species: "Selenomonas_sp_HMT_892",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Selenomonas_sp_HMT_892.png",
    },
    920: {
        species: "Selenomonas_sp_HMT_920",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Selenomonas_sp_HMT_920.png",
    },
    151: {
        species: "Selenomonas_sputigena",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Selenomonas_sputigena.png",
    },
    138: {
        species: "Selenomonas_timonae",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Selenomonas_timonae.png",
    },
    115: {
        species: "Serratia_marcescens",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Serratia_marcescens.png",
    },
    95: {
        species: "Shuttleworthia_satelles",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Shuttleworthia_satelles.png",
    },
    683: {
        species: "Simonsiella_muelleri",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Simonsiella_muelleri.png",
    },
    602: {
        species: "Slackia_exigua",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Slackia_exigua.png",
    },
    837: {
        species: "Sneathia_sanguinegens",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Sneathia_sanguinegens.png",
    },
    844: {
        species: "Sneathia_vaginalis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Sneathia_vaginalis.png",
    },
    678: {
        species: "Solobacterium_moorei",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Solobacterium_moorei.png",
    },
    3: {
        species: "Sphingomonas_glacialis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Sphingomonas_glacialis.png",
    },
    550: {
        species: "Staphylococcus_aureus",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Staphylococcus_aureus.png",
    },
    331: {
        species: "Staphylococcus_auricularis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Staphylococcus_auricularis.png",
    },
    116: {
        species: "Staphylococcus_capitis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Staphylococcus_capitis.png",
    },
    567: {
        species: "Staphylococcus_caprae",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Staphylococcus_caprae.png",
    },
    117: {
        species: "Staphylococcus_cohnii",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Staphylococcus_cohnii.png",
    },
    601: {
        species: "Staphylococcus_epidermidis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Staphylococcus_epidermidis.png",
    },
    120: {
        species: "Staphylococcus_haemolyticus",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Staphylococcus_haemolyticus.png",
    },
    127: {
        species: "Staphylococcus_hominis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Staphylococcus_hominis.png",
    },
    128: {
        species: "Staphylococcus_lugdunensis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Staphylococcus_lugdunensis.png",
    },
    141: {
        species: "Staphylococcus_pasteuri",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Staphylococcus_pasteuri.png",
    },
    142: {
        species: "Staphylococcus_pettenkoferi",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Staphylococcus_pettenkoferi.png",
    },
    789: {
        species: "Staphylococcus_saccharolyticus",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Staphylococcus_saccharolyticus.png",
    },
    233: {
        species: "Staphylococcus_schleiferi",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Staphylococcus_schleiferi.png",
    },
    76: {
        species: "Staphylococcus_warneri",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Staphylococcus_warneri.png",
    },
    663: {
        species: "Stenotrophomonas_maltophilia",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Stenotrophomonas_maltophilia.png",
    },
    37: {
        species: "Stenotrophomonas_nitritireducens",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Stenotrophomonas_nitritireducens.png",
    },
    419: {
        species: "Stomatobaculum_longum",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Stomatobaculum_longum.png",
    },
    537: {
        species: "Streptococcus_agalactiae",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Streptococcus_agalactiae.png",
    },
    543: {
        species: "Streptococcus_anginosus",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Streptococcus_anginosus.png",
    },
    73: {
        species: "Streptococcus_australis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Streptococcus_australis.png",
    },
    576: {
        species: "Streptococcus_constellatus",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Streptococcus_constellatus.png",
    },
    578: {
        species: "Streptococcus_cristatus",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Streptococcus_cristatus.png",
    },
    594: {
        species: "Streptococcus_downei",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Streptococcus_downei.png",
    },
    622: {
        species: "Streptococcus_gordonii",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Streptococcus_gordonii.png",
    },
    456: {
        species: "Streptococcus_ilei",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Streptococcus_ilei.png",
    },
    444: {
        species: "Streptococcus_infantis_clade_444",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Streptococcus_infantis_clade_444.png",
    },
    638: {
        species: "Streptococcus_infantis_clade_638",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Streptococcus_infantis_clade_638.png",
    },
    431: {
        species: "Streptococcus_infantis_clade_431",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Streptococcus_infantis_clade_431.png",
    },
    61: {
        species: "Streptococcus_infantis_clade_061",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Streptococcus_infantis_clade_061.png",
    },
    644: {
        species: "Streptococcus_intermedius",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Streptococcus_intermedius.png",
    },
    948: {
        species: "Streptococcus_lactarius",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Streptococcus_lactarius.png",
    },
    677: {
        species: "Streptococcus_mitis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Streptococcus_mitis.png",
    },
    686: {
        species: "Streptococcus_mutans",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Streptococcus_mutans.png",
    },
    707: {
        species: "Streptococcus_oralis_subsp_oralis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Streptococcus_oralis_subsp_oralis.png",
    },
    71: {
        species: "Streptococcus_oralis_subsp_tigurinus",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Streptococcus_oralis_subsp_tigurinus.png",
    },
    398: {
        species: "Streptococcus_oralis_subsp_dentisani",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Streptococcus_oralis_subsp_dentisani.png",
    },
    411: {
        species: "Streptococcus_parasanguinis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Streptococcus_parasanguinis.png",
    },
    728: {
        species: "Streptococcus_peroris",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Streptococcus_peroris.png",
    },
    734: {
        species: "Streptococcus_pneumoniae",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Streptococcus_pneumoniae.png",
    },
    425: {
        species: "Streptococcus_pseudopneumoniae",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Streptococcus_pseudopneumoniae.png",
    },
    745: {
        species: "Streptococcus_pyogenes",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Streptococcus_pyogenes.png",
    },
    415: {
        species: "Streptococcus_rubneri",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Streptococcus_rubneri.png",
    },
    755: {
        species: "Streptococcus_salivarius",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Streptococcus_salivarius.png",
    },
    758: {
        species: "Streptococcus_sanguinis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Streptococcus_sanguinis.png",
    },
    767: {
        species: "Streptococcus_sinensis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Streptococcus_sinensis.png",
    },
    768: {
        species: "Streptococcus_sobrinus",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Streptococcus_sobrinus.png",
    },
    56: {
        species: "Streptococcus_sp_HMT_056",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Streptococcus_sp_HMT_056.png",
    },
    58: {
        species: "Streptococcus_sp_HMT_058",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Streptococcus_sp_HMT_058.png",
    },
    66: {
        species: "Streptococcus_sp_HMT_066",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Streptococcus_sp_HMT_066.png",
    },
    152: {
        species: "Streptococcus_thermophilus",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Streptococcus_thermophilus.png",
    },
    21: {
        species: "Streptococcus_vestibularis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Streptococcus_vestibularis.png",
    },
    477: {
        species: "Stutzerimonas_stutzeri",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Stutzerimonas_stutzeri.png",
    },
    613: {
        species: "Tannerella_forsythia",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Tannerella_forsythia.png",
    },
    286: {
        species: "Tannerella_serpentiformis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Tannerella_serpentiformis.png",
    },
    584: {
        species: "Treponema_denticola",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Treponema_denticola.png",
    },
    653: {
        species: "Treponema_lecithinolyticum",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Treponema_lecithinolyticum.png",
    },
    664: {
        species: "Treponema_maltophilum",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Treponema_maltophilum.png",
    },
    667: {
        species: "Treponema_medium",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Treponema_medium.png",
    },
    805: {
        species: "Treponema_pallidum",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Treponema_pallidum.png",
    },
    724: {
        species: "Treponema_parvum",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Treponema_parvum.png",
    },
    725: {
        species: "Treponema_pectinovorum",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Treponema_pectinovorum.png",
    },
    743: {
        species: "Treponema_putidum",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Treponema_putidum.png",
    },
    440: {
        species: "Treponema_socranskii_subsp_paredis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Treponema_socranskii_subsp_paredis.png",
    },
    438: {
        species: "Treponema_socranskii_subsp_buccale",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Treponema_socranskii_subsp_buccale.png",
    },
    769: {
        species: "Treponema_socranskii_subsp_socranskii",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Treponema_socranskii_subsp_socranskii.png",
    },
    432: {
        species: "Treponema_vincentii_clade_432",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Treponema_vincentii_clade_432.png",
    },
    29: {
        species: "Treponema_vincentii_clade_029",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Treponema_vincentii_clade_029.png",
    },
    799: {
        species: "Ureaplasma_parvum",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Ureaplasma_parvum.png",
    },
    375: {
        species: "Urinicoccus_timonensis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Urinicoccus_timonensis.png",
    },
    717: {
        species: "Variovorax_paradoxus",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Variovorax_paradoxus.png",
    },
    524: {
        species: "Veillonella_atypica",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Veillonella_atypica.png",
    },
    887: {
        species: "Veillonella_denticariosi",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Veillonella_denticariosi.png",
    },
    160: {
        species: "Veillonella_dispar",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Veillonella_dispar.png",
    },
    156: {
        species: "Veillonella_nakazawae",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Veillonella_nakazawae.png",
    },
    161: {
        species: "Veillonella_parvula",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Veillonella_parvula.png",
    },
    158: {
        species: "Veillonella_rogosae",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Veillonella_rogosae.png",
    },
    779: {
        species: "Veillonella_sp_HMT_779",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Veillonella_sp_HMT_779.png",
    },
    780: {
        species: "Veillonella_sp_HMT_780",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Veillonella_sp_HMT_780.png",
    },
    421: {
        species: "Veillonella_tobetsuensis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Veillonella_tobetsuensis.png",
    },
    998: {
        species: "Victivallis_lenta",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Victivallis_lenta.png",
    },
    827: {
        species: "Yersinia_pestis",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Yersinia_pestis.png",
    },

    345: {
        species: "Absconditicoccaceae [G1]_bacterium HMT_345",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Absconditicoccaceae__G1__bacterium_HMT_345.png",
    },
    874: {
        species: "Absconditicoccaceae [G1]_bacterium HMT_874",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Absconditicoccaceae__G1__bacterium_HMT_874.png",
    },
    875: {
        species: "Absconditicoccaceae [G1]_bacterium HMT_875",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Absconditicoccaceae__G1__bacterium_HMT_875.png",
    },
    991: {
        species: "Absconditicoccaceae [G2]_bacterium HMT_991",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Absconditicoccaceae__G2__bacterium_HMT_991.png",
    },
    439: {
        species: "Anaerolineae [G1]_bacterium HMT_439",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Anaerolineae__G1__bacterium_HMT_439.png",
    },
    876: {
        species: "Clostridiales [F3 G1]_bacterium HMT_876",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Clostridiales__F3_G1__bacterium_HMT_876.png",
    },
    96: {
        species: "Lachnospiraceae [G2]_bacterium HMT_096",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Lachnospiraceae__G2__bacterium_HMT_096.png",
    },
    500: {
        species: "Lachnospiraceae [G8]_bacterium HMT_500",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Lachnospiraceae__G8__bacterium_HMT_500.png",
    },
    871: {
        species: "Patescibacteria [C1 O1 F1 G1]_bacterium HMT_871",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Patescibacteria__C1_O1_F1_G1__bacterium_HMT_871.png",
    },
    872: {
        species: "Patescibacteria [C1 O1 F1 G1]_bacterium HMT_872",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Patescibacteria__C1_O1_F1_G1__bacterium_HMT_872.png",
    },
    873: {
        species: "Patescibacteria [C1 O1 F1 G2]_bacterium HMT_873",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Patescibacteria__C1_O1_F1_G2__bacterium_HMT_873.png",
    },
    113: {
        species: "Peptoniphilaceae [G1]_bacterium HMT_113",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Peptoniphilaceae__G1__bacterium_HMT_113.png",
    },
    350: {
        species: "Saccharimonadales [F1 G1]_bacterium HMT_350",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Saccharimonadales__F1_G1__bacterium_HMT_350.png",
    },
    986: {
        species: "Saccharimonadales [F2 G1]_bacterium HMT_986",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Saccharimonadales__F2_G1__bacterium_HMT_986.png",
    },
    989: {
        species: "Saccharimonadales [F2 G1]_bacterium HMT_989",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Saccharimonadales__F2_G1__bacterium_HMT_989.png",
    },
    391: {
        species: "Saccharimonadales [F5 G1]_bacterium HMT_391",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Saccharimonadales__F5_G1__bacterium_HMT_391.png",
    },
    105: {
        species: "Anaerovoracaceae [G1]_infirmum",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Anaerovoracaceae__G1__infirmum.png",
    },
    759: {
        species: "Anaerovoracaceae [G5]_saphenum",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Anaerovoracaceae__G5__saphenum.png",
    },
    274: {
        species: "Paludibacteraceae [G1]_bacterium HMT_274",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Paludibacteraceae__G1__bacterium_HMT_274.png",
    },
    467: {
        species: "Anaerovoracaceae [G1]_sulci",
        fname: "breadth_vs_depth_coverage-subsite_subset-fit_curves-Anaerovoracaceae__G1__sulci.png",
    },
};
constants.abundance_names = {
    ANA: "Anterior Nares (nasal)",
    AKE: "Attached Keratinized Gingiva (oral)",
    BMU: "Buccal Mucosa (oral)",
    HPA: "Hard Palate (oral)",
    LAF: "L_Antecubital Fossa (skin)",
    LRC: "L_Retroauricular Crease (skin)",
    MVA: "Mid Vagina (vaginal)",
    PTO: "Palatine Tonsils (oral)",
    PFO: "Posterior Fornix (vaginal)",
    RAF: "R_Antecubital Fossa (skin)",
    RRC: "R_Retroauricular Crease (skin)",
    SAL: "Saliva (oral)",
    STO: "Stool (gut)",
    SUBP: "Subgingival Plaque (oral)",
    SUPP: "Supragingival Plaque (oral)",
    THR: "Throat (oral)",
    TDO: "Tongue Dorsum (oral)",
    VIN: "Vaginal Introitus (vaginal)",
    PERIO: "Periodontal (oral)",
};
constants.abundance_site_colors = {
    AKE: "#ff7f0e", //Attached_Keratinized_gingiva
    ANA: "#ffbb78", //#Anterior_nares
    BMU: "#2ca02c", //#Buccal_mucosa
    HPA: "#98df8a", //#Hard_palate
    LAF: "#d62728", //#L_Antecubital_fossa  # not in HMP
    PERIO: "#aec7e8", //# ONLY in HMP
    LRC: "#ff9896", //#L_Retroauricular_crease
    MVA: "#9467bd", //#Mid_vagina
    PFO: "#c5b0d5", //#Posterior_fornix
    PTO: "#8c564b", //#Palatine_Tonsils
    RAF: "#c49c94", //#R_Antecubital_fossa
    RRC: "#e377c2", //#R_Retroauricular_crease
    SAL: "#f7b6d2", //#Saliva

    STO: "#7f7f7f", //#Stool
    SUBP: "#c7c7c7", //#Subgingival_plaque
    SUPP: "#bcbd22", //#Supragingival_plaque
    THR: "#dbdb8d", //#Throat
    TDO: "#17becf", //#Tongue_dorsum
    VIN: "#9edae5", //#Vaginal_introitus
};
//All the Capnocytophaga can be the same color;
let capno_color = ["#a1ee0a", "#98fb98", "#00ff7f", "#adff2f"]; // 4 greens
//both Corynebacterium matruchotii and Corynebacterium durum can be the same color;
let coryne_color = ["#da70d6", "magenta"]; // 2 magenta
// The 5 nasal Corynebacterium (accolens, pseudodiphtheriticum, tuberculostearucium, propinquum, macginleyi) can be the same color;
let nasal_coryne_color = [
    "lightblue",
    "#ace5ee",
    "#abcdef",
    "#a4dded",
    "#b0e0e6",
];
// Staph epidermidis and Staph aureus can be the same color;
let staph_color = ["tomato", "lightsalmon"];
// Anaerococcus octavius and Anaerococcus sp. HMT 290 can be the same colorc;
let anaero_color = ["#fff8dc", "#fcffa4"];
// Haemophilus haemolyticus and H. sp. HMT 036 can be the same color;
let haemo_color = "orangered";
// Leptotrichia buccalis and Leptotrichia wadei can be the same color;
let lepto1_color = "#00ffff";
// Leptotrichia sp. HMT 417 and Pseudoleptotrichia HMT 221 can be the same color;
let lepto2_color = "#96152e";
// and it would be good if S. mitis, S. oralis, and S. infantis, and S. spp. HMT 074 and 423
//were very similar color or the same color to emphasize that we can't really tell them apart with this data.
let strep_color = ["#acbf60", "#b0c24a", "#a4c639", "#8c9e5e", "#9ab973"]; // 5 green

constants.plot_species_colors = {
    866: "lightsalmon",
    176: "#dc143c",
    893: "#ff4040",
    473: "DarkViolet",
    17: anaero_color[0],
    290: anaero_color[1],
    575: "#1f8ad5",
    337: capno_color[0],
    325: capno_color[1],
    329: capno_color[2],
    775: capno_color[3],
    19: nasal_coryne_color[0],
    595: coryne_color[0],
    50: nasal_coryne_color[1],
    666: coryne_color[1],
    59: nasal_coryne_color[2],
    60: nasal_coryne_color[3],
    77: nasal_coryne_color[4],
    530: "MediumSeaGreen",
    698: "yellow",
    201: "chartreuse",
    626: "#3bea0f",
    534: "plum",
    596: "aliceblue",
    851: haemo_color,
    718: "#ffa500",
    36: haemo_color,
    22: "#804e71",
    563: lepto1_color,
    222: lepto1_color,
    417: lepto2_color,
    610: "#a04115",
    101: "#9a8bf0",
    279: "#87cefa",
    930: "moccasin",
    469: "#7b68ee",
    311: "#9400d3",
    221: lepto2_color,
    188: "#4ddc9b",
    587: "#e13ffa",
    681: "#f4f74a",
    701: "#ff0000",
    172: "#ff0000",
    180: "#ff0000",
    550: staph_color[0],
    601: staph_color[1],
    73: "#008080",
    578: "#008080",
    //constants.plot_species_colors['886': {species:'Streptococcus cristatus',color:'#008080'},  //DROPPED
    431: strep_color[0],
    638: strep_color[0],
    677: strep_color[1],
    707: strep_color[2],
    411: "#3CBC3C",
    //    '721': {species:'Streptococcus parasanguinis',color:'#3CBC3C'},  //DROPPED
    755: "#50D050",
    758: "#008080",
    74: strep_color[3],
    423: strep_color[4],
    524: "#ffcff1",
    160: "#fddde6",
    161: "#ffb6c1",
    158: "#fba0e3",
    780: "deeppink",
};

// constants.plot_species_colorsxx = [  // to be put in db with species_id
//     {otid:'866',species:'Actinomyces graevenitzii',color:'lightsalmon'},
//     {otid:'176',species:'Actinomyces naeslundii',color:'#dc143c'},
//     {otid:'893',species:'Actinomyces oris',color:'#ff4040'},
//     {otid:'473',species:'Alloprevotella sp._HMT_473',color:'DarkViolet'},
//     {otid:'17',species:'Anaerococcus octavius',color: anaero_color[0]},
//     {otid:'290',species:'Anaerococcus sp._HMT_290',color: anaero_color[1]},
//     {otid:'575',species:'Campylobacter concisus',color:'#1f8ad5'},
//     {otid:'337',species:'Capnocytophaga gingivalis',color: capno_color[0]},
//     {otid:'325',species:'Capnocytophaga granulosa',color: capno_color[1]},
//     {otid:'329',species:'Capnocytophaga leadbetteri',color: capno_color[2]},
//     {otid:'775',species:'Capnocytophaga sputigena',color: capno_color[3]},
//     {otid:'19',species:'Corynebacterium accolens',color: nasal_coryne_color[0]},
//     {otid:'595',species:'Corynebacterium durum',color: coryne_color[0]},
//     {otid:'50',species:'Corynebacterium macginleyi',color: nasal_coryne_color[1]},
//     {otid:'666',species:'Corynebacterium matruchotii',color: coryne_color[1]},
//     {otid:'59',species:'Corynebacterium propinquum',color: nasal_coryne_color[2]},
//     {otid:'60',species:'Corynebacterium pseudodiphtheriticum',color: nasal_coryne_color[3]},
//     {otid:'77',species:'Corynebacterium tuberculostearicum',color: nasal_coryne_color[4]},
//     {otid:'530',species:'Cutibacterium acnes',color:'MediumSeaGreen'},
//     {otid:'698',species:'Fusobacterium nucleatum',color:'yellow'},
//     {otid:'201',species:'Fusobacterium periodonticum',color:'chartreuse'},
//     {otid:'626',species:'Gemella haemolysans',color:'#3bea0f'},
//     {otid:'534',species:'Granulicatella adiacens',color:'plum'},
//     {otid:'596',species:'Granulicatella elegans',color:'aliceblue'},
//     {otid:'851',species:'Haemophilus haemolyticus',color: haemo_color},
//     {otid:'718',species:'Haemophilus parainfluenzae',color:'#ffa500'},
//     {otid:'36',species:'Haemophilus sp._HMT_036',color: haemo_color},
//     {otid:'22',species:'Lautropia mirabilis',color:'#804e71'},
//     {otid:'563',species:'Leptotrichia buccalis',color: lepto1_color},
//     {otid:'222',species:'Leptotrichia wadei',color: lepto1_color},
//     {otid:'417',species:'Leptotrichia sp._HMT_417',color: lepto2_color},
//     {otid:'610',species:'Neisseria flavescens',color:'#a04115'},
//     {otid:'101',species:'Neisseria perflava',color:'#9a8bf0'},
//     {otid:'279',species:'Porphyromonas pasteri',color:'#87cefa'},
//     {otid:'930',species:'Porphyromonas sp._HMT_930',color:'moccasin'},
//     {otid:'469',species:'Prevotella melaninogenica',color:'#7b68ee'},
//     {otid:'311',species:'Prevotella oris',color:'#9400d3'},
//     {otid:'221',species:'Pseudoleptotrichia sp._HMT_221',color: lepto2_color},
//     {otid:'188',species:'Rothia aeria',color:'#4ddc9b'},
//     {otid:'587',species:'Rothia dentocariosa',color:'#e13ffa'},
//     {otid:'681',species:'Rothia mucilaginosa',color:'#f4f74a'},
//     {otid:'701',species:'Schaalia odontolytica',color:'#ff0000'},
//     {otid:'172',species:'Schaalia sp._HMT_172',color:'#ff0000'},
//     {otid:'180',species:'Schaalia sp._HMT_180',color:'#ff0000'},
//     {otid:'550',species:'Staphylococcus aureus',color: staph_color[0]},
//     {otid:'601',species:'Staphylococcus epidermidis',color: staph_color[1]},
//     {otid:'73',species:'Streptococcus australis',color:'#008080'},
//     {otid:'578',species:'Streptococcus cristatus',color:'#008080'},
//     // DROPPED {otid:'886',species:'Streptococcus cristatus',color:'#008080'},  //DROPPED
//     {otid:'431',species:'Streptococcus infantis',color: strep_color[0]},
//     {otid:'638',species:'Streptococcus infantis',color: strep_color[0]},
//     {otid:'677',species:'Streptococcus mitis',color: strep_color[1]},
//     {otid:'707',species:'Streptococcus oralis',color: strep_color[2]},
//     {otid:'411',species:'Streptococcus parasanguinis',color:'#3CBC3C'},
//     // DROPPED {otid:'721',species:'Streptococcus parasanguinis',color:'#3CBC3C'},  //DROPPED
//     {otid:'755',species:'Streptococcus salivarius',color:'#50D050'},
//     {otid:'758',species:'Streptococcus sanguinis',color:'#008080'},
//     {otid:'74',species:'Streptococcus sp._HMT_074',color: strep_color[3]},
//     {otid:'423',species:'Streptococcus sp._HMT_423',color: strep_color[4]},
//     {otid:'524',species:'Veillonella atypica',color:'#ffcff1'},
//     {otid:'160',species:'Veillonella dispar',color:'#fddde6'},
//     {otid:'161',species:'Veillonella parvula',color:'#ffb6c1'},
//     {otid:'158',species:'Veillonella rogosae',color:'#fba0e3'},
//     {otid:'780',species:'Veillonella sp._HMT_780',color:'deeppink'}
// ]

//constants.tax_sites_all =['oral','nasal','skin','vaginal','unassigned','nonoralref'];

//constants.tax_sites_on = ['oral','nasal','skin','vaginal','unassigned'];
constants.tax_sites_all = {
    oral: "Oral",
    nasal: "Nasal",
    skin: "Skin",
    gut: "Gut",
    vaginal: "Vaginal",
    pathogen: "Pathogen",
    enviro: "Environmental",
    //'ref'          :'Reference',  // Was NonOralRef
    unassigned: "Unassigned",
};
constants.tax_sites_default = [
    "oral",
    "nasal",
    "skin",
    "gut",
    "vaginal",
    "pathogen",
    "enviro",
    "unassigned",
];
//constants.default_site_on = ['oral', 'nasal', 'skin','gut', 'vaginal', 'pathogen', 'unassigned']
//constants.naming_status = ['Named','Unnamed']
//constants.cultivation_status = ['Cultivated','Uncultivated']
constants.tax_status_all = [
    "named_cultivated",
    "named_uncultivated",
    "unnamed_cultivated",
    "phylotype",
    "reference",
    "dropped",
];
constants.tax_status_default = [
    "named_cultivated",
    "named_uncultivated",
    "unnamed_cultivated",
    "phylotype",
    "reference",
];

constants.tax_abund_all = [
    "high_abund",
    "medium_abund",
    "low_abund",
    "scarce_abund",
    "nodata_abund",
];
constants.tax_abund_default = [
    "high_abund",
    "medium_abund",
    "low_abund",
    "scarce_abund",
    "nodata_abund",
];

constants.genome_level_all = {
    complete_genome: "Complete Genome",
    scaffold: "Scaffold",
    contig: "Contig",
    chromosome: "Chromosome",
};

// tax filenames (fn)
constants.genome_lookup_fn = "homdData-GenomeLookup.json";
constants.info_lookup_fn = "homdData-TaxonInfoLookup.json"; //??
constants.references_lookup_fn = "homdData-TaxonReferencesLookup.json";
constants.taxcounts_fn = "homdData-TaxonCounts.json";
constants.abundance_fn = "homdData-SiteAbundances.json";
constants.taxon_lookup_fn = "homdData-TaxonLookup.json";
constants.lineage_lookup_fn = "homdData-TaxonLineageLookup.json"; // supplied to create dict
constants.tax_hierarchy_fn = "homdData-TaxonHierarchy.json";
constants.refseq_lookup_fn = "homdData-TaxonRefSeqLookup.json";
constants.phage_list_fn = "homdData-PhageList.json";
constants.phage_lookup_fn = "homdData-PhageLookup.json";
constants.annotation_lookup_fn = "homdData-AnnotationLookup.json";
constants.contig_lookup_fn = "homdData-ContigsLookup.json";
constants.site_lookup_fn = "homdData-TaxonSiteLookup.json";
constants.crispr_lookup_fn = "homdData-CrisprLookup.json";
constants.phage_lookup_fn = "homdData-PhageLookup.json";
constants.amr_lookup_fn = "homdData-AMRLookup.json";
constants.pg_lookup_fn = "homdData-PangenomesLookup.json";
constants.missing_ncbi_genomes_fn = "homdData-MissingGenomes.json";
//constants.image_location_fn     = 'ImageLocation.js'

constants.image_location_locfn = "ImageLocation_loc.js";
constants.image_location_taxfn = "ImageLocation_tax.js";
//constants.abundance_lookup_fn      = 'homdData-Abundance.json'

constants.hires_images = {
    "Capno_256x256.png": "Capnocytophaga_HighRes.png",
    "Coryne_matruch_256x256.png": "Coryne_matruch_HighRes.png",
    "Leptotrichia_256x256.png": "Leptotrichia_HighRes.png",
    "MarkWelch2016_Fig4B_256_ForCoryne_Porph_Strep_Aggr.png":
        "MarkWelch2016_Fig4B_HighRes.png",
    "Schaalia_Rothmuc_Neiss_Veill_256.png":
        "Schaalia_Rothmuc_Neiss_Veill_HighRes.png",
};
//['Capnocytophaga','Coryne_matruch','Leptotrichia','MarkWelch2016_Fig4B','Schaalia_Rothmuc_Neiss_Veill']
//constants.access_log_format = 'url=":url" method=":method" statusCode=":statusCode" delta=":delta" ip=":ip"'

constants.default_phage_cols = [
    // six at most
    { name: "pid", view: "Phage-ID", width: "col1", order: "1" },
    { name: "family_ncbi", view: "Phage Family", width: "col3", order: "2" },
    { name: "genus_ncbi", view: "Phage Genus", width: "col3", order: "3" },
    { name: "species_ncbi", view: "Phage Species", width: "col3", order: "4" },
    { name: "host_otid", view: "Host Taxon-ID", width: "col1", order: "5" },
    { name: "host_ncbi", view: "Host Name", width: "", order: "6" }, // one col should have no width
];
constants.all_phage_cols = [
    { name: "pid", view: "Phage-ID", width: "col1", order: "1" },
    { name: "host_otid", view: "Host Taxon-ID", width: "col1", order: "5" },
    { name: "assembly_ncbi", view: "NCBI Assembly", width: "col3", order: "" },
    {
        name: "sra_accession_ncbi",
        view: "SRA Accession",
        width: "col3",
        order: "",
    },
    {
        name: "submitters_ncbi",
        view: "NCBI Submitters",
        width: "col5",
        order: "",
    },
    {
        name: "release_date_ncbi",
        view: "NCBI Release Date",
        width: "col3",
        order: "",
    },
    { name: "family_ncbi", view: "Phage Family", width: "col3", order: "2" },
    { name: "genus_ncbi", view: "Phage Genus", width: "col3", order: "3" },
    { name: "species_ncbi", view: "Phage Species", width: "col3", order: "4" },
    {
        name: "publications_ncbi",
        view: "Publications",
        width: "col3",
        order: "",
    },
    {
        name: "molecule_type_ncbi",
        view: "Molecule Type",
        width: "col1",
        order: "",
    },
    {
        name: "sequence_type_ncbi",
        view: "Sequence Type",
        width: "col1",
        order: "",
    },
    {
        name: "geo_location_ncbi",
        view: "Geo Location",
        width: "col1",
        order: "",
    },
    { name: "usa_ncbi", view: "USA", width: "col1", order: "" },
    { name: "host_ncbi", view: "Host Name", width: "", order: "6" }, // one col should have no width
    {
        name: "isolation_source_ncbi",
        view: "Isolation Source",
        width: "col3",
        order: "",
    },
    {
        name: "collection_date_ncbi",
        view: "Collection Date",
        width: "col3",
        order: "",
    },
    { name: "biosample_ncbi", view: "BioSample", width: "col3", order: "" },
    {
        name: "genbank_title_ncbi",
        view: "Genbank Title",
        width: "col3",
        order: "",
    },
];
constants.blast_max_file = { size: 1.5, seqs: 500 }; // MB === 1,500,000
// BLASTP  Compares an amino acid query sequence against a protein sequence database
// BLASTN  Compares a nucleotide query sequence against a nucleotide sequence database
// BLASTX  Compares a nucleotide query sequence translated in all reading frames against a protein sequence database
// TBLASTN Compares a protein query sequence against a nucleotide sequence database dynamically translated in all reading frames
constants.blastPrograms = ["BLASTN", "BLASTP", "BLASTX", "TBLASTN"];
constants.refseq_blastn_db_choices = [
    {
        name: "eHOMD 16s rRNA RefSeq Version 15.22 (starts at pos 28)",
        value: "15.22",
        filename: "HOMD_16S_rRNA_RefSeq_V15.22.fasta",
    },
    {
        name: "eHOMD 16s rRNA RefSeq Version 15.22 (starts at pos 9)",
        value: "15.22_9",
        filename: "HOMD_16S_rRNA_RefSeq_V15.22.p9.fasta",
    },
    {
        name: "eHOMD 16s rRNA RefSeq Version 14.51 (starts at pos 28)",
        value: "14.51",
        filename: "HOMD_16S_rRNA_RefSeq_V14.51.fasta",
    },
    {
        name: "eHOMD 16s rRNA RefSeq Version 14.51 (starts at pos 9)",
        value: "14.51-9",
        filename: "HOMD_16S_rRNA_RefSeq_V14.51.p9.fasta",
    },

    {
        name: "eHOMD 16s rRNA RefSeq Version 14.51 (starts at 28 trimmed at 1407 of aligned seq)",
        value: "14.51-trimmed",
        filename: "HOMD_16S_rRNA_RefSeq_V14.5.trimmed.fasta",
    },
    {
        name: "eHOMD 16s rRNA RefSeq Version 13.2 (starts at pos 28)",
        value: "13.2",
        filename: "HOMD_16S_rRNA_RefSeq_V13.2.fasta",
    },
    {
        name: "eHOMD 16s rRNA RefSeq Version 13.2 (starts at pos 9)",
        value: "13.2-9",
        filename: "HOMD_16S_rRNA_RefSeq_V13.2.p9.fasta",
    },

    // where are these DBs? are they important?
    //  {name:'Greengenes 16S rRNA Sequences (gg16S_unaligned)',value:'GG',
    //          filename:''},
    //     {name:'NCBI Reference RNA Sequences (refseq_rna, 1969-12-31)',value:'NCBI',
    //          filename:''},
    //     {name:'RDP 16S rRNA Sequences',value:'RDP',
    //          filename:''},

    {
        name: "eHOMD 16s rRNA RefSeq Extended V1.1",
        value: "V1.1",
        filename: "Extended_reference_version1",
    },
];
// constants.genome_blastn_db_choices = [
constants.all_genome_blastn_db_choices = {
    nucleotide: [
        // blastn & tblastn & tblastx 2dbs:
        {
            name: "Genomic DNA from all HOMD Genomes",
            value: "all_genomes1",
            programs: ["blastn", "tblastn", "tblastx"],
            ext: "fna",
            filename: "fna/ALL_genomes.fna",
        },
        {
            name: "DNA Sequences of Proteins from all HOMD Genomes",
            value: "all_genomes2",
            programs: ["blastn", "tblastn", "tblastx"],
            ext: "ffn",
            filename: "ffn/ALL_genomes.ffn",
        },
    ],
    //>1
    //LLGDFFRKSKEKIGKEFKRIVQRIKDFLRNLVPRTES
    protein: [
        // blastp and blastx 1db:
        {
            name: "Proteins Annotated from all HOMD Genomes",
            value: "all_genomes3",
            programs: ["blastp", "blastx"],
            ext: "faa",
            filename: "faa/ALL_genomes.faa",
        },
    ],
};
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
//constants.anviserver_link = "https://vamps.mbl.edu/anviserver/pangenomes/"
// this should reflect what is avalable on HOMD (vamps/anviserver)
// **** NOTE NOTE This data is obsolete!! Look at the mysql table:pangenomes and the script Initialize_Taxonomy.py

// constants.pangenomes = [
//     {
//       otids: ['46','555','626','757','928'],
//       name: 'GemellaV9_15_2022_07_05',
//       dnld_v7: '',  //only if present
//       dnld_v8: 'HOMD_Gemella2022_07_05-V8.tar.gz',  //only if present
//       homd_genome_version:'V9.15',
//       show:'<i>Gemella</i>(2022-07-05)',
//       seqids:['SEQF2298','SEQF2460','SEQF1019','SEQF2070','SEQF2071','SEQF2783'],
//       on_vamps:true,
//       description: 'Pangenome of the genus Gemella containing all 30 available genomes from GenBank with a RefSeq equivalent by 03/02/2021.',
//       file_size: '200'
//     },
//     {
//       otids: [],
//       name: 'Mitis_GroupV9_15',
//       dnld_v7: '',  //only if present
//       dnld_v8: 'HOMD_Mitis_Group-V8.tar.gz',  //only if present
//       homd_genome_version:'V9.15',
//       show:'<i>Mitis</i> Group',
//       seqids:[],
//       on_vamps:true,
//       description: 'All 134 Genomes from HMT-677 (<i>Stroptococcus Mitis</i>)',
//       file_size: '586'
//     },
//     {
//       otids: [],
//       name: 'Prochlorococcus_31',
//       dnld_v7: '',  //only if present
//       dnld_v8: 'HOMD_Prochlorococcus_31-V8.tar.gz',  //only if present
//       homd_genome_version:'',
//       show:'<i>Prochlorococcus</i> (31)',
//       seqids:[],
//       on_vamps:true,
//       description: "31 Prochlorococcus genome dataset from Meren's site (Non-HOMD):<br>&nbsp;&nbsp;&nbsp;&nbsp;<a href='https://merenlab.org/2016/11/08/pangenomics-v2' target='_blank'>https://merenlab.org/2016/11/08/pangenomics-v2</a>",
//       file_size: '139'
//     },
//     {
//       otids: [],
//       name: 'Veillonella_AtypicaV9_15',
//       dnld_v7: 'Veillonella_atypica_pangenome-V7.tar.gz',  //only if present
//       dnld_v8: 'Veillonella_atypica_pangenome-V8.tar.gz',  //only if present
//       homd_genome_version:'V9.15',
//       show:'<i>Veillonella atypica</i>',
//       seqids:[],
//       on_vamps:true,
//       description: 'This pangenome was build using Anvi’o v7 with Python v3.7.9 and consists of 18 <i>Veillonella atypica</> (HMT-524) refseq assemblies and associated <i>V.</> sp. refseq assemblies downloaded from NCBI on 12/15/2022. Genomes are annotated with the Pfams data base (<a href="https://www.ebi.ac.uk/interpro/" target="_blank">https://www.ebi.ac.uk/interpro/</a>).',
//       file_size: '442'
//     },
//     {
//       otids: ['887'],
//       name: 'Veillonella_DenticariosiV9_15',
//       dnld_v7: 'Veillonella_denticariosi_pangenome-V7.tar.gz',  //only if present
//       dnld_v8: 'Veillonella_denticariosi_pangenome-V8.tar.gz',  //only if present
//       homd_genome_version:'V9.15',
//       show:'<i>Veillonella denticariosi</i>',
//       seqids:[],
//       on_vamps:true,
//       description: 'This pangenome was build using Anvi’o v7 with Python v3.7.9 and consists of 2 <i>Veillonella denticariosi</> (HMT-887) refseq assemblies and associated <i>V.</> sp. refseq assemblies downloaded from NCBI on 12/15/2022. Genomes are annotated with the Pfams data base (<a href="https://www.ebi.ac.uk/interpro/" target="_blank">https://www.ebi.ac.uk/interpro/</a>).',
//       file_size: '428'
//     },
//     {
//       otids: ['160'],
//       name: 'Veillonella_DisparV9_15',
//       dnld_v7: 'Veillonella_dispar_pangenome-V7.tar.gz',  //only if present
//       dnld_v8: 'Veillonella_dispar_pangenome-V8.tar.gz',  //only if present
//       homd_genome_version:'V9.15',
//       show:'<i>Veillonella dispar</i>',
//       seqids:[],
//       on_vamps:true,
//       description: 'This pangenome was build using Anvi’o v7 with Python v3.7.9 and consists of 18 <i>Veillonella dispar</> *(HMT-160) refseq assemblies and associated <i>V.</> sp. refseq assemblies downloaded from NCBI on 12/15/2022. Genomes are annotated with the Pfams data base (<a href="https://www.ebi.ac.uk/interpro/" target="_blank">https://www.ebi.ac.uk/interpro/</a>).',
//       file_size: '444'
//     },
//     {
//       otids: ['780'],
//       name: 'Veillonella_HMT780V9_15',
//       dnld_v7: 'Veillonella_HMT780_pangenome-V7.tar.gz',  //only if present
//       dnld_v8: 'Veillonella_HMT780_pangenome-V8.tar.gz',  //only if present
//       homd_genome_version:'V9.15',
//       show:'<i>Veillonella</i> (HMT-780)',
//       seqids:[],
//       on_vamps:true,
//       description: '6 genomes for <i>Veillonella sp.</i> HMT-780 and associated <i>V.</i> sp. refseq assemblies',
//       file_size: '327'
//     },
//     {
//       otids: [],
//       name: 'Veillonella_InfantiumV9_15',
//       dnld_v7: 'Veillonella_infantium_pangenome-V7.tar.gz',  //only if present
//       dnld_v8: 'Veillonella_infantium_pangenome-V8.tar.gz',  //only if present
//       homd_genome_version:'V9.15',
//       show:'<i>Veillonella infantium</i>',
//       seqids:[],
//       on_vamps:true,
//       description: 'This pangenome was build using Anvi’o v7 with Python v3.7.9 and consists of 2 <i>Veillonella infantium</> refseq assemblies and associated <i>V.</> sp. refseq assemblies downloaded from NCBI on 12/15/2022. Genomes are annotated with the Pfams data base (<a href="https://www.ebi.ac.uk/interpro/" target="_blank">https://www.ebi.ac.uk/interpro/</a>).',
//       file_size: '428'
//     },
//     {
//       otids: [],
//       name: 'Veillonella_ParvulaV9_15',
//       dnld_v7: 'Veillonella_parvula_pangenome-V7.tar.gz',  //only if present
//       dnld_v8: 'Veillonella_parvula_pangenome-V8.tar.gz',  //only if present
//       homd_genome_version:'V9.15',
//       show:'<i>Veillonella parvula</i>',
//       seqids:[],
//       on_vamps:true,
//       description: 'This pangenome was build using Anvi’o v7 with Python v3.7.9 and consists of 29 <i>Veillonella parvula</> (HMT-161) refseq assemblies and associated <i>V.</> sp. refseq assemblies downloaded from NCBI on 12/15/2022. Genomes are annotated with the Pfams data base (<a href="https://www.ebi.ac.uk/interpro/" target="_blank">https://www.ebi.ac.uk/interpro/</a>).',
//       file_size: '454'
//     },
//     {
//       otids: [],
//       name: 'Veillonella_RogosaeV9_15',
//       dnld_v7: 'Veillonella_rogosae_pangenome-V7.tar.gz',  //only if present
//       dnld_v8: 'Veillonella_rogosae_pangenome-V8.tar.gz',  //only if present
//       homd_genome_version:'V9.15',
//       show:'<i>Veillonella rogosae</i>',
//       seqids:[],
//       on_vamps:true,
//       description: 'This pangenome was build using Anvi’o v7 with Python v3.7.9 and consists of 3 <i>Veillonella rogosae</> (HMT-158) refseq assemblies and associated <i>V.</> sp. refseq assemblies downloaded from NCBI on 12/15/2022. Genomes are annotated with the Pfams data base (<a href="https://www.ebi.ac.uk/interpro/" target="_blank">https://www.ebi.ac.uk/interpro/</a>).',
//       file_size: '429'
//     },
//     {
//       otids: [],
//       name: 'Veillonella_TobetsuensisV9_15',
//       dnld_v7: 'Veillonella_tobetsuensis_pangenome-V7.tar.gz',  //only if present
//       dnld_v8: 'Veillonella_tobetsuensis_pangenome-V8.tar.gz',  //only if present
//       homd_genome_version:'V9.15',
//       show:'<i>Veillonella tobetsuensis</i>',
//       seqids:[],
//       on_vamps:true,
//       description: 'This pangenome was build using Anvi’o v7 with Python v3.7.9 and consists of 4 <i>Veillonella tobetsuensis</> refseq assemblies downloaded from NCBI on 12/15/2022. Genomes are annotated with the Pfams data base (<a href="https://www.ebi.ac.uk/interpro/" target="_blank">https://www.ebi.ac.uk/interpro/</a>).',
//       file_size: '430'
//     },
//     {
//       otids: [],
//       name: 'Veillonella_genus',
//       dnld_v7: 'Veillonella_genus_pangenome-V7.tar.gz',  //only if present
//       dnld_v8: 'Veillonella_genus_pangenome-V8.tar.gz',  //only if present
//       homd_genome_version:'V9.15',
//       show:'<i>Veillonella</i> (genus)',
//       seqids:[],
//       on_vamps:false,
//       description: 'This pangenome was build using Anvi’o v7 with Python v3.7.9 and consists of 101 <i>Veillonella</> refseq assemblies downloaded from NCBI on 12/15/2022. Genomes are annotated with the Pfams data base (<a href="https://www.ebi.ac.uk/interpro/" target="_blank">https://www.ebi.ac.uk/interpro/</a>).',
//       file_size: '719'
//     },
// ]
constants.PAGER_ROWS = 500;

constants.hmp_v3v5_to_suppress = [
    "34",
    "36",
    "851",
    "641",
    "56",
    "622",
    "948",
    "73",
    "677",
    "574",
    "638",
    "87",
    "755",
    "721",
    "152",
    "543",
    "767",
    "76",
    "114",
    "116",
    "612",
    "834",
    "127",
    "128",
    "141",
    "550",
    "591",
    "601",
    "598",
    "682",
    "764",
    "275",
    "283",
    "298",
    "313",
    "469",
    "572",
    "885",
    "306",
    "323",
    "324",
    "380",
    "412",
    "902",
    "903",
    "700",
    "326",
    "335",
    "336",
];

// links on taxa description page
constants.link_exceptions = {};
constants.link_exceptions["105"] = {
    ncbilink: "Eubacterium-infirmum",
    gcmlink: "Eubacterium%20infirmum",
    lpsnlink: "species/eubacterium-infirmum",
};
constants.link_exceptions["467"] = {
    ncbilink: "Eubacterium-sulci",
    gcmlink: "Eubacterium%20sulci",
    lpsnlink: "species/eubacterium-sulci",
};
constants.link_exceptions["759"] = {
    ncbilink: "Eubacterium-saphenum",
    gcmlink: "Eubacterium%20saphenum",
    lpsnlink: "species/eubacterium-saphenum",
};
constants.link_exceptions["673"] = {
    ncbilink: "Eubacterium-minutum",
    gcmlink: "Eubacterium%20minutum",
    lpsnlink: "species/eubacterium-minutum",
};
constants.link_exceptions["694"] = {
    ncbilink: "Eubacterium-nodatum",
    gcmlink: "Eubacterium%20nodatum",
    lpsnlink: "species/eubacterium-nodatum",
};
constants.link_exceptions["557"] = {
    ncbilink: "Eubacterium-brachy",
    gcmlink: "Eubacterium%20brachy",
    lpsnlink: "species/eubacterium-brachy",
};
constants.link_exceptions["106"] = {
    ncbilink: "Eubacterium-yurii",
    gcmlink: "Eubacterium%20yurii",
    lpsnlink: "subspecies/eubacterium-yurii-schtitka",
};
constants.link_exceptions["377"] = {
    ncbilink: "Eubacterium-yurii",
    gcmlink: "Eubacterium%20yurii",
    lpsnlink: "subspecies/Eubacterium-yurii-margaretiae",
};
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

export default constants;
