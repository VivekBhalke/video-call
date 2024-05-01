import React, { createContext, useMemo, useContext } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  console.log("useSocket ran and we got the socket");
  const socket = useContext(SocketContext);
  if(socket.id)
  {
    console.log(socket.id);
  }else{
    console.log("in the uesSocket and the socket does not have an id");
  }
  return socket;
};

export const SocketProvider = (props) => {
  console.log("new socket genereaed the socket provider ran");
  const socket = useMemo(() => io("localhost:8000"), []);

  return (
    <SocketContext.Provider value={socket}>
      {props.children}
    </SocketContext.Provider>
  );
};
