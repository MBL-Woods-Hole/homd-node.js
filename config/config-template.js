// This is an example! *** Change all paths to match your system *** 
var path = require('path');
var os = require('os');

var config = {};
//var NODE_DATABASE = 'HOMD_taxonomy'
//// PATHS ////
//
//// LOCAL Config ////
config.PROCESS_DIR = '';
config.DATA = '';
config.ENV = ''
config.SITE = ''; 
config.DBHOST = '';

config.HOSTNAME = os.hostname();

config.SERVER_PORT = '3001'  // 1-1023 are reserved ports
config.URL = 'http://localhost:'+config.SERVER_PORT
config.CONTACT_EMAIL = 'your_email'
config.CLUSTER_AVAILIBLE = false;
config.UPLOAD_DIR = '/tmp/'  // needs to be read/write
config.PATH_TO_DATA = ''
config.PATH_TO_IMAGES = ''
config.PATH_TO_SCRIPTS = ''
config.USER_FILES_BASE = ''

// BLAST
config.PATH_TO_BLAST_FILES = ''
config.PATH_TO_BLAST_PROG = ''
config.PATH_TO_BLAST_FTP = ''
config.BLAST_DB_PATH_GENOME = ''
config.BLAST_DB_PATH_REFSEQ = ''
config.BLAST_VERSION = '2.12.0+'   // blastn -version



// anviserver -obsolete
config.ANVIO_URL = 'localhost';
config.PATH_TO_ANVISERVER = '';
config.ANVISERVER_URL = ''


config.PYTHONPATH = ''
config.PATH = ''
config.CERT_FILE = ''
config.KEY_FILE = ''
config.LOG_DIR = ''
config.PRODUCTION_LOG = ''



module.exports = config;
