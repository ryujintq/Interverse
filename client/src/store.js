import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'
import { authReducer } from './redux/reducers/authReducer'
import { friendsReducer } from './redux/reducers/friendsReducer'
import { chatReducer } from './redux/reducers/chatReducer'
import { localStorageGet } from './util/localStorage'

const reducer = combineReducers({
    auth: authReducer,
    friends: friendsReducer,
    chats: chatReducer
})
const initialState = {
    auth: {
        token: localStorageGet('token'),
        username: localStorageGet('username'),
        id: localStorageGet('id')
    },
    friends: {
        friendsList: [],
        sentRequests: [],
        friendRequests: []
    },
    chats: {
        chats: [],
        currentChat: [],
        currentChatId: '',
        currentChatName: '',
        currentChatUsers: [],
        loading: false
    }
}

const middleware = [thunk]

const store = createStore(reducer, initialState, composeWithDevTools(applyMiddleware(...middleware)))

export default store
