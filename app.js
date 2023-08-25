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
*/

app.use(session({
    secret: 'SECRET',
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
