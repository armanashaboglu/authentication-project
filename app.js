console.log("start"); 
var express = require('express');
var routes = require('./routes/routes.js');
bodyParser = require('body-parser');
var session = require('express-session');
const request = require('request-promise')
const passport = require('passport');
require('./passport.js');

require('dotenv').config()
const cookieParser = require('cookie-parser');



var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/*
const { auth } = require('express-openid-connect');

const { requiresAuth } = require('express-openid-connect');

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: '34ed182e57ff54e4de80f86e6ecaac25b4f45a5a0e151a61e6cf930cdb264e58',
  baseURL: 'http://localhost:3000',
  clientID: 'oDydxZ8aszbsu7SEOa578590AmN1eUG0',
  issuerBaseURL: 'https://dev-tziw3g3axoy7pskn.eu.auth0.com'
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));
*/

app.use(session({
    secret: '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',
    resave: false,
    saveUninitialized: false
    }));
app.use(passport.initialize());
app.use(passport.session());

app.use(cookieParser());

const isLoggedIn = (req, res, next) => {
    if (req.user) {
        next();
    } else {
        res.sendStatus(401);
    }
}

// Google Auth consent screen route
app.get('/google',
    passport.authenticate('google', {
            scope:
                ['email', 'profile']
        }
));

// Call back route
app.get('/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/failed',
    }),
    function (req, res) {
        // console.log(req);
        res.redirect('/home')
    }
);

app.get("/failed", (req, res) => {
    console.log('User is not authenticated');
    res.send("Failed")
})


app.get("/logout", routes.logout);

// req.isAuthenticated is provided from the auth router
// app.get('/', (req, res) => {
//   res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
// });

/*
app.get('/profile', requiresAuth(), (req, res) => {
    res.send(JSON.stringify(req.oidc.user));
});
*/
function ensureAuthenticated(req, res, next) {
    if (req.cookies && req.cookies['yourCookieName']) {
        return next();  
    }
    res.redirect('/login');  
}
app.get('/home', ensureAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});


/* Routes */  
app.get('/', routes.login);
app.get('/login2', routes.login);   
app.get('/signup', routes.signup);
app.post('/checklogin', routes.checkLogin);
app.post('/createaccount', routes.createAccount);
app.post('/createtask', routes.addTask);
app.post('/deletetask', routes.deleteTask);
app.post('/gettasks', routes.getTasks);


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});