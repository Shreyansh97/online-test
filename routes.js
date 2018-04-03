module.exports = function(app,passport){
    const index = require('./routes/index');
    app.get('/',redirectIfLoggedIn,index.index);

    //login
    app.post('/login',passport.authenticate('local-login',{
        successRedirect : '/home',
        failureRedirect : '/',
        failureFlash : true
    }));

    //signup
    app.post('/signup',passport.authenticate('local-signup',{
        successRedirect : '/profile',
        failureRedirect : '/',
        failureFlash    : true
    }));

    //logout
    app.get('/logout',function(req,res){
        req.logout();
        res.redirect('/');
    });
}

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        if(req.body.photo)
            return next();
        else
            return res.redirect('/profile');
    }
    else
        res.redirect('/');
}

function redirectIfLoggedIn(req,res,next){
    if(req.isAuthenticated())
        res.redirect('/home');
    else
        return next();
}