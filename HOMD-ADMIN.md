# HOMD Administration


## Starting and stopping the server
#### sudo systemctl start|stop|restart|status homd
#### sudo systemctl start|stop|restart|status SS-genome|SS-refseq
#### (on vamps) sudo systemctl start|stop|restart|status anviserver

## MySQL Database

## Initialization files and their creation scripts
#### Creation scripts are here public/install_scripts/
They pull data from the MySQL database and put them into JSON files for the server to read into memory on startup.
The output files (once created) are placed here: (config.PATH_TO_DATA)
* Initialize_Abundance.js
* Initialize_Annotation.js
* Initialize_Contigs.js
* Initialize_Genomes.js
* Initialize_ImageKey.js
* Initialize_Phage.js
* Initialize_ProteinIDs.js
* Initialize_Taxonomy.js

## config/config.js file and config/db-connection.js
These files are not and should not be included in the github repo because they contain site specific paths
or sensitive information. Templates are included in the config directory.
#### config/db-connection.js
  MySQL database connection specifics.
  
  - For connecting to main database (usually named "homd"):
  ```
  db_config={host:host,user:user,password:passwd,database:mysqldb,socketPath:sockect}
  ```
  - For connecting to all the individual genome databases(ie: NCBI_SEQF1003 & PROKKA_SEQF1003):
  ```
  db_config2={host:host,user:user,password:passwd,socketPath:sockect}
  ```
  - Do not use 'database' on db_config2.
  - Do not use 'socketPath' on homd production
   
#### config/config.js
- config.PROCESS_DIR
- config.DATA
- config.ENV
- config.SITE
- config.DBHOST
- config.GENOME_DBHOST
- config.HOSTNAME
- config.SERVER_PORT
- config.URL
- config.CONTACT_EMAIL
- config.CLUSTER_AVAILIBLE
- config.UPLOAD_DIR
- config.PATH_TO_DATA    
- config.PATH_TO_IMAGES
- config.PATH_TO_BLAST_FILES   Note:not needed with SequenceServer
- config.PATH_TO_BLAST_PROG    Note:not needed with SequenceServer
- config.PATH_TO_BLAST_FTP     Note:not needed with SequenceServer
- config.BLAST_DB_PATH_GENOME  Note:not needed with SequenceServer
- config.BLAST_DB_PATH_REFSEQ  Note:not needed with SequenceServer
- config.BLAST_VERSION         Note:not needed with SequenceServer
- config.PATH_TO_SCRIPTS
- config.ANVIO_URL
- config.PATH_TO_ANVISERVER
- config.ANVISERVER_URL
- config.PYTHONPATH
- config.PATH
- config.CERT_FILE  for ssl on production
- config.KEY_FILE   for ssl on production
- config.LOG_DIR
- config.PRODUCTION_LOG
- config.USER_FILES_BASE

