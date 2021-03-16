import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSocket } from '../../api/SocketProvider'
import { newMessage } from '../../redux/actions/chatActions'
import './ChatInputBar.css'

const ChatInputBar = () => {
    const [input, setInput] = useState('')
    const { username, id } = useSelector(state => state.auth)
    const dispatch = useDispatch()
    const socket = useSocket()

    const { currentChatId } = useSelector(state => state.chats)

    const handleEnterPress = e => {
        if (e.key === 'Enter') {
            sendMessage()
        }
    }

    const handleIconClick = () => {
        if (input === '') {
            return
        }
        sendMessage()
    }

    const sendMessage = () => {
        setInput('')
        const message = { chatId: currentChatId, messages: input, sender: { userId: id, username }, timestamp: new Date() }
        socket.emit('send-message', message)
        dispatch(newMessage(message))
    }

    return (
        <div className='right-panel-input-container'>
            <input
                autoFocus
                type="text"
                className="right-panel-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={e => handleEnterPress(e)}
            />
            <i className="fas fa-arrow-circle-right send-icon fa-2x" onClick={() => handleIconClick()}></i>
        </div>
    )
}

export default ChatInputBar