import { AUTH_FAIL, AUTH_REQUEST, AUTH_SUCCESS, AUTH_CLEAR_ERROR, AUTH_SIGNOUT } from '../constants/authConstants'

export const authReducer = (state = { token: '', username: '', id: '' }, action) => {
    const { type, payload } = action

    switch (type) {
        case AUTH_REQUEST:
            return { loading: true }
        case AUTH_SUCCESS:
            return { loading: false, token: payload.token, username: payload.username, id: payload.id }
        case AUTH_FAIL:
            return { loading: false, errorMessage: payload }
        case AUTH_SIGNOUT:
            return { loading: false }
        case AUTH_CLEAR_ERROR:
            return { loading: false, errorMessage: '' }
        default:
            return state
    }
}