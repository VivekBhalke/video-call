import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import connectDb from './src/connect.js';
import userRouter from "./src/routes/user.js"
import { User } from './src/models/user.js';
import {Server} from "socket.io"
// Initialize Express
const app = express();
import { Socket } from './src/models/socket.js';

// Middleware
app.use(bodyParser.json());
app.use(cors());



// Connect to MongoDB

connectDb();

// Define routes
app.get('/', (req, res) => {
  res.send('Hello World!');
});
app.use("/user" , userRouter);

// Start the server
const PORT = 3000;

function updateUser(thisId, otherId, roomName){
  console.log( "thisId in update user is : "  , thisId);
  console.log( "otherId in update user is : "  , otherId);
  console.log( "roomName in update user is : "  , roomName);
  return new Promise(async (resolve , reject)=>{
    try {
      const updatedUser = await User.findOneAndUpdate(
        { id: thisId },
        { roomId: parseInt(roomName) },
        { new: true } // To return the updated document
      );
      console.log("updated successfully");
      resolve(true)
    } catch (error) {
      console.log("update karne mein error aa gya");
      reject(false)
    }
  })
}


const io = new Server(8000,{
    cors : true
  });
  
  io.on('connection' , (socket)=>{
    console.log("connected to the backend")
    socket.on("room:join" , ({thisId,otherId,roomName})=>{
      console.log("type of room name is : " , typeof(roomName));
      console.log("a socket did room:join call with thisId and otherId, " ,thisId ,"   ",otherId);
      console.log("the socket.id is :" , socket.id);
        fetch("http://localhost:3000/user/authenticate" , {
          method : "POST",
          headers:{
            "Content-type" : "Application/json"
          },
          body:JSON.stringify({
            user_id : otherId
          })
        }).then((response)=>{
          response.json().then(async  (data)=>{
            
            if(data.result)
            {
              
              console.log("reached here");
              await updateUser(thisId, otherId,roomName).then((response)=>{
                console.log("in the .then of the update User.");
                io.to(roomName).emit("user:joined" , {thisId , otherId , roomName, socketId : socket.id})
                socket.join(roomName);
                socket.emit("room:join" , {thisId , otherId , roomName, socketId : socket.id});
                console.log("we emmited room joined");
              }).catch((reponse)=>{
                socket.emit("error","User not found");
              }) 
            }else{
              socket.emit("error","User not found");
            }
          })
        })
        
    })
    socket.on("getSocket" , ({dummyId,socketId})=>{
      // const targetSocket = Object.values(io.sockets.sockets).find(socket => socket.id === socketId);
      // const targetSocket = io.sockets.sockets.get(socketId);
      
      const targetSocket = io.sockets.sockets.keys();
      // const targetSocket = io.of("/").sockets.get(socketId)
      // if(targetSocket){
      //   console.log(targetSocket.id);
      //   io.to(dummyId).emit("yourSocket" , {socket : targetSocket});
      // }else{
      //   console.log("you failed");
      // }
      
      
    })
    // when user:call is hit. 
    // we recieve the socket id of other user and the offer of this user , which called this 
    // user:call 
    // so we need to send this incoming offer to the other user to establish a peer rtc connnection
    // and acheive that by emiting incoming call to the other socket id ,
    // i.e io.to(to : remoteSocketId).emit("incoming:call" , {from : socket.id , offer})
    // so from the socket id which called user:call 
    // we emit to the remote socket id , that this socket.id has called you with this offer.
    // you can join.
    // now we need to process this offer in the useEffect of the room.jsx\
    // so that the other user , will get the offer of the first user.

    socket.on("user:call", ({to,offer})=>{
      //to is the remote socket id here
      io.to(to).emit("incoming:call" , {from : socket.id , offer});
    })
    io.to("vedio-call").emit("hello" ,  "Hello World") ;

    socket.on("call:accepted" , ({to,ans})=>{
      io.to(to).emit("call:accepted" , { from:socket.id , ans});
    })

    socket.on("peer:nego:needed" , ({offer , to})=>{
      io.to(to).emit("peer:nego:needed" , { from:socket.id , offer })
    })
    socket.on("peer:nego:done" , ({to , ans})=>{
      io.to(to).emit("peer:nego:final" , {from : socket.id , ans});
    })
  })



app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
