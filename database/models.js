module.exports = {
    /////////////////////////////////////////////////////////////
    // 用户信息
    user: {
        // 电话号码 UserPhoneNum
        upn: {
            type: String,
            required: true,
            unique: true
        },
        //密码 Password
        pwd: {
            type: String,
            required: true
        },
        //用户角色 UserRole
        ur: {
            type: String,
            required: true,
            default: 'norm'
        },
        //订阅预警 WarningLock
        wl: {
            type: String,
            required: true,
            default: 'true'

        },
        //预警温度 WarningTemp
        wt: {
            type: Number,
            required: true,
            default: '27'
        },
        //账号创建时间 UserCreateTime
        uct: {
            type: Date,
            required: true,
            default: Date.now()
        }
    },
    /////////////////////////////////////////////////////////////
    //验证码信息 UserConfirmCode
    ucc: {
        // 电话号码 UserPhoneNum
        upn: {
            type: String,
            required: true,
            unique: true
        },
        //验证码 ConfirmCode
        cc: {
            type: String,
            required: true
        },
        //创建日期 CreateTime
        ct: {
            type: Date,
            required: true,
            default: Date.now()
        }
    },
    /////////////////////////////////////////////////////////////
    // 温湿度数据 TempHumidityRecord
    thr: {
        //传感器地点 SensorLocation
        sl: {
            type: String,
            default: "实验室"
        },
        //记录时间 PonitTime
        t: {
            type: Date,
            default: Date.now(),
            required: true
        },
        //温度信息 PonitTemperature
        pt: {
            type: Number,
            required: true
        },
        //湿度信息 PonitHumidity
        ph: {
            type: Number,
            required: true
        }
    },
    /////////////////////////////////////////////////////////////
    // 报警记录 WarningRecord
    wr: {
        //报警时间 WarningTime
        t: {
            type: Date,
            default: Date.now(),
            required: true
        },
        //报警手机号 WarningPhoneNum
        wpn: {
            type: String,
            required: true
        },
        //报警温度 WarningTemp
        wt: {
            type: Number,
            required: true
        },
        //报警设定温度 WarningTempSet
        wts: {
            type: Number,
            required: true
        },
        //报警类型 WarningMsgType
        wmt: {
            type: String,
            required: true,
            default: 'msg'
        }
        //报警状态 WarningMsgStatus
        // wms: {
        //     type: Boolean
        // }
    },
    ///////////////////////////////////////////////////
    //         短信报警发送记录 MsgSendStatus
    mss: {
        //报警手机号 WarningPhoneNum
        wpn: {
            type: String,
            required: true,
            unique: true
        },
        //推送状态 SendStatus
        ss: {
            type: String,
            require: true
        },
        createdAt: {
            type: Date,
            default: Date.now(),
            required: true
        }

    }
};
