local userid=KEYS[1];
local prodid=KEYS[2]; 
local qtkey="secKill_"..prodid;
local usersKey="secKill_"..prodid.."_userList";
return 5;
-- local userExists=redis.call("sismember",usersKey,userid); 
-- if tonumber(userExists)==1 then 
--     return 2;  
-- end;
-- local num=redis.call("get",qtkey); 
-- if tonumber(num)<=0 then 
--     return 0; 
-- else  
--     redis.call("decr",qtkey);
--     redis.call("sadd",usersKey,userid);
-- end; 
-- return 1;