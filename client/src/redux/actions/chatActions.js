import { CHATS_SET, CHATS_CREATE, CHATS_FAIL, CHATS_CLEAR_ERROR, CHATS_SEND_MESSAGE, CHATS_RECEIVED_MESSAGE, CHATS_CLEAR_ALL, CHATS_SELECTION, CHATS_SET_CHAT, CHATS_LEAVE, CHATS_CREATED } from "../constants/chatConstants"
import api from '../../api/chatApp'

export const setChats = chatsData => dispatch => {
    dispatch({ type: CHATS_SET, payload: chatsData })
}

export const createChat = (incomingName, userIds) => async dispatch => {
    try {
        const { data: { data: { name, _id } } } = await api.post('/chats', { incomingName, userIds })
        dispatch({ type: CHATS_CREATE, payload: { name, _id } })
    } catch (error) {
        dispatch({ type: CHATS_FAIL, payload: error.response.data.message })
    }
}

export const newChatCreated = data => dispatch => {
    dispatch({ type: CHATS_CREATED, payload: data })
}

export const setCurrentChat = chatId => async dispatch => {
    try {
        dispatch({ type: CHATS_SELECTION, payload: chatId })
        const { data: { data: { messages, chat } } } = await api.get(`/chats/${chatId}`)
        dispatch({ type: CHATS_SET_CHAT, payload: { messages, chat } })
    } catch (error) {
        console.log(error)
    }
}

export const newMessage = message => dispatch => {
    dispatch({ type: CHATS_SEND_MESSAGE, payload: message })
}

export const receivedMessage = message => dispatch => {
    dispatch({ type: CHATS_RECEIVED_MESSAGE, payload: message })
}

export const leaveChat = chatId => dispatch => {
    dispatch({ type: CHATS_LEAVE, payload: chatId })
}

export const setChatError = errorMessage => dispatch => {
    dispatch({ type: CHATS_FAIL, payload: errorMessage })
}

export const chatsClear = () => dispatch => {
    dispatch({ type: CHATS_CLEAR_ALL })
}

export const chatsClearError = () => dispatch => {
    dispatch({ type: CHATS_CLEAR_ERROR })
}
