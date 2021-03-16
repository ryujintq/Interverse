import React, { useEffect, useRef } from 'react'
import Message from '../Message/Message'
import { useSelector } from 'react-redux'
import './ChatSection.css'

const ChatSection = () => {
    const lastMessageRef = useRef(null)

    const { currentChat } = useSelector(state => state.chats)

    useEffect(() => {
        lastMessageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })
    }, [currentChat])

    return (
        <div className='right-panel-chat'>
            {currentChat.map((message, index) => (
                <Message key={index} message={message} />
            ))}
            <div ref={lastMessageRef}></div>
        </div>
    )
}

export default ChatSection
