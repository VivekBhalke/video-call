class SocketHere {
     constructor(socket){
        this.socket = socket;
        SocketHere.instances.push(this);
     }
     
}

SocketHere.instances = [];

export default SocketHere;