var express = require('express');
var router = express.Router();

var Alidayu = require('../controller/alidayu/alidayu');


var User = global.dbHandel.getModel('user');
var UserConfirmCode = global.dbHandel.getModel('ucc');
var TempHumidityRecord = global.dbHandel.getModel('thr');
var WarningRecord = global.dbHandel.getModel('wr');


router.get('/', function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.render('index', { title: '首页' });
});


router.get('/login', function(req, res, next) {
    res.render('login');
});




router.get('/setting', function(req, res, next) {
    if (req.session.user) {
        res.render('setting');
    } else {
        res.redirect('/');
    }
});



router.get('/warningRecord', function(req, res, next) {

    if (req.session.user) {

        WarningRecord
            .find({
                'wpn': req.session.user.upn
            })
            .sort('-t')
            .exec(function(err, doc) {
                if (err) {
                    console.log("数据库查询历史报警信息出错！" + err);
                } else {
                    // console.log('记录 item : ' + doc);
                    res.render("warningRecord", {
                        title: '历史记录',
                        item: doc
                    });
                };
            });
            
    } else {
        res.redirect('/');
    }

});




// router.get('/warningRecord', function(req, res, next) {

//     WarningRecord.find({}, function(err, doc) {
//         if (err) {
//             console.log(err);
//         } else {
//             res.send(doc);
//         }
//     });

// });




router.post('/setting', function(req, res, next) {
    User.findOne({
        upn: req.session.user.upn
    }, function(err, doc) {
        if (err) {
            res.send(500);
            console.log(err);
        } else if (!doc) {
            // req.session.error = '用户不存在';
            res.send(404);
            console.log("用户" + req.session.user.upn + "不存在");
        } else {
            User.update({
                upn: req.session.user.upn
            }, {
                $set: {
                    wt: req.body.userTempSet,
                    wl: req.body.userTempLock
                }
            }, function(err, doc) {
                if (err) {
                    console.log(err);
                    res.send(500);
                } else {
                    console.log("用户设置更新");
                    // req.session.user = doc;//session同时更新
                    req.session.user.wt = req.body.userTempSet;
                    req.session.user.wl = req.body.userTempLock;
                    res.redirect('/');
                }
            });
        }
    });
});








router.get('/getUserInofo', function(req, res, next) {
    if (req.session.user) {
        var User = {
            PhoneNum: req.session.user.upn,
            UserRole: req.session.user.ur,
            WarningLock: req.session.user.wl,
            WarningTemp: req.session.user.wt,
            UserCreateTime: req.session.user.uct
        }
        res.send(User);
    } else {
        res.send('error');
    }
});



//获取所有温湿度信息，构建图表
router.get('/getAllTempAndHumityInofo', function(req, res, next) {

    TempHumidityRecord
        .find({})
        .sort('-t')
        .limit(50)
        .sort('t')
        .exec(function(err, docs) {
            if (err) {
                console.log('查询历史温湿度数据错误！' + err);
            } else {
                res.send(docs);
            }
        })
});







router.post('/login', function(req, res, next) {
    User.findOne({
        upn: req.body.loginphoneNum
    }, function(err, doc) {
        if (err) {
            res.send(500);
            console.log(err);
        } else if (!doc) {
            req.session.error = '手机号未注册';
            // res.send('手机号未注册');
            res.redirect("/");
            console.log("用户" + req.body.loginphoneNum + "不存在");
        } else {
            if (doc.pwd != req.body.loginPwd) {
                req.session.error = "密码输入错误";
                // res.send(404);
                // res.sendStatus(500);
                // res.send('密码输入错误');
                res.redirect("/");
                console.log(req.body.loginphoneNum + "密码错误");
            } else {
                // console.log("doc：" + doc);
                req.session.user = doc;
                // req.session.success = '登录成功！';
                // DataBaseOperate.LoginInfoRecord(req, res);
                // res.sendStatus(200);
                res.redirect("/");

            };
        };
    });
    //////////////////////
});




router.post('/regist', function(req, res, next) {
    // console.log(req.body);
    // { registPhoneNum: '13568821053',
    //   registCode: '7879',
    //   registPwd: 'chenchao',
    //   registPwdConfirm: 'chenchao' }

    // 先对验证码进行验证
    UserConfirmCode.findOne({
        upn: req.body.registPhoneNum
    }, function(err, doc) {
        if (err) {
            res.send(500);
            console.log(err);
        } else if (doc) {
            // req.session.error = '手机号码已存在！';
            var reqCode = req.body.registCode;
            var oldCode = doc.cc;

            if (reqCode == oldCode) {
                console.log('验证码一致');
                //创建用户信息,验证成功
                User.create({
                    upn: req.body.registPhoneNum,
                    pwd: req.body.registPwdConfirm,
                }, function(err, doc) {
                    if (err) {
                        // req.session.error = '创建失败！';
                        res.sendStatus(500);
                        console.log(err);
                    } else {
                        // req.session.success = '用户创建成功，请登录！';
                        req.session.user = doc;
                        res.redirect("/setting");
                        console.log("用户创建成功！")
                    }
                }); //创建结束！
            } else {
                // console.log('验证码不一致');
                res.send(500);
            }

        } else {
            // 请先获取验证码
            res.send(500);
        }
    });

});

router.post('/getRegistCode', function(req, res, next) {

    var pNum = req.body.phoneNum;
    //  生成随机数
    var registCode = creatRegistCode();
    ///////////////////////
    //  存入数据库
    UserConfirmCode.findOne({
        upn: pNum
    }, function(err, doc) {
        if (err) {
            res.send(500);
            console.log(err);
        } else if (doc) {
            ////////
            UserConfirmCode.update({
                upn: pNum
            }, {
                $set: {
                    cc: registCode
                }
            }, function(err, doc) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("手机号码存在,验证码更新");
                    res.sendStatus(200);
                }
            });
            ////////////
        } else {
            //创建新用户验证码信息
            UserConfirmCode.create({
                upn: pNum,
                cc: registCode
            }, function(err, doc) {
                if (err) {
                    res.sendStatus(500);
                    console.log(err);
                } else {
                    console.log("验证码创建成功！")
                        ////////短信发送
                    var sendRegistParam = '{"code": "' + registCode + '","product": "温度实时监测报警系统"}'
                    Alidayu.sendRegisterCode(sendRegistParam, pNum);
                    res.sendStatus(200);
                }
            }); //创建结束！

        }
    });
    ///////////////////////////////
    function creatRegistCode() {
        var code = null;
        do
            code = Math.floor(Math.random() * 10000);
        while (code < 1000)
        // console.log(code);
        return code;
    }

});




module.exports = router;
