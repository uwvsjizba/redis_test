
const router = require("express").Router();
const path = require("node:path");
const jwt = require("jsonwebtoken");
const fs = require("node:fs/promises");
const connection = require("../util/mysqlUtil");
const redis = require("../util/redisUtil");
const auths = {};

const createVaildateCode = (length)=>{
    let res = "";
    const arr = "8765432109";
    const len = arr.length;
    for(let i=0; i<length; i++){
        let rand = Math.floor(Math.random() * len);
        res += arr[rand];
    }
    return res;
}

// 过滤器，在此判断用户权限
router.use((req, res, next) => {
    next();
})

router.get("/getCode", (req, res, next)=>{
    const {phone} = req.query;
    const key = phone;

    // 获取验证码之前判断 redis 是否有记录
    redis.getHValue(key).then(data=>{
        if(!data) {
            // 没有记录，就创建记录并发送验证码
            try {
                const obj = {
                    phone,
                    count: 1, // 记录获取验证码的次数
                    datetime: new Date(), // 记录当前获取验证码的时间
                    createtime: new Date() // 记录第一次获取验证码的时间
                }
                redis.setValue(key, obj);
                let code = createVaildateCode(6); // 六位数字验证码
                // 响应信息
                res.status(200).send({
                    state: "success",
                    msg: "验证码已发送",
                    data: {
                        code
                    }
                });
            } catch(err) {
                console.log(err);
            }
            return ;
        }
        // 有记录，就获取当前时间与第一次获取验证码的时间
        let now = Date.now();
        let firsttime = new Date(data?.createtime).getTime();
        console.log(+data.count);
        if(+data.count >= 3 && (now - firsttime) < 24*60*60*1000) {
            // 如果当天获取次数超过三次则响应错误信息
            res.status(403).send({
                state: "error",
                msg: "每天最多获取三次验证码",
                data: null
            });
            return ;
        } else if((now - firsttime) >= 24*60*60*1000){
            // 如果时长超过一天，就将次数赋值为 0
            data.count = 0;
        }
        // 再次获取当前时间
        now = Date.now();
        let pretime = new Date(data.datetime).getTime();
        if(now - pretime < 2*60*1000){
            // 如果获取验证码间隔小于 2 分钟，则响应错误信息
            res.status(403).send({
                state: "error",
                msg: `请在 ${parseInt(((pretime +2*60*1000) - now)/1000)} 秒后重试 `,
                data: null
            })
            return ;
        } 
        创建六位数字验证码
        let code = createVaildateCode(6);
        redis.setValue(key, {
            phone,
            count: +data.count + 1,
            datetime: new Date(),
            createtime: data.count === 0? new Date(): data.createtime
        })
        // 响应验证码
        res.status(200).send({
            state: "success",
            msg: "验证码已发送",
            data: {
                code
            }
        });
        return ;
    })
})

// 用户注册
router.post("/register", (req, res, next) => {
    const user = req.body;
 
    if (!auths[user.username] || !user.auth || auths[user.username] !== user.auth) {
        res.status(403).send({
            state: "error",
            msg: "验证码输入有误",
            data: null
        });
        return;
    }
    connection.query("select * from user where user_id = " + user.username + ";",(err, data)=>{
        if(err) {
            res.status(403).send({
                state: "error",
                msg: "服务器繁忙，请重试",
                data: null
            });
            return ;
        } else {
            connection.query(`insert into user(user_id, username, password, nickname, gender) 
            values(null, ${user.username}, ${user.pwd}, '李四', 'M')`, (error, count)=>{
                if(error){
                    res.status(403).send({
                        state: "error",
                        msg: "服务器繁忙，请重试",
                        data: null
                    });
                    return ;
                } else {
                    res.status(200).send({
                        state: "success",
                        msg: "注册成功",
                        data: null
                    });
                    return ;
                }
                
            });
        }
    })
})

// 获取验证码
router.get("/getAuth", (req, res, next) => {
    const username = req.query.username;
    let auth = createVaildateCode(6);
    auths[username] = auth;
    res.status(200).send({
        state: "success",
        msg: "验证码已发送",
        data: {
            auth
        }
    });
})


exports.userrouter = router;