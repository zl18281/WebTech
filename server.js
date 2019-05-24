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
    "ids INTEGER PRIMARY KEY AUTOINCREMENT, " +
    "username VARCHAR(50) UNIQUE NOT NULL, " +
    "password VARCHAR(50) NOT NULL, " +
    "email VARCHAR(50) NOT NULL " +
    ");";
sqliteDB.createTable(createUserTableSql);

//schema of category table
var createCategoryTableSql = "CREATE TABLE IF NOT EXISTS " +
    "category(" +
    "ids INTEGER PRIMARY KEY AUTOINCREMENT, " +
    "name VARCHAR(50) UNIQUE NOT NULL " +
    ");";
sqliteDB.createTable(createCategoryTableSql);

//schema of wine table
var createWineTableSql = "CREATE TABLE IF NOT EXISTS " +
    "wine(" +
    "ids INTEGER PRIMARY KEY AUTOINCREMENT, " +
    "name VARCHAR(50) UNIQUE NOT NULL, " +
    "intro TEXT, " +
    "category INTEGER, " +
    "price INTEGER, " +
    "FOREIGN KEY(category) REFERENCES category(ids)" +
    ");";
sqliteDB.createTable(createWineTableSql);

//schema of join table between wine and customer
var createOrderTableSql = "CREATE TABLE IF NOT EXISTS " +
    "orderList(" +
    "ids INTEGER PRIMARY KEY AUTOINCREMENT, " +
    "customer INTEGER NOT NULL, " +
    "wine INTEGER NOT NULL, " +
    "FOREIGN KEY(customer) REFERENCES customer(ids), " +
    "FOREIGN KEY(wine) REFERENCES wine(ids)" +
    ");";
sqliteDB.createTable(createOrderTableSql);

/*
//some initial data for user table(最后要删掉)
var userData = [[1, 'pq18281', '123', 'zl18281@bristol.ac.uk'],
    [2, 'fg123', '456', 'abc@163.com']];
var insertUserSql = "INSERT INTO customer(ids, username, password, email) VALUES(?, ?, ?, ?);";
sqliteDB.insertData(insertUserSql, userData);

*/

//some initial data for category table(最后要删掉)
var categoryData = [[1, 'wine'],
    [2, 'spirit'],
    [3, 'beer']];
var insertCategorySql = "INSERT INTO category(ids, name) VALUES(?, ?);";
sqliteDB.insertData(insertCategorySql, categoryData);

//some initial data for wine table(最后要删)
var wineData = [[1, 'Porta 6 2017 Lisboa', 'Chock-full of warm, jammy forest-fruit flavours, it is our best-ever-selling red for good reason.', 1, 8.99],
    [2, 'The Guvnor', 'A heady, limitless red pumping with blackcurrant, plum and vanilla flavours.', 1, 8.99],
    [3, 'Definition Rioja Reserva 2013', 'What makes the perfect Rioja? Is it toasty cherry flavours? Vanilla spice? Or the ability to match beautifully with lamb? The Definition Rioja does all three!', 1, 13.99],
    [4, 'S&R Douro Red, 2016', 'It is deep-ruby red, emitting countless vanilla-licked notes of red and black fruits. It is everything that makes Portuguese blends great.', 1, 11.99],
    [5, 'Vieux Remparts 2016 Lussac St-Emilion', 'Flavours of ripe blackberry, plum and sandlewood drift through this full-bodied red. All of this at this low price is a steal.', 1, 12.99],
    [6, 'Château Recougne 2016 Bordeaux Supérieur', 'Discover a Bordeaux bargain in this red delectable bramble notes, regal spices and integrated tannins.', 1, 11.99],
    [7, 'Passimento 2016 Pasqua', 'It is one of our best-rated Italian reds and a heady red, full of concentrated black fruits and sweet spices. A baby Amarone at the snip of it is big brothers asking price.', 1, 11.99],
    [8, 'Kangarilla Road Shiraz 2018 McLaren Vale', 'Packed with black fruits, dark chocolate and a creamy texture, this is why the Kangarilla Road winery was given the top Five Red Star rating by leading Aussie wine critic James Halliday.', 1, 13.99],

    [9, 'Red Sprite', 'With no sugar', 2, '/images/spirit/1'],
    [10, 'Blue Sprite', 'With sugar', 2, '/images/spirit/2'],
    [11, 'Black beer', 'From America', 3, '/images/beer/1'],
    [12, 'Light beer', 'With less sugar', 3, '/image/beer/2'],
    [13, 'Strong beer', 'With strong spicy flavor', 3, '/images/beer/3']];
