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
var dbUrl = 'mongodb://123.59.57.189:20000/bypathsystem' //线上数据库

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

var sensor = {
    initialize: function() {
        console.log('温湿度传感器正在初始化.....');
        return sensorLib.initialize(11, 26);
    },
    read: function() {
        var readout = sensorLib.read();
        console.log('Temperature: ' + readout.temperature.toFixed(1) + 'C, ' + 'humidity: ' + readout.humidity.toFixed(1) + '%');
        //////////////////////////////////////
        if (readout.temperature > 5) { //筛选掉初始化值，乱值

            var recordTime = new Date();
            // 长连接模块，实时数据
            io.on('connection', function(socket) {
                console.log("新用户加入");
                socket.emit('realTimeTAndH', {
                    temperature: readout.temperature.toFixed(1),
                    date: recordTime,
                    humidity: readout.humidity.toFixed(1)
                });
            });
            ////////////存入数据库
            TempHumidityRecord.create({
                pt: readout.temperature,
                ph: readout.humidity,
                t: recordTime
            }, function(err, doc) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(recordTime + "记录成功！");
                }
            });
            ////////////////////
        } else {
            console.log(readout.temperature + '值不合法，被抛弃，不记录');
        }
        /////////// //创建结束！
        setTimeout(function() {
            sensor.read();
        }, 2000);
    },
    warning: function() {
        var readout = sensorLib.read();
        /////////////////////////////
        var UserInfo = null;
        //  查询数据库,获取用户的手机号、温度设定、进行通知
        User.find({}, function(err, doc) {
            if (err) {
                console.log(err);
            } else {
                console.log(doc);
                UserInfo = doc;
            }
        });
        for (var i in UserInfo) {
            /////////////////////////////
            if (readout.temperature > i.wt) {
                /////////////////////////////
                var warningTime = new Date();
                ////////////存入数据库
                WarningRecord.create({
                    wt: i.temperature,
                    wpn: i.upn, //报警的手机号
                    wts: i.wt, //报警温度设定
                    t: warningTime
                }, function(err, doc) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(warningTime + '\n' + i.upn + "报警记录成功！");
                    }
                });
                ////////////////////
                //  向用户发送报警短信
                // 报警通知：${type}，${time}：${location}温度为${temp}，超出限定温度${tempset}。 SMS_8135532
                var smsParams = '{"type": "温度超限警报","location": "实验室","temp":"' + readout.temperature + '","tempset":"' + i.wt + '"}';
                var phoneNum = i.upn;
                Alidayu.sendWarningMsg(smsParams, phoneNum);
                ///////////////////
                //  5分钟后再读取
                setTimeout(function() {
                    sensor.warning();
                }, 1000 * 60 * 5);

            } else {
                console.log(readout.temperature + '温度正常');
                /////////// //继续每秒读取
                setTimeout(function() {
                    sensor.warning();
                }, 1000);
            }
            ////////////////////
        }


    }
};

if (sensor.initialize()) {
    sensor.read();
} else {
    console.warn('温湿度传感器初始化失败！');
}



// /////////////////////////////////////////





// module.exports = io;
// ///////////////////////////////////////
// // 长连接模块
// io.on('connection', function(socket) {
//     console.log("新用户加入");

//     socket.emit('realTimeTAndH', { temperature: 32, date: '20160901', humidity: 23 });
// });

///////////////////////////////////////////







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
        maxAge: 1000 * 60 * 30 //过期时间设置(单位毫秒)
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
