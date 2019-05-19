"use strict";

const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const SqliteDB = require('./sqlite.js').SqliteDB;

var file = 'wine.db';
var exists = fs.existsSync(file);
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(file);

var app = express();

app.use(express.static(__dirname + '/site'));

//database
var file = "wine.db";
var sqliteDB = new SqliteDB(file);
var dropUserTableSql = "DROP TABLE IF EXISTS customer";


var createUserTableSql = "CREATE TABLE IF NOT EXISTS " +
    "customer(" +
    "id INTEGER AUTO INCREMENT, " +
    "username VARCHAR(50) UNIQUE NOT NULL, " +
    "name VARCHAR(50) NOT NULL, " +
    "password VARCHAR(50) NOT NULL, " +
    "email VARCHAR(50) NOT NULL, " +
    "PRIMARY KEY(id)" +
    ");";
sqliteDB.createTable(createUserTableSql);

var userData = [[3, "pq18281", "Fan", "123", "zl18281@bristol.ac.uk"],
                [4, "fg123", "Peter", "456", "abc@163.com"]];
var insertUserSql = "INSERT INTO customer(id, username, name, password, email) VALUES(?, ?, ?, ?, ?);"
sqliteDB.insertData(insertUserSql, userData);


//user login
app.get('/user', (req, res) => {
    console.log(req.query.log_user);
    var findUserSql = "SELECT * FROM customer WHERE username = ?;";
    var userSearchResult = sqliteDB.queryData(findUserSql, req.log_user);
    console.log(userSearchResult.username);
    console.log(userSearchResult.name);
    console.log(userSearchResult.email);

    res.render('user.hbs', {
        user: req.query.log_user
    });
});

app.listen(8080);