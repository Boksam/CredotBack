var database = require("express").Router();
const url = require("url");
var mariadb = require("mysql");

const con = mariadb.createConnection({
  host: "credot-rds.cccnip9rb8nn.ap-northeast-2.rds.amazonaws.com",
  port: 3306,
  user: "admin",
  password: "sandburg123",
  database: "credotClient",
});

con.connect(function (err) {
  if (err) throw err;
});

database.get("/register", function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  let compareBool = false;

  let response = url.parse(req.url, true).query;

  const user = {
    name: response.name,
    email: response.email,
    pw: response.pw,
    phoneNum: response.phoneNum,
    bank: response.bank,
    account: response.account,
    corporateName: response.corporateName,
    ceo: response.ceo,
    businessLoc: response.businessLoc,
    corporateNum: response.corporateNum,
  };
  var sql =
    "INSERT INTO client(name, email, pw, phoneNum, bank, account, corporateName, ceo, businessLoc, corporateNum) VALUES (?,?,?,?,?,?,?,?,?,?)";
  console.log(user["name"]);

  var params = [
    user["name"],
    user["email"],
    user["pw"],
    user["phoneNum"],
    user["bank"],
    user["account"],
    user["corporateName"],
    user["ceo"],
    user["businessLoc"],
    user["corporateNum"],
  ];
  con.query(sql, params, function (err, result) {
    if (err) {
      throw err;
      return res.send(false);
    }
    return res.send(true);
  });
});

module.exports = database;
