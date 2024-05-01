import React, { useEffect, useState } from 'react'
import { userState } from '../store/user'
import { useRecoilValue, useSetRecoilState } from 'recoil';
const LoginSignup = () => {
  const [id , setId ] = useState(0);
  const [password , setPassword] = useState('');
  const user = useRecoilValue(userState);
  const setUser = useSetRecoilState(userState);

  async function handleClick(e){
    e.preventDefault();
    fetch("http://localhost:3000/user/login" , {
        method : "POST" , 
        headers : {
            "Content-type" : "Application/json"
        },
        body:JSON.stringify({
            user_id : id,
            user_password : password
        })
    }).then((response)=>{
        console.log("response got");
        response.json().then((data)=>{
            if(data.result)
            {
                // console.log("correct creadentials");
                // console.log("logged in ");
                localStorage.setItem("token" , data.result);
                setUser({id : id , loggedIn: true});
                // window.location = "/"
            }
            else{
                alert("wrong credentials")
            }
        })
    })
  }
  return (
    <form action="">
        <label>Enter the id</label>
        <input type="text" onChange={(e)=>{
            setId(parseInt(e.target.value));
        }} />
        <label>Enter the password</label>
        <input type="text" onChange={(e)=>{
            setPassword(e.target.value)
        }} />
       <button onClick={handleClick}>LoginIn</button>
    </form>
  )
}

export default LoginSignup