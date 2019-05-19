"use strict";

const express = require('express');
const fs = require('fs');
const SqliteDB = require('./sqlite.js').SqliteDB;

var file = 'wine.db';
var exists = fs.existsSync(file);
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(file);
var userLoggedIn = null;

var app = express();

app.use(express.static(__dirname + '/site'));

app.get('/', (req, res) => {

});



//database
var file = "wine.db";
var sqliteDB = new SqliteDB(file);



//最后要删掉
var dropUserTableSql = "DROP TABLE IF EXISTS customer;";
sqliteDB.dropTable(dropUserTableSql);



//schema of user table
var createUserTableSql = "CREATE TABLE IF NOT EXISTS " +
    "customer(" +
    "id INTEGER AUTO INCREMENT, " +
    "username VARCHAR(50) UNIQUE NOT NULL, " +
    "password VARCHAR(50) NOT NULL, " +
    "email VARCHAR(50) NOT NULL, " +
    "PRIMARY KEY(id)" +
    ");";
sqliteDB.createTable(createUserTableSql);



//some initial data for user table(最后要删掉)
var userData = [[1, 'pq18281', '123', 'zl18281@bristol.ac.uk'],
                [2, 'fg123', '456', 'abc@163.com']];
var insertUserSql = "INSERT INTO customer(id, username, password, email) VALUES(?, ?, ?, ?);";
sqliteDB.insertData(insertUserSql, userData);



//user login
app.get('/user', (req, res) => {
    var username = req.query.log_user;
    var findUserSql = "SELECT * FROM customer WHERE username = \'" + username + "\';";
    sqliteDB.queryData(findUserSql, (rows) => {
        console.log(rows[0]);
        if(rows[0] == undefined) {
            res.send('User does not exist !<a href="../">Back to Home Page<a/>')
        }
        else {
            userLoggedIn = rows[0].username;
            res.render('user.hbs', {
                user: rows[0].username
            });
        }
    });
});



//User register
app.get('/newuser', (req, res) => {
   var username = req.query.user;
   var email = req.query.email;
   var password = req.query.pass;
   var userData = [[username, email, password]]
   var insertUserSql = "INSERT INTO customer(username, password, email) VALUES(?, ?, ?);";
   sqliteDB.insertData(insertUserSql, userData);
   res.render('register.hbs', {
       username: req.query.user,
       password: req.query.pass,
       email: req.query.email
   });
});

app.get('/:category', (req, res) => {
    if(req.params.category == wine) {
        res.render('category.hbs', {
           category: 'Wine'
        });
    }
})

app.listen(8080);