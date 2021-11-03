# HOMD (Human Oral Microbiome Database)  2021

This is a re-write of the php version pre-2015  (http://www.homd.org)

You can clone this code on your system but you will need a database schema (and data)
to make it fully functional.

## Installation and Setup
All files located in /install_scripts

### Legacy transfer files:
Used for extracting data from the old mysql database and putting in the new database
- 1_txfr_taxonomy.py	
- 2_txfr_sites.py		
- 3_txfr_genomes.py		
- 4_notes.txt	
- 5_load_phage.py
- 6_Abundance2JSON_2021-09-07.py
