require('dotenv').config()
const passport =require("passport")
const GoogleStrategy = require('passport-google-oauth2').Strategy;
var routes = require('./routes/routes.js');



passport.use(new GoogleStrategy({
        clientID: 'CLIENT_ID',
        clientSecret: 'CLIENT_SECRET',
        callbackURL: "CALL_BACK_URL",
        passReqToCallback   : true
},
function(request, accessToken, refreshToken, profile, done) {
    // console.log(profile);
        console.log("Logging you in");
        routes.addAccountOAuth2(profile, accessToken);
        return done(null, profile);
}
));

passport.serializeUser(function(user, done) {
done(null, user);
});

passport.deserializeUser(function(user, done) {
done(null, user);
});
