import { FRIENDS_ADD, FRIENDS_CLEAR_ERROR, FRIENDS_FAIL, FRIENDS_SET, FRIENDS_REQUEST_RECEIVED, FRIENDS_DENY_REQUEST, FRIENDS_REQUEST_DENIED, FRIENDS_ACCEPT_REQUEST, FRIENDS_REQUEST_ACCEPTED, FRIENDS_CLEAR_ALL, FRIENDS_REMOVE } from "../constants/friendsConstants"

export const setFriendsAndRequests = data => dispatch => {
    dispatch({ type: FRIENDS_SET, payload: data })
}

export const addToSentRequests = data => dispatch => {
    dispatch({ type: FRIENDS_ADD, payload: data })
}

export const addToFriendRequests = data => dispatch => {
    dispatch({ type: FRIENDS_REQUEST_RECEIVED, payload: data })
}

export const acceptFriendRequest = data => dispatch => {
    dispatch({ type: FRIENDS_ACCEPT_REQUEST, payload: data })
}

export const denyFriendRequest = data => dispatch => {
    dispatch({ type: FRIENDS_DENY_REQUEST, payload: data })
}

export const friendRequestDenied = data => dispatch => {
    dispatch({ type: FRIENDS_REQUEST_DENIED, payload: data })
}

export const friendRequestAccepted = data => dispatch => {
    dispatch({ type: FRIENDS_REQUEST_ACCEPTED, payload: data })
}

export const friendsFail = errorMessage => dispatch => {
    dispatch({ type: FRIENDS_FAIL, payload: errorMessage })
}

export const removeFriend = friend => dispatch => {
    dispatch({ type: FRIENDS_REMOVE, payload: friend })
}

export const friendsClear = () => dispatch => {
    dispatch({ type: FRIENDS_CLEAR_ALL })
}

export const friendsClearError = () => dispatch => {
    dispatch({ type: FRIENDS_CLEAR_ERROR })
}
