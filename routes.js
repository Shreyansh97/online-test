module.exports = function(app,passport){
    const index = require('./routes/index');
    const user = require('./routes/user');
    const multer = require('multer');

    const uploading = multer({
        dest : __dirname + '/public/uploads/',
        limits: {fileSize: 1000000, files:1},
    })

    //index route
    app.get('/',redirectIfLoggedIn,index.index);

    //user routes
    app.get('/profile',isLoggedInProfile,user.profile);
    app.post('/uploadProfile',isLoggedInProfile,uploading.single('pic'),user.uploadPic);

    //login
    app.post('/login',passport.authenticate('local-login',{
        successRedirect : '/profile',
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

function isLoggedInProfile(req,res,next){
    if(req.isAuthenticated()){
        return next();
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