var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var session = require('express-session');



var app = express();


var server = require('http').Server(app);
var io = require('socket.io')(server);

//启动服务器，在3000端口
server.listen(3000, function() {
    console.log('服务器启动，端口:3000;');
});



////////////////////
//数据库相关
var mongoose = require('mongoose');

// var dbUrl = 'mongodb://127.0.0.1:27017/temp' //测试数据库
var dbUrl = 'mongodb://123.59.57.189:20000/temp' //线上数据库

var db = mongoose.connection;
mongoose.connect(dbUrl)
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(callback) {
    console.log("数据库连接成功！" + dbUrl)
});

global.dbHandel = require('./database/dbHandel');
///////////////////






//用户号码和设置的温度报警都存于数据库，方便调用
// //////////////////////////////////
var sensorLib = require('node-dht-sensor');

var User = global.dbHandel.getModel('user');
var TempHumidityRecord = global.dbHandel.getModel('thr');
var WarningRecord = global.dbHandel.getModel('wr');

var MsgSendStatus = global.dbHandel.getModel('mss');

var Alidayu = require('./controller/alidayu/alidayu');






var sensor = {
    initialize: function() {
        console.log('温湿度传感器正在初始化.....');
        return sensorLib.initialize(11, 26);
    },
    read: function() {
        var readout = sensorLib.read();
        var recordTime = new Date();
        console.log('读取========[ 实时 ]=========温度: ' + readout.temperature.toFixed(1) + 'C, ' + '湿度: ' + readout.humidity.toFixed(1) + '%');
        //////////////////////////////////////
        if (readout.temperature > 5) { //筛选掉初始化值，乱值

            ///////////////////////////
            //      实时温度 存入数据库,后台也要运行
            TempHumidityRecord.create({
                pt: readout.temperature,
                ph: readout.humidity,
                t: recordTime
            }, function(err, doc) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(recordTime + "[ 实时 ]温度记录成功！");
                }
            });
            ///////////////////////////
        } else {
            console.log('实时温度读取' + readout.temperature + '摄氏值不合法，被抛弃，不记录');
        }
        ///////////
        setTimeout(function() {
            sensor.read();
        }, 1000);
        //////////
    },
    warning: function() {
        var readout = sensorLib.read();
        var recordTime = new Date();
        console.log('读取========[ 报警 ]=========温度: ' + readout.temperature.toFixed(1) + 'C, ' + '湿度: ' + readout.humidity.toFixed(1) + '%');
        var userInfo = null;
        User
            .find({})
            .exec(function(err, data) {
                if (err) {
                    console.log(err);
                }
                userInfo = data;
                console.log("用户信息更新！");
                // console.log("用户信息：" + userInfo);
                for (var i = 0; i < userInfo.length; i++) {
                    console.log("========== " + i + " ==========");
                    userdetail = userInfo[i];
                    ////////////////////////////////////////////
                    if (readout.temperature > userdetail.wt && userdetail.wl == 'true') {
                        console.log("温度超出限制，订阅报警，记录并发送报警短信给用户==========：" + userdetail.upn);


                        MsgSendStatus
                            .findOne({
                                wpn: userdetail.upn
                            }, function(err, doc) {
                                if (err) {
                                    console.log(err);
                                    console.log("[短信报警]=======用户不存在！");
                                } else if (!doc) {
                                    ////////////存入报警信息数据库
                                    WarningRecord.create({
                                        wt: readout.temperature, //报警温度
                                        wpn: userdetail.upn, //报警的手机号
                                        wts: userdetail.wt, //报警温度设定
                                        t: recordTime, //报警时间
                                        wmt: '短信推送'
                                    }, function(err, doc) {
                                        if (err) {
                                            // console.log(err);
                                            console.log("[短信报警]=======报警信息数据库保存失败！");
                                        } else {
                                            console.log("[短信报警]=======报警信息数据库保存成功！");

                                            MsgSendStatus.create({
                                                wpn: userdetail.upn,
                                                ss: "sendSucess"
                                            }, function(err, doc) {
                                                if (err) {
                                                    console.log(err);
                                                } else {
                                                    console.log("报警状态记录成功！");
                                                    //  报警状态记录
                                                    /////////////////
                                                    var smsParams = '{"type": "温度超限警报","time":"' + recordTime + '","location": "实验室","temp":"' + readout.temperature + '度","tempset":"' + userdetail.wt + '度"}';
                                                    console.log("==============给用户：" + userdetail.upn + "发送短信报警！");
                                                    // Alidayu.sendWarningMsg(smsParams, userdetail.upn);
                                                    ////////////////////
                                                }

                                            });

                                        }
                                    });
                                    //////////////
                                } else {
                                    console.log("[短信报警]=======5分钟内已经给用户发送过报警短信！");
                                }

                            });


                    } else if (readout.temperature > userdetail.wt && userdetail.wl == 'false') {
                        console.log("温度超出限制，关闭报警，记录报警信息=========：" + userdetail.upn);
                        ////////////存入报警信息数据库
                        WarningRecord.create({
                            wt: readout.temperature, //报警温度
                            wpn: userdetail.upn, //报警的手机号
                            wts: userdetail.wt, //报警温度设定
                            t: recordTime, //报警时间
                            wmt: '关闭订阅'
                        }, function(err, doc) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log("报警信息数据库保存成功！")
                            }
                        });
                        //////////////
                    } else {
                        console.log("温度正常范围内，继续报警监控");
                    }
                }
                /////////// for 遍历

            });


        ///////////
        setTimeout(function() {
            sensor.warning();
        }, 1000);
        ///////////
    }

}







if (sensor.initialize()) {

    setTimeout(function() {
        sensor.read();
        sensor.warning();
    }, 1000 * 5);

    /////////////////////
    //        长连接
    //////////////////// 
    io.on('connection', function(socket) {
        console.log("新用户加入");
        setInterval(function() {
            var readout = sensorLib.read();
            var recordTime = new Date();
            ///// 长连接模块，实时数据
            socket.emit('realTimeTAndH', {
                temperature: readout.temperature.toFixed(1),
                date: recordTime,
                humidity: readout.humidity.toFixed(1)
            });
            /////
            console.log("实时温度传输")
        }, 1000);
    });
    //////////////////
} else {
    console.warn('温湿度传感器初始化失败！');
}











// view engine setup
app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');
app.engine("html", require("ejs").__express);
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(session({
    secret: 'temp',
    cookie: {
        maxAge: 1000 * 60 * 60 //过期时间设置(单位毫秒)
    },
    resave: 'false',
    saveUninitialized: 'false'
}));




var routes = require('./routes/index');
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});



// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
