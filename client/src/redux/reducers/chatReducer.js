import { CHATS_CREATE, CHATS_HIDE_PANEL, CHATS_SHOW_PANEL, CHATS_ADDED, CHATS_LEFT, CHATS_SET, CHATS_SELECTION, CHATS_FAIL, CHATS_CLEAR_ERROR, CHATS_SEND_MESSAGE, CHATS_RECEIVED_MESSAGE, CHATS_CLEAR_ALL, CHATS_SET_CHAT, CHATS_LEAVE, CHATS_CREATED } from "../constants/chatConstants"

export const chatReducer = (state = { chats: [], currentChat: [], currentChatId: '', currentChatName: '', currentChatUsers: [], loading: false, panelClassName: 'left-panel' }, action) => {
    const { type, payload } = action

    switch (type) {
        case CHATS_SET:
            return { ...state, chats: [...payload] }
        case CHATS_CREATE:
            return { ...state, chats: [payload, ...state.chats], currentChatId: payload._id, currentChat: [], currentChatUsers: [...payload.users], currentChatName: payload.name }
        case CHATS_CREATED:
            return { ...state, chats: [payload, ...state.chats] }
        case CHATS_SELECTION:
            const index = state.chats.map(chat => chat._id).findIndex(id => id == payload)
            const newChatsArray = state.chats
            newChatsArray[index].noOfUnreads = 0
            return { ...state, currentChatId: payload, loading: true, chats: [...newChatsArray] }
        case CHATS_SET_CHAT:
            return {
                ...state,
                currentChat: [...payload.messages],
                currentChatName: payload.chat.name,
                currentChatUsers: payload.chat.users,
                loading: false
            }
        case CHATS_SEND_MESSAGE:
            //if chat is first in the list, simply add message to the chat
            //if not, then move that chat to the top of the list
            const chatIndex = state.chats.map(chat => chat._id).indexOf(payload.chatId)
            if (chatIndex == 0) {
                return { ...state, currentChat: [...state.currentChat, payload] }
            } else {
                const newChatArray = state.chats
                const chatToMove = newChatArray.splice(chatIndex, 1)
                newChatArray.unshift(chatToMove[0])
                return { ...state, chats: [...newChatArray], currentChat: [...state.currentChat, payload] }
            }
        case CHATS_RECEIVED_MESSAGE:
            //if chat is open, simply add message to the chat
            //if not, then move that chat to the top of the list
            if (payload.chat._id.toString() === state.currentChatId.toString()) {
                return { ...state, currentChat: [...state.currentChat, payload] }
            }
            const chatIndex1 = state.chats.map(chat => chat._id).indexOf(payload.chat._id)
            if (chatIndex1 > -1) {
                const newChatArray = state.chats
                const chatToMove = newChatArray.splice(chatIndex1, 1)
                chatToMove[0].noOfUnreads = chatToMove[0].noOfUnreads + 1
                newChatArray.unshift(chatToMove[0])
                return { ...state, chats: [...newChatArray] }
            } else {
                const newChats = state.chats
                newChats.unshift({ _id: payload.chat._id, name: payload.chat.name, noOfUnreads: 1 })
                return { ...state, chats: [...newChats] }
            }
        case CHATS_LEAVE:
            const chatId = payload
            const newChatsList = state.chats.filter(chat => chat._id != chatId)
            return { ...state, chats: [...newChatsList], currentChat: [], currentChatId: '', currentChatName: '', currentChatUsers: [] }
        case CHATS_LEFT:
            const { id, message } = payload
            //if incoming message belongs to opened chat, add message to array
            // else increment unreads and move chat to top
            if (message.chat._id.toString() == state.currentChatId.toString()) {
                const newUsersArray = state.currentChatUsers.filter(user => user._id !== id)
                return { ...state, currentChat: [...state.currentChat, message], currentChatUsers: [...newUsersArray] }
            } else {
                const chatIndex = state.chats.map(chat => chat._id).indexOf(message.chat._id)
                const newChatArray = state.chats
                const chatToMove = newChatArray.splice(chatIndex, 1)
                chatToMove[0].noOfUnreads = chatToMove[0].noOfUnreads + 1
                newChatArray.unshift(chatToMove[0])
                return { ...state, chats: [...newChatArray] }
            }
        case CHATS_ADDED:
            const { users, message: usersAddedMessage } = payload
            //if incoming message belongs to opened chat, add message to array
            // else increment unreads and move chat to top
            if (usersAddedMessage.chat._id.toString() == state.currentChatId.toString()) {
                const newUsersArray = [...state.currentChatUsers, ...users]
                return { ...state, currentChat: [...state.currentChat, usersAddedMessage], currentChatUsers: [...newUsersArray] }
            } else {
                const chatIndex = state.chats.map(chat => chat._id).indexOf(usersAddedMessage.chat._id)
                if (chatIndex > -1) {
                    const newChatArray = state.chats
                    const chatToMove = newChatArray.splice(chatIndex, 1)
                    chatToMove[0].noOfUnreads = chatToMove[0].noOfUnreads + 1
                    newChatArray.unshift(chatToMove[0])
                    return { ...state, chats: [...newChatArray] }
                }
                const newChats = state.chats
                newChats.unshift({ _id: usersAddedMessage.chat._id, name: usersAddedMessage.chat.name, noOfUnreads: 1 })
                return { ...state, chats: [...newChats] }
            }
        case CHATS_SHOW_PANEL:
            return { ...state, panelClassName: 'left-panel' }
        case CHATS_HIDE_PANEL:
            return { ...state, panelClassName: 'left-panel toggle' }
        case CHATS_CLEAR_ERROR:
            return { ...state, errorMessage: '' }
        case CHATS_CLEAR_ALL:
            return { chats: [], currentChat: [], currentChatId: '' }
        case CHATS_FAIL:
            return { ...state, errorMessage: payload }
        default:
            return state
    }
}
