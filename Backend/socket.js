import {Server} from "socket.io"

const io = new Server(8000,{
    cors : true
  });
  
  io.on('connection' , (socket)=>{
    console.log(`socket connected with id  : ${socket.id}`  )
    socket.on("room:join" , ({thisId,otherId,roomName})=>{
        console.log(`${thisId} , ${otherId} , ${roomName}`);
    })
  })