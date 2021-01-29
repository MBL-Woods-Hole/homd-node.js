// TODO: get_taxonomy_query has depth 15! Can we simplify it, that it's no more then 3?
const express = require('express');
var router = express.Router();
const C = require(app_root + '/public/constants');
//const helpers = require('./helpers/helpers');

module.exports = {

get_user_by_name: (uname, passwd) =>{
    const db = 'HOMD_taxonomy';
    var q = "SELECT user_id, username, email, institution, first_name, last_name, active, security_level,"
     q += " encrypted_password, PASSWORD('"+passwd+"') as entered_pw, sign_in_count,"
     q += " DATE_FORMAT(current_sign_in_at,'%Y-%m-%d %T') as current_sign_in_at,last_sign_in_at FROM "+db+".user"
     q += " WHERE username ='"+uname+"'"
    return q;
},
reset_user_signin: (new_count, old_date, uid) => {
    var updateQuery = "UPDATE user set sign_in_count='"+new_count+"', current_sign_in_at=CURRENT_TIMESTAMP(), last_sign_in_at='"+old_date+"' WHERE user_id='"+uid+"'"
    return updateQuery
},
insert_new_user: (mysql_new_user) => {
    
    var qInsertUser = "INSERT INTO user (username, encrypted_password, first_name, last_name, email, institution, active, sign_in_count, security_level, current_sign_in_at, last_sign_in_at)";
    qInsertUser +=    " VALUES ('" + mysql_new_user.username +"', "+
                                   // helpers.generateHash(mysql_new_user.password) +"', '"+
                                    "PASSWORD('"+mysql_new_user.password+"'),   '"+
                                    mysql_new_user.firstname +"', '"+
                                    mysql_new_user.lastname +"', '"+
                                    mysql_new_user.email +"', '"+
                                    mysql_new_user.institution +"',"+                                    
                                    " 1,"+
                                     " 1, "+
                                     mysql_new_user.security_level +","+
                                    " CURRENT_TIMESTAMP(), "+
                                     " CURRENT_TIMESTAMP() )";
    //console.log(qInsertUser)
    return qInsertUser
},

};

