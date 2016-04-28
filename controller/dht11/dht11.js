var sensorLib = require('node-dht-sensor');

var TempHumidityRecord = global.dbHandel.getModel('thr');


var sensor = {
    initialize: function(type, gpio) {
        console.log('温湿度传感器正在初始化.....');
        return sensorLib.initialize(11, 26);
        // return sensorLib.initialize(type, gpio);
    },
    read: function() {
        var readout = sensorLib.read();
        console.log('Temperature: ' + readout.temperature.toFixed(1) + 'C, ' + 'humidity: ' + readout.humidity.toFixed(1) + '%');

        // return readout;放入index中处理
        ////////////存入数据库
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
        /////////// //创建结束！
        setTimeout(function() {
            sensor.read();
        }, 2000);
    }
};

// if (sensor.initialize()) {
//     sensor.read();
//     // 1. 倒计定时器： timename = setTimeout("function();", delaytime);
//     // 2. 循环定时器： timename = setInterval("function();", delaytime);
// } else {
//     console.warn('温湿度传感器初始化失败！');
// }



module.exports = sensor;
