TopClient = require('./topClient').TopClient;

var client = new TopClient({
    'appkey': '23349731',
    'appsecret': '73a6b17a12a10ba68cea010f6a906868',
    'REST_URL': 'http://gw.api.taobao.com/router/rest'
});



// 群发短信需传入多个号码，以英文逗号分隔，一次调用最多传入200个号码。示例：18600000000,13911111111,13322222222

// *模板内容:
// 报警通知：${type}，${time}：${location}温度为${temp}，超出限定温度${tempset}。 SMS_8135532
exports.sendWarningMsg = function(smsParams, phoneNum) {
    client.execute('alibaba.aliqin.fc.sms.num.send', {
        // 'extend': '123456',
        'sms_type': 'normal',
        'sms_free_sign_name': '温度实时监测报警',
        // 'sms_param': '{"type":"高温预警",time":"2016.04.20","location":"实验室","temp":"25.C","tempset":"32.C"}',
        'sms_param': smsParams,
        'rec_num': phoneNum,
        'sms_template_code': 'SMS_8135532'
    }, function(error, response) {
        if (!error) console.log("短信报警发送成功！" + response);
        else console.log("短信报警发送失败！" + error);
    })
    console.log("请求短信发送报警成功！");

};


// *模板内容:
// 验证码${code}，您正在注册成为${product}用户，感谢您的支持！
exports.sendRegisterCode = function(smsParams, phoneNum) {
    client.execute('alibaba.aliqin.fc.sms.num.send', {
        // 'extend': '123456',
        'sms_type': 'normal',
        'sms_free_sign_name': '注册验证',
        // 'sms_param': '{"code":registCode",product":"温度实时监测报警系统"}',
        // 'rec_num': '13568821053',
        'sms_param': smsParams,
        'rec_num': phoneNum,
        'sms_template_code': 'SMS_4900543'
    }, function(error, response) {
        if (!error) console.log("注册验证码发送成功！" + response);
        else console.log("注册验证码发送失败！" + error);
    })
};

//查询短信发送记录
exports.queryTextSend = function(smsParams, phoneNum) {
    client.execute('alibaba.aliqin.fc.sms.num.query', {
        // 'biz_id': '1234^1234',//短信发送流水
        'rec_num': phoneNum, //短信接收号码
        'query_date': '20151215', //短信发送日期，支持近30天记录查询，格式yyyyMMdd
        'current_page': '1',
        'page_size': '50' //分页参数，每页数量。最大值50
    }, function(error, response) {
        if (!error) console.log("注册验证码发送成功！" + response);
        else console.log("注册验证码发送失败！" + error);
    })
};
