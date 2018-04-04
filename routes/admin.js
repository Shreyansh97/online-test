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

router.manage = function(req,res){
    let query = "SELECT id,title,start,end FROM test INNER JOIN admins ON test.id=admins.test WHERE admins.user=? AND ";
    let ending = " ORDER BY start DESC";
    db.query(query+"start > CURRENT_TIMESTAMP"+ending,[req.user.email],function(err,upcoming){
        if(err) throw err;
        db.query(query+"start <= CURRENT_TIMESTAMP AND end >= CURRENT_TIMESTAMP"+ending,[req.user.email],function(err,current){
            if(err) throw err;
            db.query(query+"end <= CURRENT_TIMESTAMP"+ending,[req.user.email],function(err,past){
                if(err) throw err;
                res.render('manage',{
                    present :   current,
                    past    :   past,
                    upcoming:   upcoming
                });
            });
        });
    });
}

router.edittest = function(req,res){
    db.query("SELECT * FROM test INNER JOIN admins ON test.id=admins.test WHERE admins.user=? AND test.id=?",
    [req.user.email,req.params.id],function(err,result){
        if(err) throw err;
        if(result.length==0)
            return res.status(404).send('Not Found');
        let response = result[0];
        let start=new Date(response.start);
        let end=new Date(response.end);
        var d=start.toISOString().split(/[TZ]/);
        response.startdate=d[0];
        response.starttime=d[1];
        var d=end.toISOString().split(/[TZ]/);
        response.enddate=d[0];
        response.endtime=d[1];
        
        db.query("SELECT user FROM admins WHERE test=?",[req.params.id],function(err,admins){
            if(err) throw err;
            db.query("SELECT * FROM questions WHERE test=?",[req.params.id],function(err,questions){
                if(err) throw err;
                res.render('edittest',{
                    details :   response,
                    admins  :   admins,
                    questions:  questions
                });
            });
        });
    });
}

router.modifytest = function(req,res){
    db.query("SELECT * FROM admins WHERE test=? AND user=?",[req.body.id,req.user.email],function(err,test){
        if(err) throw err;
        if(test.length==0)
            return res.status(404).send('Not Found');
        let insertJSON = {};
        insertJSON.title = req.body.title;
        insertJSON.description = req.body.description;
        insertJSON.start = req.body.startdate+' '+req.body.starttime;
        insertJSON.end = req.body.enddate+' '+req.body.endtime;
        db.query("UPDATE test SET ? WHERE id=?",[insertJSON,req.body.id],function(err,result){
            if(err) throw err;
            let testid=result.insertId;
            res.redirect('/manage/'+req.body.id);
        });
    });
}

router.addadmin = function(req,res){
    db.query("SELECT * FROM admins WHERE test=? AND user=?",[req.body.id,req.user.email],function(err,result){
        if(err) throw err;
        if(result.length==0)
            return res.status(404).send('Not Found');
        db.query("INSERT INTO admins(test,user) VALUES(?,?)",[req.body.id,req.body.user],function(err,result){
            if(err){
                console.log(err);
                return res.status(501).send('Email not found');
            }
            return res.redirect('/manage/'+req.body.id);
        });
    });
}

router.addquestion = function(req,res){
    db.query("SELECT * FROM admins WHERE test=? AND user=?",[req.body.test,req.user.email],function(err,result){
        if(err) throw err;
        if(result.length==0)
            return res.status(404).send('Not Found');
        db.query("INSERT INTO questions SET ?",[req.body],function(err,result){
            if(err) throw err;
            return res.redirect('/manage/'+req.body.test);
        });
    });
}
module.exports=router;