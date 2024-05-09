const router = require("express").Router()
const redis = require("../util/redisUtil");


const redisLuaScript = 
`local userid=KEYS[1];
local prodid=KEYS[2];
local qtkey='secKill_'..prodid;
local usersKey='secKill_'..prodid..'_userList';
local userExists=redis.call('sismember',usersKey,userid); 
if tonumber(userExists)==1 then 
    return 2; 
end; 
local num=redis.call('get',qtkey);
if tonumber(num)<=0 then 
    return 0; 
else 
    redis.call('decr',qtkey);
    redis.call('sadd',usersKey,userid); 
end;
return 1;`

const doSecKill = async (uid, prodId)=>{
    if (!uid || !prodId ) {
        console.log("参数有误");
        return false; 
    }
    const keyName = "secKill_" + prodId;
    let SECKILL_PROD = await redis.getValue(keyName);
    if(!SECKILL_PROD){
        console.log("商品还未上架！");
        return false;
    }
    const luaText = await redis.scriptLoad(redisLuaScript);
    const res = await redis.evalsha(luaText, 2, uid, prodId);
    switch(res){
        case 0:
            console.log("库存不足！");
            return false;  
        case 1:
            console.log("秒杀成功！");
            return true;
        case 2:
            console.log("不能重复参与秒杀！");
            return false;
    };
}

router.get("/secKillForRedis", async (req, res, next)=>{
    const uid = Math.floor(Math.random()*1000);
    const prodId = req.query.prodId;
    let result = await doSecKill(uid, prodId)
    if(result){
        res.status(200).send({
            state: "ok",
            code: 2000,
            msg: "秒杀成功",
            data: null
        });
    } else {
        res.status(200).send({
            state: "reject",
            code: 1000,
            msg: "秒杀失败",
            data: null
        });
    }
})

exports.secKillRouter = router;