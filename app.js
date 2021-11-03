// ==== constantes ====

const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const fileupload = require('express-fileupload');
const expressSession = require('express-session');
const MongoStore = require('connect-mongo');
const connectFlash = require('connect-flash');
const {
    stripTags, limit
} = require('./helpers/hbs');

// ==== article ====
const articleAddController = require('./controllers/articleAdd')
const homePage = require('./controllers/homePage')
const articleSingleController = require('./controllers/articleSingle')
const articlePostController = require('./controllers/articlePost')
const articlePutPageController = require ('./controllers/articlePutPage')
const articlePutFormContoller = require ('./controllers/articlePutForm')
const articleSupprController = require ('./controllers/articleSuppr')
// ==== user ====
const userCreate = require('./controllers/userCreate')
const userRegister = require('./controllers/userRegister')
const userLogin = require('./controllers/userLogin')
const userLoginAuth = require('./controllers/userLoginAuth')
const userLogout = require('./controllers/userLogout')
const app = express();


// ==== dotenv ===== (crypter les clé etc...)
require('dotenv').config()

// console.log(process.env.MONGO_URI)

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
})

const mongoStore = MongoStore(expressSession)

app.use(connectFlash())

app.use(expressSession({
    secret: 'securite',
    name: 'biscuit',
    saveUninitialized: true,
    resave: false,

    store: new mongoStore({
        mongooseConnection: mongoose.connection
    })
}))

var Handlebars = require("handlebars");
var MomentHandler = require("handlebars.moment");
MomentHandler.registerHelpers(Handlebars);
// 

//==== route ====
app.engine('handlebars', exphbs({
    helpers: {
        stripTags: stripTags,
        limit: limit
    },

    defaultLayout: 'main'
}));

app.set('view engine', 'handlebars');

// ====bodyParser====
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

app.use(fileupload())



// ==== Express====
app.use(express.static('public'));

app.use('*', (req, res, next) => {
    res.locals.user = req.session.userId;
    console.log("ID Session: " + res.locals.user);
    next()
})

// ====middleware==== //
const articleValidPost = require('./middleware/articleValidPost');
const auth = require('./middleware/auth');
const redirectAuthSucess = require('./middleware/redirectAuthSucess')
app.use("/article/post", articleValidPost)


// ==== Get ==== 
app.get("/", homePage)


//==== Articles ====
// page de creation d'article
app.get("/articles/add", auth, articleAddController)
// Formulaire de creation d'article
app.post("/articles/post", auth, articleValidPost, articlePostController)
// Page Article ID
app.get("/articles/:id", articleSingleController)

// Page Edit Article
app.get("/articles/edit/:id", articlePutPageController )
// Formulaire Edit Article
app.post("/articles/edit/:id", articlePutFormContoller)
// Page de suppretion article
app.get ("/articles/delete/:id", articleSupprController)

// ==== user ====
// creation user 
app.get('/user/create', redirectAuthSucess, userCreate)
// inscription user
app.post('/user/register', redirectAuthSucess, userRegister)
// login user
app.get('/user/login', redirectAuthSucess, userLogin)
// redirecttion si auth ok 
app.post('/user/loginAuth', redirectAuthSucess, userLoginAuth)
// deconncetion
app.get('/user/logout', userLogout)


// ==== contact ====
app.get("/contact", (req, res) => {
    res.render("contact")
})

// error 404 
app.use((req, res) => {
    res.render('error404')
})

// ==== Port ====
app.listen(process.env.PORT || 3000, () => {
    console.log("le serveur tourne sur le port 3000");
})