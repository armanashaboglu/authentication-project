require('dotenv').config()
const passport =require("passport")
const GoogleStrategy = require('passport-google-oauth2').Strategy;
var routes = require('./routes/routes.js');



passport.use(new GoogleStrategy({
        clientID: '28786774994-uhv6iup2v119pmbhp2lcb5o9413s59ac.apps.googleusercontent.com',
        clientSecret: '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',
        callbackURL: "http://localhost:3005/google/callback",
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