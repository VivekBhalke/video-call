class PeerService{
    constructor(){
        if(!this.peer)
        {
            // the object of the in built classin javascript RTC peer connection 
            // has all the things needed to connect with anoter browser online.
            // we need to pass the ice servers to get the object back.
            // the urls of the ice servers . are 
            // stun urls : the first one down below is the stun provided by google .
            // which is used to have an ice server thingi.
            // the other is provided by twilio which does the same thing.
            this.peer = new RTCPeerConnection({
                iceServers : [{
                    urls: [
                        "stun:stun.l.google.com:19302",
                        "stun:global.stun.twilio.com:3478",
                      ],
                }]
            })
        }
    }
    async getAnswer(offer){
        if(this.peer){
            // when one end of the peer connection receives an offer.
            // it calls the setRemoteDescription method on that offer.
            // so the first user sent his offer to the backend server
            // the backend server sent this offer to the other user in the frontend
            // now in the frontend the other user has called this getAnswer function 
            // in the handleIncomingCall function of room.jsx
            // so that it can set the remote description (description of the first user)
            // as this offer and get back an answer.
            await this.peer.setRemoteDescription(offer);
            const ans = await this.peer.createAnswer();
            // create Answer creates an answer for the incoming offer to 
            // establish connection.
            await this.peer.setLocalDescription(new RTCSessionDescription(ans));
            return ans;

            
        }

    }
    async setLocalDescription(ans)
    {
        if(this.peer)
        {
            await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
        }
    }
    async getOffer(){
        if(this.peer)
        {
            // to establish a coonection between two peers we need this offer object
            // createOffer method on the instance of the RTCPeerConnection class , does returns 
            // a promise , which has all the description of the local device to link with other device.
            // now we save the local desccription of this device , in the 
            // this.peer.setLocalDescription method.
            // RTCSessionDescription(offer) it has the properties , to get connected with other.
            // and we return this offer so that we give it to the other socket.
            const offer = await this.peer.createOffer();
            await this.peer.setLocalDescription(new RTCSessionDescription(offer))
            return offer;
        }
    }
}
export default new PeerService;