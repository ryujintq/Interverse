import React, { useContext, useEffect, useState } from 'react'
import socketIOClient from 'socket.io-client'

const SocketContext = React.createContext()

export const useSocket = () => {
    return useContext(SocketContext)
}

export const SocketProvider = ({ id, children }) => {
    const [socket, setSocket] = useState()

    useEffect(() => {
        const newSocket = socketIOClient("http://localhost:8080", { query: { id } })
        // const newSocket = socketIOClient("https://interverse-lcsrujzezq-lz.a.run.app", { query: { id } })

        setSocket(newSocket)

        return () => newSocket.close()
    }, [id])

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    )
}
