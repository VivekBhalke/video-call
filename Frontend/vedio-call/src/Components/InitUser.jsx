import React, { useEffect } from 'react'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { userState } from '../store/user'
import LoginSignup from './LoginSignup';
import Outlet from '../Outlet';
import { otherUserState } from '../store/otherUser';
import { socketState } from '../store/sockets';
import { SocketProvider } from '../Context/SocketProvider';
const InitUser = () => {
  const user = useRecoilValue(userState);
  const setUser = useSetRecoilState(userState);


  const otherUser = useRecoilValue(otherUserState)
  const setOtherUser = useSetRecoilState(otherUserState)

  const thisSocket = useRecoilValue(socketState);
  const setThisSocket = useSetRecoilState(socketState)


  useEffect(()=>{
    
    fetch("http://localhost:3000/user/me" , {
        method:"GET",
        headers:{
          "Content-Type":"application/json",
          "token" : localStorage.getItem("token")
        },
      }).then((response)=>{
        response.json().then((data)=>{
            if(data.id)
            {
                if(localStorage.getItem("socketId"))
                {
                  setThisSocket({id : localStorage.getItem("socketId")})
                }else{
                  setThisSocket({});
                }
                if(localStorage.getItem("otherId"))
                {
                  setOtherUser({id : localStorage.getItem("otherId")})
                }else{
                  setOtherUser({id:0})
                }
                

                setUser({id : data.id , loggedIn : true});
                 
            }else{
                setUser({id : 0 , loggedIn : false});
            }
        })
      })
    },[])
    
  return (
    user.loggedIn ? <SocketProvider><Outlet /></SocketProvider> : <LoginSignup />
    
  )
}

export default InitUser