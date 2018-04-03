const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');

let app = express();

app.set('views',path.join(__dirname,'views'));
app.set('view engine','hbs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({secret:'dbsproject'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require('./config/passport')(passport);
require('./routes')(app,passport);


//Handling 404s
app.use(function(req,res,next){
	var err = new Error('Not found');
	err.status = 404;
	next(err);
});

//handling all errors
app.use(function(err,req,res,next){
	res.locals.message = err.message;
	// TODO: When in production change res.locals.error = {}
	res.locals.error = err;

	res.status(err.status || 500);
	res.render('error');
});

app.listen(3000,function(err){
    if(err)
        console.log(err);
    else
        console.log("Listening to port 3000");
});