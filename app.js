  var express = require('express');
  var path = require('path');
  var bodyParser = require('body-parser');
  var mysql = require('mysql');
  var session = require('express-session');
  var app = express();
  var ejs = require('ejs');
  var http = require('http');
  var fs = require('fs');
  var sess = false;


  var connection = mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'PNP'
  });

  app.use(session({
      secret: 'peopleneedpeople',
      resave: false,
      saveUninitialized: true
  }));
  app.set('views',path.join(__dirname,'views'));
  app.set('view engine', 'ejs');
  app.use(bodyParser.urlencoded({
      extended: true
  }));
  app.use(bodyParser.text());
  app.use(express.static(path.join(__dirname + '/public')));
  app.get('/', function(req, res) {
      // res.sendFile(__dirname + '/public/html/pnp.html');
      res.render('pnp',{usernum : req.session.usernum, name:req.session.userid});
  });

  /*app.get('/signIn', function(req, res) {
      res.sendFile(__dirname + '/public/html/signIn.html');
  });

  app.get('/signUp', function(req, res) {
      res.sendFile(__dirname + '/public/html/signUp.html');
  });*/

  app.get('/RECRUIT', function(req, res) {
    var pageno = req.query.pageno == undefined ? 1 : req.query.pageno;
    var result;

    connection.query('select recr_write_usernum ,recr_write_number, recr_write_prname, recr_write_name, recr_write_area, recr_write_recruits, date_format(recr_write_date, "%Y-%m-%d") as recr_date,' +
    ' recr_write_views from Recruit order by recr_write_date desc', function(err, row){
      if(err){
        console.log(err);
        res.send('<script>alert("RECRUIT내부에 오류가 발생했습니다. 다시 시도해 주세요.");window.history.back();</script>');
    }else{
        if(row.length == 0){
          console.log("Empty set.");
        }
        res.render('RECRUIT',{usernum: req.session.usernum, userid: req.session.userid, data: row, curPage: pageno});
      }
    });
  });


  app.get('/recruitboard', function(req,res){
    var postno = req.query.postno;
    if(req.session.usernum == null || req.session.userid == null){
      res.send('<script>alert("로그인 해주세요.");window.location.href="/";</script>');
      return;
    }
    if(postno == undefined){
      res.render('RecruitBoard',{usernum: req.session.usernum, userid: req.session.userid, data: null/*, title: req.session.title, content: req.session.content,
      password: req.session.password*/});
    }
    else{
      connection.query('select * from Recruit where recr_write_number=?', postno, function(err, row){
        if(err){
          console.log(err);
          res.send('<script>alert("내부에 오류가 발생했습니다. 다시 시도해 주세요.");window.history.back();</script>');
        } else {
          res.render('RecruitBoard',{usernum:req.session.usernum, userid: req.session.userid, data: row});

        }
      });
    }
  });

  app.post('/rewriterecruitboard', function(req,res){
    var postno = req.query.postno;
    var prname = req.body.prname, area = req.body.area, recruits = req.body.recruits,
        content = req.body.content, password=  req.body.password;
    var dataset = [prname, area, recruits, content, password, postno];

  //   connection.query('update Recruit set recr_write_prname = ?, recr_write_area = ?,' +
  // 'recr_write_recruits = ?, recr_write_content = ?, recr_write_password = ? where recr_write_number =?', dataset, function(err, row){
  //   if(err){
  //     console.log(err);
  //     res.send('<script>alert("내부에 오류가 발생했습니다. 다시 시도해 주세요.");window.history.back();</script>');
  //   }else{
  //     res.send('<script>alert("수정이 완료되었습니다.");location.href="/RecruitView?postno='+postno+'";</script>');
  //     }
  //   });
  var sql = 'update Recruit set recr_write_prname = ?, recr_write_area = ?,' +
   'recr_write_recruits = ?, recr_write_content = ?, recr_write_password = ? where recr_write_number =?';

  var isQuerySuccess = executeQuery(sql, dataset);

  if(isQuerySuccess == 1){
     res.send('<script>alert("rewriteRecruitBoard내부에 오류가 발생했습니다. 다시 시도해 주세요.");window.history.back();</script>');
  }else{
    res.send('<script>alert("수정이 완료되었습니다.");location.href="/RecruitView?postno='+postno+'";</script>');    }


});

  app.post('/saveRecruitBoard', function(req,res){
    if(req.session.usernum == null || req.session.userid == null){
      res.send('<script>alert("로그인 해주세요.");window.location.href="/";</script>');
    }

    // var usernum = req.session.usernum;
    // var username = req.session.userid;
    // var prname = req.body.prname;
    // var area = req.body.area;
    // var recruits = req.body.recruits;
    // var content = req.body.content;
    // var password = req.body.password;
    // var dataset = [usernum, prname, area, recruits, username, content, password];

    var dataBoard = {
      recr_write_usernum : req.session.usernum,
      recr_write_name : req.session.userid,
      recr_write_prname : req.body.prname,
      recr_write_area : req.body.area,
      recr_write_recruits : req.body.recruits,
      recr_write_content : req.body.content,
      recr_write_password : req.body.password
    };

  //   if(dataBoard.recr_write_prname == "" || dataBoard.recr_write_area == "" || dataBoard.recr_write_recruits == ""
  // || dataBoard.recr_write_content == "" || dataBoard.recr_write_password == ""){
  //     res.send('<script>alert("비어있는 항목이 있습니다.");window.history.back();</script>');
  //     return;
  //   }

    var tbName= "Recruit";
    var toSend = [tbName, dataBoard];
    var isQuerySuccess = saveBoard(toSend);

    if(isQuerySuccess == 1){
      res.send('<script>alert("saveRecruitBoard내부에 오류가 발생했습니다. 다시 시도해 주세요.");window.history.back();</script>');
    }else{
      res.redirect('/recruit');
    }
    // connection.query('insert into Recruit (recr_write_usernum, recr_write_prname, recr_write_area, recr_write_recruits, recr_write_name, recr_write_content, recr_write_password)'+
    // ' values (?, ?, ?, ?, ?, ?, ?)', dataset, function(err, row){
    //   if(err){
    //     console.log(err);
    //     res.send('<script>alert("saveRecruitBoard내부에 오류가 발생했습니다. 다시 시도해 주세요.");window.history.back();</script>');
    //   } else {
    //     res.redirect('/recruit');
    //   }
    });


  app.get('/RecruitView', function(req, res){
    var postNo = req.query.postno;
  // add view count;
    connection.query('update Recruit set recr_write_views = recr_write_views + 1 where recr_write_number = ' + postNo, function(err, row){
      if(err){
        console.log(err);
        res.send('<script>alert("RecruitView내부에 오류가 발생했습니다. 다시 시도해 주세요.");window.history.back();</script>');
      }
    });
    connection.query('select recr_write_number,recr_write_usernum, recr_write_prname, recr_write_name, date_format(recr_write_date, "%Y-%m-%d") as recr_date, recr_write_views,' +
    ' recr_write_content from recruit where recr_write_number = ?'
    , postNo, function(err, row){
      if(err){
        console.log(err);
        res.send('<script>alert("RecruitView select내부에 오류가 발생했습니다. 다시 시도해 주세요.");window.history.back();</script>');
      }else{
        res.render('RecruitView', {usernum: req.session.usernum, userid: req.session.userid, data: row});
      }
    });
  });

  app.get('/MENTORING', function(req, res) {
    var pageno = req.query.pageno == undefined ? 1 : req.query.pageno;

    var result;
    connection.query('select ment_write_number, ment_write_title, ment_write_name, date_format(ment_write_date, "%Y-%m-%d") as ment_date,' +
    ' ment_write_views from Mentoring order by ment_write_date desc', function(err, row){
      if(err){
        console.log(err);
  res.send('<script>alert("내부에 오류가 발생했습니다. 다시 시도해 주세요.");window.history.back();</script>');
    }else{
        if(row.length == 0){
          console.log("Empty set.");
        }
        res.render('MENTORING',{usernum: req.session.usernum, userid: req.session.userid, data: row, curPage: pageno});
      }
    });
  });

  app.get('/mentoringboard',function(req,res){
    var postno = req.query.postno;

    if(req.session.usernum == null || req.session.userid == null){
      res.send('<script>alert("로그인 해주세요.");window.location.href="/";</script>');
      return;
    }
    if(postno == undefined){
      res.render('MentoringBoard',{usernum: req.session.usernum, userid: req.session.userid, data: null/*, title: req.session.title, content: req.session.content,
      password: req.session.password*/});
    }
    else{
      connection.query('select * from Mentoring where ment_write_number=?', postno, function(err, row){
        if(err){
          console.log(err);
          res.send('<script>alert("내부에 오류가 발생했습니다. 다시 시도해 주세요.");window.history.back();</script>');
        } else {
          res.render('MentoringBoard',{usernum:req.session.usernum, userid: req.session.userid, data: row});
        }
      });
    }
  });

  app.post('/rewritementoringboard', function(req,res){
    var postno = req.query.postno;

    var title = req.body.title, content = req.body.content,
        password = req.body.password;

    var dataset = [title, content, password, postno];

    // connection.query('update Mentoring set ment_write_title = ?, ment_write_content = ?,'+
    // 'ment_write_password = ? where ment_write_number= ?', dataset, function(err, row){
    //   if(err){
    //     console.log(err);
    //     res.send('<script>alert("내부에 오류가 발생했습니다. 다시 시도해 주세요.");window.history.back();</script>');
    //   } else {
    //     res.send('<script>alert("수정이 완료되었습니다.");location.href="/MentoringView?postno='+postno+'";</script>');
    //   }
    // });
    var sql = 'update Mentoring set ment_write_title = ?, ment_write_content = ?,'+
     'ment_write_password = ? where ment_write_number= ?';

    var isQuerySuccess = executeQuery(sql, dataset);

    if(isQuerySuccess == 1){
       res.send('<script>alert("rewriteMentoringBoard내부에 오류가 발생했습니다. 다시 시도해 주세요.");window.history.back();</script>');
    }else{
      res.send('<script>alert("수정이 완료되었습니다.");location.href="/MentoringView?postno='+postno+'";</script>');    }



  });

  app.post('/saveMentoringBoard', function(req, res){
    if(req.session.usernum == null || req.session.userid == null){
      res.send('<script>alert("로그인 해주세요.");window.location.href="/";</script>');
    }

  var dataBoard = {
    ment_write_usernum : req.session.usernum,
    ment_write_name : req.session.userid,
    ment_write_title : req.body.title,
    ment_write_content : req.body.content,
    ment_write_password : req.body.password
  };
  var tbName = "Mentoring";

  var toSend = [tbName, dataBoard];

  var isQuerySuccess = saveBoard(toSend);

  // if(dataBoard.ment_write_title === "" || dataBoard.ment_write_content === "" || dataBoard.ment_write_password === ""){
  //   res.send('<script>alert("비어있는 항목이 있습니다.");window.history.back();</script>');
  //   return;
  // }



  if(isQuerySuccess == 1){
     res.send('<script>alert("saveMentoringBoard내부에 오류가 발생했습니다. 다시 시도해 주세요.");window.history.back();</script>');
  }else{
    res.redirect('/mentoring');
  }

  });

  app.get('/MentoringView', function(req, res){
    var postNo = req.query.postno;
  // add view count;
    connection.query('update mentoring set ment_write_views = ment_write_views + 1 where ment_write_number = ' + postNo, function(err, row){
      if(err){
        console.log(err);
        res.send('<script>alert("내부에 오류가 발생했습니다. 다시 시도해 주세요.");window.history.back();</script>');
      }
    });
    connection.query('select ment_write_number, ment_write_usernum, ment_write_title, ment_write_name, date_format(ment_write_date, "%Y-%m-%d") as ment_date, ment_write_views,' +
    ' ment_write_content from mentoring where ment_write_number = ?'
    , postNo, function(err, row){
      if(err){
        console.log(err);
        res.send('<script>alert("내부에 오류가 발생했습니다. 다시 시도해 주세요.");window.history.back();</script>');
      }else{
        res.render('MentoringView', {usernum: req.session.usernum, userid: req.session.userid, data: row});
      }
    });
  });

  app.post('/verifyMentoringpassword', function(req,res){
    var password = req.body.password;
    var primarykey = req.body.primarykey;

    connection.query('select ? = (select ment_write_password from Mentoring where ment_write_number = ?) as isright ' , [password, primarykey], function(err, row){
      if(err){
        console.log(err);
        res.send('<script>alert("내부에 오류가 발생했습니다. 다시 시도해 주세요.");window.history.back();</script>');
      }else{
        res.send({ isright : row[0].isright});
      }
    });
  });

  app.post('/verifyRecruitpassword', function(req,res){
    var password = req.body.password;
    var primarykey = req.body.primarykey;

    connection.query('select ? = (select recr_write_password from Recruit where recr_write_number = ?) as isright ', [password, primarykey], function(err, row){
      if(err){
        console.log(err);
        res.send('<script>alert("내부에 오류가 발생했습니다. 다시 시도해 주세요.");window.history.back();</script>');
      }else{
        res.send({ isright : row[0].isright});
      }
    });
  });

  app.post('/verifyClubfinderpassword', function(req,res){
    var password = req.body.password;
    var primarykey = req.body.primarykey;

    connection.query('select ? = (select club_write_password from ClubFinder where club_write_number = ?) as isright', [password, primarykey], function(err, row){
      if(err){
        console.log(err);
        res.send('<script>alert("내부에 오류가 발생했습니다. 다시 시도해 주세요.");window.history.back();</script>');
      }else{
        res.send({isright : row[0].isright});
      }
    });
  });


  app.post('/deleteMentoringboard', function(req,res){
    var primarykey = req.body.primarykey;
    //
    // connection.query('delete from Mentoring where ment_write_number = ?', primarykey, function(err, row){
    //   if(err){
    //     console.log(err);
    //     res.status(500).send("내부에 오류가 발생했습니다. 다시 시도해 주세요.");
    //   }else{
    //     res.send('<script>alert("게시글이 삭제되었습니다.");</script>');
    //   }
    // });
    var sql = 'delete from Mentoring where ment_write_number = ?';

    var isQuerySuccess = executeQuery(sql, primarykey);

    if(isQuerySuccess == 1){
      res.send('<script>alert("deleteMentoringBoard내부에 오류가 발생했습니다. 다시 시도해 주세요.");window.history.back();</script>');
    }else{
      res.send('<script>alert("게시글이 삭제되었습니다.")</script>');
    }
  });

  app.post('/deleteRecruitboard', function(req,res){
    var primarykey = req.body.primarykey;

    // connection.query('delete from Recruit where recr_write_number = ? ', primarykey, function(err,row){
    //   if(err){
    //     console.log(err);
    //     res.status(500).send("내부에 오류가 발생했습니다. 다시 시도해 주세요. ");
    //
    //   }else{
    //     res.send('<script>alert("게시글이 삭제되었습니다.")</script>');
    //   }
    // });
    var sql = 'delete from Recruit where recr_write_number = ?';

    var isQuerySuccess = executeQuery(sql, primarykey);

    if(isQuerySuccess == 1){
      res.send('<script>alert("deleteRecruitBoard내부에 오류가 발생했습니다. 다시 시도해 주세요.");window.history.back();</script>');
    }else{
      res.send('<script>alert("게시글이 삭제되었습니다.")</script>');
    }
  });

  app.post('/deleteClubFinderboard', function(req,res){
    var primarykey = req.body.primarykey;

    // connection.query('delete from ClubFinder where club_write_number = ?', primarykey, function(err,row){
    //   if(err){
    //     console.log(err);
    //     res.status(500).send("내부에 오류가 발생했습니다. 다시 시도해 주세요. ");
    //
    //   }else{
    //     res.send('<script>alert("게시글이 삭제되었습니다.")</script>');
    //   }
    // });
    var sql = 'delete from ClubFinder where club_write_number = ?';
    var isQuerySuccess = executeQuery(sql, primarykey);
    if(isQuerySuccess == 1){
      res.send('<script>alert("deleteClubFinderBoard내부에 오류가 발생했습니다. 다시 시도해 주세요.");window.history.back();</script>');
    }else{
      res.send('<script>alert("게시글이 삭제되었습니다.")</script>');
    }
  });



  app.get('/CLUBFINDER', function(req, res) {
    var pageno = req.query.pageno == undefined ? 1 : req.query.pageno;

    var result;
    connection.query('select club_write_usernum , club_write_number, club_write_title, club_write_1lineSum, club_write_content, club_write_password, club_write_views, club_write_clubname, date_format(club_write_date, "%Y-%m-%d")as club_date'+
  'club_write_views from ClubFinder order by club_write_date desc', function(err, row){
    if(err){
      console.log(err);
      res.send('<script>alert("CLUBFINDER내부에 오류가 발생하였습니다. 다시 시도해 주세요");window.history.back();</script>');
    }else{
      if(row.length == 0){
        console.log("Empty set.");
      }
      res.render('ClubFinder',{usernum: req.session.usernum, userid: req.session.userid, data: row, curPage: pageno});
    }
  });
  });

  app.get('/clubfinderboard', function(req, res){
    var postno = req.query.postno;

    if(req.session.usernum == null || req.session.userid == null){
      res.send('<script>alert("로그인 해주세요.");window.location.href="/";</script>');
      return;
    }
    if(postno == undefined){
      res.render('ClubFinderBoard',{usernum: req.session.usernum, userid: req.session.userid, data: null/*, title: req.session.title, content: req.session.content,
      password: req.session.password*/});
    }
    else{
      connection.query('select * from ClubFinder where club_write_number=?', postno, function(err, row){
        if(err){
          console.log(err);
          res.send('<script>alert("내부에 오류가 발생했습니다. 다시 시도해 주세요.");window.history.back();</script>');
        } else {
          res.render('ClubFinderBoard',{usernum:req.session.usernum, userid: req.session.userid, data: row});

        }
      });
    }
  });

  app.post('/rewriteclubfinderboard', function(req,res){
    var postno = req.query.postno;

    var clubtitle = req.body.clubtitle, clubname = req.body.clubname, oneline = req.body.oneline, content = req.body.content,
        password = req.body.password;

    var dataset = [clubtitle, clubname, oneline, content, password, postno];

    // connection.query('update ClubFinder set club_write_title = ?, club_write_clubname = ?, club_write_1lineSum = ?, club_write_content = ?,'+
    // 'club_write_password = ? where club_write_number= ?', dataset, function(err, row){
    //   if(err){
    //     console.log(err);
    //     res.send('<script>alert("내부에 오류가 발생했습니다. 다시 시도해 주세요.");window.history.back();</script>');
    //   } else {
    //     res.send('<script>alert("수정이 완료되었습니다.");location.href="/ClubFinderView?postno='+postno+'";</script>');
    //   }
    // });

    var sql = 'update ClubFinder set club_write_title = ?, club_write_clubname = ?, club_write_1lineSum = ?, club_write_content = ?,'+
     'club_write_password = ? where club_write_number= ?';

    var isQuerySuccess = executeQuery(sql, dataset);

    if(isQuerySuccess == 1){
       res.send('<script>alert("rewriteClubFinderBoard내부에 오류가 발생했습니다. 다시 시도해 주세요.");window.history.back();</script>');
    }else{
      res.send('<script>alert("수정이 완료되었습니다.");location.href="/ClubFinderView?postno='+postno+'";</script>');    }



  })



  app.post('/saveClubFinderBoard', function(req,res){
    if(req.session.usernum ==null || req.session.userid == null){
      res.send('<script>alert("로그인 해주세요.");window.location.href="/";</script>');
    }

    var dataBoard = {
      club_write_usernum : req.session.usernum,
      club_write_name : req.session.userid,
      club_write_title : req.body.clubtitle,
      club_write_clubname : req.body.clubname,
      club_write_1lineSum : req.body.oneline,
      club_write_content : req.body.content,
      club_write_password : req.body.password
    };

    var tbName = "ClubFinder";

    var toSend = [tbName, dataBoard];

    var isQuerySuccess = saveBoard(toSend);

    //
    // if(dataBoard.club_write_title== "" || dataBoard.club_write_clubname == "" || dataBoard.club_write_1lineSum == ""
    // || dataBoard.club_write_content == "" || dataBoard.club_write_password == ""){
    //   res.send('<script>alert("비어있는 항목이 있습니다.");window.history.back();</script>');
    //   return;
    // }
    if(isQuerySuccess == 1){
       res.send('<script>alert("saveClubFinderBoard내부에 오류가 발생했습니다. 다시 시도해 주세요.");window.history.back();</script>');
    }else{
      res.redirect('/clubfinder');
    }

  });


  app.get('/ClubFinderView', function(req, res){
    var postNo = req.query.postno;
  // add view count;
    connection.query('update ClubFinder set club_write_views = club_write_views + 1 where club_write_number = ' + postNo, function(err, row){
      if(err){
        console.log(err);
        res.send('<script>alert("ClubFinderView내부에 오류가 발생했습니다. 다시 시도해 주세요.");window.history.back();</script>');
      }
    });
    connection.query('select club_write_number,club_write_usernum, club_write_title, club_write_1lineSum, club_write_clubname, club_write_name, date_format(club_write_date, "%Y-%m-%d") as club_date, club_write_views,' +
    ' club_write_content from ClubFinder where club_write_number = ?'
    , postNo, function(err, row){
      if(err){
        console.log(err);
        res.send('<script>alert("ClubFinderView 내부에 오류가 발생했습니다. 다시 시도해 주세요.");window.history.back();</script>');
      }else{
        res.render('ClubFinderView', {usernum: req.session.usernum, userid: req.session.userid, data: row});
      }
    });
  });

  app.get('/logout',function (req,res) {
    req.session.userid = null;
    req.session.usernum = null;
    res.redirect('/');
  });

  // submit sign up form
  app.post('/signUp', function(req, res) {
      var id = req.body.userid;
      var pwd = req.body.pass;
      var pwdcheck = req.body.passcheck;
      var email = req.body.email;

      if(pwd == '' || pwd != pwdcheck){
        //alert("password not match");
        res.status(500).send('비밀번호와 비밀번호 확인 칸의 값이 일치하지 않습니다.');
        return;
      }

      if(!id.match(/^[A-Za-z0-9]{6,20}$/g)|| id.match(/^[A-Za-z0-9]{6,20}$/g).length == 0){
        res.status(500).send('올바른 아이디 형식이 아닙니다.');
        return;
      }
      if(!pwd.match(/^[A-Za-z0-9]{8,20}$/g) || pwd.match(/^[A-Za-z0-9]{8,20}$/g).length == 0){
        res.status(500).send('올바른 비밀번호 형식이 아닙니다.');
        return;
      }
      var isNotMultipleId = checkIDOnSignUp(id);
      if(isNotMultipleId == 1){
        res.status(500).send('이미 존재하는 ID입니다.');
      }

      var data = [id, email, pwd];
      connection.query('insert into users (user_id, user_email, user_password) values(?,?,?)', data, function(err, result) {
          if (err) {
              console.log(err);
              res.status(500).send('내부의 오류가 발생하였습니다.');
          } else {
              var user_num;
              console.log(result);
              connection.query('select user_number from users where user_id = ?', id, function(err, result){
                if(err){
                  console.log(err);
                  res.status(500).send('내부의 오류가 발생하였습니다.');
                  return;
                }else{
                  user_num = result[0].user_number;
                }
              })
              req.session.usernum = user_num;
              req.session.userid = id;
              //req.session.userid = id;
              //res.redirect('/');
              res.send({msg:'회원가입이 완료되었습니다.'});
          }
      });
      });
      /*
      connection.query('select max(uNum) from user', function(err, rows) {
          if (err) {
              console.log(err);
          } else {
              var uNum = rows[0]['max(uNum)'] + 1;
              var data = [email, id, pwd, uNum];
              connection.query('insert into user values(?,?,?,?)', data, function(err, result) {
                  if (err) {
                      console.log(err);
                  } else {
                      console.log(result);
                  }
              });
          }
      });
      res.redirect('/signIn');
      */


  // communicate with client when ID input focus out
  app.post('/checkID', function(req, res) {
      var id = req.body.id;

      if(!id.match(/^[A-Za-z0-9]{6,20}$/g)|| id.match(/^[A-Za-z0-9]{6,20}$/g).length == 0){
        res.status(500).send('올바른 아이디 형식이 아닙니다.');
        return;
      }
      console.log('Herer!!');
      checkID(id,res);
  });

  // communicate with client when email input focus out
  /*app.post('/checkEmail', function(req, res) {
      var email = req.body.email;
      connection.query("select email from users where email ='" + email + "'", function(err, rows) {
          if (err) {
              console.log(err);
          } else {
              if (rows.length == 0) {
                  res.send({
                      'msg': "사용 가능한 E-mail입니다!",
                      "email": "true"
                  });
              } else {
                  res.send({
                      'msg': "이미 존재하는 E-mail입니다.",
                      "email": "false"
                  });
              }
          }
      });
  });
  */
  app.post('/signIn', function(req, res) {
    var id = req.body.id;
    var pwd = req.body.password;
    var datas = [id, pwd];
    connection.query("select user_number, user_id, user_password from users where user_id = ? and user_password = ?", datas, function(err, rows) {
        if(err){
          console.log(err);
        }else{
          if (rows.length == 0) {
              res.status(500).send('잘못된 회원 정보입니다.');
          } else {
              req.session.userid = id;
              req.session.usernum = rows[0].user_number;
              sess = true;
              res.send({msg:'로그인에 성공하였습니다.'});
              //res.redirect('/');
          }
        }
    });
  });

  /*app.post('/MentoringBoard', function(req, res){
    var title = req.body.title;
    var content = req.body.content;
    var password = req.body.password;
    var datas = [title, content, password];
    connection.query("insert ment_write_title, ment_write_content, ment_write_password into values (?, ?, ?);", datas, function(err, rows));

  );
  })
  */
  app.post('/MentoringBoard', function(req, res){
    var title = req.body.title;
    var content = req.body.content;
    var password = req.body.password;
    var datas = [title, content, password];
    connection.query("insert ment_write_title, ment_write_content, ment_write_password into values(?, ?, ?)",
     datas,
     function(err, rows){
       if(err){
         console.log(err);
         res.status(500).send('InvalidSQL');
       }else{
         res.send({msg:'로그인에 성공하였습니다.'});
       }
     });
  });

  app.post('/RecruitBoard', function(req, res){
    var prname = req.body.prname;
    var area = req.body.area;
    var recruits = req.body.recruits;
    var content = req.body.content;
    var password = req.body.password;
    var datas = [prname, area, recruits, content, password];
    connection.query("insert recr_write_prname, recr_write_area, recr_write_recruits, recr_write_content, recr_write_password into values(?, ?, ?, ?, ?)",
     datas,
     function(err, rows){
       if(err){
         console.log(err);
         res.status(500).send('InvalidSQL');
       }else{
         res.send({msg:'로그인에 성공하였습니다.'});
       }
     });
  });

  app.listen(3000, function() {
      console.log('server on!');
  });

  function checkID(id,res){
    connection.query("select user_id from users where user_id = ?", id, function(err, rows) {
        if (err) {
            console.log(err);
        } else {
            if (rows.length == 0) {
              res.send({msg:'사용 가능한 ID입니다.'});
            } else {
              res.status(500).send('이미 존재하는 ID입니다.');
            }
        }
    });
  }
  function checkIDOnSignUp(id){
    connection.query("select user_id from users where user_id = ?", id, function(err, rows) {
        if (err) {
            console.log(err);
        } else {
            if (rows.length == 0) {
              return 0;
            } else {
              return 1;
            }
        }
    });
  }

  function saveBoard(data){
    executeQuery('INSERT INTO ?? SET ?', data);
  }


  function executeQuery(sql, data){
    connection.query(sql, data, function(err,row){
      if(err){
        console.log(err);
        return 1;
      }else{
        return 0;
      }
    });
  }
