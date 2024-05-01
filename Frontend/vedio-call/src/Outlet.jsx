import React from 'react'
import {Routes , Route} from "react-router-dom"
import Lobby from './Screens/Lobby'
import Room from './Screens/Room'
import { SocketProvider } from './Context/SocketProvider'
const Outlet = () => {
  return (
    <>
      <Routes>
      <Route path='/' element={<Lobby/>}></Route>
        <Route path='/room/:roomName' element={<Room/>}></Route>
      </Routes>
    </>
  )
}

export default Outlet