import { FRIENDS_ACCEPT_REQUEST, FRIENDS_REQUEST_ACCEPTED, FRIENDS_SET, FRIENDS_ADD, FRIENDS_CLEAR_ERROR, FRIENDS_FAIL, FRIENDS_REQUEST_RECEIVED, FRIENDS_DENY_REQUEST, FRIENDS_REQUEST_DENIED, FRIENDS_CLEAR_ALL, FRIENDS_REMOVE } from "../constants/friendsConstants"

export const friendsReducer = (state = { friendsList: [], sentRequests: [], friendRequests: [] }, action) => {
    const { type, payload } = action
    let requests

    switch (type) {
        case FRIENDS_SET:
            const { friends, friendRequests, sentRequests } = payload
            return { friendsList: [...friends], friendRequests: [...friendRequests], sentRequests: [...sentRequests] }
        case FRIENDS_ADD:
            return { ...state, sentRequests: [...state.sentRequests, payload] }
        case FRIENDS_REQUEST_RECEIVED:
            return { ...state, friendRequests: [...state.friendRequests, payload] }
        case FRIENDS_ACCEPT_REQUEST:
            const { username: acceptedFriend } = payload
            requests = state.friendRequests.filter(friendRequest => acceptedFriend !== friendRequest.username)
            return { ...state, friendsList: [...state.friendsList, payload], friendRequests: [...requests] }
        case FRIENDS_DENY_REQUEST:
            const { username: friendToDeny } = payload
            requests = state.friendRequests.filter(friendRequest => friendToDeny !== friendRequest.username)
            return { ...state, friendRequests: [...requests] }
        case FRIENDS_REQUEST_DENIED:
            const { userId: deniedId } = payload
            requests = state.sentRequests.filter(sentRequest => deniedId !== sentRequest.userId)
            return { ...state, sentRequests: [...requests] }
        case FRIENDS_REQUEST_ACCEPTED:
            const { userId: acceptedId } = payload
            requests = state.sentRequests.filter(sentRequest => acceptedId !== sentRequest.userId)
            return { ...state, sentRequests: [...requests], friendsList: [...state.friendsList, payload] }
        case FRIENDS_REMOVE:
            const { userId } = payload
            const friendsList = state.friendsList.filter(friend => friend.userId != userId)
            return { ...state, friendsList: [...friendsList] }
        case FRIENDS_FAIL:
            return { ...state, errorMessage: payload }
        case FRIENDS_CLEAR_ERROR:
            return { ...state, errorMessage: '' }
        case FRIENDS_CLEAR_ALL:
            return { friendsList: [], sentRequests: [], friendRequests: [] }
        default:
            return state
    }
}
