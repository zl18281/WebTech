
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

//database
var file = "wine.db";
var sqliteDB = new SqliteDB(file);


//最后要删掉
var dropCategoryTableSql = "DROP TABLE IF EXISTS category;";
sqliteDB.dropTable(dropCategoryTableSql);
//最后要删掉
var dropWineTableSql = "DROP TABLE IF EXISTS wine;";
sqliteDB.dropTable(dropWineTableSql);
//最后要删掉
var dropUserTableSql = "DROP TABLE IF EXISTS customer;";
sqliteDB.dropTable(dropUserTableSql);





//database set up

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

//schema of category table
var createCategoryTableSql = "CREATE TABLE IF NOT EXISTS " +
    "category(" +
    "id INTEGER AUTO INCREMENT, " +
    "name VARCHAR(50) UNIQUE NOT NULL, " +
    "PRIMARY KEY(id)" +
    ");";
sqliteDB.createTable(createCategoryTableSql);

//schema of wine table
var createWineTableSql = "CREATE TABLE IF NOT EXISTS " +
    "wine(" +
    "id INTEGER AUTO INCREMENT, " +
    "name VARCHAR(50) UNIQUE NOT NULL, " +
    "intro TEXT, " +
    "category INTEGER, " +
    "PRIMARY KEY(id), " +
    "FOREIGN KEY(category) REFERENCES category(id) " +
    ");";
sqliteDB.createTable(createWineTableSql);

//some initial data for user table(最后要删掉)
var userData = [[1, 'pq18281', '123', 'zl18281@bristol.ac.uk'],
                [2, 'fg123', '456', 'abc@163.com']];
var insertUserSql = "INSERT INTO customer(id, username, password, email) VALUES(?, ?, ?, ?);";
sqliteDB.insertData(insertUserSql, userData);

//some initial data for category table(最后要删掉)
var categoryData = [[1, 'wine'],
                    [2, 'sprites'],
                    [3, 'beer']];
var insertCategorySql = "INSERT INTO category(id, name) VALUES(?, ?);";
sqliteDB.insertData(insertCategorySql, categoryData);

//some initial data for wine table(最后要删)
var wineData = [[1, '葡萄酒', '来自西域的葡萄酒', 1],
                [2, '米酒', '外婆酿的米酒', 1],
                [3, '干红', '没有糖的红酒', 2],
                [4, '威士忌', '来自维也纳的威士忌', 2],
                [5, '雪花啤酒', '来自中国青岛的雪花啤酒', 3],
                [6, '格瓦斯', '来自俄罗斯的格瓦斯', 3]];
var insertWineSql = "INSERT INTO wine(id, name, intro, category) VALUES(?, ?, ?, ?);";
sqliteDB.insertData(insertWineSql, wineData);






//user login
app.get('/user', (req, res) => {
    var username = req.query.log_user;
    var findUserSql = "SELECT * FROM customer WHERE username = \'" + username + "\';";
    sqliteDB.queryData(findUserSql, (rows) => {
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

app.get('/userLoggedIn', (req, res) => {
    res.send({"username": userLoggedIn});

});

//User register
app.get('/newuser', (req, res) => {
   var username = req.query.user;
   var email = req.query.email;
   var password = req.query.pass;
   var userData = [[username, email, password]];
   var insertUserSql = "INSERT INTO customer(username, password, email) VALUES(?, ?, ?);";
   sqliteDB.insertData(insertUserSql, userData);
   res.render('register.hbs', {
       username: req.query.user,
       password: req.query.pass,
       email: req.query.email
   });
});




//category pages
app.get('/:category', (req, res) => {
    if(req.params.category == "wine") {
        res.render('category.hbs', {
           category: 'Wine',
            one: 'wine one',
            two: 'wine two',
            urlOne: "/wine/one",
            urlTwo: "/wine/two"
        });
    }else if(req.params.category == "sprites") {
        res.render('category.hbs', {
            category: 'sprites',
            one: 'sprite one',
            two: 'sprite two',
            urlOne: "/sprites/one",
            urlTwo: "/sprites/two"
        });
    }else if(req.params.category == "beer") {
        res.render('category.hbs', {
            category: 'beer',
            one: 'beer one',
            two: 'beer two',
            urlOne: "/beer/one",
            urlTwo: "/beer/two"
        });
    }else if(req.params.category == "other") {
        res.render('category.hbs', {
            category: 'other',
            one: 'Coke',
            two: 'Juice',
            urlOne: "/other/one",
            urlTwo: "/other/two"
        });
    }else if(req.params.category == "recipes") {
        res.render('category.hbs', {
            category: 'recipes',
            one: 'Fermentation',
            two: 'Mixing',
            urlOne: "/recipes/one",
            urlTwo: "/recipes/two"
        });
    }else if(req.params.category == "bars") {
        res.render('category.hbs', {
            category: 'bars',
            one: 'bar one',
            two: 'bar two',
            urlOne: "/bars/one",
            urlTwo: "/bars/two"
        });
    }else if(req.params.category == "deals") {
        res.render('category.hbs', {
            category: 'deals',
            one: 'deal one',
            two: 'deal two',
            urlOne: "/deals/one",
            urlTwo: "/deals/two"
        });
    }
});





//Individual wine pages
app.get('/:wine/:individual', (req, res) => {
    console.log(req);
    var category = req.params["wine"];
    var wine = req.params["individual"];
    console.log(wine);
    var findWineSql;
    var index;

    switch(category){
        case 'wine': {
            findWineSql = "SELECT * FROM wine WHERE category = 1;";
            break;
        }
        case 'sprites': {
            findWineSql = "SELECT * FROM wine WHERE category = 2;";
            break;
        }
        case 'beer': {
            findWineSql = "SELECT * FROM wine WHERE category = 3;";
            break;
        }
    }
    switch(wine){
        case 'one':{
            index = 1;
            break;
        }
        case 'two':{
            index = 2;
            break;
        }
    }
    sqliteDB.queryData(findWineSql, (rows) => {
        if(rows[index-1] == undefined) {
            res.send('Wine does not exist !<a href="../">Back to Home Page<a/>');
        }
        else {
            res.render('individual.hbs', {
                individual: rows[index-1].name,
                introduction: rows[index-1].intro,
                category: req.params['wine'],
                parent_page: "/" + req.params['wine']
            });
        }
    });
});

app.listen(3000);
