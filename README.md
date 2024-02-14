# HOMD (Human Oral Microbiome Database)  2021
### Link: [HOMD Administration README](./HOMD-ADMIN.md) 
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

### Abundance scripts 
Located on github:homd-scripts
These scripts are used sequentially for taking data from oligotypes (Eren2014) or counts matrix (Segata2012 and Dewhirst) 
to place the data into the 'abundance' database table. Each script takes the output from the previous script.
The output is tab-separated data. Run the script with no parameters to get input requirements.
More information: file:notes_abundance.txt (RUNNING THE SCRIPTS) in github:homd-scripts
 - 12-blast_parse_abundance.py  -- first and second steps: to blast a seq, then parse the results (Eren)
 - 3-abundance_add_counts_per_site.py  Adds counts data (Eren) to create a counts matrix
 - 4-abundance_calculate_pcts.py   percents per person-site
 - 5-abundance_coalesce.py        split the rows up to one row per HMT
 - 6 NO SCRIPT
 - 7-abundance_hmt2taxonomy.py    convert HMT to taxonomy
 - 8-gather_abundance_by_rank.py  Split the taxon_strings and addup the percentages per rank.
 - 9-abunance_ranks_calc_means.py   Calculate the MEAN, SD and PREV for each site for each row(taxonomy)
 - 10-load_abundance2db.py     Load the abundance MEAN, Stdev, and Prev for each oral site into the database.
 
### Initialization scripts (Initialize_*)
Used to create the required JSON files that the HOMD Node.js app reads on startup.
This provides the app with JSON objects which is much faster that making MySQL queries during data requests.
These scripts support a pretty_print (-pp) option to be able to read the JSON file better if you are so inclined.

- Initialize_Taxonomy.py -- Takes data from new MySQL DB: homd \
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Usage: ./Initialize_Taxonomy.py \
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-- creates files:
  - ./homdData-TaxonRefSeqLookup.json
  - ./homdData-TaxonInfoLookup.json
  - ./homdData-TaxonReferencesLookup.json
  - ./homdData-TaxonLineagelookup.json
  - ./homdData-TaxonHierarchy.json
  - ./homdData-TaxonCounts.json
  - ./homdData-TaxonLookup.json
- Initialize_Annotation.py -- Takes data from ORIGINAL HOMD Annotation DBs (ie: PROKKA_SEQF1234 and NCBI_SEQF1234) \
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Usage ./Initialize_Annotation.py  \
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(creates file: homdData-AnnotationLookup.json)
- Initialize_Genomes.py -- Takes data from new MySQL DB: genome \
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Usage ./Initialize_Genomes.py \
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(creates file: homdData-GenomeLookup.json)
- Initialize_Phage.py -- Takes data from new MySQL DB: homd \
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Usage: ./Initialize_Phage.py \
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(creates file: homdData-PhageList.json and homdData-PhageLookup.json)

- Initialize_Abundance.py -- *MUST be run after Initialize_Taxonomy.py!* \
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Usage: ./Initialize_Abundance.py -i HOMDtaxa-abundance-2021-09-06-cleaned.tsv 
  - Re-writes file: homdData-TaxonCounts.json

Once these homdData* files are created they need to be moved into homd-data directory which is outside the app root.
The exact directory is defined in the /config/config.js file as config.DATA

### BLAST Sever (uses SequenceServer and is written in ruby) (currently on 192.168.1.60)
   https://github.com/MBL-Woods-Hole/sequenceserver-HOMD  (see the README.md for more info)
   https://sequenceserver.com/
   Uses two branches (main and allgenomes)
   --genome  PORT:4567  confFile:  .sequenceserver-genome.conf
       systemd:  sudo systemctl restart SS-genome.service
   --refseq  PORT:4568  confFile: .sequenceserver-refseq.conf
       systemd:  sudo systemctl restart SS-refseq.service
   --single_prokka PORT:4571   confFile:  ~/.sequenceserver-single_prokka.conf 
       systemd:  sudo systemctl restart SS-single_prokka.service
   --single_ncbi   PORT:4570   confFile:  ~/.sequenceserver-single_ncbi.conf
       systemd:  sudo systemctl restart SS-single_ncbi.service
For the single genome selection:
The logic to show only one database (for the single db versions -single_ncbi and -single_prokka) is located  
in the /lib/sequenceserver/routes.rb file:  ```get '/searchdata.json' do```  about line 100.
Its important to note that SS must load ALL the databases on startup. (for homd thats: 3x8600 DBs)  
That is why it is split into prokka and ncbi versions: so that each only loads only half the number.  
To find the one database that is called for in the URL (ie ?gid=SEQF1595.2) I have recorded all the database IDs  
into files (one prokka and one ncbi) which is loaded at runtime and searched to display the (usually) three  
genome databases (faa, ffn and fna). The Database ID is used and derived from an MD5HASH() of the BLAST database full-path.  
If the path changes in the future we will need to re-create the ID files. There is a script in homd-scripts  
that will re-create the ID data files: ```blast_get_SS_databaseIDs.py```
### Pangenome Server (Anvio`) (currently on 192.168.1.233)
   https://github.com/MBL-Woods-Hole/anvio-node.js

### nginx
    nginx for homd, sequenceserver, pangenomeserver
    