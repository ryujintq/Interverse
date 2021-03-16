export default (a, b) => {
    const x = a.username.toUpperCase()
    const y = b.username.toUpperCase()

    return x == y ? 0 : x > y ? 1 : -1
}

