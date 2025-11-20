
///////////////////////////
////// ACCOUNT ////////////
//////////////////////////
export const get_user_by_name = function get_user_by_name(uname, passwd) {
    let q = "SELECT user_id, username, email, institution, first_name, last_name, active, security_level,"
     //q += " encrypted_password, PASSWORD('"+passwd+"') as entered_pw, sign_in_count,"
     q += " encrypted_password, CONCAT('*', UPPER(SHA1(UNHEX(SHA1('"+passwd+"'))))) as entered_pw, sign_in_count,"
     q += " DATE_FORMAT(current_sign_in_at,'%Y-%m-%d') as current_sign_in_at,"
     q += " DATE_FORMAT(first_sign_in,'%Y-%m-%d') as first_sign_in"
     q += " FROM user"
     q += " WHERE username ='"+uname+"'"
    return q;
};

export const reset_user_signin = function reset_user_signin(new_count, old_date, uid) {
    let updateQuery = "UPDATE user set sign_in_count='"+new_count+"', current_sign_in_at=CURRENT_TIMESTAMP(), last_sign_in_at='"+old_date+"' WHERE user_id='"+uid+"'"
    return updateQuery
};

export const update_user_info = function update_user_info(uid, new_info) {
    let updateQuery = "UPDATE user set first_name='"+new_info.first_name+"', last_name='"+new_info.last_name+"', email='"+new_info.email+"', institution='"+new_info.institution+"' WHERE user_id='"+uid+"'"
    console.log(updateQuery)
    return updateQuery
};

export const update_user_pw_admin = function update_user_pw_admin(uid, pw) {
    let updateQuery = "UPDATE user set encrypted_password=CONCAT('*', UPPER(SHA1(UNHEX(SHA1('"+pw+"'))))) WHERE user_id='"+uid+"'"
    console.log(updateQuery)
    return updateQuery
};

export const get_user_by_uid = function get_user_by_uid(uid) {
    let q = "SELECT user_id, username, email, institution, first_name, last_name, active, security_level,"
    q += " encrypted_password, sign_in_count,"
    q += " DATE_FORMAT(current_sign_in_at,'%Y-%m-%d') as current_sign_in_at,"
    q += " DATE_FORMAT(first_sign_in,'%Y-%m-%d') as first_sign_in"
    q += " FROM user WHERE user_id ='"+uid+"'"
    return q;
};

export const get_all_users = function get_all_users() {
    let q = "SELECT * from user order by last_name"
    return q;
};

//
export const insert_new_user = function insert_new_user(mysql_new_user) {
    
    let qInsertUser = "INSERT INTO user (username, encrypted_password, first_name, last_name, email, institution, active, sign_in_count, security_level, current_sign_in_at, last_sign_in_at,first_sign_in)";
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
};
