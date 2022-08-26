////
///  config/db-connect-dev.js
//
NODE_BACTERIAL_DATABASE = 'vamps_js_development'  // global
 // NODE_DATABASE = 'vamps_js_dev_av'
//NODE_DATABASE = 'vamps_dev_mobe'    // for testing MoBE data loading from qita output
//NODE_DATABASE = 'vamps_dev_testing'
//
///
////


var db_config = {
    host     : 'localhost',
    user     : 'db username',
    password : '**private**',
    database :  NODE_BACTERIAL_DATABASE,
    socketPath: '/tmp/mysql.sock'
  };

//  where separate annotation dbs are
var db_config2 = {
    host     : 'otherhost',
    user     : '',
    password : '',
    // don't name database:: Use "USE DB" sql query syntax 
    socketPath: '/tmp/mysql.sock' // may not be needed
  };