//////////////////////////////
//          图表
/////////////////////////////
//图表
var echartsDataxAxis = []
var echartsDatatemp = [];
var echartsDatahumity = [];

var myChart = echarts.init(document.getElementById('tempTrendChart'));
myChart.showLoading();
// 指定图表的配置项和数据
var option = {
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            animation: false
        }
    },
    legend: {
        data: ['温度', '湿度'],
        textStyle: {
            color: '#feffff'
        }
    },
    xAxis: {
        splitLine: {
            show: false
        },
        axisTick: {
            show: false,
            lineStyle: {
                color: '#feffff'
            }
        },
        axisLabel: {
            // show: false,
            textStyle: {
                color: '#feffff'
            }
        },
        axisLine: {
            show: true,
            lineStyle: {
                color: '#feffff'
            }
        },
        data: echartsDataxAxis
    },
    yAxis: {
        type: 'value',
        splitLine: {
            show: false
        },
        axisTick: {
            show: false,
            lineStyle: {
                color: '#feffff'
            }
        },
        axisLabel: {
            // show: false,
            textStyle: {
                color: '#feffff'
            }
        },
        axisLine: {
            show: true,
            lineStyle: {
                color: '#feffff'
            }
        }

    },
    series: [{
        name: '温度',
        type: 'line',
        showSymbol: false,
        hoverAnimation: false,
        data: echartsDatatemp,
        markPonit: {
            data: [{
                name: '最大值',
                type: 'max'
            }, {
                name: '最小值',
                type: 'min'
            }]
        },
        markLine: {
            data: [{
                name: '平均线',
                // 支持 'average', 'min', 'max'
                type: 'average'
            }]
        }
    }, {
        name: '湿度',
        type: 'line',
        showSymbol: false,
        hoverAnimation: false,
        data: echartsDatahumity
    }],
    // splitLine: {
    //     lineStyle: {
    //         // 使用深浅的间隔色
    //         color: ['#FEFFFF', '#FEFFFF']
    //     }
    // },
    color: ['#FEFFFF']
};


// 使用刚指定的配置项和数据显示图表。
myChart.setOption(option);

// 异步加载数据
$.ajax({
    url: '/getAllTempAndHumityInofo',
    type: 'get',
    error: function() {
        console.log('获取历史温湿度数据出错！');
    },
    success: function(data) {
        console.log('获取历史温湿度数据成功！');
        for (var i = 0; i < data.length; i++) {
            echartsDataxAxis.push(data[i].t.slice(-8));
            echartsDatatemp.push(data[i].pt);
            echartsDatahumity.push(data[i].ph);
        }
        myChart.hideLoading();
        // console.log('［echart］时间' + echartsDataxAxis);
        // console.log('［echart］温度' + echartsDatatemp);
        // console.log('［echart］湿度' + echartsDatahumity);

        ////// 填入数据
        myChart.setOption({
            xAxis: {
                data: echartsDataxAxis
            },
            series: [{
                name: '温度',
                type: 'line',
                showSymbol: false,
                hoverAnimation: false,
                data: echartsDatatemp
            }, {
                name: '湿度',
                type: 'line',
                showSymbol: false,
                hoverAnimation: false,
                data: echartsDatahumity
            }]
        });
        //////////////////


    }
});





//自适应变化
window.addEventListener("resize", function() {
    myChart.resize();
});



////////////////////////////////////////////////
//判断是否登陆，获取用户信息
var UserInfo = {}

$.ajax({
    url: '/getUserInofo',
    type: 'get',
    error: function() {
        console.log('获取用户信息出错！');
    },
    success: function(data) {
        // console.log(data);
        if (data == 'error') {
            console.log('用户没有登录');
            // $("#tableWarningTempSet").text('登陆后查看');
            $("#ModelSelected").text('自动模式');
        } else {
            UserInfo = data;
            console.log('用户信息：' + UserInfo);
            console.log('用户' + UserInfo.PhoneNum + '已经登录');

            if (UserInfo.WarningLock == 'true') {
                $("#ModelSelected").text('监控模式');
            } else {
                $("#ModelSelected").text('自动模式');
            }

            if (UserInfo.WarningTemp) {
                $("#tableWarningTempSet").text(UserInfo.WarningTemp);

                $('#loginPopBtn').removeClass('am-icon-user');
                $('#loginPopBtn').addClass('am-icon-get-pocket');
                $('#warningHistory').css("display", "block");

            } else {
                $('#loginPopBtn').removeClass('am-icon-get-pocket');
                $('#loginPopBtn').addClass('am-icon-user');
                $('#warningHistory').css("display", "none");
            }


        }
    }
});



///////////////////////////////////////////////////////////////
//长连接socket.io
var socket = io.connect('http://chenchao.ngrok.natapp.cn');

