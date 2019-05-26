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

    [9, 'Silent Pool Gin', 'A well-balanced gin that is both traditional and refreshingly individual in nature', 2, 44.00],
    [10, 'Cucumber Gin', 'Cucumber Gin is happy to be mixed with coriander sprigs and mint, take the lead role in a gin and tonic or simply to be enjoyed on its own over the freshest of ice.', 2, 37.00],
    [11, 'Cotswold Gin', 'The Award Winning Gin from the Heart of the Cotswolds - serve with a slice of Pink Grapefruit.', 2, 40.00],
    [12, 'Definition Gin', 'Our Gin, distilled in England. Find flavours of clementine, roasted spice and coriander. Drink with a twist of orange rind.', 2, 25.50],
    [13, 'Rumbullion!', 'Only the richest and most flavoursome rums are used in the creation of Ableforths Rumbullion! providing a remarkable drinking experience, unrivalled in our modern era.', 2, 40.00],
    [14, 'Dark Matter Rum', 'The taste equivalent of warping into a liquid black hole but without every atom in your body being crushed to an infinitely small point.', 2, 40.00],
    [15, 'Jameson Irish Whiskey', 'Triple-distilled for extra smoothness.', 2, 24.50],
    [16, 'Glenmorangie Original', 'Glenmorangies distinctive and delicate aroma has an elegance all of its own.', 2, 40.00],

    [17, 'Asahi Super Dry 24x330ml Bottles', 'A really fresh, dry style lager from Japan.', 3, 32.40],
    [18, 'Budweiser Budvar 24x330ml Bottles', 'This pale lager has a beautiful golden colour and rich head, its mild hop aroma balances well with the perfectly synchronised sweet-bitter taste.', 3, 24.00],
    [19, 'Pilsner Urquell 24x330ml Bottles', 'The creation of Pilsner Urquell marked the worlds first golden beer, still brewed in Plzen, Czech Republic with an unchanged recipe since 1842.', 3, 24.00],
    [20, 'Corona Extra 24x330ml Bottles', 'The famous Mexican beer, fantastic with a slice of lime on a summer day.', 3, 24.00],
    [21, 'Sharps Doom Bar 8x500ml Bottles', 'Doom Bar is the epitome of consistency, balance and moreish appeal of an amber ale.', 3, 14.32],
    [22, 'Paulaner Wheat 12x500ml Bottles', 'A traditional Bavarian wheat beer with a nose boasting cloves and fruit. A great food beer, this drinks deliciously with white meats and is particularly suitable for dishes flavoured with lemon!', 3, 21.00],
    [23, 'Punk IPA BrewDog 4x330ml Cans', 'This is a light, golden classic and delivers bursts of caramel, tropical fruit, grapefruit, pineapple and lychee. It has a bitter finish and works well with spicy foods a classic with curry.', 3, 7.32],
    [24, 'Freedom Four 12x330ml Bottles', 'Hopped with a combination of British First Gold and Hallertau Perle, Freedom Four has an initial sweetness that slides into a hoppy bitter finish.', 3, 15.96],

    [25, 'Veuve Clicquot Brut NV Champagne', 'Veuve Clicquot ages their non-vintage for almost twice the required time, resulting in a superb marriage of freshness and power, with rich fruit and a mouth-filling mousse.', 4, 44.99],
    [26, 'Bouvet Ladubay Saumur NV France', 'Bouvet is made with the same traditional method as Champagne. But it is crafted from Chenin Blanc grapes. This pumps up the biroche-and-citrus-packed body of the juice. It is a steal.', 4, 12.99],
    [27, 'Nicolas Courtin Brut NV Champagne', 'Champagne for less than £16? It really is possible. And, with swathes of toast, citrus and golden apple, this really does not skimp on quality to bring great-value fizz to your flute.', 4, 19.99],
    [28, 'Pol Roger Réserve NV Champagne', 'Pol Roger’s historic underground cellars are 33m deep. They thus provide an environment uniquely suited to slow fermentation, and are responsible for this Champagnes famously super-fine mousse.', 4, 45.99],
    [29, 'Nicolas Feuillatte 2009 Champagne', 'Nicolas Feuillattes vintage cuvée combines freshness with a subtle yeastiness from extended ageing on the lees. Great as a party wine, or as a match with antipasto and cured meats.', 4, 27.99],
    [30, 'J de Telmont NV Champagne', 'One of the few remaining, family owned Champagne houses, De Telmont produces this excellent non-vintage in a medium bodied, soft and fruity, classically yeasty style. Fabulous value.', 4, 21.99],
    [31, 'Krug Grande Cuvée NV Champagne', 'Krug’s uncompromising and single-minded determination to produce the best Champagne is legendary. Unquestionably one of the finest Champagnes in the world.', 4, 150.00],
    [32, 'Bollinger Rosé NV Champagne', 'A recent addition to Bollingers range, which delivers their trademark fullness with the addition of luscious berry notes.', 4, 54.99]];
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
            one:'Silent Pool Gin',
            two:'Cucumber Gin',
            three:'Cotswold Gin',
            four:'Definition Gin',
            five:'Rumbullion!',
            six:'Dark Matter Rum',
            seven:'Jameson Irish Whiskey',
            eight:'Glenmorangie Original',
            priceOne:'44.00',
            priceTwo:'37.00',
            priceThree:'40.00',
            priceFour:'25.50',
            priceFive:'40.00',
            priceSix:'40.00',
            priceSeven:'24.50',
            priceEight:'40.00',
            urlOne: "/spirit/one",
            urlTwo: "/spirit/two",
            urlThree:"/spirit/three",
            urlFour:"/spirit/four",
            urlFive:"/spirit/five",
            urlSix:"/spirit/six",
            urlSeven:"/spirit/seven",
            urlEight:"/spirit/eight",
        });
    } else if (req.params.category == "beer") {
        category = "beer";
        res.render('category.hbs', {
            category: 'beer',
            one:'Asahi Super Dry 24x330ml Bottles',
            two:'Budweiser Budvar 24x330ml Bottles',
            three:'Pilsner Urquell 24x330ml Bottles',
            four:'Corona Extra 24x330ml Bottles',
            five:'Sharps Doom Bar 8x500ml Bottles',
            six:'Paulaner Wheat 12x500ml Bottles',
            seven:'Punk IPA BrewDog 4x330ml Cans',
            eight:'Freedom Four 12x330ml Bottles',
            priceOne:'32.40',
            priceTwo:'24.00',
            priceThree:'24.00',
            priceFour:'24.00',
            priceFive:'14.32',
            priceSix:'21.00',
            priceSeven:'7.32',
            priceEight:'15.96',
            urlOne: "/beer/one",
            urlTwo: "/beer/two",
            urlThree:"/beer/three",
            urlFour:"/beer/four",
            urlFive:"/beer/five",
            urlSix:"/beer/six",
            urlSeven:"/beer/seven",
            urlEight:"/beer/eight",
        });
    } else if (req.params.category == "other") {
        category = "other";
        res.render('category.hbs', {
            category: 'other',
            one:'Veuve Clicquot Brut NV Champagne',
            two:'Bouvet Ladubay Saumur NV France',
            three:'Nicolas Courtin Brut NV Champagne',
            four:'Pol Roger Réserve NV Champagne',
            five:'Nicolas Feuillatte 2009 Champagne',
            six:'J de Telmont NV Champagne',
            seven:'Krug Grande Cuvée NV Champagne',
            eight:'Bollinger Rosé NV Champagne',
            priceOne:'44.99',
            priceTwo:'12.99',
            priceThree:'19.99',
            priceFour:'45.99',
            priceFive:'27.99',
            priceSix:'21.99',
            priceSeven:'150.00',
            priceEight:'54.99',
            urlOne: "/other/one",
            urlTwo: "/other/two",
            urlThree:"/other/three",
            urlFour:"/other/four",
            urlFive:"/other/five",
            urlSix:"/other/six",
            urlSeven:"/other/seven",
            urlEight:"/other/eight",
        });
    } else if (req.params.category == "recipes") {
        category = "recipes";
        res.sendFile(__dirname + "/site/recipes.html");
    } else if (req.params.category == "bars") {
        category = "bars";
        res.sendFile(__dirname + "/site/bars.html");
    } else if (req.params.category == "deals") {
        category = "deals";
        res.sendFile(__dirname + "/site/discount.html");
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
        "SELECT w.name as wineName, COUNT(*) AS wineNum, (w.price * COUNT(*)) as total FROM orderList as ol INNER JOIN wine as w ON ol.wine = w.ids WHERE customer = " +
        userId + " GROUP BY ol.wine;";
    sqliteDB.queryData(queryOrder, (rows) => {
        var orderList = [["Item", "Number", "Total Price"]];
        if ((rows[0] == undefined)) {
            res.render('order.hbs', {
                username: userLoggedIn,
                order: orderList
            });
        } else {
            for (var i = 0; i < rows.length; i++) {
                orderList[i + 1] = [rows[i].wineName, rows[i].wineNum, rows[i].total];
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
