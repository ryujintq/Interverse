import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSocket } from '../../api/SocketProvider'
import { leaveChat, showPanel } from '../../redux/actions/chatActions'
import { useMediaQuery } from '../../util/useMediaQuery'
import ModalOverlay from '../ModalOverlay/ModalOverlay'
import './ChatInfoBar.css'

const ChatInfoBar = () => {
    const [displayMenu, setDisplayMenu] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [modalName, setModalName] = useState('')
    const [checkedUsers, setCheckedUsers] = useState([])

    const { currentChatName, currentChatUsers, currentChatId } = useSelector(state => state.chats)
    const { friendsList: friends } = useSelector(state => state.friends)

    const socket = useSocket()
    const dispatch = useDispatch()

    const handleModalClose = () => {
        setShowModal(false)
        setCheckedUsers([])
    }

    const handleMenuClick = () => {
        setDisplayMenu(!displayMenu)
    }

    const handleAddToChatModal = () => {
        setModalName('ADD')
        setShowModal(true)
        setDisplayMenu(false)
    }

    const handleAddToChat = () => {
        socket.emit('add-to-chat', { chatId: currentChatId, users: checkedUsers })
        setShowModal(false)
        setCheckedUsers([])
    }

    const modalButtons = (
        <div className="modal-btns">
            <div
                className="modal-confirm-btn modal-btn"
                onClick={handleAddToChat}
            >
                Confirm
            </div>
            <div
                className="modal-cancel-btn modal-btn"
                onClick={handleModalClose}
            >
                Cancel
            </div>
        </div>
    )

    const modalButton = (
        <div className="modal-btns">
            <div
                className="modal-confirm-btn modal-btn"
                onClick={handleModalClose}
            >
                OK
        </div>
        </div>
    )

    const addModalContent = () => {
        const filteredFriends = friends.filter(friend => !currentChatUsers.find(user => user._id === friend.userId))
        return (
            <div className="modal-container">
                <h2>Add User To Chat</h2>
                <div className="modal-list-container">
                    {filteredFriends.map(user => (
                        <div key={user.userId} className="modal-list-element" onClick={() => handleCheckBoxClick(user)}>
                            <input
                                type="checkbox"
                                checked={isUserChecked(user)}
                                readOnly
                            />
                            <p>{user.username}</p>
                        </div>
                    ))}
                </div>
                {modalButtons}
            </div>
        )
    }

    const participantsModalContent = (
        <div className="modal-container">
            <h2>Participants</h2>
            <div className="modal-list-container">
                {currentChatUsers.map(user => (
                    <div key={user._id} className="modal-list-element" >
                        <p>{user.username}</p>
                    </div>
                ))}
            </div>
            {modalButton}
        </div>
    )

    const isUserChecked = user => {
        for (let i = 0, iEnd = checkedUsers.length; i < iEnd; i++) {
            if (checkedUsers[i].userId == user.userId) {
                return true
            }
        }
        return false
    }

    const handleCheckBoxClick = user => {
        setCheckedUsers(prevCheckedUsers => {
            if (isUserChecked(user)) {
                return prevCheckedUsers.filter(prevUser => {
                    return prevUser.userId !== user.userId
                })
            } else {
                return [...prevCheckedUsers, user]
            }
        })
    }

    const handleParticipantsClick = () => {
        setModalName('PARTICIPANTS')
        setDisplayMenu(false)
        setShowModal(true)
    }

    const handleLeaveChat = () => {
        socket.emit('leave-chat', { chatId: currentChatId })
        dispatch(leaveChat(currentChatId))
        setDisplayMenu(false)
    }

    const isSmallScreen = useMediaQuery()

    const showTabs = () => {
        dispatch(showPanel())
    }

    return (
        <div className='info-bar'>
            {isSmallScreen && <i className="fas fa-comments fa-2x" onClick={showTabs}></i>}
            <h3>{currentChatName}</h3>
            <div className="menu">
                <div className='menu-icon' onClick={handleMenuClick}>
                    <div className="line"></div>
                    <div className="line"></div>
                    <div className="line"></div>
                </div>
                <div className={`menu-items ${displayMenu && 'active'}`}>
                    <ul>
                        <li onClick={handleParticipantsClick}>Participants</li>
                        <li onClick={handleAddToChatModal}>Add Participant</li>
                        <li onClick={handleLeaveChat}>Leave chat</li>
                    </ul>
                </div>
            </div>
            {showModal && <ModalOverlay onCancel={handleModalClose}>
                {modalName == 'ADD' ? addModalContent() : participantsModalContent}
            </ModalOverlay>
            }
        </div>
    )
}

export default ChatInfoBar