var insertWineSql = "INSERT INTO wine(ids, name, intro, category, price) VALUES(?, ?, ?, ?, ?);";
sqliteDB.insertData(insertWineSql, wineData);


//user login
app.get('/user', (req, res) => {
    var username = req.query.log_user;
    var findUserSql = "SELECT * FROM customer WHERE username = \'" + username + "\';";
    sqliteDB.queryData(findUserSql, (rows) => {
        if (rows[0] == undefined) {
            res.send('User does not exist !<a href="../">Back to Home Page<a/>')
        } else {
            console.log(userLoggedIn);
            console.log(req.query.log_pass);
            console.log(rows[0].password);
            if(req.query.log_pass == rows[0].password) {
                userLoggedIn = rows[0].username;
                userId = rows[0].ids;
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
            var userData = [[username, password, email]];
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
            category:'wine',
            one:'Porta 6 2017 Lisboa',
            two:'The Guvnor',
            three:'Definition 2013',
            four:'S&R Douro Red, 2016',
            five:'Vieux Remparts 2016',
            six:'Château Recougne 2016',
            seven:'Passimento 2016 Pasqua',
            eight:'Kangarilla Road Shiraz 2018',
            priceOne:'8.99',
            priceTwo:'8.99',
            priceThree:'13.99',
            priceFour:'11.99',
            priceFive:'12.99',
            priceSix:'11.99',
            priceSeven:'11.99',
            priceEight:'13.99',
            urlOne: "/wine/one",
            urlTwo: "/wine/two",
            urlThree:"/wine/three",
            urlFour:"/wine/four",
            urlFive:"/wine/five",
            urlSix:"/wine/six",
            urlSeven:"/wine/seven",
            urlEight:"/wine/eight",
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
    //need modify if adding new individual wine.
    //Keep number of branches of switch up with largest number.
    switch (wine) {
        case 'one': {
            number = "one";
            index = 1;
            imageSrc = "/images/" + category + "/" + category + "1.png";
            break;
        }
        case 'two': {
            number = "two";
            index = 2;
            imageSrc = "/images/" + category + "/" + category + "2.png";
            break;
        }
        case 'three': {
            number = "three";
            index = 3;
            imageSrc = "/images/" + category + "/" + category + "3.png";
            break;
        }
        case 'four': {
            number = "four";
            index = 4;
            imageSrc = "/images/" + category + "/" + category + "4.png";
            break;
        }
        case 'five': {
            number = "five";
            index = 5;
            imageSrc = "/images/" + category + "/" + category + "5.png";
            break;
        }
        case 'six': {
            number = "six";
            index = 6;
            imageSrc = "/images/" + category + "/" + category + "6.png";
            break;
        }
        case 'seven': {
            number = "seven";
            index = 7;
            imageSrc = "/images/" + category + "/" + category + "7.png";
            break;
        }
        case 'eight': {
            number = "eight";
            index = 8;
            imageSrc = "/images/" + category + "/" + category + "8.png";
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
                    image: imageSrc,
                    price: rows[index - 1].price
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
        var queryCustomer = "SELECT * FROM customer WHERE username = \'" + userLoggedIn + "\';";
        console.log(userLoggedIn);
        var customerId = null;
        sqliteDB.queryData(queryCustomer, (rows) => {
            customerId = rows[0].ids;
            console.log(rows[0]);
            console.log(customerId);
            var queryWine = "SELECT ids FROM wine WHERE name = \'" + req.params["individual"] + "\';";
            var wineId = null;
            sqliteDB.queryData(queryWine, (rows) => {
                wineId = rows[0].ids;
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
        "SELECT w.name as wineName, COUNT(*) AS wineNum FROM orderList as ol INNER JOIN wine as w ON ol.wine = w.ids WHERE customer = " +
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

app.listen(3000);
