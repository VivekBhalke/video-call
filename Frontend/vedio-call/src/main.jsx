import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

import { RecoilRoot } from 'recoil';
import {BrowserRouter} from "react-router-dom"
import { SocketProvider } from './Context/SocketProvider.jsx';


console.log("main .jsx  rendered")
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
   <RecoilRoot>
      
        <App />
      
   </RecoilRoot>
   </BrowserRouter>
  </React.StrictMode>,
)