socket.on('realTimeTAndH', function(data) {

    console.log(data);

    // date:"2016-05-05T11:54:51.180Z"
    // humidity:"47.0"
    // temperature:"27.0"

    echartsDataxAxis.shift();
    echartsDatatemp.shift();
    echartsDatahumity.shift();

    echartsDataxAxis.push(data.date.slice(-8));
    echartsDatatemp.push(data.temperature);
    echartsDatahumity.push(data.humidity);

    myChart.hideLoading();

    // // 填入数据
    myChart.setOption({
        xAxis: {
            data: echartsDataxAxis
        },
        series: [{
            name: '温度',
            type: 'line',
            showSymbol: false,
            hoverAnimation: false,
            data: echartsDatatemp
        }, {
            name: '湿度',
            type: 'line',
            showSymbol: false,
            hoverAnimation: false,
            data: echartsDatahumity
        }]
    });
    //////////////////


    document.getElementById("realTimeCirleTemp").innerHTML = data.temperature;
    document.getElementById("tableRtTemp").innerHTML = data.temperature;
    document.getElementById("tableRtHumd").innerHTML = data.humidity;


    //body背景颜色改变 
    if (UserInfo.WarningTemp && data.temperature >= UserInfo.WarningTemp) {

        $("body").removeClass("bkg-norm");
        $("body").addClass("bkg-warning");
    } else {
        $("body").removeClass("bkg-warning");
        $("body").addClass("bkg-norm");
    }



});



//////////////////////////////////////////////////////////////

$(".phone-login").show();
$(".phone-signup").hide();

// 验证码模块
$("#getRegistCode").click(function() {

    var phoneNum = $('#registPhoneNum').val();

    function checkMobile(str) {
        var re = /^1((3|5|8){1}\d{1}|70)\d{8}$/
        if (re.test(str)) {
            return true;
        } else {
            return false;
        }
    }

    if (checkMobile(phoneNum)) {
        $.ajax({
            url: '/getRegistCode',
            type: 'post',
            data: {
                'phoneNum': phoneNum
            },
            error: function() {
                alert('error');
            },
            success: function(data) {
                $("#getRegistCode").text('已发送！');
                $("#getRegistCode").addClass('am-disabled');
            }
        });
    }
});

//////////////////////////////////////
//          登陆注册表单验证
//////////////////////////////////////
$("#signup-box-link").click(function() {
    $(".phone-login").fadeOut(100);
    $(".phone-signup").delay(100).fadeIn(100);
    $("#login-box-link").removeClass("active");
    $("#signup-box-link").addClass("active");
});

$("#login-box-link").click(function() {
    $(".phone-login").delay(100).fadeIn(100);;
    $(".phone-signup").fadeOut(100);
    $("#login-box-link").addClass("active");
    $("#signup-box-link").removeClass("active");
});
/////////////////////////////////
////        表单验证
/////////////////////////////////
$('#loginPannel').validator({
    onValid: function(validity) {
        $(validity.field).closest('.u-form-group').find('.am-alert').hide();
    },
    onInValid: function(validity) {
        var $field = $(validity.field);
        var $group = $field.closest('.u-form-group');
        var $alert = $group.find('.am-alert');
        // 使用自定义的提示信息 或 插件内置的提示信息
        var msg = $field.data('validationMessage') || this.getValidationMessage(validity);
        if (!$alert.length) {
            $alert = $('<div class="am-alert am-alert-danger" style="width: 90%;max-width: 300px;margin:5px auto;font-size:12px;line-height:12px;padding:7px;"></div>').hide().
            appendTo($group);
        }
        $alert.html(msg).show();
    }
});

$('#registPannel').validator({
    onValid: function(validity) {
        $(validity.field).closest('.u-form-group').find('.am-alert').hide();
    },
    onInValid: function(validity) {
        var $field = $(validity.field);
        var $group = $field.closest('.u-form-group');
        var $alert = $group.find('.am-alert');
        // 使用自定义的提示信息 或 插件内置的提示信息
        var msg = $field.data('validationMessage') || this.getValidationMessage(validity);
        if (!$alert.length) {
            $alert = $('<div class="am-alert am-alert-danger" style="width: 90%;max-width: 300px;margin:5px auto;font-size:12px;line-height:12px;padding:7px;"></div>').hide().
            appendTo($group);
        }
        $alert.html(msg).show();
    }
});


/////////////////////////
//          登陆注册弹框
/////////////////////////
var $modal = $('#loginModel');


$('#loginModel').on('open.modal.amui', function() {
    console.log('弹窗打开');
    $('#tempBackPannel').css("visibility", "hidden");
});

$('#loginModel').on('close.modal.amui', function() {
    console.log('弹窗关闭');
    $('#tempBackPannel').css("visibility", "visible");
});



$('#loginPopBtn').on('click', function(e) {

    var $target = $(e.target);

    if (UserInfo.PhoneNum) {
        location.href = '/setting';

    } else {

        if (($target).hasClass('js-modal-open')) {
            $modal.modal();
            $("#getRegistCode").removeClass('am-disabled');
            $("#getRegistCode").text('获取验证码');
        }
    }
});
/////////////////////////////////
