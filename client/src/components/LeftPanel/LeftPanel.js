import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Tabs from '../../components/Tabs/Tabs'
import Input from '../../components/Input/Input'
import ModalOverlay from '../../components/ModalOverlay/ModalOverlay'
import { addToSentRequests, addToFriendRequests, acceptFriendRequest, denyFriendRequest, friendRequestDenied, friendRequestAccepted, friendsClearError, friendsFail, removeFriend } from '../../redux/actions/friendsActions'
import ErrorMessage from '../ErrorMessage/ErrorMessage'
import { chatsClearError, createChat, setChatError, setCurrentChat, receivedMessage } from '../../redux/actions/chatActions'
import { useSocket } from '../../api/SocketProvider'
import './LeftPanel.css'

const LeftPanel = () => {
    const [isConversationsOpen, setIsConversationsOpen] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [addContactName, setAddContactName] = useState('')
    const [newConversationName, setNewConversationName] = useState('')
    const [checkedFriends, setCheckedFriends] = useState([])

    const socket = useSocket()

    const auth = useSelector(state => state.auth)
    const { username } = auth

    const friends = useSelector(state => state.friends)
    const { friendsList, friendRequests, sentRequests, errorMessage: friendsError } = friends

    const chatsState = useSelector(state => state.chats)
    const { chats, currentChatId, errorMessage: chatsError } = chatsState

    const dispatch = useDispatch()

    useEffect(() => {
        if (socket == null) return

        socket.on('friend-request-sent', data => {
            closeModal()
            dispatch(addToSentRequests(data))
        })

        socket.on('receive-message', data => dispatch(receivedMessage(data)))

        socket.on('friend-request-received', data => dispatch(addToFriendRequests(data)))

        socket.on('friend-request-denied', data => dispatch(friendRequestDenied(data)))

        socket.on('friend-request-accepted', data => dispatch(friendRequestAccepted(data)))

        socket.on('add-friend-error', message => dispatch(friendsFail(message)))

        socket.on('remove-friend', data => dispatch(removeFriend(data)))
    }, [socket])

    const confirmButtonFunction = () => {
        if (isConversationsOpen) {
            if (!checkedFriends.length || newConversationName === '') {
                dispatch(setChatError('Please enter a name and choose a friend'))
            } else {
                dispatch(createChat(newConversationName, checkedFriends))
                closeModal()
            }
        } else {
            socket.emit('add-friend', { friendName: addContactName })
        }
    }

    const closeModal = () => {
        clearModalInputs()
        setIsModalOpen(false)
        dispatch(friendsClearError())
        dispatch(chatsClearError())
    }


    const modalButtons = (
        <div className="modal-btns">
            <div
                className="modal-confirm-btn modal-btn"
                onClick={confirmButtonFunction}
            >
                Confirm
            </div>
            <div
                className="modal-cancel-btn modal-btn"
                onClick={closeModal}
            >
                Cancel
            </div>
        </div>
    )

    const clearModalInputs = () => {
        setAddContactName('')
        setNewConversationName('')
        setCheckedFriends([])
    }


    const conversationModalContent = (
        <div className="modal-container">
            <h2>Start New Conversation</h2>
            {chatsError && <ErrorMessage text={chatsError} />}
            <Input
                value={newConversationName}
                onChange={e => setNewConversationName(e.target.value)}
                placeholder='New conversation name'
            />
            <div className="modal-list-container">
                {friendsList.map(friend => (
                    <div key={friend.userId} className="modal-list-element" onClick={() => handleCheckBoxClick(friend)}>
                        <input
                            type="checkbox"
                            checked={checkedFriends.includes(friend.userId)}
                            readOnly
                        />
                        <p>{friend.username}</p>
                    </div>
                ))}
            </div>
            {modalButtons}
        </div>
    )

    const handleCheckBoxClick = friend => {
        setCheckedFriends(prevCheckedFriends => {
            if (checkedFriends.includes(friend.userId)) {
                return prevCheckedFriends.filter(friendId => {
                    return friendId !== friend.userId
                })
            } else {
                return [...prevCheckedFriends, friend.userId]
            }
        })
    }

    const contactModalContent = (
        <div className="modal-container">
            <h2>Add New Contact</h2>
            {friendsError && <ErrorMessage text={friendsError} />}
            <Input
                value={addContactName}
                onChange={e => setAddContactName(e.target.value)}
                placeholder='New contact username'
            />
            {modalButtons}
        </div>
    )

    const handleAcceptRequest = request => {
        socket.emit('accept-friend-request', { userId: request.userId })
        dispatch(acceptFriendRequest(request))
    }

    const handleDenyRequest = request => {
        socket.emit('deny-friend-request', { userId: request.userId })
        dispatch(denyFriendRequest(request))
    }

    const handleChatSelection = chatId => {
        if (chatId == currentChatId) {
            return
        }
        dispatch(setCurrentChat(chatId))
    }

    const handleRemoveFriend = friend => {
        socket.emit('remove-friend', friend)
        dispatch(removeFriend(friend))
    }

    return (
        <div className='left-panel'>
            <Tabs onTabChange={() => setIsConversationsOpen(!isConversationsOpen)}>
                <div label='Conversations'>
                    <div className="conversations">
                        {chats.length > 0 && chats.map(chat => (
                            <p
                                key={chat._id}
                                className={`conversation-name ${currentChatId == chat._id ? 'selected-chat' : ''}`}
                                onClick={() => handleChatSelection(chat._id)}
                            >
                                {chat.name} {chat.newMessages ? <span className='new-messsage'>new!</span> : ''}
                            </p>
                        ))}
                    </div>
                </div>

                <div label='Contacts'>
                    <div className='contact-section'>
                        <p className='contact-section-heading'>Requests Sent ({sentRequests.length})</p>
                        {sentRequests.map(request => <p key={request.username} className='contact-element'>{request.username}</p>)}
                    </div>
                    <div className='contact-section'>
                        <p className='contact-section-heading'>Friend Requests ({friendRequests.length})</p>
                        {friendRequests.map(request => (
                            <div key={request.username} className="contact-element-wrapper">
                                <p className='contact-element'>{request.username}</p>
                                <div className="contact-action-icons">
                                    <i className="fas fa-check contact-icon" onClick={() => handleAcceptRequest(request)}></i>
                                    <i className="fas fa-times contact-icon" onClick={() => handleDenyRequest(request)}></i>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className='contact-section'>
                        <p className='contact-section-heading'>Friends ({friendsList.length})</p>
                        {friendsList.map(friend => (
                            <div key={friend.username} className="friend-element">
                                <p className='contact-element'>{friend.username}</p>
                                <i className="fas fa-times contact-icon remove-icon" onClick={() => handleRemoveFriend(friend)}></i>
                            </div>
                        ))}
                    </div>
                </div>
            </Tabs>
            <div className="left-panel-username">
                <p>Your username is: {username}</p>
            </div>
            <div className="left-panel-button" onClick={() => setIsModalOpen(true)}>
                <h2>New {isConversationsOpen ? 'Conversation' : 'Contact'}</h2>
            </div>
            {isModalOpen && (
                <ModalOverlay onCancel={closeModal}>
                    {isConversationsOpen ? conversationModalContent : contactModalContent}
                </ModalOverlay>
            )}
        </div>
    )
}

export default LeftPanel
