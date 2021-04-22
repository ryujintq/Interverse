import { AUTH_FAIL, AUTH_REQUEST, AUTH_LOGIN, AUTH_SIGNUP, AUTH_CLEAR_ERROR, AUTH_SIGNOUT } from '../constants/authConstants'

export const authReducer = (state = { token: '', username: '', id: '', signedUp: false }, action) => {
    const { type, payload } = action

    switch (type) {
        case AUTH_REQUEST:
            return { loading: true }
        case AUTH_SIGNUP: {
            return { ...state, signedUp: true }
        }
        case AUTH_LOGIN:
            return { loading: false, token: payload.token, username: payload.username, id: payload.id }
        case AUTH_FAIL:
            return { loading: false, errorMessage: payload }
        case AUTH_SIGNOUT:
            return { loading: false }
        case AUTH_CLEAR_ERROR:
            return { ...state, errorMessage: '' }
        default:
            return state
    }
}
