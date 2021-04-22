import React from 'react'
import { useSelector } from 'react-redux'
import './Message.css'

const Message = ({ message, useRef }) => {
    const { username } = useSelector(state => state.auth)

    const time = new Date(message.timestamp).toString().slice(0, 21)
    const isSender = message.sender.username === username

    const header = !isSender ? <>{message.sender.username} <span>{time}</span></> : <><span>{time}</span> {message.sender.username}</>

    return (
        <div className="message-container" ref={useRef}>
            <div className={`message ${isSender ? 'owner' : ''}`}>
                <div className="message-header">
                    <p className={`message-username ${isSender ? 'owner' : ''}`}>
                        {/* {message.sender.username} <span>{time}</span> */}
                        {header}
                    </p>
                </div>
                <div className={`message-body  ${isSender ? 'owner' : ''}`}>
                    <p>{message.messages}</p>
                </div>
            </div>
        </div>
    )
}

export default Message