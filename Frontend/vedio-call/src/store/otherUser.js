import {atom} from "recoil"

export const otherUserState = atom({
    key : 'otherUserState' , 
    default : {
        id : 0,
        
    }
})