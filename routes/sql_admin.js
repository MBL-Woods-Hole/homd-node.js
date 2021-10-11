
// const express = require('express')
// const router = express.Router();
// const C = require(app_root + '/public/constants')
// const helpers = require('./helpers/helpers');

module.exports = {

  get_user_by_name: (uname, passwd) => {
    const db = 'HOMD_taxonomy'
    let q = 'SELECT user_id, username, email, institution, first_name, last_name, active, security_level,'
    q += " encrypted_password, PASSWORD('" + passwd + "') as entered_pw, sign_in_count,"
    q += " DATE_FORMAT(current_sign_in_at,'%Y-%m-%d %T') as current_sign_in_at,last_sign_in_at FROM " + db + '.user'
    q += " WHERE username ='" + uname + "'"
    return q
  },
  reset_user_signin: (newCount, oldDate, uid) => {
    const updateQuery = "UPDATE user set sign_in_count='" + newCount + "', current_sign_in_at=CURRENT_TIMESTAMP(), last_sign_in_at='" + oldDate + "' WHERE user_id='" + uid + "'"
    return updateQuery
  },
  insert_new_user: (mysqlNewUser) => {
    let qInsertUser = 'INSERT INTO user (username, encrypted_password, first_name, last_name, email, institution, active, sign_in_count, security_level, current_sign_in_at, last_sign_in_at)'
    qInsertUser += " VALUES ('" + mysqlNewUser.username + "', " +
            // helpers.generateHash(mysql_new_user.password) +"', '"+
            "PASSWORD('" + mysqlNewUser.password + "'),   '" +
            mysqlNewUser.firstname + "', '" +
            mysqlNewUser.lastname + "', '" +
            mysqlNewUser.email + "', '" +
            mysqlNewUser.institution + "'," +
             ' 1,' +
             ' 1, ' +
            mysqlNewUser.security_level + ',' +
            ' CURRENT_TIMESTAMP(), ' +
            ' CURRENT_TIMESTAMP() )'
    // console.log(qInsertUser)
    return qInsertUser
  }

}
