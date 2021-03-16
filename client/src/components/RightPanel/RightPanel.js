import React from 'react'
import { useSelector } from 'react-redux'
import ChatInfoBar from '../ChatInfoBar/ChatInfoBar'
import ChatInputBar from '../ChatInputBar/ChatInputBar'
import ChatSection from '../ChatSection/ChatSection'
import Spinner from '../Spinner/Spinner'
import './RightPanel.css'

const RightPanel = () => {
    const { currentChatId, loading } = useSelector(state => state.chats)

    return (
        <div className='right-panel'>
            {loading ? <Spinner /> : currentChatId && (
                <>
                    <ChatInfoBar />
                    <ChatSection />
                    <ChatInputBar />
                </>
            )}
        </div>
    )
}

export default RightPanel
