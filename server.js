const express = require('express');
const fs = require('fs');
const SqliteDB = require('./sqlite.js').SqliteDB;
const jade = require('jade');

var file = 'wine.db';
var exists = fs.existsSync(file);
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(file);
var userLoggedIn = null;
var userId = null;
var category;
var number;

var app = express();

app.use(express.static(__dirname + '/site'));
app.set('view engine', 'jade');

//database
var file = "wine.db";
var sqliteDB = new SqliteDB(file);


//最后要删掉
var dropOrderTableSql = "DROP TABLE IF EXISTS orderList;";
sqliteDB.dropTable(dropOrderTableSql);
//最后要删掉
var dropWineTableSql = "DROP TABLE IF EXISTS wine;";
sqliteDB.dropTable(dropWineTableSql);
//最后要删掉
var dropCategoryTableSql = "DROP TABLE IF EXISTS category;";
sqliteDB.dropTable(dropCategoryTableSql);
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
    "src VARCHAR(100), " +
    "PRIMARY KEY(id), " +
    "FOREIGN KEY(category) REFERENCES category(id) " +
    ");";
sqliteDB.createTable(createWineTableSql);

//schema of join table between wine and customer
var createOrderTableSql = "CREATE TABLE IF NOT EXISTS " +
    "orderList(" +
    "id INTEGER AUTO INCREMENT, " +
    "customer INTEGER NOT NULL, " +
    "wine INTEGER NOT NULL, " +
    "PRIMARY KEY(id), " +
    "FOREIGN KEY(customer) REFERENCES customer(id), " +
    "FOREIGN KEY(wine) REFERENCES wine(id)" +
    ");";
sqliteDB.createTable(createOrderTableSql);


//some initial data for user table(最后要删掉)
var userData = [[1, 'pq18281', '123', 'zl18281@bristol.ac.uk'],
    [2, 'fg123', '456', 'abc@163.com']];
var insertUserSql = "INSERT INTO customer(id, username, password, email) VALUES(?, ?, ?, ?);";
sqliteDB.insertData(insertUserSql, userData);

//some initial data for category table(最后要删掉)
var categoryData = [[1, 'wine'],
    [2, 'spirit'],
    [3, 'beer']];
var insertCategorySql = "INSERT INTO category(id, name) VALUES(?, ?);";
sqliteDB.insertData(insertCategorySql, categoryData);

//some initial data for wine table(最后要删)
var wineData = [[1, 'Red Wine', 'From Australia', 1, '/images/wine/1'],
    [2, 'Grain Wine', 'Fermented from pure corn', 1, '/images/wine/2'],
    [3, 'Red Sprite', 'With no sugar', 2, '/images/spirit/1'],
    [4, 'Blue Sprite', 'With sugar', 2, '/images/spirit/2'],
    [5, 'Black beer', 'From America', 3, 'images/beer/1'],
    [6, 'Light beer', 'With less sugar', 3, 'image/beer/2'],
    [7, 'Strong beer', 'With strong spicy flavor', 3, 'images/beer/3']];
var insertWineSql = "INSERT INTO wine(id, name, intro, category, src) VALUES(?, ?, ?, ?, ?);";
sqliteDB.insertData(insertWineSql, wineData);


//user login
app.get('/user', (req, res) => {
    var username = req.query.log_user;
    var findUserSql = "SELECT * FROM customer WHERE username = \'" + username + "\';";
    sqliteDB.queryData(findUserSql, (rows) => {
        if (rows[0] == undefined) {
            res.send('User does not exist !<a href="../">Back to Home Page<a/>')
        } else {
            if(req.query.log_pass == rows[0].password) {
                userLoggedIn = rows[0].username;
                userId = rows[0].id;
                res.render('user.hbs', {
                    user: rows[0].username
                });
            }else {
                userLoggedIn = null;
                res.render('user.hbs', {
                    user: "nobody. Password incorrect !"
                });
            }

        }
    });
});

app.get('/userLoggedIn', (req, res) => {
    res.send({"username": userLoggedIn});

});

//User register
app.get('/newuser', (req, res) => {
    var username = req.query.user;
    var queryUser = "SELECT username FROM customer WHERE username = \'" + username + "\';";
    sqliteDB.queryData(queryUser, (rows) => {
        if (rows[0] == undefined) {
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

        } else {
            res.send('Username exists, registration failed !<a href="../">Back to Home Page<a/>');
        }
    });
});


