import { AUTH_FAIL, AUTH_REQUEST, AUTH_SUCCESS, AUTH_CLEAR_ERROR, AUTH_SIGNOUT } from '../constants/authConstants'
import api from '../../api/chatApp'
import { localStorageSet, localStorageRemove } from '../../util/localStorage'

export const signup = (incomingUsername, email, password, language) => async dispatch => {
    try {
        dispatch({ type: AUTH_REQUEST })

        const { data } = await api.post('/users/signup', { incomingUsername, email, password, language })
        const { data: { token, username, id } } = data

        localStorageSet('token', token)
        localStorageSet('username', username)
        localStorageSet('id', id)

        dispatch({ type: AUTH_SUCCESS, payload: { token, username, id } })
    } catch (error) {
        dispatch({ type: AUTH_FAIL, payload: error.response.data.message })
    }
}

export const login = (email, password) => async dispatch => {
    try {
        dispatch({ type: AUTH_REQUEST })

        const { data } = await api.post('/users/login', { email, password })
        const { data: { token, username, id } } = data

        localStorageSet('token', token)
        localStorageSet('username', username)
        localStorageSet('id', id)

        dispatch({ type: AUTH_SUCCESS, payload: { token, username, id } })
    } catch (error) {
        dispatch({ type: AUTH_FAIL, payload: error.response.data.message })
    }
}

export const signout = () => async dispatch => {
    localStorageRemove('token')
    localStorageRemove('username')
    localStorageRemove('id')
    dispatch({ type: AUTH_SIGNOUT })
}

export const clearErrorMessage = () => async dispatch => {
    dispatch({ type: AUTH_CLEAR_ERROR })
}

export const setErrorMessage = text => async dispatch => {
    dispatch({ type: AUTH_FAIL, payload: text })
}