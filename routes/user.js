const express = require('express');
const router = express.Router();
const db = require('../config/db');
const fs = require('fs');
const path = require('path');

router.profile = function(req,res){
    res.render('profile',{
        req : req
    });
}

router.home = function(req,res){
    res.send("HI");
}

router.uploadPic = function(req,res){
    let ext = path.extname(req.file.originalname);
    if(ext !='.jpg' || ext !='.png' || ext !='.jpeg' || ext !='.bmp')
        return res.redirect('/profile');
    db.query("UPDATE users SET photo=? WHERE email=?",[req.file.filename,req.user.email],function(err,result){
        if(err) throw err;
        res.redirect('/profile');
    });
}

module.exports = router;