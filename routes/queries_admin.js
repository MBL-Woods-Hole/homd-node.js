
///////////////////////////
////// ACCOUNT ////////////
//////////////////////////
module.exports.get_user_by_name = function get_user_by_name(uname, passwd) {
    var q = "SELECT user_id, username, email, institution, first_name, last_name, active, security_level,"
     //q += " encrypted_password, PASSWORD('"+passwd+"') as entered_pw, sign_in_count,"
     q += " encrypted_password, CONCAT('*', UPPER(SHA1(UNHEX(SHA1('"+passwd+"'))))) as entered_pw, sign_in_count,"
     q += " DATE_FORMAT(current_sign_in_at,'%Y-%m-%d %T') as current_sign_in_at,last_sign_in_at FROM user"
     q += " WHERE username ='"+uname+"'"
    return q;
}
module.exports.reset_user_signin = function reset_user_signin(new_count, old_date, uid) {
    var updateQuery = "UPDATE user set sign_in_count='"+new_count+"', current_sign_in_at=CURRENT_TIMESTAMP(), last_sign_in_at='"+old_date+"' WHERE user_id='"+uid+"'"
    return updateQuery
}
module.exports.get_user_by_uid = function get_user_by_uid(uid) {
    var q = "SELECT * from user WHERE user_id ='"+uid+"'"
    return q;
},

//
module.exports.insert_new_user = function insert_new_user(mysql_new_user) {
    
    var qInsertUser = "INSERT INTO user (username, encrypted_password, first_name, last_name, email, institution, active, sign_in_count, security_level, current_sign_in_at, last_sign_in_at,first_sign_in)";
    qInsertUser +=    " VALUES ('" + mysql_new_user.username +"', "+
                                   // helpers.generateHash(mysql_new_user.password) +"', '"+
                                   // "PASSWORD('"+mysql_new_user.password+"'),   '"+
                                    "CONCAT('*', UPPER(SHA1(UNHEX(SHA1('"+mysql_new_user.password+"'))))),   '"+
                                    mysql_new_user.firstname +"', '"+
                                    mysql_new_user.lastname +"', '"+
                                    mysql_new_user.email +"', '"+
                                    mysql_new_user.institution +"',"+                                    
                                    " 1,"+
                                     " 1, "+
                                     mysql_new_user.security_level +","+
                                    " CURRENT_TIMESTAMP(), "+
                                    " CURRENT_TIMESTAMP(), "+
                                     " CURRENT_TIMESTAMP() )";
    return qInsertUser
}
