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

};

