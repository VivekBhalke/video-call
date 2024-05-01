import env from "dotenv"
import jwt from "jsonwebtoken"
env.config();
const SECRET = process.env.SECRET;
export default async function verifyToken(req, res ,next){
    const token = req.headers.token;
    if(token)
    {
        console.log("token is not undefined");
        try {
            const result = await jwt.verify(token,SECRET);
            console.log("token found id is available");
            req.id = result;
            console.log(result);
            next();
        } catch (error) {
            console.log("error token not found");
            return res.json({message : "wrong token"})
        }

    }else{
        console.log("token is undefined");
        res.json({message : "provide a token"})
    }
}