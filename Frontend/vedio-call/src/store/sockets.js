import {atom} from "recoil"
import { useSocket } from "../Context/SocketProvider"

export const socketState = atom({
    key : 'socketState' , 
    default : {
        id : ''
    }
})