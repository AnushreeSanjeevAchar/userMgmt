var mysql = require('mysql');
var connect = mysql.createConnection({
  host: 'localhost',
  user: '', //enter username
  password: '', //enter password
  database: 'userMgmt' // database name
});

connect.connect(function(err) {
  if (err) throw err;
  console.log('Database is connected');
});
module.exports = connect;