const PREFIX = 'chatapp-'

export const localStorageGet = key => {
    const prefixedkey = PREFIX + key
    return localStorage.getItem(prefixedkey)
}

export const localStorageSet = (key, value) => {
    const prefixedkey = PREFIX + key
    localStorage.setItem(prefixedkey, value)
}

export const localStorageRemove = (key) => {
    const prefixedkey = PREFIX + key
    localStorage.removeItem(prefixedkey)
}