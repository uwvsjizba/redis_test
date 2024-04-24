const mysql = require("mysql");

const config = require("../resource/mysql.config");
module.exports = mysql.createConnection(config);
