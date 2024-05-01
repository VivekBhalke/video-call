import React, { useCallback, useEffect, useState } from 'react'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { userState } from '../store/user'
import { otherUserState } from '../store/otherUser';
import { useSocket } from '../Context/SocketProvider';
import { socketState } from '../store/sockets.js';
import socketClass from "../socketClass.js"
import ReactPlayer from "react-player"
import peer from '../service/peer.js';
import { useNavigate } from 'react-router-dom';
const Room = () => {
    const user = useRecoilValue(userState);
    const [otherId , setOtherId] = useState(null);
    const [remoteSocketId , setRemoteSocketId] = useState(null);
    const [myStream , setMyStream] = useState(null);
    const [remoteStream , setRemoteStream] = useState(null);
    const socket = useSocket();
    const navigate = useNavigate();
    const handleUserJoined = useCallback(({thisId , otherId , roomName, socketId})=>{
      console.log("a user joined ")
      console.log("thisId joined the room " , thisId)
      setOtherId(otherId);
      setRemoteSocketId(socketId);
    })
    
    const handleCallUser = useCallback(async ()=>{
      const stream = await navigator.mediaDevices.getUserMedia({audio : true , video : true})

      const offer = await peer.getOffer();
      // we get the offer through getOffer method to establish a rtc connection with other user.
      // now we need to send this offer to the other user.
      // to do this we call user:call through our socket to the backend server.
      // we send the data of to : (remoteSocketId ) the socket to which we need to establish the connection.,\
      // and the offer.
      socket.emit("user:call",{ to : remoteSocketId , offer});
      setMyStream(stream);
    } , [remoteSocketId , socket])
    
    const handleIncomingCall = useCallback(async ({from , offer})=>{
      // from the first user. which called the user:call , he has sent his offer and his socket.id
      // so from is the socket id of the first user . and offer is his rtc offer to 
      // establish connection
      // we will call the getAnwser function of the class , 
      // and we will pass this offer to it
      // and then it will set the remoteDescription for this(remoteSocketId) as this offer(offer from first user)
      
      console.log("incoming call " , offer);
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({audio : true , video : true})
      const ans = await peer.getAnswer(offer);
      // now we have given the incoming offer from user 1 to the user 2
      // now user 2 has set its remote description as this offer.
      // and user 2 has generated an answer for the first user in response for this offer.
      // and user 2 has set its local description as the answer for the first user
      // now we need to send this answer to the user 1 and then 
      // we need to set its remote description as the answer from the first user
      // and then the web rtc connection will be
      
      socket.emit("call:accepted" , ({to:from , ans}));
      // we send a call:accepted to the backend server so that the first user with the socketid as from , 
      // can set its remote description as the answer from the second user
      setMyStream(stream);
      
    } , [socket])

    const sendStreams = useCallback(()=>{
      for ( const track of myStream.getTracks()) {
        console.log("for loop ran");
        peer.peer.addTrack(track , myStream)
      }
    } , [myStream])

    const callAccepted = useCallback(({from , ans})=>{
      peer.setLocalDescription(ans);
      console.log("the remote description of the first user is set to the answer from the second user ");
      //he remote description of the first user is set to the answer from the second user
      console.log("call accepted");
      sendStreams();

    } , [sendStreams]);

  const handleNegoNeeded = useCallback(async()=>{
      const offer = await peer.getOffer();
      socket.emit("peer:nego:needed" , {offer , to:remoteSocketId});
  } , [remoteSocketId , socket])

  const handleNegoIncoming = useCallback(async ({from , offer})=>{
    const ans = await peer.getAnswer(offer);
    socket.emit("peer:nego:done" , {to:from , ans}) 
  } , [socket]) 

  const handleNegoFinal = useCallback(async ({ans}) =>{
    await peer.setLocalDescription(ans);
  } , [socket])

  const leaveCall = useCallback(()=>{
    fetch("http://localhost:3000/user/leaveCall" , {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          "token" : localStorage.getItem("token")
        },
        body: JSON.stringify({
          thisId : user.id,
          otherId : otherId
        })
      }).then((response)=>{
        response.json().then((data)=>{
          if(data.true)
          {
              navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                .then(function(stream) {
                // Get tracks from the stream
                const tracks = stream.getTracks();

                // Disable both video and audio tracks
                tracks.forEach(track => {
                if (track.kind === 'video') {
                // Disable video track
                track.enabled = false;
                } else if (track.kind === 'audio') {
                  // Disable audio track
                  track.enabled = false;
                }
                });
                navigate("/");
              })
            .catch(function(err) {
            console.log('Error accessing media devices: ', err);
            });
          }else{
            alert("error returning to lobby")
          }
        })
      })
  } , [])

    useEffect( ()=>{
      peer.peer.addEventListener("negotiationneeded" ,handleNegoNeeded)
      return ()=>{
        peer.peer.removeEventListener("negotiationneeded" ,handleNegoNeeded)
      }
    } , [handleNegoNeeded])

    useEffect(()=>{
      peer.peer.addEventListener('track' , async ev => {
        const remoteStream = ev.streams;
        setRemoteStream(remoteStream[0]);

      })
    } , [])


    useEffect(()=>{
      socket.on("user:joined" ,handleUserJoined )
      socket.on("incoming:call" , handleIncomingCall);
      socket.on("call:accepted" , callAccepted);
      socket.on("peer:nego:needed" , handleNegoIncoming);
      socket.on("peer:nego:final" , handleNegoFinal)
      return () =>{
        socket.off("user:joined" , handleUserJoined)
        socket.off("incoming:call" , handleIncomingCall);
        socket.off("call:accepted" , callAccepted);
        socket.off("peer:nego:needed" , handleNegoIncoming);
        socket.off("peer:nego:final" , handleNegoFinal)
      }
    } , [socket,handleUserJoined ,handleIncomingCall,callAccepted])

  return (
    <>
    <div>Room {user.id} { otherId ? otherId : "no other id "} {remoteSocketId ? remoteSocketId : "no remote socket id "} </div>
    <button onClick={handleCallUser}>Call</button>
    {
      myStream && <button onClick={sendStreams}>Send Stream</button>
    }
    {
      <>
        <h1>My stream</h1>
        {myStream && <ReactPlayer height="100px" width="300px" playing muted url={myStream}></ReactPlayer>}
      </>
    }
    {
      <>
        <h1>Remote Stream</h1>
        {remoteStream && <ReactPlayer height="100px" width="300px" playing muted url={remoteStream}></ReactPlayer>}
      </>
    }
    {
      myStream && remoteStream &&  <button onClick={leaveCall}>Leave Call </button>
    }
    </>
  )
}

export default Room



//problem is we are getting new sockets with new id's and the one which are in the room are not available here
