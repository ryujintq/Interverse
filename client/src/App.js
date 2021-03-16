import React from 'react'
import { useSelector } from 'react-redux'
import Authentication from './pages/Authentication/Authentication'
import Navbar from './pages/Navbar/Navbar'
import Main from './pages/Main/Main'
import { SocketProvider } from './api/SocketProvider'
import './App.css'

const App = () => {
  const { token, id } = useSelector(state => state.auth)

  return (
    <div className='app'>
      <Navbar />
      {token
        ? (
          <SocketProvider id={id}>
            <Main />
          </SocketProvider>
        )
        : <Authentication />}
    </div>
  )
}

export default App
