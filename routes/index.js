const express = require('express');
const router = express.Router();

router.index = function(req,res){
    res.render('index',{
        loginMessage : req.flash('loginMessage'),
        signupMessage : req.flash('signupMessage')
    });
}

module.exports = router;