//category pages
app.get('/:category', (req, res) => {
    if (req.params.category == "wine") {
        category = "wine";
        res.render('category.hbs', {
            category: 'wine',
            one: 'Red Wine',
            two: 'Grain Wine',
            urlOne: "/wine/one",
            urlTwo: "/wine/two",
        });
    } else if (req.params.category == "spirit") {
        category = "spirit";
        res.render('category.hbs', {
            category: 'spirit',
            one: 'Red Spirit',
            two: 'Blue Spirit',
            urlOne: "/spirit/one",
            urlTwo: "/spirit/two"
        });
    } else if (req.params.category == "beer") {
        category = "beer";
        res.render('category.hbs', {
            category: 'beer',
            one: 'Black beer',
            two: 'Light beer',
            three: 'beer three',
            urlOne: "/beer/one",
            urlTwo: "/beer/two",
            urlThree: "/beer/three"
        });
    } else if (req.params.category == "other") {
        category = "other";
        res.render('category.hbs', {
            category: 'other',
            one: 'Coke',
            two: 'Juice',
            urlOne: "/other/one",
            urlTwo: "/other/two"
        });
    } else if (req.params.category == "recipes") {
        category = "recipes";
        res.render('category.hbs', {
            category: 'recipes',
            one: 'Fermentation',
            two: 'Mixing',
            urlOne: "/recipes/one",
            urlTwo: "/recipes/two"
        });
    } else if (req.params.category == "bars") {
        category = "bars";
        res.render('category.hbs', {
            category: 'bars',
            one: 'bar one',
            two: 'bar two',
            urlOne: "/bars/one",
            urlTwo: "/bars/two"
        });
    } else if (req.params.category == "deals") {
        category = "deals";
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
app.get('/:category/:individual', (req, res) => {
    var category = req.params["category"];
    var wine = req.params["individual"];
    var findWineSql;
    var index;
    var imageSrc;

    switch (category) {
        case 'wine': {
            findWineSql = "SELECT * FROM wine WHERE category = 1;";
            break;
        }
        case 'spirit': {
            findWineSql = "SELECT * FROM wine WHERE category = 2;";
            break;
        }
        case 'beer': {
            findWineSql = "SELECT * FROM wine WHERE category = 3;";
            break;
        }
    }
    switch (wine) {
        case 'one': {
            number = "one";
            index = 1;
            imageSrc = "/images/" + category +"/1.png";
            break;
        }
        case 'two': {
            number = "two";
            index = 2;
            imageSrc = "/images/" + category +"/2.png";
            break;
        }
        case 'three': {
            number = "three";
            index = 3;
            imageSrc = "/images/" + category +"/3.png";
            break;
        }
    }
    if (category == "wine" || category == "spirit" || category == "beer") {
        sqliteDB.queryData(findWineSql, (rows) => {
            if (rows[index - 1] == undefined) {
                res.send('Wine does not exist !<a href="../">Back to Home Page<a/>');
            } else {
                res.render('individual.hbs', {
                    individual: rows[index - 1].name,
                    introduction: rows[index - 1].intro,
                    category: req.params['category'],
                    parent_page: "/" + req.params['category'],
                    image: imageSrc
                });
            }
        });
    }
});


//place order
app.get('/:category/:individual/cart', (req, res) => {
    if(userLoggedIn == null) {
        res.render('successfulPlaceOrder.hbs', {
            parent_page: "/" + req.params["category"],
            category: req.params["category"],
            message: "You are not logged in"
        });
    }else{
        console.log(req);
        var queryCustomer = "SELECT id FROM customer WHERE username = \'" + userLoggedIn + "\';";
        console.log(userLoggedIn);
        var customerId = null;
        sqliteDB.queryData(queryCustomer, (rows) => {
            customerId = rows[0].id;
            console.log(customerId);
            var queryWine = "SELECT id FROM wine WHERE name = \'" + req.params["individual"] + "\';";
            var wineId = null;
            sqliteDB.queryData(queryWine, (rows) => {
                wineId = rows[0].id;
                console.log(wineId);
                var insertOrderData = [[customerId, wineId]];
                var insertOrderSql = "INSERT INTO orderList(customer, wine) VALUES(?, ?);";
                for (var i = 0; i < req.query.num; i++) {
                    sqliteDB.insertData(insertOrderSql, insertOrderData);
                    console.log("***");
                }
            });
        });
        res.render('successfulPlaceOrder.hbs', {
            parent_page: "/" + req.params["category"],
            category: req.params["category"],
            message: "Your order has been recorded"
        });
    }
});


//check order
app.get('/user/order/orderForUser', (req, res) => {
    console.log("hahaha");
    console.log(userId);
    var queryOrder =
        "SELECT w.name as wineName, COUNT(*) AS wineNum FROM orderList as ol INNER JOIN wine as w ON ol.wine = w.id WHERE customer = " +
        userId + " GROUP BY ol.wine;";
    sqliteDB.queryData(queryOrder, (rows) => {
        var orderList = [["Item", "Number"]];
        if ((rows[0] == undefined)) {
            res.render('order.hbs', {
                username: userLoggedIn,
                order: orderList
            });
        } else {
            for (var i = 0; i < rows.length; i++) {
                orderList[i + 1] = [rows[i].wineName, rows[i].wineNum];
            }
            console.log(orderList);
            res.render('order.hbs', {
                username: userLoggedIn,
                order: orderList
            });
        }
    });
});

app.listen(3001);
