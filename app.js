const express = require("express");
const userRouter = require("./src/routers").userRouter;
const secKillRouter = require("./src/routers").secKillRouter;
const app = express();

app.use(express.json())
app.use(express.static("./dist"));
app.use((req, res, next)=>{
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "content-type");
    next();
})

app.listen(3000, ()=>{
    console.log("服务器已经启动！");
})

app.use("/user", userRouter);
app.use("/secKill", secKillRouter);


app.use((req, res, next)=>{
    res.status(404).send();
});


