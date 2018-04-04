const express = require('express');
const router = express.Router();
const db = require('../config/db');
const fs = require('fs');
const path = require('path');

router.profile = function(req,res){
    db.query("SELECT email,password,name,date_format(dob,'%d-%m-%Y') as dob,photo from users WHERE email = ?",[req.user.email],function(err,result){
        if(err) throw err;
        let abc = {};
        abc.user=result[0];
        db.query("SELECT * FROM gives INNER JOIN test ON test.id=gives.test WHERE gives.user = ?",[req.user.email],function(err,tests){
            if(err) throw err;
            res.render('profile',{
                req : abc,
                tests:tests
            });
        });
    });
}

router.uploadPic = function(req,res){
    let ext = path.extname(req.file.originalname);
    if(ext !='.jpg' && ext !='.png' && ext !='.jpeg' && ext !='.bmp')
        return res.redirect('/profile');
    db.query("UPDATE users SET photo=? WHERE email=?",[req.file.filename,req.user.email],function(err,result){
        if(err) throw err;
        res.redirect('/profile');
    });
}

router.viewall = function(req,res){
    let query = "SELECT id,title,date_format(start,'%d-%m-%Y %h:%i %p') as start,date_format(end,'%d-%m-%Y %h:%i %p') as end FROM test WHERE ";
    let ending = " ORDER BY start DESC";
    db.query(query+"start > CURRENT_TIMESTAMP"+ending,function(err,upcoming){
        if(err) throw err;
        db.query(query+"start <= CURRENT_TIMESTAMP AND end >= CURRENT_TIMESTAMP"+ending,function(err,current){
            if(err) throw err;
            db.query(query+"end <= CURRENT_TIMESTAMP"+ending,function(err,past){
                if(err) throw err;
                res.render('view',{
                    present :   current,
                    past    :   past,
                    upcoming:   upcoming
                });
            });
        });
    });
}

router.viewtest = function(req,res){
    db.query("SELECT * FROM test WHERE id=?",[req.params.id],function(err,result){
        if(err) throw err;
        if(result.length == 0)
            return res.status(404).send('Not Found');
        let now = new Date();
        let start = new Date(result[0].start);
        let end = new Date(result[0].end);
        let goingon = now>=start && now <=end;
        let over = now>end;
        let upcoming = now<start;
        res.render('viewtest',{
            details:result[0],
            goingon:goingon,
            over:over,
            upcoming:upcoming
        });
    });
}

router.givetest = function(req,res){
    db.query("SELECT * FROM test WHERE id=? AND start<=CURRENT_TIMESTAMP AND end>=CURRENT_TIMESTAMP",[req.params.id],function(err,test){
        if(err) throw err;
        if(test.length==0)
            return res.redirect('/view/'+req.params.id);
        test = test[0];
        db.query("SELECT * FROM questions WHERE test=?",[test.id],function(err,questions){
            if(err) throw err;
            return res.render('givetest',{
                details :   test,
                questions:  questions
            }) 
        });
    });
}

router.submit = function(req,res){
    db.query("SELECT id,correct,score FROM questions WHERE test = ?",[req.body.test],function(err,questions){
        if(err) throw err;
        let score = 0;
        for(let i=0;i<questions.length;i++){
            if(req.body[questions[i].id]==questions[i].correct)
                score = score + parseInt(questions[i].score);
        }
        let insertJSON = {};
        insertJSON.user = req.user.email;
        insertJSON.test = req.body.test;
        insertJSON.score = score;
        db.query("INSERT INTO gives SET ?",[insertJSON],function(err,result){
            if(err) throw err;
            res.redirect('/profile');
        });
    });
}

module.exports = router;