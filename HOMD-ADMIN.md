# HOMD Administration
## Basics
HOMD is written in javascript. Node.js (and the 'Express' package) is the scaffold that allows javascript to be used on the server as well as its traditional use on the client side.

All the client side (java)scripts are located in ```public/js/*```

And the HOMD code base is here: ```/home/ubuntu/homd/homd-node.js/*```

Currently the HOMD github repository is: [https://github.com/MBL-Woods-Hole/homd-node.js](https://github.com/MBL-Woods-Hole/homd-node.js) but it may change in the future to a dedicated homd github site.
I almost always edit the code on my laptop and run homd locally to debug before pushing the code to the repository rather than editing to code on the server.
```
  cd to homd-node.js directory
  git add .
  git commit -m "short description of changes"
  git pull  <only if there are changes to download>
  git push
```
Then on the production AWS server pull the new code and restart the server for the changes to take effect.
```
  ssh homd
  cd to /home/ubuntu/homd/homd-node.js directory
  git pull
  sudo systemctl restart homd
```
## Starting and Stopping the production server on AWS HOMD
#### HOMD uses systemd to start/stop the services: nginx, homd-node.js, SS-genome and SS-refseq (SequenceServer)
The systemd service files are located here: /lib/systemd/system/*

The HOMD site uses nginx as a reverse proxy to point localhost:3001 to homd.org
<br>nginx config file(s) are located here: ```/etc/nginx/conf.d/*```
```
sudo systemctl start|stop|restart|status homd   (on AWS HOMD)

For testing (or on localhost): 'npm start' or 'node app.js'
```
SequenceServer:
```
sudo systemctl start|stop|restart|status SS-genome|SS-refseq  (SequenceServer)
```
## Anviserver (Anvi`o Server)
Anviserver is running on the VAMPS web server but displays genomes from the HOMD
(Human Oral Microbiome Database (homd.org)) database. 
Currently it is not referenced from the VAMPS web interface
and it is hosted on vamps because there are memory
issues with the AWS server where HOMD is hosted. You will need permissions from Rich Fox (rfox@mbl.edu) to make changes here.

Location:
```
on vamps:  /usr/local/www/vamps/projects/anvioserver/

url: https://vamps.mbl.edu/anviserver

github:  https://github.com/MBL-Woods-Hole/anviserver-HOMD

sudo systemctl start/stop/restart/status anviserver
```
## MySQL Database
``` 
see homddb_schema.sql.gz in the root directory
```
## Required Initialization Files and their Creation Scripts
#### Creation scripts are here:``` public/install_scripts/```
These scripts pull data from the MySQL database and create JSON files which the server to read into memory on startup.
The output files (once created) are placed here: ```(config.PATH_TO_DATA)```

* Initialize_Annotation.js
* Initialize_Contigs.js
* Initialize_Genomes.js
* Initialize_ImageKey.js
* Initialize_Phage.js      -- currently not needed
* Initialize_ProteinIDs.js
* Initialize_Taxonomy.js
* Initialize_Abundance.js  -- MUST be run after 'Initialize_Taxonomy.js'

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
- config.PATH_TO_BLAST_FILES   Note:not needed with SequenceServer
- config.PATH_TO_BLAST_PROG    Note:not needed with SequenceServer
- config.PATH_TO_BLAST_FTP     Note:not needed with SequenceServer
- config.BLAST_DB_PATH_GENOME  Note:not needed with SequenceServer
- config.BLAST_DB_PATH_REFSEQ  Note:not needed with SequenceServer
- config.BLAST_VERSION         Note:not needed with SequenceServer

## New Genomes and Taxa