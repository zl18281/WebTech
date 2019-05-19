"use strict";

const express = require('express');
var fs = require('fs');
const bodyParser = require('body-parser');
var file = 'wine.db';
var exists = fs.existsSync(file);
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(file);

var app = express();

app.use(express.static(__dirname + '/site'));
app.use(bodyParser.urlencoded({ extended: true }));

//user login
app.get('/user', (req, res) => {
    console.log(req.query.log_user);
    res.render('user.hbs', {
        user: req.query.log_user
    });
});

app.listen(8080);