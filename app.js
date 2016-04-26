var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var session = require('express-session');


var app = express();



////////////////////
//数据库相关
var mongoose = require('mongoose');

var dbUrl = 'mongodb://localhost:27017/temp' //测试数据库
    // var dbUrl = 'mongodb://123.59.61.62:20000/bypathsystem' //线上数据库

var db = mongoose.connection;
mongoose.connect(dbUrl)
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(callback) {
    console.log("数据库连接成功！" + dbUrl)
});
global.dbHandel = require('./database/dbHandel');
///////////////////





/////////
//DHT11 模块
// var DHT11 = require('./controller/dht11/dht11');
// var Alidayu = require('./controller/alidayu/alidayu');

// if (DHT11.initialize()) {
//     DHT11.read();
//     DHT11.warning();
//     // 1. 倒计定时器： timename = setTimeout("function();", delaytime);
//     // 2. 循环定时器： timename = setInterval("function();", delaytime);
// } else {
//     console.warn('温湿度传感器初始化失败！');
// }


//用户号码和设置的温度报警都存于数据库，方便调用
////////////////////////////////////
var sensorLib = require('node-dht-sensor');
var TempHumidityRecord = global.dbHandel.getModel('thr');

var sensor = {
    initialize: function() {
        console.log('温湿度传感器正在初始化.....');
        return sensorLib.initialize(11, 26);
    },
    read: function() {
        var readout = sensorLib.read();
        console.log('Temperature: ' + readout.temperature.toFixed(1) + 'C, ' + 'humidity: ' + readout.humidity.toFixed(1) + '%');
        // return readout;放入index中处理
        ////////////存入数据库
        if (readout.temperature > 10) {
            TempHumidityRecord.create({
                pt: readout.temperature,
                ph: readout.humidity
            }, function(err, doc) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("记录成功！");
                }
            });
        } else {
            console.log(readout.temperature + '值不合法，被抛弃，不记录');
        }
        /////////// //创建结束！
        setTimeout(function() {
            sensor.read();
        }, 2000);
        //////////////报警
        setInterval(function() {
            if (readout.temperature > 27) {
                console.log('warning');
            }
        }, 1000 * 60 * 5);
    }
};


///////////////////////////////////////
// 长连接模块

var server = require('http').Server(app);
var io = require('socket.io')(server);

//启动服务器，在3000端口
server.listen(3000, function() {
    console.log('服务器启动，端口3000;');
});


io.on('connection', function(socket) {
    console.log("新用户加入");
    // setInterval(function() {
    //     socket.emit('realTimeTAndH', { temperature: 32, date: new Date(), humidity: 23 });
    // }, 1000);
    socket.emit('realTimeTAndH', { temperature: 32, date: '20160901', humidity: 23 });
});






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
