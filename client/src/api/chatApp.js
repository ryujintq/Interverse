import axios from 'axios'
import { localStorageGet } from '../util/localStorage'

const instance = axios.create({
    baseURL: 'http://localhost:8080/api/v1'
    // baseURL: 'https://interverse-lcsrujzezq-lz.a.run.app/api/v1'
})

instance.interceptors.request.use(
    config => {
        const token = localStorageGet('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        config.headers['Content-Type'] = 'application/json';
        return config
    },
    err => {
        return Promise.reject(err)
    }
)

export default instance
