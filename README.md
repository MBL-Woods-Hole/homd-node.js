# HOMD (Human Oral Microbiome Database)  2021

This is a re-write of the php version pre-2015  (http://www.homd.org) using Node.js (javascript)

You can clone this code on your system but you will need a database schema (and data)
to make it fully functional.

## Installation and Setup
All files located in /install_scripts

### Legacy transfer files:
Used for extracting data from the old mysql database and putting in the new database (not maintained (may/will) need editing.
- 1_txfr_taxonomy.py	
- 2_txfr_sites.py		
- 3_txfr_genomes.py		
- 4_notes.txt	
- 5_load_phage.py

### Initialization scripts (Initialize_*)
Used to create the required JSON files that the HOMD Node.js app reads on startup.
This provides the app with JSON objects which is much faster that making MySQL queries during data requests.
These scripts support a pretty_print (-pp) option to be able to read the JSON file better if you are so inclined.

- Initialize_Annotation.py -- Takes data from ORIGINAL HOMD Annotation DBs (ie: PROKKA_SEQF1234 and NCBI_SEQF1234) \
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Usage ./Initialize_Annotation.py  (creates file: homdData-AnnotationLookup.json)
- Initialize_Genomes.py -- Takes data from new MySQL DB: genome \
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Usage ./Initialize_Genomes.py (creates file: homdData-GenomeLookup.json)
- Initialize_Phage.py -- Takes data from new MySQL DB: homd \
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Usage: ./Initialize_Phage.py (creates file: homdData-PhageList.json and homdData-PhageLookup.json)
- Initialize_Taxonomy.py -- Takes data from new MySQL DB: homd \
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Usage: ./Initialize_Taxonomy.py -- creates files:
  - ./homdData-TaxonRefSeqLookup.json
  - ./homdData-TaxonInfoLookup.json
  - ./homdData-TaxonReferencesLookup.json
  - ./homdData-TaxonLineagelookup.json
  - ./homdData-TaxonHierarchy.json
  - ./homdData-TaxonCounts.json
  - ./homdData-TaxonLookup.json
- Initialize_Abundance.py -- Has to be run after Initialize_Taxonomy.py! \
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Usage: ./Initialize_Abundance.py -i HOMDtaxa-abundance-2021-09-06-cleaned.csv 
  - Re-writes file: homdData-TaxonCounts.json

Once these homdData* files are created they need to be moved into homd-data directory which is outside the app root.
The exact directory is defined in the /config/config.js file as config.DATA

