const express = require('express');
const router = express.Router();
const db=require('../config/db');

router.test = function(req,res){
    res.render('createtest');
}

router.addtest = function(req,res){
    let insertJSON = {};
    insertJSON.title = req.body.title;
    insertJSON.description = req.body.description;
    insertJSON.start = req.body.startdate+' '+req.body.starttime;
    insertJSON.end = req.body.enddate+' '+req.body.endtime;
    db.query("INSERT INTO test SET ?",[insertJSON],function(err,result){
        if(err) throw err;
        let testid=result.insertId;
        db.query("INSERT INTO admins(test,user) VALUES(?,?)",[testid,req.user.email],function(err,result){
            if(err) throw err;
            res.redirect('/managetest');
        });
    });
}

module.exports=router;