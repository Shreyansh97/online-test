const LocalStrategy = require('passport-local').Strategy;
const db = require('./db');

module.exports = function(passport){
    //Serializing and deserializing users
    passport.serializeUser(function(user,done){
        done(null,user.email);
    });
    passport.deserializeUser(function(id,done){
        db.query('SELECT * FROM users where email = ?',[id],function(err,rows){
            done(err,rows[0]);
        });
    });

    //Login stratergy
    passport.use('local-login',new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
    },function(req,username,password,done){
        db.query("SELECT * FROM users WHERE email = ? AND password = ?",[username,password],function(err,results){
            if(err)
                return done(err);
            if(!results.length)
                return done(null,false,req.flash('loginMessage','User with credentials not found.'));
            done(null,results[0]);
        });
    }));

    //Signup stratergy
    passport.use('local-signup',new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
    },function(req,email,password,done){
        db.query('SELECT * FROM users WHERE email = ?',[email],function(err,results){
            if(err) return done(err);
            if(results.length>0) {
                return done(null,false,req.flash('signupMessage','A user with that email already exists'));
            } else {
                let newUser = Object();
                newUser.email = email;
                newUser.password = password;
                newUser.name = req.body.name;
                newUser.dob = req.body.dob;
                db.query("INSERT INTO users SET ?",[newUser],function(err,results){
                    if(err) return done(err);
                    return done(null,newUser);    
                });
            }
        });
    }));
}