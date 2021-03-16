import { CHATS_CREATE, CHATS_SET, CHATS_SELECTION, CHATS_FAIL, CHATS_CLEAR_ERROR, CHATS_SEND_MESSAGE, CHATS_RECEIVED_MESSAGE, CHATS_CLEAR_ALL, CHATS_SET_CHAT, CHATS_LEAVE, CHATS_CREATED } from "../constants/chatConstants"

export const chatReducer = (state = { chats: [], currentChat: [], currentChatId: '', currentChatName: '', currentChatUsers: [], loading: false }, action) => {
    const { type, payload } = action

    switch (type) {
        case CHATS_SET:
            return { ...state, chats: [...payload] }
        case CHATS_CREATE:
            return { ...state, chats: [payload, ...state.chats], currentChatId: payload._id, currentChat: [] }
        case CHATS_CREATED:
            return { ...state, chats: [payload, ...state.chats] }
        case CHATS_SELECTION:
            return { ...state, currentChatId: payload, loading: true }
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
            } else {
                const chatIndex = state.chats.map(chat => chat._id).indexOf(payload.chat._id)
                const newChatArray = state.chats
                const chatToMove = newChatArray.splice(chatIndex, 1)
                newChatArray.unshift(chatToMove[0])
                return { ...state, chats: [...newChatArray] }
            }
        case CHATS_LEAVE:
            const chatId = payload
            const newChatsList = state.chats.filter(chat => chat._id != chatId)
            return { ...state, chats: [...newChatsList], currentChat: [], currentChatId: '', currentChatName: '', currentChatUsers: [] }
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
