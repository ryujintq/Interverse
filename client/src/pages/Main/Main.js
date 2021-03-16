import React, { useEffect } from 'react'
import LeftPanel from '../../components/LeftPanel/LeftPanel'
import RightPanel from '../../components/RightPanel/RightPanel'
import { setFriendsAndRequests } from '../../redux/actions/friendsActions'
import { useDispatch } from 'react-redux'
import { setChats } from '../../redux/actions/chatActions'
import './Main.css'
import { useSocket } from '../../api/SocketProvider'

const Main = () => {
    const dispatch = useDispatch()
    const socket = useSocket()

    useEffect(() => {
        if (socket == null) return

        socket.emit('request-user-data')

        socket.on('get-user-data', data => {
            const { friendsData, chatData } = data
            dispatch(setFriendsAndRequests(friendsData))
            dispatch(setChats(chatData))
        })

    }, [socket])

    return (
        <div className='main'>
            <LeftPanel />
            <RightPanel />
        </div>
    )
}

export default Main
