
const router = require("express").Router();
const path = require("node:path");
const jwt = require("jsonwebtoken");
const fs = require("node:fs/promises");


const auths = {};

const createAuth = ()=>{
    let res = "";
    const arr = "asdf8765ghkjlz4321xcvbnmqwertyuiop09";
    const len = arr.length;
    for(let i=0; i<4; i++){
        let rand = Math.floor(Math.random() * len);
        res += arr[rand];
    }
    return res;
}

// 过滤器，在此判断用户权限
router.use((req, res, next) => {
    next();
})

// 用户注册
router.post("/register", (req, res, next) => {
    const user = req.body;
    console.log(user, auths[user.username]);
    if (!auths[user.username] || !user.auth || auths[user.username] !== user.auth) {
        res.status(403).send({
            state: "error",
            msg: "验证码输入有误",
            data: null
        });
        return;
    }
    fs.readFile(path.resolve(__dirname, "../resource/users.json"), { encoding: "utf-8" })
        .then((buffer) => {
            const data = JSON.parse(buffer);
            return data;
        })
        .then((data) => {
            const exsit = data.users.find((e) => { e.usename === user.username });
            if (exsit) {
                res.status(403).send({
                    state: "error",
                    msg: "该用户名已存在",
                    data: null
                });
                return;
            } else {
                delete user.auth;
                data.users.push(user);
                
                fs.writeFile(path.resolve(__dirname, "../resource/users.json"), JSON.stringify(data))
                    .then(() => {
                        res.status(200).send({
                            state: "success",
                            msg: "用户注册成功",
                            data: null
                        });
                    })
                    .catch((err)=>{
                        res.status(500).send({
                            state: "error",
                            msg: "系统繁忙，请重试",
                            data: null
                        });
                    })
                return;
            }
        })
})

// 获取验证码
router.get("/getAuth", (req, res, next) => {
    const username = req.query.username;
    let auth = createAuth();
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