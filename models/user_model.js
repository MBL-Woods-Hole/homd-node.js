const validator = require('validator');
const C      = require(app_root + '/public/constants');

class User {

  constructor() {
    this.User_obj = {
      username: "",
      email: "",
      institution: "",
      first_name: "",
      last_name: "",
      security_level: "",
      encrypted_password: "",
      groups: "",
    };
  }

  getAllUsers(callback) {
    return DBConn.query("Select * from user", callback);
  }

  getUserById(user_id, callback) {
    return DBConn.query("select * from user where user_id = ?", [user_id], callback);
  }

  getUser_id(first_name, last_name, email, institution, callback) {
    return DBConn.query("SELECT user_id FROM user WHERE first_name = ? AND last_name = ? AND email = ? AND institution = ?", [first_name, last_name, email, institution], callback);
  }

  getUserInfoFromGlobalbyUniqKey(first_name, last_name, email, institution) {
    var uniq_key = first_name + "#" + last_name + "#" + email + "#" + institution;

    if (typeof C.ALL_USERS_BY_UnK[uniq_key] !== 'undefined') {
      this.User_obj.user_id        = C.ALL_USERS_BY_UnK[uniq_key].user_id;
      this.User_obj.username       = C.ALL_USERS_BY_UnK[uniq_key].username;
      this.User_obj.email          = C.ALL_USERS_BY_UnK[uniq_key].email;
      this.User_obj.institution    = C.ALL_USERS_BY_UnK[uniq_key].institution;
      this.User_obj.first_name     = C.ALL_USERS_BY_UnK[uniq_key].first_name;
      this.User_obj.last_name      = C.ALL_USERS_BY_UnK[uniq_key].last_name;
      this.User_obj.security_level = C.ALL_USERS_BY_UnK[uniq_key].status;
      this.User_obj.groups         = C.ALL_USERS_BY_UnK[uniq_key].groups;
    }
    else {
      console.log("ERR from getUserInfoFromGlobalbyUniqKey. No such user: C.ALL_USERS_BY_UnK[uniq_key]", uniq_key);
    }
  }

  getUserInfoFromGlobal(user_id) {

    // console.log("UUU1 C.ALL_USERS_BY_UID = ", C.ALL_USERS_BY_UID);
    //   { email: 'kirchman@udel.edu',
    //      username: 'kirchman',
    //      last_name: 'Kirchman',
    //      first_name: 'David',
    //      institution: 'University of Delaware',
    //      status: 50,
    //      groups: [] }

    this.User_obj.user_id = user_id;
    if (typeof C.ALL_USERS_BY_UID[user_id] !== 'undefined') {
      this.User_obj.username           = C.ALL_USERS_BY_UID[user_id].username;
      this.User_obj.email              = C.ALL_USERS_BY_UID[user_id].email;
      this.User_obj.institution        = C.ALL_USERS_BY_UID[user_id].institution;
      this.User_obj.first_name         = C.ALL_USERS_BY_UID[user_id].first_name;
      this.User_obj.last_name          = C.ALL_USERS_BY_UID[user_id].last_name;
      this.User_obj.security_level     = C.ALL_USERS_BY_UID[user_id].status;
      this.User_obj.encrypted_password = C.ALL_USERS_BY_UID[user_id].encrypted_password;
      this.User_obj.groups             = C.ALL_USERS_BY_UID[user_id].groups;
    }
  }

  addUser(callback) {
    return DBConn.query("Insert into user values(?,?,?,?,?,?,?,?,?,?,?,?)", [
      this.User_obj.user_id,
      this.User_obj.username,
      this.User_obj.email,
      this.User_obj.institution,
      this.User_obj.first_name,
      this.User_obj.last_name,
      this.User_obj.active,
      this.User_obj.security_level,
      this.User_obj.encrypted_password,
      this.User_obj.sign_in_count,
      this.User_obj.current_sign_in_at,
      this.User_obj.last_sign_in_at
    ], callback);
  }

  newUser(req_body, username, password) {
    var this_username    = username || req_body.username;
    var this_password    = password || req_body.password;
    var new_user         = {};
    new_user.email       = req_body.email.trim();
    new_user.firstname   = req_body.firstname.trim();
    new_user.lastname    = req_body.lastname.trim();
    new_user.institution = req_body.institution.trim();
    new_user.password    = this_password;
    new_user.username    = this_username.trim();
    return (new_user);
  }

  validate_new_user(req, new_user, confirm_password0) {
    console.log('in USER:validate_new_user')
    var err = 0;
    var confirm_password = confirm_password0 || new_user.password;

    if (!validator.equals(new_user.password, confirm_password)) {
      req.flash('fail', 'Passwords do not match!');
      err = 1;
    }
    if (!validator.isLength(new_user.password, {min: 6, max: 12})) {
      req.flash('fail', 'Password must be between 6 and 12 characters.');
      err = 1;
    }
    if ((!validator.isLength(new_user.username, {
      min: 3,
      max: 15
    })) || (!validator.isAlphanumeric(new_user.username, 'en-US'))) {
      req.flash('fail', 'Username must be between 3 and 15 characters. Alphanumeric only.');
      err = 1;
    }
    if (!validator.isEmail(new_user.email)) {
      req.flash('fail', 'Email address is empty or the wrong format.');
      err = 1;
    }

    if ((!validator.isLength(new_user.firstname, {min: 1, max: 20})) || (!validator.isLength(new_user.lastname, {
      min: 1,
      max: 20
    }))) {
      req.flash('fail', 'Both first and last names are required and should be not longer then 20 characters.');
      err = 1;
    }
    if ((!validator.matches(new_user.firstname, /^[a-zA-Z- ]+$/)) || (!validator.matches(new_user.lastname, /^[a-zA-Z- ]+$/))) {
      req.flash('fail', 'Both first and last names should have alphanumeric characters, dash and underscore only.');
      err = 1;
    }
    if (validator.isEmpty(new_user.institution)) {
      req.flash('fail', 'Institution name is required.');
      err = 1;
    }
    return [err, req];
  }
}

module.exports = User;
