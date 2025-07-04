import { useState } from 'react'
import './App.css'
import Emailverifyotp from './Emailverifyotp.jsx'
import Resendemailotp from './Resendemailotp.jsx'
import Dashboard from './Dashboard.jsx'
import Logout from './Logout.jsx'
import Forgetpasswordotp from './Forgetpasswordotp.jsx'
import Resendforgetpasswordotp from './Resendforgetpasswordotp.jsx'
import { BrowserRouter as Router,Routes,Route } from 'react-router-dom'
import Passwordreset from './Passwordreset.jsx'
import AuthPage from './AuthPage.jsx'

function App() {


  return (
    <>
      <div>
        <Router>
          <Routes>
            <Route path='/' element={<AuthPage></AuthPage>}></Route>
            <Route path='/emailverify' element={<Emailverifyotp></Emailverifyotp>}></Route>
            <Route path='/resendemailotp' element={<Resendemailotp></Resendemailotp>}></Route>
            <Route path='/logout' element={<Logout></Logout>}></Route>
            <Route path='/dashboard' element={<Dashboard></Dashboard>}></Route>
            <Route path='/forgetpasswordotp' element={<Forgetpasswordotp></Forgetpasswordotp>}></Route>
            <Route path='/resendforgetpasswordotp' element={<Resendforgetpasswordotp></Resendforgetpasswordotp>}></Route>
            <Route path='/passwordreset' element={<Passwordreset></Passwordreset>}></Route>
          </Routes>
        </Router>
      </div>
    </>
  )
}

export default App
