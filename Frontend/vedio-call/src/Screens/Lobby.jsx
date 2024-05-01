import React, { useCallback, useContext, useEffect, useState } from 'react'
import { useRecoilValue, useSetRecoilState  } from 'recoil'
import { userState } from '../store/user'
import {useSocket} from "../Context/SocketProvider"
import socketClass from "../socketClass.js"
import { useNavigate } from 'react-router-dom'
const Lobby = () => {
    const user = useRecoilValue(userState);
    const setUser = useSetRecoilState(userState);

    console.log("entered the lobby");


    const [otherId , setOtherId] = useState(0);

    const navigate = useNavigate();

    const socket = useSocket();

    





    const handleJoinRoom = useCallback((e)=>{
        e.preventDefault();
    
        
        if(otherId == user.id)
        {
            handleUseEffectFalse();
        }
        else{
            fetch("http://localhost:3000/user/roomMeinHaiKya",{
                method:"POST",
                headers : {
                    "Content-type" : "application/json",
                    "token" : localStorage.getItem("token"),
                },
                body:JSON.stringify({
                    "thisId" : user.id,
                    "otherId" : otherId,
                    
                })
            }).then((response)=>{
                response.json().then((data)=>{
                    if(data.otherRoomId)
                    {
                        //other id wala banda is in the room 
                        console.log("other id wala banda is in the room")
                        socket.emit("room:join" , {thisId : user.id , otherId:otherId ,roomName :JSON.stringify(data.otherRoomId)})
                    }else{
                        //other id wala band is not in the room
                        console.log("other id wala band is not in the room");
                        socket.emit("room:join" , {thisId : user.id , otherId:otherId ,roomName : JSON.stringify(user.id)})
                    }
                })
            })
            // console.log("emited room:join to the backend.");
            
        }
        
        
    } , [socket, user.id , otherId])


    const handleUseEffectTrue = useCallback(({thisId , otherId , roomName, socketId})=>{
        console.log("we got into the handleUseEffect True , which was trigged after socket.on('room join')")
        console.log("the this id is :" , thisId);
        console.log("the other id is :" , otherId);
        console.log("the roomName id is :" , roomName);
        console.log("the socketId is : " , socketId);
        localStorage.setItem("otherId" , otherId);
        localStorage.setItem("socketId" ,  socketId);

        const newSocket = new socketClass(socket);
        
        navigate(`/room/${roomName}`);

        
        
    } , [socket,user,otherId]);

    const handleUseEffectFalse = useCallback((data)=>{
        alert(data);
    } , [socket,user,otherId])
    useEffect(()=>{
        console.log("the useEffect of the lobby ran.");
        socket.on("room:join" , handleUseEffectTrue);
        socket.on("error" , handleUseEffectFalse)
        return () => {
            // Remove any event listeners or cleanup logic here
            socket.off('room:join', ()=>{})
            
            socket.off("error" , ()=>{})
          }
    } ,[socket , handleUseEffectTrue ,handleUseEffectFalse, user,otherId])


    return (
        <div>Lobby
            <label htmlFor="">Enter the other id : </label>
            <input type="text" onChange={(e)=>{
                
                setOtherId(parseInt(e.target.value));
               

            }}/>
            <button onClick={handleJoinRoom}>join room</button>
        </div>
    )
}

export default Lobby;