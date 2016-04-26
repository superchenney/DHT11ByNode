$(function() {

    //图表
    var dom = document.getElementById("tempTrendChart");
    var myChart = echarts.init(dom);

    function randomData() {
        now = new Date(+now + oneDay);
        value = value + Math.random() * 21 - 10;
        return {
            name: now.toString(),
            value: [
                [now.getFullYear(), now.getMonth() + 1, now.getDate()].join('-'),
                Math.round(value)
            ]
        }
    }


    var data = [];
    var now = +new Date(1997, 9, 3);
    var oneDay = 24 * 3600 * 1000;
    var value = Math.random() * 1000;
    for (var i = 0; i < 1000; i++) {
        data.push(randomData());
    }

    var option = {
        tooltip: {
            trigger: 'axis',
            formatter: function(params) {
                params = params[0];
                var date = new Date(params.name);
                return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' : ' + params.value[1];
            },
            axisPointer: {
                animation: false
            },
            textStyle: {
                color: '#feffff'
            },
            axisPointer: {
                lineStyle: {
                    color: '#feffff',
                    opacity: 0.4
                }
            }
        },
        xAxis: {
            type: 'time',
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
                show: false
            }
        },
        yAxis: {
            type: 'value',
            boundaryGap: [0, '100%'],
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
                show: false
            }

        },
        series: [{
            name: '模拟数据',
            type: 'line',
            showSymbol: false,
            hoverAnimation: false,
            data: data,
            // makePoint: {},
            // markLine: {
            //     data: [{
            //         type: 'average',
            //         name: '平均值'
            //     }]
            // }
        }],
        // splitLine: {
        //     lineStyle: {
        //         // 使用深浅的间隔色
        //         color: ['#FEFFFF', '#FEFFFF']
        //     }
        // },
        color: ['#FEFFFF', '#FEFFFF', '#FEFFFF', '#FEFFFF', '#FEFFFF']
    };

    setInterval(function() {

        for (var i = 0; i < 5; i++) {
            data.shift();
            data.push(randomData());
        }

        myChart.setOption({
            series: [{
                data: data
            }]
        });
    }, 1000);

    if (option && typeof option === "object") {
        myChart.setOption(option, true);
    }

    //自适应变化
    window.addEventListener("resize", function() {
        myChart.resize();
    });

});
