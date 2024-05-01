import mongoose from "mongoose";
import  {User}  from "../models/user.js";
import express from "express";
import jwt from "jsonwebtoken";
import env from "dotenv";
import verifyToken from "../middleware/tokenVerify.js";
env.config();
const SECRET = process.env.SECRET;
const router = express.Router();

router.post("/login" ,async  (req,res)=>{
    const user_id = req.body.user_id;
    const user_password = req.body.user_password;
    console.log(user_id , " " , user_password);
    if(!user_id || !user_password) return res.json({message : "no fields"})
    else{
        try {
            const result = await User.find({id : user_id});
            if(!result)
            {
                return res.json({message : "wrong user_id or password"})
            }
            else if(parseInt(result[0].password) == user_password)
            {
                
                const token =  jwt.sign(result[0].id , SECRET );
                return res.json({result : token})
            }
            else{
                return res.json({message : "wrong user_id or password"})
            }
            
        } catch (error) {
            console.log(error);
            return res.json({message : error})
        }
    }
})

router.get("/me" , verifyToken, (req,res)=>{
    const id = req.id;
    //user token is correct just send the id
    
    res.json({id : id});
})

router.post("/authenticate" , async  (req,res)=>{
    let id = 0;
    try {
        id = parseInt(req.body.user_id);
    } catch (error) {
        return res.json({result : false});
    }
    console.log(id);
    try {
        const result = await User.find({id : id});
        console.log(result);
        if(result.length == 0)
        {
            return res.json({result:false})
        }
        else{
            return res.json({result : true});
        }
    } catch (error) {
        return res.json({result : false});
    }
})
router.post("/roomMeinHaiKya" , verifyToken , async (req, res)=>{
    const thisIdString = req.body.thisId;
    const otherIdString = req.body.otherId;
    const thisId = parseInt(thisIdString);
    const otherId = parseInt(otherIdString);
    try {
        const data = await User.find({id:otherId});
        console.log(data);
        if(data[0].roomId!=-1)
        {
            console.log("room id hai");
            return res.json({otherRoomId : data[0].roomId})
        }
        else{
            console.log("room id nahi hai");
            return res.json({data : false})
        }
    } catch (error) {
        return res.json({error : "error"})
    }
})

router.post("/leaveCall" , verifyToken  , async (req, res)=>{
    const thisIdString = req.body.thisId;
    const otherIdString = req.body.otherId;
    const thisId = parseInt(thisIdString);
    const otherId = parseInt(otherIdString);
    try {
        const data =  await User.findOneAndUpdate(
            {id : thisId},
            {roomId : -1},
            { new: true }
        );
        console.log("now user " , thisId , " is out of the meeting");
        return res.json({true:true});
    } catch (error) {
        console.log(error);
        return res.json({false: false})
    }
})
export default router;